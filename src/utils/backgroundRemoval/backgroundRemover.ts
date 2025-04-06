
import { pipeline, env } from '@huggingface/transformers';
import { PHOTO_REQUIREMENTS } from "../photoRequirements";
import { toast } from "sonner";

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
    return { width, height };
  }

  return { width, height };
}

export const removeBackground = async (imageElement: HTMLImageElement): Promise<Blob> => {
  try {
    console.log('Starting background removal process...');
    
    // Configure transformers.js
    env.allowLocalModels = false;
    env.useBrowserCache = true;

    const segmenter = await pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512');
    
    // Convert HTMLImageElement to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Resize image if needed and draw it to canvas
    const { width, height } = resizeImageIfNeeded(canvas, ctx, imageElement);
    console.log(`Image processed with dimensions: ${width}x${height}`);
    
    // Get image data as base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    // Process the image with the segmentation model
    const result = await segmenter(imageData);
    
    if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
      throw new Error('Invalid segmentation result');
    }
    
    // Create output canvas with white background
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = PHOTO_REQUIREMENTS.width;
    outputCanvas.height = PHOTO_REQUIREMENTS.height;
    const outputCtx = outputCanvas.getContext('2d');
    
    if (!outputCtx) throw new Error('Could not get output canvas context');
    
    // Fill with white background
    outputCtx.fillStyle = PHOTO_REQUIREMENTS.backgroundColor;
    outputCtx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
    
    // Calculate scaling to fit the image
    const scaleWidth = PHOTO_REQUIREMENTS.width / width;
    const scaleHeight = PHOTO_REQUIREMENTS.height / height;
    const scale = Math.min(scaleWidth, scaleHeight);
    
    const scaledWidth = width * scale;
    const scaledHeight = height * scale;
    const offsetX = (PHOTO_REQUIREMENTS.width - scaledWidth) / 2;
    const offsetY = (PHOTO_REQUIREMENTS.height - scaledHeight) / 2;
    
    // Create a temporary canvas for the original image
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (!tempCtx) throw new Error('Could not get temp canvas context');
    
    tempCtx.drawImage(imageElement, 0, 0, width, height);
    
    // Get image data
    const tempImageData = tempCtx.getImageData(0, 0, width, height);
    const originalPixels = tempImageData.data;
    
    // Apply mask to preserve original image data
    for (let i = 0; i < result[0].mask.data.length; i++) {
      const alpha = Math.round((1 - result[0].mask.data[i]) * 255);
      
      if (alpha > 128) { // Keep the foreground
        const originalIndex = i * 4;
        outputCtx.fillStyle = `rgba(${originalPixels[originalIndex]}, ${originalPixels[originalIndex + 1]}, ${originalPixels[originalIndex + 2]}, 1)`;
        const x = (i % width);
        const y = Math.floor(i / width);
        outputCtx.fillRect(
          offsetX + x * scale, 
          offsetY + y * scale, 
          scale, 
          scale
        );
      }
    }
    
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
    console.error('Error removing background:', error);
    throw error;
  }
};
