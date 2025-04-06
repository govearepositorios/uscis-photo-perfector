import { PHOTO_REQUIREMENTS } from "../photoRequirements";
import { toast } from "sonner";
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js to use web storage and not download to disk
env.allowLocalModels = false;
env.useBrowserCache = true;

// Maximum dimension for processing (to improve performance)
const MAX_IMAGE_DIMENSION = 1024;

// Resize image if it's too large for processing
function resizeImageIfNeeded(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    return true;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0);
  return false;
}

export const removeBackground = async (imageElement: HTMLImageElement): Promise<Blob> => {
  try {
    console.log('Starting background removal with U-2-Net...');
    
    // Create canvas for image processing
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Resize image if needed and draw it to canvas
    const wasResized = resizeImageIfNeeded(canvas, ctx, imageElement);
    console.log(`Image ${wasResized ? 'was' : 'was not'} resized. Final dimensions: ${canvas.width}x${canvas.height}`);
    
    // Convert to base64 for model processing
    const imageData = canvas.toDataURL('image/jpeg', 0.85);
    
    console.log('Loading portrait segmentation model...');
    const segmenter = await pipeline(
      'image-segmentation', 
      'Xenova/u2net-portrait',
      { 
        progress_callback: (progress: any) => {
          if (progress && progress.status) {
            console.log(`Model loading: ${progress.status} ${progress.progress ? Math.round(progress.progress * 100) + '%' : ''}`);
          }
        }
      }
    );
    
    console.log('Processing image with U-2-Net...');
    const result = await segmenter(imageData);
    
    if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
      throw new Error('Invalid segmentation result');
    }
    
    console.log('Creating masked image...');
    // Create canvas for the processed image
    const maskedCanvas = document.createElement('canvas');
    maskedCanvas.width = canvas.width;
    maskedCanvas.height = canvas.height;
    const maskedCtx = maskedCanvas.getContext('2d');
    
    if (!maskedCtx) throw new Error('Could not get masked canvas context');
    
    // Draw original image
    maskedCtx.drawImage(canvas, 0, 0);
    
    // Apply mask to keep only the person
    const imageData = maskedCtx.getImageData(0, 0, maskedCanvas.width, maskedCanvas.height);
    const data = imageData.data;
    const maskData = result[0].mask.data;
    
    // Apply threshold for cleaner mask - values above threshold are person, below are background
    const threshold = 0.5;
    
    for (let i = 0; i < maskData.length; i++) {
      // U-2-Net returns foreground (person) as higher values in the mask
      const isForeground = maskData[i] > threshold;
      
      // If background (not foreground), make it white
      if (!isForeground) {
        data[i * 4] = 255;     // R
        data[i * 4 + 1] = 255; // G
        data[i * 4 + 2] = 255; // B
      }
    }
    
    maskedCtx.putImageData(imageData, 0, 0);
    
    // Create final output canvas with USCIS dimensions
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = PHOTO_REQUIREMENTS.width;
    outputCanvas.height = PHOTO_REQUIREMENTS.height;
    const outputCtx = outputCanvas.getContext('2d');
    
    if (!outputCtx) throw new Error('Could not get output canvas context');
    
    // Fill with white background
    outputCtx.fillStyle = PHOTO_REQUIREMENTS.backgroundColor;
    outputCtx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
    
    // Calculate scaling to fit the person in the photo
    const scaleWidth = PHOTO_REQUIREMENTS.width / maskedCanvas.width;
    const scaleHeight = PHOTO_REQUIREMENTS.height / maskedCanvas.height;
    const scale = Math.min(scaleWidth, scaleHeight);
    
    const scaledWidth = maskedCanvas.width * scale;
    const scaledHeight = maskedCanvas.height * scale;
    const offsetX = (PHOTO_REQUIREMENTS.width - scaledWidth) / 2;
    const offsetY = (PHOTO_REQUIREMENTS.height - scaledHeight) / 2;
    
    // Draw the masked image centered on the white background
    outputCtx.drawImage(
      maskedCanvas,
      0, 0, maskedCanvas.width, maskedCanvas.height,
      offsetX, offsetY, scaledWidth, scaledHeight
    );
    
    // Convert to blob for download/display
    return new Promise((resolve, reject) => {
      outputCanvas.toBlob(
        (blob) => {
          if (blob) {
            toast.success("Imagen procesada con éxito");
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
    console.error('Error en el procesamiento con U-2-Net:', error);
    throw error;
  }
};
