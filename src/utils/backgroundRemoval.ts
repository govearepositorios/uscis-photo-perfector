import { toast } from "sonner";
import { PHOTO_REQUIREMENTS } from "./photoRequirements";
import { loadImage, isDockerEnvironment } from "./imageUtils";

// Remove background from an image using the Hugging Face Transformers.js library
export const removeBackground = async (imageElement: HTMLImageElement): Promise<Blob | null> => {
  try {
    console.log("Iniciando procesamiento de imagen:", imageElement.src.substring(0, 100) + "...");
    console.log("Dimensiones de la imagen:", imageElement.naturalWidth, "x", imageElement.naturalHeight);
    
    toast.info("Procesando imagen, por favor espere...", { duration: 3000 });
    
    // Si estamos en Docker, usar el método alternativo directamente
    if (isDockerEnvironment()) {
      console.log("Detectado entorno Docker - usando método alternativo de procesamiento");
      return await useAlternativeBackgroundRemoval(imageElement);
    }
    
    console.log("Importando la biblioteca de transformers...");
    
    const MAX_IMAGE_SIZE = 1024;
    let imageToProcess = imageElement;
    let needsResize = false;
    
    // Resize large images to improve performance
    if (imageElement.naturalWidth > MAX_IMAGE_SIZE || imageElement.naturalHeight > MAX_IMAGE_SIZE) {
      console.log("Redimensionando imagen para mejor rendimiento");
      needsResize = true;
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('No se pudo obtener el contexto del canvas para redimensionar');
      }
      
      let width = imageElement.naturalWidth;
      let height = imageElement.naturalHeight;
      
      if (width > height) {
        height = Math.round((height * MAX_IMAGE_SIZE) / width);
        width = MAX_IMAGE_SIZE;
      } else {
        width = Math.round((width * MAX_IMAGE_SIZE) / height);
        height = MAX_IMAGE_SIZE;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(imageElement, 0, 0, width, height);
      
      const resizedImage = new Image();
      resizedImage.src = canvas.toDataURL('image/jpeg', 0.9);
      
      // Wait for the resized image to load
      await new Promise((resolve) => {
        resizedImage.onload = resolve;
      });
      
      imageToProcess = resizedImage;
      console.log("Imagen redimensionada:", width, "x", height);
    }
    
    try {
      // Dynamically import the transformers library to reduce initial load time
      console.log("Importando módulos de transformers.js...");
      const { pipeline, env } = await import('@huggingface/transformers');
      
      // Configure transformers.js
      env.allowLocalModels = false;
      env.useBrowserCache = true; // Utilizar caché para mejorar rendimiento en Docker
      
      console.log("Inicializando el modelo de segmentación...");
      
      // Configuración más compatible con entornos Docker
      const segmenter = await pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512', {
        progress_callback: (progressInfo: any) => {
          // Extract a percentage value from the progress info object
          let percentage = 0;
          if (progressInfo && typeof progressInfo === 'object' && 'progress' in progressInfo) {
            percentage = Number(progressInfo.progress);
          } else if (
            progressInfo && 
            typeof progressInfo === 'object' && 
            'loaded' in progressInfo && 
            'total' in progressInfo && 
            typeof progressInfo.loaded === 'number' && 
            typeof progressInfo.total === 'number' && 
            progressInfo.total > 0
          ) {
            percentage = progressInfo.loaded / progressInfo.total;
          }
          console.log(`Progreso de carga del modelo: ${Math.round(percentage * 100)}%`);
        }
      });
      
      console.log("Modelo inicializado correctamente");
      
      // Set up canvas to process the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('No se pudo obtener el contexto del canvas');
      }
      
      // Draw image to canvas
      canvas.width = imageToProcess.naturalWidth || imageToProcess.width;
      canvas.height = imageToProcess.naturalHeight || imageToProcess.height;
      ctx.drawImage(imageToProcess, 0, 0);
      
      // Convert to base64 for processing
      console.log("Convirtiendo imagen a base64...");
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      console.log("Procesando con el modelo de segmentación...");
      const result = await segmenter(imageData);
      
      console.log("Resultado de segmentación:", result ? "obtenido" : "null");
      
      if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
        throw new Error('Resultado de segmentación inválido');
      }
      
      // Create canvas for masked image
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = canvas.width;
      outputCanvas.height = canvas.height;
      const outputCtx = outputCanvas.getContext('2d');
      
      if (!outputCtx) {
        throw new Error('No se pudo obtener el contexto del canvas de salida');
      }
      
      // Fill with white background
      outputCtx.fillStyle = PHOTO_REQUIREMENTS.backgroundColor;
      outputCtx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
      
      // Draw original image
      outputCtx.drawImage(canvas, 0, 0);
      
      // Apply mask to remove background
      const outputImageData = outputCtx.getImageData(
        0, 0, outputCanvas.width, outputCanvas.height
      );
      const data = outputImageData.data;
      
      console.log("Aplicando máscara...");
      
      // Apply mask to alpha channel
      for (let i = 0; i < result[0].mask.data.length; i++) {
        // Invert mask (1 - value) to keep person instead of background
        const alpha = Math.round((1 - result[0].mask.data[i]) * 255);
        
        if (alpha < 128) { // If background (low alpha)
          // Set to white (background color)
          data[i * 4] = 255; // R
          data[i * 4 + 1] = 255; // G
          data[i * 4 + 2] = 255; // B
          data[i * 4 + 3] = 255; // A (fully opaque)
        }
      }
      
      outputCtx.putImageData(outputImageData, 0, 0);
      
      console.log("Máscara aplicada correctamente");
      
      // Convert to blob
      return new Promise((resolve, reject) => {
        outputCanvas.toBlob(
          (blob) => {
            if (blob) {
              console.log('Imagen procesada correctamente, tamaño:', blob.size, "bytes");
              toast.success("¡Fondo eliminado con éxito!");
              resolve(blob);
            } else {
              reject(new Error('Error al crear el blob de la imagen'));
            }
          },
          'image/png',
          1.0
        );
      });
    } catch (transformersError) {
      console.error('Error con la biblioteca transformers:', transformersError);
      
      // Si falla el método anterior, usar método alternativo más simple
      console.log("Intentando método alternativo de procesamiento...");
      return await useAlternativeBackgroundRemoval(imageElement);
    }
  } catch (error) {
    console.error('Error al eliminar el fondo:', error);
    toast.error("Error al procesar la imagen. Inténtelo de nuevo.");
    return null;
  }
};

// Método alternativo para remover el fondo sin usar el modelo de ML
export const useAlternativeBackgroundRemoval = async (imageElement: HTMLImageElement): Promise<Blob> => {
  console.log("Utilizando método alternativo de remoción de fondo");
  
  // Método alternativo: solo recortar y ajustar la imagen sin eliminar el fondo
  const canvas = document.createElement('canvas');
  canvas.width = PHOTO_REQUIREMENTS.width;
  canvas.height = PHOTO_REQUIREMENTS.height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('No se pudo obtener el contexto del canvas');
  }
  
  // Fill with white background
  ctx.fillStyle = PHOTO_REQUIREMENTS.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Calculate scaling to fit the image
  const scaleWidth = PHOTO_REQUIREMENTS.width / imageElement.naturalWidth;
  const scaleHeight = PHOTO_REQUIREMENTS.height / imageElement.naturalHeight;
  const scale = Math.min(scaleWidth, scaleHeight);
  
  const newWidth = imageElement.naturalWidth * scale;
  const newHeight = imageElement.naturalHeight * scale;
  const x = (PHOTO_REQUIREMENTS.width - newWidth) / 2;
  const y = (PHOTO_REQUIREMENTS.height - newHeight) / 2;
  
  // Draw the image on the canvas
  ctx.drawImage(imageElement, x, y, newWidth, newHeight);
  
  // Mostrar mensaje de fallback
  toast.info("Utilizando método alternativo para el procesamiento de la imagen.");
  
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          console.log('Imagen procesada con método alternativo');
          resolve(blob);
        } else {
          reject(new Error('Error al crear el blob de la imagen'));
        }
      },
      'image/png',
      1.0
    );
  });
};
