
import { toast } from "sonner";
import { removeBackground as advancedRemoveBackground } from "./backgroundRemover";
import { PHOTO_REQUIREMENTS } from "../photoRequirements";

// Process image with AI-powered background removal
export const removeBackground = async (imageElement: HTMLImageElement): Promise<Blob | null> => {
  try {
    console.log("Iniciando procesamiento avanzado de imagen:", imageElement.src.substring(0, 100) + "...");
    console.log("Dimensiones de la imagen:", imageElement.naturalWidth, "x", imageElement.naturalHeight);
    
    toast.info("Procesando imagen con IA, recortando hasta los hombros...", { duration: 5000 });
    
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
    
    // Try to crop only head and shoulders in fallback method too
    // Estimate that the top 40% of the image contains the head and shoulders
    const cropHeight = imageElement.naturalHeight * 0.4;
    const cropWidth = imageElement.naturalWidth;
    
    // Calculate scaling to fit the image
    const scaleWidth = PHOTO_REQUIREMENTS.width / cropWidth;
    const scaleHeight = PHOTO_REQUIREMENTS.height / cropHeight;
    const scale = Math.min(scaleWidth, scaleHeight);
    
    const scaledWidth = cropWidth * scale;
    const scaledHeight = cropHeight * scale;
    const offsetX = (PHOTO_REQUIREMENTS.width - scaledWidth) / 2;
    const offsetY = (PHOTO_REQUIREMENTS.height - scaledHeight) / 2;
    
    // Draw the original image onto the white background, centered, cropped to show just head and shoulders
    ctx.drawImage(
      imageElement,
      0, 0, cropWidth, cropHeight,
      offsetX, offsetY, scaledWidth, scaledHeight
    );
    
    // Convert to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            toast.success("Imagen procesada con método alternativo (recortada)");
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
