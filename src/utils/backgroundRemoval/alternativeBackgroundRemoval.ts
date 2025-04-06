
import { toast } from "sonner";
import { PHOTO_REQUIREMENTS } from "../photoRequirements";

// Alternative method for background removal without ML models
export const useAlternativeBackgroundRemoval = async (imageElement: HTMLImageElement): Promise<Blob> => {
  console.log("Utilizando método alternativo optimizado de remoción de fondo");
  toast.info("Procesando imagen...", { duration: 3000 });
  
  try {
    // Crear canvas con las dimensiones de la imagen original
    const originalCanvas = document.createElement('canvas');
    const ctx = originalCanvas.getContext('2d', { willReadFrequently: true });
    
    if (!ctx) {
      throw new Error('No se pudo obtener el contexto del canvas');
    }
    
    // Obtener dimensiones reales de la imagen
    const width = imageElement.naturalWidth || imageElement.width;
    const height = imageElement.naturalHeight || imageElement.height;
    
    console.log(`Procesando imagen de ${width}x${height} píxeles`);
    
    // Dibujar la imagen en el canvas original
    originalCanvas.width = width;
    originalCanvas.height = height;
    ctx.drawImage(imageElement, 0, 0, width, height);
    
    // Obtener datos de la imagen
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    
    // ======= MÉTODO MEJORADO DE DETECCIÓN DE FONDO =======
    
    // 1. Detección de fondo usando múltiples técnicas
    
    // Para mejorar la detección, vamos a usar varios métodos y combinarlos
    
    // 1.1 Analizar bordes para encontrar el color de fondo predominante
    const edgePixels = [];
    const edgeWidth = Math.max(5, Math.floor(width * 0.03)); // 3% del ancho
    
    // Bordes superior e inferior
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < edgeWidth; y++) {
        const idx = (y * width + x) * 4;
        edgePixels.push([pixels[idx], pixels[idx+1], pixels[idx+2]]);
      }
      
      for (let y = height - edgeWidth; y < height; y++) {
        const idx = (y * width + x) * 4;
        edgePixels.push([pixels[idx], pixels[idx+1], pixels[idx+2]]);
      }
    }
    
    // Bordes izquierdo y derecho (evitando duplicar las esquinas)
    for (let y = edgeWidth; y < height - edgeWidth; y++) {
      for (let x = 0; x < edgeWidth; x++) {
        const idx = (y * width + x) * 4;
        edgePixels.push([pixels[idx], pixels[idx+1], pixels[idx+2]]);
      }
      
      for (let x = width - edgeWidth; x < width; x++) {
        const idx = (y * width + x) * 4;
        edgePixels.push([pixels[idx], pixels[idx+1], pixels[idx+2]]);
      }
    }
    
    // 1.2 Encontrar los colores más frecuentes en los bordes con cuantización
    const colorCounts = new Map();
    for (const [r, g, b] of edgePixels) {
      // Agrupar colores similares 
      const quantizedR = Math.round(r / 5) * 5;
      const quantizedG = Math.round(g / 5) * 5;
      const quantizedB = Math.round(b / 5) * 5;
      
      const colorKey = `${quantizedR},${quantizedG},${quantizedB}`;
      colorCounts.set(colorKey, (colorCounts.get(colorKey) || 0) + 1);
    }
    
    // Ordenar colores por frecuencia
    const sortedColors = [...colorCounts.entries()].sort((a, b) => b[1] - a[1]);
    
    // Tomar los 3 colores más frecuentes (probablemente fondo)
    const topBackgroundColors = sortedColors.slice(0, 3).map(([colorKey]) => {
      const [r, g, b] = colorKey.split(',').map(Number);
      return [r, g, b];
    });
    
    console.log("Colores de fondo detectados:", topBackgroundColors);
    
    // 2. Crear máscara combinando diferentes métodos
    const resultCanvas = document.createElement('canvas');
    resultCanvas.width = width;
    resultCanvas.height = height;
    const resultCtx = resultCanvas.getContext('2d', { willReadFrequently: true });
    
    if (!resultCtx) {
      throw new Error('No se pudo obtener el contexto del canvas resultante');
    }
    
    // Rellenar con fondo blanco
    resultCtx.fillStyle = PHOTO_REQUIREMENTS.backgroundColor;
    resultCtx.fillRect(0, 0, width, height);
    
    // Aplicar un suavizado leve para reducir ruido
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
    
    if (!tempCtx) {
      throw new Error('No se pudo obtener el contexto del canvas temporal');
    }
    
    tempCtx.filter = 'blur(1px)';
    tempCtx.drawImage(originalCanvas, 0, 0);
    
    // Obtener datos para procesamiento
    const tempData = tempCtx.getImageData(0, 0, width, height);
    const tempPixels = tempData.data;
    
    // 3. Procesamiento de píxeles para crear máscara mejorada
    const maskData = new Uint8ClampedArray(pixels.length);
    
    // Parámetros para detección de piel
    const skinLowerRGB = [60, 30, 20]; 
    const skinUpperRGB = [255, 220, 180];
    
    // Umbral de tolerancia para el fondo (más bajo = elimina menos, más alto = elimina más)
    const backgroundTolerance = 25;
    
    // Cache para optimizar cálculos
    const colorDistanceCache = new Map();
    
    for (let i = 0; i < pixels.length; i += 4) {
      const r = tempPixels[i];
      const g = tempPixels[i + 1];
      const b = tempPixels[i + 2];
      
      // Máscara: 255 para conservar, 0 para fondo
      let isForeground = false;
      
      // 1. Verificar si es piel (alta probabilidad de ser persona)
      const isSkin = r >= skinLowerRGB[0] && r <= skinUpperRGB[0] &&
                    g >= skinLowerRGB[1] && g <= skinUpperRGB[1] &&
                    b >= skinLowerRGB[2] && b <= skinUpperRGB[2] &&
                    (r > g) && (g > b); // La piel humana suele tener R > G > B
      
      // 2. Verificar si es similar a alguno de los colores de fondo detectados
      let isBackground = false;
      
      // Calcular distancia a los colores de fondo más frecuentes
      for (const [bgR, bgG, bgB] of topBackgroundColors) {
        const colorKey = `${r},${g},${b}-${bgR},${bgG},${bgB}`;
        
        let colorDiff;
        if (colorDistanceCache.has(colorKey)) {
          colorDiff = colorDistanceCache.get(colorKey);
        } else {
          colorDiff = Math.sqrt(
            Math.pow(r - bgR, 2) +
            Math.pow(g - bgG, 2) +
            Math.pow(b - bgB, 2)
          );
          colorDistanceCache.set(colorKey, colorDiff);
        }
        
        if (colorDiff < backgroundTolerance) {
          isBackground = true;
          break;
        }
      }
      
      // 3. Combinación mejorada de criterios
      if (isSkin || !isBackground) {
        // Adicional: Verificar saturación para evitar eliminar ropa colorida
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const saturation = max > 0 ? (max - min) / max : 0;
        
        // Alta saturación indica colores vivos (probablemente no fondo)
        if (saturation > 0.2) {
          isForeground = true;
        } else {
          isForeground = isSkin || !isBackground;
        }
      }
      
      // Establecer valores de máscara
      if (isForeground) {
        maskData[i] = pixels[i];
        maskData[i + 1] = pixels[i + 1];
        maskData[i + 2] = pixels[i + 2];
        maskData[i + 3] = 255; // Alpha siempre 255
      } else {
        // Fondo blanco
        maskData[i] = 255;
        maskData[i + 1] = 255;
        maskData[i + 2] = 255;
        maskData[i + 3] = 255;
      }
    }
    
    // 4. Aplicar resultado al canvas con fondo blanco
    const finalImageData = new ImageData(maskData, width, height);
    resultCtx.putImageData(finalImageData, 0, 0);
    
    // 5. Escalar y ajustar al tamaño final
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = PHOTO_REQUIREMENTS.width;
    outputCanvas.height = PHOTO_REQUIREMENTS.height;
    const outputCtx = outputCanvas.getContext('2d');
    
    if (!outputCtx) {
      throw new Error('No se pudo obtener el contexto del canvas de salida');
    }
    
    // Establecer fondo blanco
    outputCtx.fillStyle = PHOTO_REQUIREMENTS.backgroundColor;
    outputCtx.fillRect(0, 0, PHOTO_REQUIREMENTS.width, PHOTO_REQUIREMENTS.height);
    
    // Calcular escalado manteniendo proporciones
    const scaleWidth = PHOTO_REQUIREMENTS.width / width;
    const scaleHeight = PHOTO_REQUIREMENTS.height / height;
    const scale = Math.min(scaleWidth, scaleHeight);
    
    const scaledWidth = width * scale;
    const scaledHeight = height * scale;
    const offsetX = (PHOTO_REQUIREMENTS.width - scaledWidth) / 2;
    const offsetY = (PHOTO_REQUIREMENTS.height - scaledHeight) / 2;
    
    // Dibujar imagen final con fondo blanco
    outputCtx.drawImage(resultCanvas, offsetX, offsetY, scaledWidth, scaledHeight);
    
    console.log("Procesamiento completo - imagen con fondo blanco generada");
    
    // Convertir canvas a blob
    return new Promise((resolve, reject) => {
      outputCanvas.toBlob(
        (blob) => {
          if (blob) {
            toast.success("Imagen procesada correctamente");
            resolve(blob);
          } else {
            reject(new Error('Error al generar la imagen final'));
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error("Error en la eliminación de fondo:", error);
    
    // Si falla, usar método simple de respaldo
    return useBasicCroppingFallback(imageElement);
  }
};

// Método básico de respaldo que simplemente recorta la imagen
const useBasicCroppingFallback = async (imageElement: HTMLImageElement): Promise<Blob> => {
  console.log("Usando método de respaldo básico (solo recorte)");
  toast.warning("Usando método simplificado para procesar la imagen");
  
  const canvas = document.createElement('canvas');
  canvas.width = PHOTO_REQUIREMENTS.width;
  canvas.height = PHOTO_REQUIREMENTS.height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('No se pudo obtener el contexto del canvas');
  }
  
  // Fondo blanco
  ctx.fillStyle = PHOTO_REQUIREMENTS.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Escalado manteniendo proporciones
  const width = imageElement.naturalWidth || imageElement.width;
  const height = imageElement.naturalHeight || imageElement.height;
  
  const scaleWidth = PHOTO_REQUIREMENTS.width / width;
  const scaleHeight = PHOTO_REQUIREMENTS.height / height;
  const scale = Math.min(scaleWidth, scaleHeight);
  
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;
  const offsetX = (PHOTO_REQUIREMENTS.width - scaledWidth) / 2;
  const offsetY = (PHOTO_REQUIREMENTS.height - scaledHeight) / 2;
  
  // Dibujar imagen centrada
  ctx.drawImage(imageElement, offsetX, offsetY, scaledWidth, scaledHeight);
  
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          console.log('Imagen procesada con método básico');
          resolve(blob);
        } else {
          reject(new Error('Error al crear la imagen final'));
        }
      },
      'image/png',
      1.0
    );
  });
};
