
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

// Función para detectar la posición aproximada de los hombros basada en la altura de la imagen
function estimateShoulderPosition(height: number): number {
  // En una foto típica, los hombros están aproximadamente a 1/4 o 1/3 de la altura total
  // desde la parte superior de la imagen
  return Math.round(height * 0.33); // Ajustamos a 1/3 de la altura
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
    
    // Apply inverted mask to alpha channel
    for (let i = 0; i < result[0].mask.data.length; i++) {
      // Invert the mask value (1 - value) to keep the subject instead of the background
      const alpha = Math.round((1 - result[0].mask.data[i]) * 255);
      data[i * 4 + 3] = alpha;
    }
    
    maskedCtx.putImageData(maskedImageData, 0, 0);
    console.log('Mask applied successfully');
    
    // Estimate shoulder position
    const shoulderPosition = estimateShoulderPosition(maskedCanvas.height);
    console.log(`Estimated shoulder position: ${shoulderPosition} px from top`);
    
    // Create a new canvas for the cropped image (up to shoulders)
    const croppedCanvas = document.createElement('canvas');
    
    // Determine the position of the head in the image
    // This es una estimación simple: buscamos la primera fila con píxeles no transparentes
    const imageDataForHeadDetection = maskedCtx.getImageData(0, 0, maskedCanvas.width, maskedCanvas.height);
    const dataForHeadDetection = imageDataForHeadDetection.data;
    let topPosition = 0;
    
    // Buscar el primer pixel no transparente desde arriba (el punto más alto de la cabeza)
    outerLoop: for (let y = 0; y < maskedCanvas.height; y++) {
      for (let x = 0; x < maskedCanvas.width; x++) {
        const index = (y * maskedCanvas.width + x) * 4;
        if (dataForHeadDetection[index + 3] > 50) { // Si el pixel no es transparente
          topPosition = y;
          break outerLoop;
        }
      }
    }
    
    console.log(`Detected top of head at position: ${topPosition} px from top`);
    
    // Calcular altura desde la parte superior de la cabeza hasta los hombros
    const headToShoulderHeight = shoulderPosition - topPosition;
    
    // Asegurarnos de que hay suficiente espacio para la cabeza
    const minHeadHeight = Math.max(headToShoulderHeight, maskedCanvas.height * 0.3); // Al menos 30% de la altura total
    
    // Calcular la nueva altura del canvas para incluir hasta los hombros
    const croppedHeight = Math.min(minHeadHeight * 1.5, maskedCanvas.height - topPosition);
    
    // Configurar el canvas recortado
    croppedCanvas.width = maskedCanvas.width;
    croppedCanvas.height = croppedHeight;
    const croppedCtx = croppedCanvas.getContext('2d');
    
    if (!croppedCtx) throw new Error('Could not get cropped canvas context');
    
    // Dibujar solo la parte de la imagen hasta los hombros
    croppedCtx.drawImage(
      maskedCanvas,
      0, topPosition, maskedCanvas.width, croppedHeight,
      0, 0, croppedCanvas.width, croppedHeight
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
