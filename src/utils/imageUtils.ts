
import { PHOTO_REQUIREMENTS } from "./photoRequirements";

// Load an image from a file or blob
export const loadImage = (file: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => {
      console.error("Error al cargar la imagen:", e);
      reject(new Error("Error al cargar la imagen."));
    };
    img.src = URL.createObjectURL(file);
  });
};

// Resize and crop the image to the required dimensions
export const resizeAndCropImage = async (imageBlob: Blob): Promise<Blob> => {
  try {
    console.log("Iniciando redimensionamiento de imagen:", imageBlob.size, "bytes");
    const image = await loadImage(imageBlob);
    console.log("Imagen cargada, dimensiones:", image.width, "x", image.height);
    
    // Create a canvas with the required dimensions
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
    
    // Calculate scaling factors to fit the image within the canvas
    const scaleWidth = PHOTO_REQUIREMENTS.width / image.width;
    const scaleHeight = PHOTO_REQUIREMENTS.height / image.height;
    const scale = Math.min(scaleWidth, scaleHeight);
    
    // Calculate positioning to center the image
    const newWidth = image.width * scale;
    const newHeight = image.height * scale;
    const x = (PHOTO_REQUIREMENTS.width - newWidth) / 2;
    const y = (PHOTO_REQUIREMENTS.height - newHeight) / 2;
    
    console.log("Dibujando imagen en canvas:", x, y, newWidth, newHeight);
    // Draw the image on the canvas
    ctx.drawImage(image, x, y, newWidth, newHeight);
    
    // Convert to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            console.log("Imagen redimensionada con éxito:", blob.size, "bytes");
            resolve(blob);
          } else {
            console.error("Error al crear el blob de la imagen redimensionada");
            reject(new Error('Error al crear el blob de la imagen redimensionada'));
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error("Error en resizeAndCropImage:", error);
    throw error;
  }
};

// Type augmentation for Navigator to include deviceMemory
interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number;
}

// Detect if running in Docker environment - always return true for now
export const isDockerEnvironment = (): boolean => {
  return true;
};

// Función de utilidad para forzar el uso del método alternativo - always return true for now
export const forceAlternativeMethodForDocker = (): boolean => {
  return true;
};
