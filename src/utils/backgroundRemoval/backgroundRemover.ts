
import { PHOTO_REQUIREMENTS } from "../photoRequirements";
import { toast } from "sonner";

export const removeBackground = async (imageElement: HTMLImageElement): Promise<Blob> => {
  try {
    console.log('Starting simple background removal process...');
    
    // Create canvas to work with
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Set canvas to input image dimensions
    canvas.width = imageElement.naturalWidth;
    canvas.height = imageElement.naturalHeight;
    
    // Draw original image
    ctx.drawImage(imageElement, 0, 0);
    
    // Create output canvas with white background and USCIS dimensions
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = PHOTO_REQUIREMENTS.width;
    outputCanvas.height = PHOTO_REQUIREMENTS.height;
    const outputCtx = outputCanvas.getContext('2d');
    
    if (!outputCtx) throw new Error('Could not get output canvas context');
    
    // Fill with white background
    outputCtx.fillStyle = PHOTO_REQUIREMENTS.backgroundColor;
    outputCtx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
    
    // Calculate scaling to fit the image
    const scaleWidth = PHOTO_REQUIREMENTS.width / canvas.width;
    const scaleHeight = PHOTO_REQUIREMENTS.height / canvas.height;
    const scale = Math.min(scaleWidth, scaleHeight);
    
    const scaledWidth = canvas.width * scale;
    const scaledHeight = canvas.height * scale;
    const offsetX = (PHOTO_REQUIREMENTS.width - scaledWidth) / 2;
    const offsetY = (PHOTO_REQUIREMENTS.height - scaledHeight) / 2;
    
    // Draw the original image onto the white background, centered
    outputCtx.drawImage(
      imageElement,
      0, 0, imageElement.naturalWidth, imageElement.naturalHeight,
      offsetX, offsetY, scaledWidth, scaledHeight
    );
    
    // Convert to blob
    return new Promise((resolve, reject) => {
      outputCanvas.toBlob(
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
  } catch (error) {
    console.error('Error in simple background removal:', error);
    throw error;
  }
};
