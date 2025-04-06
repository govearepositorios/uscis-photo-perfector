
import { toast } from "sonner";
import { PHOTO_REQUIREMENTS } from "./photoRequirements";
import { loadImage, isDockerEnvironment, forceAlternativeMethodForDocker } from "./imageUtils";

// Remove background from an image using the Hugging Face Transformers.js library
export const removeBackground = async (imageElement: HTMLImageElement): Promise<Blob | null> => {
  try {
    console.log("Iniciando procesamiento de imagen:", imageElement.src.substring(0, 100) + "...");
    console.log("Dimensiones de la imagen:", imageElement.naturalWidth, "x", imageElement.naturalHeight);
    
    toast.info("Procesando imagen, por favor espere...", { duration: 3000 });
    
    // Detectar Docker y FORZAR el uso del método alternativo
    const dockerDetected = isDockerEnvironment();
    console.log("¿Entorno Docker detectado?", dockerDetected);
    
    if (dockerDetected || forceAlternativeMethodForDocker()) {
      console.log("Detectado entorno Docker o limitaciones - FORZANDO método alternativo de procesamiento");
      toast.info("Utilizando método optimizado para Docker", { duration: 4000 });
      return await useAlternativeBackgroundRemoval(imageElement);
    }
    
    console.log("Usando método estándar de eliminación de fondo...");
    
    try {
      // Dynamically import the transformers library to reduce initial load time
      console.log("Importando módulos de transformers.js...");
      const { pipeline, env } = await import('@huggingface/transformers');
      
      // Configure transformers.js
      env.allowLocalModels = false;
      env.useBrowserCache = true;
      
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
      canvas.width = imageElement.naturalWidth || imageElement.width;
      canvas.height = imageElement.naturalHeight || imageElement.height;
      ctx.drawImage(imageElement, 0, 0);
      
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

// Método alternativo mejorado para remover el fondo sin usar el modelo de ML
export const useAlternativeBackgroundRemoval = async (imageElement: HTMLImageElement): Promise<Blob> => {
  console.log("Utilizando método alternativo de remoción de fondo");
  toast.info("Utilizando método simplificado para el procesamiento de la imagen", { duration: 3000 });
  
  // Intentar usar Canvas API para recortar el sujeto de la imagen
  try {
    // Crear un canvas con las dimensiones de la imagen original
    const originalCanvas = document.createElement('canvas');
    const ctx = originalCanvas.getContext('2d', { willReadFrequently: true });
    
    if (!ctx) {
      throw new Error('No se pudo obtener el contexto del canvas');
    }
    
    // Dibujar la imagen en el canvas original
    originalCanvas.width = imageElement.naturalWidth;
    originalCanvas.height = imageElement.naturalHeight;
    ctx.drawImage(imageElement, 0, 0);
    
    // Obtener datos de la imagen
    const imageData = ctx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);
    const data = imageData.data;
    
    // Algoritmo simple para detectar bordes y eliminar fondo
    // Asumiendo que el fondo es más claro y uniforme que el sujeto
    
    // 1. Detectar colores de bordes (asumiendo que son parte del fondo)
    const edgePixels = [];
    const borderSize = 10;
    
    // Recopilar los colores de los bordes
    for (let y = 0; y < borderSize; y++) {
      for (let x = 0; x < originalCanvas.width; x++) {
        const i = (y * originalCanvas.width + x) * 4;
        edgePixels.push([data[i], data[i + 1], data[i + 2]]);
      }
    }
    
    for (let y = originalCanvas.height - borderSize; y < originalCanvas.height; y++) {
      for (let x = 0; x < originalCanvas.width; x++) {
        const i = (y * originalCanvas.width + x) * 4;
        edgePixels.push([data[i], data[i + 1], data[i + 2]]);
      }
    }
    
    for (let x = 0; x < borderSize; x++) {
      for (let y = borderSize; y < originalCanvas.height - borderSize; y++) {
        const i = (y * originalCanvas.width + x) * 4;
        edgePixels.push([data[i], data[i + 1], data[i + 2]]);
      }
    }
    
    for (let x = originalCanvas.width - borderSize; x < originalCanvas.width; x++) {
      for (let y = borderSize; y < originalCanvas.height - borderSize; y++) {
        const i = (y * originalCanvas.width + x) * 4;
        edgePixels.push([data[i], data[i + 1], data[i + 2]]);
      }
    }
    
    // Calcular el color promedio del borde (posible color de fondo)
    let avgR = 0, avgG = 0, avgB = 0;
    edgePixels.forEach(pixel => {
      avgR += pixel[0];
      avgG += pixel[1];
      avgB += pixel[2];
    });
    
    avgR = Math.round(avgR / edgePixels.length);
    avgG = Math.round(avgG / edgePixels.length);
    avgB = Math.round(avgB / edgePixels.length);
    
    console.log("Color de fondo detectado:", avgR, avgG, avgB);
    
    // 2. Crear un nuevo canvas para la imagen con fondo eliminado
    const resultCanvas = document.createElement('canvas');
    resultCanvas.width = PHOTO_REQUIREMENTS.width;
    resultCanvas.height = PHOTO_REQUIREMENTS.height;
    const resultCtx = resultCanvas.getContext('2d');
    
    if (!resultCtx) {
      throw new Error('No se pudo obtener el contexto del canvas resultante');
    }
    
    // Rellenar con fondo blanco
    resultCtx.fillStyle = PHOTO_REQUIREMENTS.backgroundColor;
    resultCtx.fillRect(0, 0, resultCanvas.width, resultCanvas.height);
    
    // Crear una máscara simplificada
    const tolerance = 35; // Tolerancia para la diferencia de color
    
    // Crear un nuevo ImageData para la imagen con fondo eliminado
    const maskedImageData = ctx.createImageData(originalCanvas.width, originalCanvas.height);
    const maskedData = maskedImageData.data;
    
    // Aplicar umbral para separar sujeto del fondo
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Calcular la diferencia de color con el color promedio del borde
      const diff = Math.sqrt(
        Math.pow(r - avgR, 2) +
        Math.pow(g - avgG, 2) +
        Math.pow(b - avgB, 2)
      );
      
      // Si la diferencia es menor que la tolerancia, es parte del fondo
      if (diff < tolerance) {
        // Hacer transparente (para el fondo)
        maskedData[i] = 255;     // R - blanco
        maskedData[i + 1] = 255; // G - blanco
        maskedData[i + 2] = 255; // B - blanco
        maskedData[i + 3] = 0;   // Alpha - transparente
      } else {
        // Mantener el color original (para el sujeto)
        maskedData[i] = r;
        maskedData[i + 1] = g;
        maskedData[i + 2] = b;
        maskedData[i + 3] = 255; // Alpha - opaco
      }
    }
    
    // Poner la imagen procesada en el canvas original
    ctx.putImageData(maskedImageData, 0, 0);
    
    // Escalar y centrar la imagen en el canvas final
    const scaleWidth = PHOTO_REQUIREMENTS.width / originalCanvas.width;
    const scaleHeight = PHOTO_REQUIREMENTS.height / originalCanvas.height;
    const scale = Math.min(scaleWidth, scaleHeight);
    
    const newWidth = originalCanvas.width * scale;
    const newHeight = originalCanvas.height * scale;
    const x = (PHOTO_REQUIREMENTS.width - newWidth) / 2;
    const y = (PHOTO_REQUIREMENTS.height - newHeight) / 2;
    
    // Dibujar la imagen procesada en el canvas final
    resultCtx.drawImage(originalCanvas, x, y, newWidth, newHeight);
    
    // Convertir a blob y devolver
    return new Promise((resolve, reject) => {
      resultCanvas.toBlob(
        (blob) => {
          if (blob) {
            console.log('Imagen procesada con método alternativo mejorado');
            toast.success("Imagen procesada correctamente");
            resolve(blob);
          } else {
            reject(new Error('Error al crear el blob de la imagen'));
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (canvasError) {
    console.error("Error en el algoritmo de eliminación de fondo alternativo:", canvasError);
    
    // Si falla el algoritmo alternativo, usar un método más simple de recorte
    console.log("Usando método de recorte básico...");
    
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
    
    toast.info("Utilizando método básico para el procesamiento de la imagen.");
    
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            console.log('Imagen procesada con método básico');
            resolve(blob);
          } else {
            reject(new Error('Error al crear el blob de la imagen'));
          }
        },
        'image/png',
        1.0
      );
    });
  }
};
