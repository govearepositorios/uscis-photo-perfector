
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

// Function to detect the approximate position of shoulders based on the image height
function estimateShoulderPosition(height: number): number {
  // In a typical photo, shoulders are approximately 1/3 of the total height from the top
  return Math.round(height * 0.4); // Adjusted to 40% of height which should include shoulders
}

export const removeBackground = async (imageElement: HTMLImageElement): Promise<Blob> => {
  try {
    console.log('Starting advanced background removal process...');
    
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
    
    // Create segmenter pipeline
    console.log('Initializing segmentation model...');
    const segmenter = await pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512');
    
    // Process the image with the segmentation model
    console.log('Processing with segmentation model...');
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
    const maskedImageData = maskedCtx.getImageData(
      0, 0,
      maskedCanvas.width,
      maskedCanvas.height
    );
    const data = maskedImageData.data;
    
    // Find person mask if it exists
    const personMaskIndex = result.findIndex(item => item.label === 'person');
    const maskToUse = personMaskIndex !== -1 ? result[personMaskIndex].mask : result[0].mask;
    
    // Apply mask to alpha channel
    for (let i = 0; i < maskToUse.data.length; i++) {
      // For person mask, use as is. For other masks, invert (1 - value)
      const alpha = personMaskIndex !== -1
        ? Math.round(maskToUse.data[i] * 255)
        : Math.round((1 - maskToUse.data[i]) * 255);
      data[i * 4 + 3] = alpha;
    }
    
    maskedCtx.putImageData(maskedImageData, 0, 0);
    console.log('Mask applied successfully');
    
    // Estimate shoulder position
    const shoulderPosition = estimateShoulderPosition(maskedCanvas.height);
    console.log(`Estimated shoulder position: ${shoulderPosition} px from top`);
    
    // Find the top of the head in the masked image
    let topPosition = 0;
    const dataForHeadDetection = maskedCtx.getImageData(0, 0, maskedCanvas.width, maskedCanvas.height).data;
    
    // Find first non-transparent pixel from top
    outerLoop: for (let y = 0; y < maskedCanvas.height; y++) {
      for (let x = 0; x < maskedCanvas.width; x++) {
        const index = (y * maskedCanvas.width + x) * 4;
        if (dataForHeadDetection[index + 3] > 50) { // If pixel is not transparent
          topPosition = y;
          break outerLoop;
        }
      }
    }
    
    console.log(`Detected top of head at position: ${topPosition} px from top`);
    
    // Create canvas for cropped image
    const croppedCanvas = document.createElement('canvas');
    
    // Calculate crop height to include from top of head to just below shoulders
    // If topPosition is 0, use a default value (20% from top of image)
    if (topPosition === 0) {
      topPosition = Math.floor(maskedCanvas.height * 0.2);
    }
    
    // Calculate height from top of head to shoulders, plus a bit more
    const cropHeight = Math.min(
      shoulderPosition - topPosition + maskedCanvas.height * 0.15, // Add 15% for below shoulders
      maskedCanvas.height - topPosition
    );
    
    croppedCanvas.width = maskedCanvas.width;
    croppedCanvas.height = cropHeight;
    const croppedCtx = croppedCanvas.getContext('2d');
    
    if (!croppedCtx) throw new Error('Could not get cropped canvas context');
    
    // Draw only the portion of the image from top of head to below shoulders
    croppedCtx.drawImage(
      maskedCanvas,
      0, topPosition, maskedCanvas.width, cropHeight,
      0, 0, croppedCanvas.width, croppedCanvas.height
    );
    
    console.log(`Image cropped to shoulders. New dimensions: ${croppedCanvas.width}x${croppedCanvas.height}`);
    
    // Create output canvas with USCIS dimensions and white background
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = PHOTO_REQUIREMENTS.width;
    outputCanvas.height = PHOTO_REQUIREMENTS.height;
    const outputCtx = outputCanvas.getContext('2d');
    
    if (!outputCtx) throw new Error('Could not get output canvas context');
    
    // Fill with white background
    outputCtx.fillStyle = PHOTO_REQUIREMENTS.backgroundColor;
    outputCtx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
    
    // Calculate scaling to fit the image with transparency
    const scaleWidth = PHOTO_REQUIREMENTS.width / croppedCanvas.width;
    const scaleHeight = PHOTO_REQUIREMENTS.height / croppedCanvas.height;
    const scale = Math.min(scaleWidth, scaleHeight);
    
    const scaledWidth = croppedCanvas.width * scale;
    const scaledHeight = croppedCanvas.height * scale;
    const offsetX = (PHOTO_REQUIREMENTS.width - scaledWidth) / 2;
    const offsetY = (PHOTO_REQUIREMENTS.height - scaledHeight) / 2;
    
    // Draw the masked and cropped image onto the white background, centered
    outputCtx.drawImage(
      croppedCanvas,
      0, 0, croppedCanvas.width, croppedCanvas.height,
      offsetX, offsetY, scaledWidth, scaledHeight
    );
    
    // Convert to blob
    return new Promise((resolve, reject) => {
      outputCanvas.toBlob(
        (blob) => {
          if (blob) {
            toast.success("Imagen procesada y recortada hasta los hombros");
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
    console.error('Error in advanced background removal:', error);
    throw error;
  }
};
