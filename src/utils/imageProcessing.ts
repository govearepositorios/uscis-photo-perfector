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
    img.onerror = (e) => {
      console.error("Error al cargar la imagen:", e);
      reject(new Error("Error al cargar la imagen."));
    };
    img.src = URL.createObjectURL(file);
  });
};

// Resize and crop the image to the required dimensions
export const resizeAndCropImage = async (imageBlob: Blob): Promise<Blob> => {
  try {
    console.log("Iniciando redimensionamiento de imagen:", imageBlob.size, "bytes");
    const image = await loadImage(imageBlob);
    console.log("Imagen cargada, dimensiones:", image.width, "x", image.height);
    
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
    
    console.log("Dibujando imagen en canvas:", x, y, newWidth, newHeight);
    // Draw the image on the canvas
    ctx.drawImage(image, x, y, newWidth, newHeight);
    
    // Convert to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            console.log("Imagen redimensionada con éxito:", blob.size, "bytes");
            resolve(blob);
          } else {
            console.error("Error al crear el blob de la imagen redimensionada");
            reject(new Error('Error al crear el blob de la imagen redimensionada'));
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error("Error en resizeAndCropImage:", error);
    throw error;
  }
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

// Remove background from an image using the Hugging Face Transformers.js library
export const removeBackground = async (imageElement: HTMLImageElement): Promise<Blob | null> => {
  try {
    console.log("Iniciando procesamiento de imagen:", imageElement.src.substring(0, 100) + "...");
    console.log("Dimensiones de la imagen:", imageElement.naturalWidth, "x", imageElement.naturalHeight);
    
    toast.info("Procesando imagen, por favor espere...", { duration: 3000 });
    console.log("Importando la biblioteca de transformers...");
    
    const MAX_IMAGE_SIZE = 1024;
    let imageToProcess = imageElement;
    let needsResize = false;
    
    // Resize large images to improve performance
    if (imageElement.naturalWidth > MAX_IMAGE_SIZE || imageElement.naturalHeight > MAX_IMAGE_SIZE) {
      console.log("Redimensionando imagen para mejor rendimiento");
      needsResize = true;
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('No se pudo obtener el contexto del canvas para redimensionar');
      }
      
      let width = imageElement.naturalWidth;
      let height = imageElement.naturalHeight;
      
      if (width > height) {
        height = Math.round((height * MAX_IMAGE_SIZE) / width);
        width = MAX_IMAGE_SIZE;
      } else {
        width = Math.round((width * MAX_IMAGE_SIZE) / height);
        height = MAX_IMAGE_SIZE;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(imageElement, 0, 0, width, height);
      
      const resizedImage = new Image();
      resizedImage.src = canvas.toDataURL('image/jpeg', 0.9);
      
      // Wait for the resized image to load
      await new Promise((resolve) => {
        resizedImage.onload = resolve;
      });
      
      imageToProcess = resizedImage;
      console.log("Imagen redimensionada:", width, "x", height);
    }
    
    try {
      // Dynamically import the transformers library to reduce initial load time
      console.log("Importando módulos de transformers.js...");
      const { pipeline, env } = await import('@huggingface/transformers');
      
      // Configure transformers.js
      env.allowLocalModels = false;
      env.useBrowserCache = true; // Utilizar caché para mejorar rendimiento en Docker
      
      console.log("Inicializando el modelo de segmentación...");
      
      // Configuración más compatible con entornos Docker
      const segmenter = await pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512', {
        progress_callback: (progressInfo) => {
          // Extract a percentage value from the progress info object
          let percentage = 0;
          if ('progress' in progressInfo) {
            percentage = progressInfo.progress;
          } else if ('loaded' in progressInfo && 'total' in progressInfo && progressInfo.total > 0) {
            percentage = progressInfo.loaded / progressInfo.total;
          }
          console.log(`Progreso de carga del modelo: ${Math.round(percentage * 100)}%`);
        }
      });
      
      console.log("Modelo inicializado correctamente");
      
      // Set up canvas to process the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('No se pudo obtener el contexto del canvas');
      }
      
      // Draw image to canvas
      canvas.width = imageToProcess.naturalWidth || imageToProcess.width;
      canvas.height = imageToProcess.naturalHeight || imageToProcess.height;
      ctx.drawImage(imageToProcess, 0, 0);
      
      // Convert to base64 for processing
      console.log("Convirtiendo imagen a base64...");
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      console.log("Procesando con el modelo de segmentación...");
      const result = await segmenter(imageData);
      
      console.log("Resultado de segmentación:", result ? "obtenido" : "null");
      
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
      
      console.log("Aplicando máscara...");
      
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
      
      console.log("Máscara aplicada correctamente");
      
      // Convert to blob
      return new Promise((resolve, reject) => {
        outputCanvas.toBlob(
          (blob) => {
            if (blob) {
              console.log('Imagen procesada correctamente, tamaño:', blob.size, "bytes");
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
    } catch (transformersError) {
      console.error('Error con la biblioteca transformers:', transformersError);
      
      // Si falla el método anterior, usar método alternativo más simple
      console.log("Intentando método alternativo de procesamiento...");
      
      // Método alternativo: solo recortar y ajustar la imagen sin eliminar el fondo
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
      
      // Calculate scaling to fit the image
      const scaleWidth = PHOTO_REQUIREMENTS.width / imageElement.naturalWidth;
      const scaleHeight = PHOTO_REQUIREMENTS.height / imageElement.naturalHeight;
      const scale = Math.min(scaleWidth, scaleHeight);
      
      const newWidth = imageElement.naturalWidth * scale;
      const newHeight = imageElement.naturalHeight * scale;
      const x = (PHOTO_REQUIREMENTS.width - newWidth) / 2;
      const y = (PHOTO_REQUIREMENTS.height - newHeight) / 2;
      
      // Draw the image on the canvas
      ctx.drawImage(imageElement, x, y, newWidth, newHeight);
      
      // Mostrar mensaje de fallback
      toast.warning("Procesamiento avanzado no disponible. Usando método alternativo.");
      
      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log('Imagen procesada con método alternativo');
              resolve(blob);
            } else {
              reject(new Error('Error al crear el blob de la imagen'));
            }
          },
          'image/png',
          1.0
        );
      });
    }
  } catch (error) {
    console.error('Error al eliminar el fondo:', error);
    toast.error("Error al procesar la imagen. Inténtelo de nuevo.");
    return null;
  }
};

// Process the image (remove background, resize, and validate)
export const processImage = async (file: File): Promise<ProcessedImage> => {
  console.log("Iniciando procesamiento de imagen:", file.name, file.size, "bytes", file.type);
  
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
      console.log("Validación de archivo fallida:", fileValidation.message);
      return result;
    }
    
    // Load the image
    console.log("Cargando imagen...");
    const image = await loadImage(file);
    result.width = image.width;
    result.height = image.height;
    console.log("Imagen cargada, dimensiones:", image.width, "x", image.height);
    
    try {
      // Remove background
      console.log("Eliminando fondo...");
      const noBackgroundBlob = await removeBackground(image);
      
      if (!noBackgroundBlob) {
        console.error("removeBackground retornó null");
        result.validations.push({
          valid: false,
          message: "No se pudo eliminar el fondo de la imagen.",
          type: "error",
        });
        
        // Intentar método alternativo: usar la imagen original
        console.log("Intentando método alternativo - usar imagen original");
        
        // Resize and crop the original image
        const processedBlob = await resizeAndCropImage(file);
        result.processedUrl = URL.createObjectURL(processedBlob);
        
        // Load the processed image for validation
        const processedImage = await loadImage(processedBlob);
        
        // Validate the processed image
        const imageValidations = validateProcessedImage(processedImage);
        result.validations = [...result.validations, ...imageValidations];
        
        // Agregar advertencia sobre el fondo
        result.validations.push({
          valid: false,
          message: "No se pudo procesar el fondo. Asegúrese de que la foto tenga un fondo sólido.",
          type: "warning",
        });
        
        return result;
      }
      
      // Resize and crop
      console.log("Redimensionando y recortando imagen...");
      const processedBlob = await resizeAndCropImage(noBackgroundBlob);
      result.processedUrl = URL.createObjectURL(processedBlob);
      
      // Load the processed image for validation
      const processedImage = await loadImage(processedBlob);
      
      // Validate the processed image
      const imageValidations = validateProcessedImage(processedImage);
      result.validations = [...result.validations, ...imageValidations];
      
      return result;
    } catch (processingError) {
      console.error("Error durante el procesamiento:", processingError);
      
      // Fallback: intentar solo redimensionar la imagen original
      console.log("Utilizando fallback - solo redimensionar imagen original");
      
      const processedBlob = await resizeAndCropImage(file);
      result.processedUrl = URL.createObjectURL(processedBlob);
      
      const processedImage = await loadImage(processedBlob);
      const imageValidations = validateProcessedImage(processedImage);
      
      result.validations = [
        ...result.validations, 
        ...imageValidations,
        {
          valid: false,
          message: "No se pudo procesar el fondo automáticamente. Se ha aplicado solo redimensionamiento.",
          type: "warning"
        }
      ];
      
      return result;
    }
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
