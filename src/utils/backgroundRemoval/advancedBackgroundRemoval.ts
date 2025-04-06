import { PHOTO_REQUIREMENTS } from "../photoRequirements";
import { toast } from "sonner";

// Advanced background removal using transformers.js
export const useAdvancedBackgroundRemoval = async (imageElement: HTMLImageElement): Promise<Blob> => {
  console.log("Intentando eliminar fondo con método avanzado (transformers.js)");
  
  // Dynamically import the transformers library to reduce initial load time
  console.log("Importando módulos de transformers.js...");
  const { pipeline, env } = await import('@huggingface/transformers');
  
  // Configure transformers.js
  env.allowLocalModels = false;
  env.useBrowserCache = true;
  
  console.log("Inicializando el modelo de segmentación...");
  
  // Modelo más pequeño y rápido para entornos web
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
  
  // Draw image to canvas with original dimensions
  canvas.width = imageElement.naturalWidth || imageElement.width;
  canvas.height = imageElement.naturalHeight || imageElement.height;
  ctx.drawImage(imageElement, 0, 0);
  
  // Convert to base64 for processing with slightly reduced quality to improve performance
  console.log("Convirtiendo imagen a base64...");
  const imageData = canvas.toDataURL('image/jpeg', 0.9);
  
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
};
