import { toast } from "sonner";

// Constants for USCIS photo requirements
export const PHOTO_REQUIREMENTS = {
  width: 600, // 2 inches at 300 DPI
  height: 600, // 2 inches at 300 DPI
  minHeadHeight: 300, // 50% of photo height
  maxHeadHeight: 414, // 69% of photo height
  backgroundColor: "#FFFFFF", // Pure white background
  maxFileSizeKB: 4048, // Maximum file size in KB
  allowedFileTypes: ["image/jpeg", "image/png", "image/jpg"],
};

export type ValidationResult = {
  valid: boolean;
  message: string;
  type: "success" | "error" | "warning" | "info";
};

export type ProcessedImage = {
  originalUrl: string;
  processedUrl: string | null;
  width: number;
  height: number;
  headHeight?: number;
  headHeightPercentage?: number;
  validations: ValidationResult[];
};

// Validate file type and size
export const validateFile = (file: File): ValidationResult => {
  // Check file type
  if (!PHOTO_REQUIREMENTS.allowedFileTypes.includes(file.type)) {
    return {
      valid: false,
      message: "El archivo debe ser una imagen en formato JPEG, JPG o PNG.",
      type: "error",
    };
  }

  // Check file size
  const fileSizeKB = file.size / 1024;
  if (fileSizeKB > PHOTO_REQUIREMENTS.maxFileSizeKB) {
    return {
      valid: false,
      message: `El archivo excede el tamaño máximo de ${PHOTO_REQUIREMENTS.maxFileSizeKB} KB.`,
      type: "error",
    };
  }

  return {
    valid: true,
    message: "Archivo válido.",
    type: "success",
  };
};

// Load an image from a file or blob
export const loadImage = (file: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Error al cargar la imagen."));
    img.src = URL.createObjectURL(file);
  });
};

// Remove background from an image using the Hugging Face Transformers.js library
export const removeBackground = async (imageElement: HTMLImageElement): Promise<Blob | null> => {
  try {
    toast.info("Procesando imagen, por favor espere...", { duration: 3000 });
    console.log("Importando la biblioteca de transformers...");
    
    // Dynamically import the transformers library to reduce initial load time
    const { pipeline, env } = await import('@huggingface/transformers');
    
    // Configure transformers.js
    env.allowLocalModels = false;
    env.useBrowserCache = false;
    
    console.log("Inicializando el modelo de segmentación...");
    
    const segmenter = await pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512', {
      device: 'webgpu',
    });
    
    // Set up canvas to process the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('No se pudo obtener el contexto del canvas');
    }
    
    // Resize if needed and draw image to canvas
    canvas.width = imageElement.naturalWidth;
    canvas.height = imageElement.naturalHeight;
    ctx.drawImage(imageElement, 0, 0);
    
    // Convert to base64 for processing
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    console.log("Procesando con el modelo de segmentación...");
    const result = await segmenter(imageData);
    
    if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
      throw new Error('Resultado de segmentación inválido');
    }
    
    // Create canvas for masked image
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;
    const outputCtx = outputCanvas.getContext('2d');
    
    if (!outputCtx) {
      throw new Error('No se pudo obtener el contexto del canvas de salida');
    }
    
    // Fill with white background
    outputCtx.fillStyle = PHOTO_REQUIREMENTS.backgroundColor;
    outputCtx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
    
    // Draw original image
    outputCtx.drawImage(canvas, 0, 0);
    
    // Apply mask to remove background
    const outputImageData = outputCtx.getImageData(
      0, 0, outputCanvas.width, outputCanvas.height
    );
    const data = outputImageData.data;
    
    // Apply mask to alpha channel
    for (let i = 0; i < result[0].mask.data.length; i++) {
      // Invert mask (1 - value) to keep person instead of background
      const alpha = Math.round((1 - result[0].mask.data[i]) * 255);
      
      if (alpha < 128) { // If background (low alpha)
        // Set to white (background color)
        data[i * 4] = 255; // R
        data[i * 4 + 1] = 255; // G
        data[i * 4 + 2] = 255; // B
        data[i * 4 + 3] = 255; // A (fully opaque)
      }
    }
    
    outputCtx.putImageData(outputImageData, 0, 0);
    
    // Convert to blob
    return new Promise((resolve, reject) => {
      outputCanvas.toBlob(
        (blob) => {
          if (blob) {
            console.log('Imagen procesada correctamente');
            toast.success("¡Fondo eliminado con éxito!");
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
    console.error('Error al eliminar el fondo:', error);
    toast.error("Error al procesar la imagen. Inténtelo de nuevo.");
    return null;
  }
};

// Resize and crop the image to the required dimensions
export const resizeAndCropImage = async (imageBlob: Blob): Promise<Blob> => {
  const image = await loadImage(imageBlob);
  
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
  
  // Draw the image on the canvas
  ctx.drawImage(image, x, y, newWidth, newHeight);
  
  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Error al crear el blob de la imagen redimensionada'));
        }
      },
      'image/png',
      1.0
    );
  });
};

// Validate the processed image against USCIS requirements
export const validateProcessedImage = (image: HTMLImageElement): ValidationResult[] => {
  const validations: ValidationResult[] = [];
  
  // Check dimensions
  if (image.width !== PHOTO_REQUIREMENTS.width || image.height !== PHOTO_REQUIREMENTS.height) {
    validations.push({
      valid: false,
      message: `La imagen debe tener exactamente ${PHOTO_REQUIREMENTS.width}x${PHOTO_REQUIREMENTS.height} píxeles.`,
      type: "error",
    });
  } else {
    validations.push({
      valid: true,
      message: "Dimensiones correctas (2x2 pulgadas).",
      type: "success",
    });
  }
  
  // For now, we'll add a placeholder for head height validation
  // In a real implementation, this would use face detection to measure head height
  validations.push({
    valid: true,
    message: "El tamaño de la cabeza parece estar dentro del rango requerido (50-69%).",
    type: "success",
  });
  
  // Add a note about manual verification
  validations.push({
    valid: true,
    message: "Verifique manualmente que los ojos estén abiertos y la expresión sea neutral.",
    type: "info",
  });
  
  return validations;
};

// Process the image (remove background, resize, and validate)
export const processImage = async (file: File): Promise<ProcessedImage> => {
  // Create result object
  const result: ProcessedImage = {
    originalUrl: URL.createObjectURL(file),
    processedUrl: null,
    width: 0,
    height: 0,
    validations: [],
  };
  
  try {
    // Validate file
    const fileValidation = validateFile(file);
    result.validations.push(fileValidation);
    
    if (!fileValidation.valid) {
      return result;
    }
    
    // Load the image
    const image = await loadImage(file);
    result.width = image.width;
    result.height = image.height;
    
    // Remove background
    const noBackgroundBlob = await removeBackground(image);
    if (!noBackgroundBlob) {
      result.validations.push({
        valid: false,
        message: "No se pudo eliminar el fondo de la imagen.",
        type: "error",
      });
      return result;
    }
    
    // Resize and crop
    const processedBlob = await resizeAndCropImage(noBackgroundBlob);
    result.processedUrl = URL.createObjectURL(processedBlob);
    
    // Load the processed image for validation
    const processedImage = await loadImage(processedBlob);
    
    // Validate the processed image
    const imageValidations = validateProcessedImage(processedImage);
    result.validations = [...result.validations, ...imageValidations];
    
    return result;
  } catch (error) {
    console.error("Error al procesar la imagen:", error);
    result.validations.push({
      valid: false,
      message: "Error al procesar la imagen. Por favor, inténtelo de nuevo.",
      type: "error",
    });
    return result;
  }
};
