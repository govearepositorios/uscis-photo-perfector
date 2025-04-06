
import { toast } from "sonner";
import { loadImage, isDockerEnvironment, forceAlternativeMethodForDocker } from "../imageUtils";
import { useAdvancedBackgroundRemoval } from "./advancedBackgroundRemoval";
import { useAlternativeBackgroundRemoval } from "./alternativeBackgroundRemoval";

// Remove background from an image using the Hugging Face Transformers.js library
export const removeBackground = async (imageElement: HTMLImageElement): Promise<Blob | null> => {
  try {
    console.log("Iniciando procesamiento de imagen:", imageElement.src.substring(0, 100) + "...");
    console.log("Dimensiones de la imagen:", imageElement.naturalWidth, "x", imageElement.naturalHeight);
    
    toast.info("Procesando imagen, por favor espere...", { duration: 3000 });
    
    // Detectar Docker y decidir si usar método alternativo
    // Primero verificar las variables globales definidas en window
    const windowDockerEnv = typeof window !== 'undefined' && (window as any).DOCKER_CONTAINER === true;
    const windowForceAlt = typeof window !== 'undefined' && (window as any).USE_ALTERNATIVE_BACKGROUND_REMOVAL === true;
    
    // SIEMPRE usar el método alternativo en este caso
    console.log("Usando método alternativo para todas las imágenes");
    return await useAlternativeBackgroundRemoval(imageElement);
  } catch (error) {
    console.error('Error al eliminar el fondo:', error);
    toast.error("Error al procesar la imagen. Inténtelo de nuevo.");
    return null;
  }
};

// Re-export the individual implementation functions
export { useAdvancedBackgroundRemoval, useAlternativeBackgroundRemoval };
