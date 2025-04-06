
import { toast } from "sonner";
import { PHOTO_REQUIREMENTS } from "../photoRequirements";

// Alternative method for background removal without ML models
export const useAlternativeBackgroundRemoval = async (imageElement: HTMLImageElement): Promise<Blob> => {
  console.log("Utilizando método alternativo de remoción de fondo");
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
    
    // ======= MÉTODO DE DETECCIÓN DE FONDO MEJORADO =======
    
    // 1. Detección de bordes para encontrar color de fondo
    const borderPixels = [];
    const borderWidth = Math.max(10, Math.floor(Math.min(width, height) * 0.05)); // Border 5% of smallest dimension
    
    // Muestrear píxeles de los bordes (superior, inferior, izquierdo, derecho)
    // Borde superior
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < borderWidth; y++) {
        const idx = (y * width + x) * 4;
        borderPixels.push([pixels[idx], pixels[idx+1], pixels[idx+2]]);
      }
    }
    
    // Borde inferior
    for (let x = 0; x < width; x++) {
      for (let y = height - borderWidth; y < height; y++) {
        const idx = (y * width + x) * 4;
        borderPixels.push([pixels[idx], pixels[idx+1], pixels[idx+2]]);
      }
    }
    
    // Bordes laterales (excluyendo las esquinas ya procesadas)
    for (let y = borderWidth; y < height - borderWidth; y++) {
      // Borde izquierdo
      for (let x = 0; x < borderWidth; x++) {
        const idx = (y * width + x) * 4;
        borderPixels.push([pixels[idx], pixels[idx+1], pixels[idx+2]]);
      }
      
      // Borde derecho
      for (let x = width - borderWidth; x < width; x++) {
        const idx = (y * width + x) * 4;
        borderPixels.push([pixels[idx], pixels[idx+1], pixels[idx+2]]);
      }
    }
    
    // 2. Encontrar colores más frecuentes en los bordes (probablemente el fondo)
    const colorCounts = new Map();
    for (const [r, g, b] of borderPixels) {
      // Agrupar colores similares usando cuantización simple
      const quantizedR = Math.round(r / 10) * 10;
      const quantizedG = Math.round(g / 10) * 10;
      const quantizedB = Math.round(b / 10) * 10;
      
      const colorKey = `${quantizedR},${quantizedG},${quantizedB}`;
      colorCounts.set(colorKey, (colorCounts.get(colorKey) || 0) + 1);
    }
    
    // Ordenar colores por frecuencia y obtener el más común
    const sortedColors = [...colorCounts.entries()].sort((a, b) => b[1] - a[1]);
    const dominantColorKey = sortedColors[0][0];
    const [bgR, bgG, bgB] = dominantColorKey.split(',').map(Number);
    
    console.log("Color de fondo detectado:", bgR, bgG, bgB);
    
    // 3. Crear máscara con detección de piel y umbral de color
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
    
    // Usar una versión suavizada como base
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
    
    if (!tempCtx) {
      throw new Error('No se pudo obtener el contexto del canvas temporal');
    }
    
    // Aplicar un pequeño suavizado para reducir ruido
    tempCtx.filter = 'blur(1px)';
    tempCtx.drawImage(originalCanvas, 0, 0);
    
    // Obtener datos para procesamiento
    const tempData = tempCtx.getImageData(0, 0, width, height);
    const tempPixels = tempData.data;
    
    // 4. Procesamiento de píxeles para crear máscara
    const maskData = new Uint8ClampedArray(pixels.length);
    
    // Método híbrido uniendo detección de piel y distancia de color respecto al fondo
    const skinLowerRGB = [60, 30, 20]; // Umbral bajo para detección de piel
    const skinUpperRGB = [255, 220, 180]; // Umbral alto para detección de piel
    
    // Tolerancia para el color de fondo (mayor es más agresivo eliminando el fondo)
    const backgroundTolerance = 30;
    
    for (let i = 0; i < pixels.length; i += 4) {
      const r = tempPixels[i];
      const g = tempPixels[i + 1];
      const b = tempPixels[i + 2];
      
      // Máscara básica: 255 para conservar, 0 para fondo
      let isForeground = false;
      
      // 1. Verificar si es piel (alta probabilidad de ser persona)
      const isSkin = r >= skinLowerRGB[0] && r <= skinUpperRGB[0] &&
                    g >= skinLowerRGB[1] && g <= skinUpperRGB[1] &&
                    b >= skinLowerRGB[2] && b <= skinUpperRGB[2] &&
                    (r > g) && (g > b); // La piel humana suele tener R > G > B
      
      // 2. Verificar si es similar al color de fondo
      const colorDiff = Math.sqrt(
        Math.pow(r - bgR, 2) +
        Math.pow(g - bgG, 2) +
        Math.pow(b - bgB, 2)
      );
      
      const isBackground = colorDiff < backgroundTolerance;
      
      // 3. Combinación de criterios
      if (isSkin || !isBackground) {
        isForeground = true;
      }
      
      // Establecer valores de máscara
      maskData[i] = isForeground ? pixels[i] : 255;
      maskData[i + 1] = isForeground ? pixels[i + 1] : 255;
      maskData[i + 2] = isForeground ? pixels[i + 2] : 255;
      maskData[i + 3] = 255; // Alpha siempre 255
    }
    
    // 5. Refinamiento de la máscara
    // Aplicar resultado al canvas con fondo blanco
    const finalImageData = new ImageData(maskData, width, height);
    resultCtx.putImageData(finalImageData, 0, 0);
    
    // 6. Escalar y ajustar al tamaño final
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
    
    // Si falla, usar método básico de recorte como respaldo
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
