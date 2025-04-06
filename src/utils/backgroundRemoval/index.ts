
import { toast } from "sonner";
import { removeBackground as u2netRemoveBackground } from "./backgroundRemover";
import { PHOTO_REQUIREMENTS } from "../photoRequirements";

// Process image with background removal using U-2-Net
export const removeBackground = async (imageElement: HTMLImageElement): Promise<Blob | null> => {
  try {
    console.log("Iniciando procesamiento con U-2-Net...");
    
    toast.info("Procesando imagen...", { duration: 5000 });
    
    return await u2netRemoveBackground(imageElement);
  } catch (error) {
    console.error('Error al procesar la imagen con U-2-Net:', error);
    toast.error("Fallando el procesamiento, usando método alternativo...", { duration: 3000 });
    
    // Fallback: simple resize and center on white background
    return await simpleFallbackMethod(imageElement);
  }
};

// Fallback method if AI processing fails
const simpleFallbackMethod = async (imageElement: HTMLImageElement): Promise<Blob> => {
  try {
    console.log('Usando método alternativo simple...');
    
    // Create canvas with USCIS dimensions
    const canvas = document.createElement('canvas');
    canvas.width = PHOTO_REQUIREMENTS.width;
    canvas.height = PHOTO_REQUIREMENTS.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Fill with white background
    ctx.fillStyle = PHOTO_REQUIREMENTS.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate scaling to fit the image
    const scaleWidth = PHOTO_REQUIREMENTS.width / imageElement.naturalWidth;
    const scaleHeight = PHOTO_REQUIREMENTS.height / imageElement.naturalHeight;
    const scale = Math.min(scaleWidth, scaleHeight);
    
    const scaledWidth = imageElement.naturalWidth * scale;
    const scaledHeight = imageElement.naturalHeight * scale;
    const offsetX = (PHOTO_REQUIREMENTS.width - scaledWidth) / 2;
    const offsetY = (PHOTO_REQUIREMENTS.height - scaledHeight) / 2;
    
    // Draw the original image centered on the white background
    ctx.drawImage(
      imageElement,
      0, 0, imageElement.naturalWidth, imageElement.naturalHeight,
      offsetX, offsetY, scaledWidth, scaledHeight
    );
    
    // Convert to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            toast.success("Imagen procesada con método alternativo");
            resolve(blob);
          } else {
            reject(new Error('Error al crear la imagen final'));
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error('Error en el método alternativo:', error);
    throw error;
  }
};
