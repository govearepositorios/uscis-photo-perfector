
import { toast } from "sonner";
import { PHOTO_REQUIREMENTS } from "../photoRequirements";

// Alternative method for background removal without ML models
export const useAlternativeBackgroundRemoval = async (imageElement: HTMLImageElement): Promise<Blob> => {
  console.log("Utilizando método alternativo de remoción de fondo");
  toast.info("Utilizando método simplificado para el procesamiento de la imagen", { duration: 3000 });
  
  try {
    // Enfoque mejorado para Docker: método híbrido que combina algoritmos de detección y reemplazo
    
    // 1. Crear canvas con las dimensiones de la imagen original
    const originalCanvas = document.createElement('canvas');
    const ctx = originalCanvas.getContext('2d', { willReadFrequently: true });
    
    if (!ctx) {
      throw new Error('No se pudo obtener el contexto del canvas');
    }
    
    // Dibujar la imagen en el canvas original
    originalCanvas.width = imageElement.naturalWidth;
    originalCanvas.height = imageElement.naturalHeight;
    ctx.drawImage(imageElement, 0, 0);
    
    // 2. Crear canvas para el resultado final de tamaño USCIS
    const resultCanvas = document.createElement('canvas');
    resultCanvas.width = PHOTO_REQUIREMENTS.width;
    resultCanvas.height = PHOTO_REQUIREMENTS.height;
    const resultCtx = resultCanvas.getContext('2d');
    
    if (!resultCtx) {
      throw new Error('No se pudo obtener el contexto del canvas resultante');
    }
    
    // 3. Rellenar canvas resultante con fondo blanco
    resultCtx.fillStyle = PHOTO_REQUIREMENTS.backgroundColor;
    resultCtx.fillRect(0, 0, resultCanvas.width, resultCanvas.height);
    
    // 4. Obtener datos de la imagen para procesamiento
    const imageData = ctx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);
    const data = imageData.data;
    
    // 5. Detectar rostro usando un método simplificado (basado en detección de piel)
    // Este enfoque es muy simple pero efectivo para fotos de carnet
    const faceRegions = [];
    const skinColorLowerRGB = [100, 40, 20]; // Umbral bajo para detección de piel
    const skinColorUpperRGB = [255, 200, 170]; // Umbral alto para detección de piel
    
    // Crear una máscara para la piel
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = originalCanvas.width;
    maskCanvas.height = originalCanvas.height;
    const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
    
    if (!maskCtx) {
      throw new Error('No se pudo obtener el contexto del canvas de máscara');
    }
    
    // Dibujar la imagen en el canvas de máscara
    maskCtx.drawImage(imageElement, 0, 0);
    const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    const maskPixels = maskData.data;
    
    // Detectar piel y crear máscara
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Verificar si el pixel está en el rango de color de piel
      if (r >= skinColorLowerRGB[0] && r <= skinColorUpperRGB[0] &&
          g >= skinColorLowerRGB[1] && g <= skinColorUpperRGB[1] &&
          b >= skinColorLowerRGB[2] && b <= skinColorUpperRGB[2]) {
        maskPixels[i] = 255;     // R
        maskPixels[i + 1] = 255; // G
        maskPixels[i + 2] = 255; // B
        maskPixels[i + 3] = 255; // Alpha - opaco
      } else {
        maskPixels[i] = 0;       // R
        maskPixels[i + 1] = 0;   // G
        maskPixels[i + 2] = 0;   // B
        maskPixels[i + 3] = 0;   // Alpha - transparente
      }
    }
    
    // Aplicar la máscara al canvas para refinamiento
    maskCtx.putImageData(maskData, 0, 0);
    
    // 6. Crear nueva imagen combinando el fondo blanco con la imagen original
    const processedCanvas = document.createElement('canvas');
    processedCanvas.width = originalCanvas.width;
    processedCanvas.height = originalCanvas.height;
    const processedCtx = processedCanvas.getContext('2d');
    
    if (!processedCtx) {
      throw new Error('No se pudo obtener el contexto del canvas procesado');
    }
    
    // Rellenar con fondo blanco
    processedCtx.fillStyle = PHOTO_REQUIREMENTS.backgroundColor;
    processedCtx.fillRect(0, 0, processedCanvas.width, processedCanvas.height);
    
    // Aplicar la imagen original usando la máscara como guía
    processedCtx.drawImage(imageElement, 0, 0);
    
    // 7. Aplicar técnica de umbral adaptativo para mejorar la segmentación
    const processedData = processedCtx.getImageData(0, 0, processedCanvas.width, processedCanvas.height);
    const processedPixels = processedData.data;
    
    // Detectar colores de bordes (asumiendo que son parte del fondo)
    const borderSize = 20; // pixels from each edge
    const edgeColors = [];
    
    // Sample colors from the image borders
    for (let y = 0; y < borderSize; y++) {
      for (let x = 0; x < originalCanvas.width; x++) {
        const i = (y * originalCanvas.width + x) * 4;
        edgeColors.push([data[i], data[i + 1], data[i + 2]]);
      }
    }
    
    for (let y = originalCanvas.height - borderSize; y < originalCanvas.height; y++) {
      for (let x = 0; x < originalCanvas.width; x++) {
        const i = (y * originalCanvas.width + x) * 4;
        edgeColors.push([data[i], data[i + 1], data[i + 2]]);
      }
    }
    
    for (let x = 0; x < borderSize; x++) {
      for (let y = borderSize; y < originalCanvas.height - borderSize; y++) {
        const i = (y * originalCanvas.width + x) * 4;
        edgeColors.push([data[i], data[i + 1], data[i + 2]]);
      }
    }
    
    for (let x = originalCanvas.width - borderSize; x < originalCanvas.width; x++) {
      for (let y = borderSize; y < originalCanvas.height - borderSize; y++) {
        const i = (y * originalCanvas.width + x) * 4;
        edgeColors.push([data[i], data[i + 1], data[i + 2]]);
      }
    }
    
    // Calculate average edge color (likely background color)
    let sumR = 0, sumG = 0, sumB = 0;
    for (const color of edgeColors) {
      sumR += color[0];
      sumG += color[1];
      sumB += color[2];
    }
    
    const avgR = sumR / edgeColors.length;
    const avgG = sumG / edgeColors.length;
    const avgB = sumB / edgeColors.length;
    
    console.log("Color de fondo detectado:", avgR, avgG, avgB);
    
    // 8. Refinamiento final: distinguir entre fondo y sujeto
    // ALGORITMO MEJORADO ESPECÍFICAMENTE PARA DOCKER: Umbral adaptativo con mayor tolerancia
    const tolerance = 60;  // Aumentado para entornos Docker
    
    for (let i = 0; i < processedPixels.length; i += 4) {
      const r = processedPixels[i];
      const g = processedPixels[i + 1];
      const b = processedPixels[i + 2];
      
      // Calcular diferencia con el color promedio de borde
      const diff = Math.sqrt(
        Math.pow(r - avgR, 2) +
        Math.pow(g - avgG, 2) +
        Math.pow(b - avgB, 2)
      );
      
      // Si la diferencia es menor que la tolerancia, es parte del fondo
      if (diff < tolerance) {
        processedPixels[i] = 255;     // R - blanco
        processedPixels[i + 1] = 255; // G - blanco
        processedPixels[i + 2] = 255; // B - blanco
      }
      
      // Mantener los píxeles de piel intactos (basado en la máscara)
      const maskAlpha = maskPixels[i + 3];
      if (maskAlpha > 200) {  // Si es parte de la piel (según la máscara)
        // No modificar - mantener colores originales
        processedPixels[i] = data[i];
        processedPixels[i + 1] = data[i + 1];
        processedPixels[i + 2] = data[i + 2];
      }
    }
    
    // Aplicar los cambios al canvas procesado
    processedCtx.putImageData(processedData, 0, 0);
    
    // 9. Escalar y centrar la imagen en el canvas final
    const scaleWidth = PHOTO_REQUIREMENTS.width / processedCanvas.width;
    const scaleHeight = PHOTO_REQUIREMENTS.height / processedCanvas.height;
    const scale = Math.min(scaleWidth, scaleHeight);
    
    const newWidth = processedCanvas.width * scale;
    const newHeight = processedCanvas.height * scale;
    const x = (PHOTO_REQUIREMENTS.width - newWidth) / 2;
    const y = (PHOTO_REQUIREMENTS.height - newHeight) / 2;
    
    // 10. Dibujar en el canvas final
    // Primero asegurar que el fondo es blanco
    resultCtx.fillStyle = PHOTO_REQUIREMENTS.backgroundColor;
    resultCtx.fillRect(0, 0, resultCanvas.width, resultCanvas.height);
    // Luego dibujar la imagen procesada
    resultCtx.drawImage(processedCanvas, x, y, newWidth, newHeight);
    
    console.log("Imagen procesada con algoritmo alternativo mejorado para Docker");
    
    // Convertir a blob y devolver
    return new Promise((resolve, reject) => {
      resultCanvas.toBlob(
        (blob) => {
          if (blob) {
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
    return useBasicCroppingFallback(imageElement, canvasError);
  }
};

// Basic fallback method when all other methods fail
const useBasicCroppingFallback = async (imageElement: HTMLImageElement, originalError: Error): Promise<Blob> => {
  console.log("Usando método de recorte básico...");
  toast.info("Utilizando método básico para el procesamiento de la imagen.");
  
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
  
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          console.log('Imagen procesada con método básico');
          resolve(blob);
        } else {
          reject(new Error(`Error al crear el blob de la imagen: ${originalError.message}`));
        }
      },
      'image/png',
      1.0
    );
  });
};
