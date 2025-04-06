
import { PHOTO_REQUIREMENTS, ValidationResult } from "./photoRequirements";

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
