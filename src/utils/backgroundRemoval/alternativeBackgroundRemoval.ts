
import { toast } from "sonner";
import { PHOTO_REQUIREMENTS } from "../photoRequirements";

// Alternative method for background removal without ML models
export const useAlternativeBackgroundRemoval = async (imageElement: HTMLImageElement): Promise<Blob> => {
  console.log("Utilizando método alternativo de remoción de fondo");
  toast.info("Utilizando método simplificado para el procesamiento de la imagen", { duration: 3000 });
  
  // Intentar usar un algoritmo mejorado de detección de bordes y eliminación de fondo
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
    
    // 1. Detectar colores de bordes (asumiendo que son parte del fondo)
    const edgePixels = [];
    const borderSize = 15; // Aumentado para mejor detección
    
    // Recopilar los colores de los bordes (superior, inferior, izquierdo, derecho)
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
    
    // Crear una máscara simplificada con tolerancia ajustable
    const tolerance = 45; // Aumentado para mejor detección
    
    // Algoritmo mejorado para separar sujeto del fondo
    // Primero creamos una máscara
    const maskedImageData = ctx.createImageData(originalCanvas.width, originalCanvas.height);
    const maskedData = maskedImageData.data;
    
    // Aplicar umbral para separar sujeto del fondo con algoritmo mejorado
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
        // Hacer blanco y transparente (para el fondo)
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
    
    console.log("Imagen procesada con método alternativo mejorado");
    
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
