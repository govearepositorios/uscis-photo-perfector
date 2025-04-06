import { PHOTO_REQUIREMENTS } from "../photoRequirements";
import { toast } from "sonner";
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js to use web storage and not download to disk
env.allowLocalModels = false;
env.useBrowserCache = true;

const MAX_IMAGE_DIMENSION = 1024;

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
    console.log('Starting U-2-Net based background removal...');
    
    // Create canvas to work with
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Resize image if needed and draw it to canvas
    const wasResized = resizeImageIfNeeded(canvas, ctx, imageElement);
    console.log(`Image ${wasResized ? 'was' : 'was not'} resized. Final dimensions: ${canvas.width}x${canvas.height}`);
    
    // Get image data as base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    console.log('Image converted to base64');
    
    // Initialize the image-segmentation pipeline with a U-2-Net derived model
    // Using "Xenova/u2net-portrait" which is a portrait-specialized version of U-2-Net
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
    
    // Process the image to get the mask
    console.log('Processing with portrait segmentation model...');
    const result = await segmenter(imageData);
    
    console.log('Segmentation result:', result);
    
    if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
      throw new Error('Invalid segmentation result');
    }
    
    // Create a new canvas for the masked image
    const maskedCanvas = document.createElement('canvas');
    maskedCanvas.width = canvas.width;
    maskedCanvas.height = canvas.height;
    const maskedCtx = maskedCanvas.getContext('2d');
    
    if (!maskedCtx) throw new Error('Could not get masked canvas context');
    
    // Draw original image
    maskedCtx.drawImage(canvas, 0, 0);
    
    // Apply the mask
    const maskedImageData = maskedCtx.getImageData(0, 0, maskedCanvas.width, maskedCanvas.height);
    const data = maskedImageData.data;
    
    // Get the portrait mask from the result (U-2-Net specialized for portraits)
    const maskData = result[0].mask.data;
    
    // Apply mask to alpha channel - for U-2-Net portrait model, higher values indicate the person/foreground
    for (let i = 0; i < maskData.length; i++) {
      // U-2-Net portrait model typically outputs foreground as higher values
      // We use a threshold to make the mask more definitive
      const threshold = 0.5;
      const alpha = maskData[i] > threshold ? 255 : 0; // Binary mask for cleaner results
      
      // If this is background (alpha == 0), make it pure white
      if (alpha === 0) {
        data[i * 4] = 255; // R
        data[i * 4 + 1] = 255; // G
        data[i * 4 + 2] = 255; // B
      }
      // Keep the original person pixels (alpha == 255)
    }
    
    maskedCtx.putImageData(maskedImageData, 0, 0);
    console.log('Mask applied successfully');
    
    // Create output canvas with USCIS dimensions and white background
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = PHOTO_REQUIREMENTS.width;
    outputCanvas.height = PHOTO_REQUIREMENTS.height;
    const outputCtx = outputCanvas.getContext('2d');
    
    if (!outputCtx) throw new Error('Could not get output canvas context');
    
    // Fill with white background
    outputCtx.fillStyle = PHOTO_REQUIREMENTS.backgroundColor;
    outputCtx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
    
    // Calculate scaling to fit the image
    const scaleWidth = PHOTO_REQUIREMENTS.width / maskedCanvas.width;
    const scaleHeight = PHOTO_REQUIREMENTS.height / maskedCanvas.height;
    const scale = Math.min(scaleWidth, scaleHeight);
    
    const scaledWidth = maskedCanvas.width * scale;
    const scaledHeight = maskedCanvas.height * scale;
    const offsetX = (PHOTO_REQUIREMENTS.width - scaledWidth) / 2;
    const offsetY = (PHOTO_REQUIREMENTS.height - scaledHeight) / 2;
    
    // Draw the masked image onto the white background, centered
    outputCtx.drawImage(
      maskedCanvas,
      0, 0, maskedCanvas.width, maskedCanvas.height,
      offsetX, offsetY, scaledWidth, scaledHeight
    );
    
    // Convert to blob
    return new Promise((resolve, reject) => {
      outputCanvas.toBlob(
        (blob) => {
          if (blob) {
            toast.success("Imagen procesada con U-2-Net");
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
    console.error('Error in U-2-Net background removal:', error);
    throw error;
  }
};
