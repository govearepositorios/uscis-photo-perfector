
import { toast } from "sonner";
import { ProcessedImage, ValidationResult } from "./photoRequirements";
import { validateFile, validateProcessedImage } from "./photoValidation";
import { loadImage, resizeAndCropImage } from "./imageUtils";
import { removeBackground, useAlternativeBackgroundRemoval } from "./backgroundRemoval";

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
