
import { toast } from "sonner";
import { removeBackground as advancedRemoveBackground } from "./backgroundRemover";
import { PHOTO_REQUIREMENTS } from "../photoRequirements";

// Process image with AI-powered background removal
export const removeBackground = async (imageElement: HTMLImageElement): Promise<Blob | null> => {
  try {
    console.log("Iniciando procesamiento avanzado de imagen:", imageElement.src.substring(0, 100) + "...");
    console.log("Dimensiones de la imagen:", imageElement.naturalWidth, "x", imageElement.naturalHeight);
    
    toast.info("Procesando imagen con IA, por favor espere...", { duration: 5000 });
    
    return await advancedRemoveBackground(imageElement);
  } catch (error) {
    console.error('Error al procesar la imagen con IA:', error);
    toast.error("Fallando la IA, usando método simple...", { duration: 3000 });
    
    // Fallback: simple resize and center on white background
    return await simpleFallbackMethod(imageElement);
  }
};

// Fallback method if AI processing fails
const simpleFallbackMethod = async (imageElement: HTMLImageElement): Promise<Blob> => {
  try {
    console.log('Using simple fallback method...');
    
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
    
    // Draw the original image onto the white background, centered
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
            reject(new Error('Error al crear el blob de la imagen'));
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error('Error in simple fallback method:', error);
    throw error;
  }
};
