
import { toast } from "sonner";
import { ProcessedImage, ValidationResult } from "./photoRequirements";
import { validateFile, validateProcessedImage } from "./photoValidation";
import { loadImage, resizeAndCropImage } from "./imageUtils";
import { removeBackground } from "./backgroundRemoval";

// Re-export types and constants for backward compatibility
export * from "./photoRequirements";
export * from "./photoValidation";
export * from "./imageUtils";
export * from "./backgroundRemoval";

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
        throw new Error("Fallo al eliminar el fondo");
      }
      
      // Final image processing
      console.log("Finalizando procesamiento...");
      result.processedUrl = URL.createObjectURL(noBackgroundBlob);
      
      // Load the processed image for validation
      const processedImage = await loadImage(noBackgroundBlob);
      
      // Validate the processed image
      const imageValidations = validateProcessedImage(processedImage);
      result.validations = [...result.validations, ...imageValidations];
      
      return result;
    } catch (processingError) {
      console.error("Error durante el procesamiento:", processingError);
      
      // Fallback to simple resize if background removal fails
      console.log("Usando método alternativo de respaldo");
      
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
