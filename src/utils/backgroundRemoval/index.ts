
import { toast } from "sonner";
import { loadImage } from "../imageUtils";
import { useAdvancedBackgroundRemoval } from "./advancedBackgroundRemoval";
import { useAlternativeBackgroundRemoval } from "./alternativeBackgroundRemoval";

// Remove background from an image using the most appropriate method
export const removeBackground = async (imageElement: HTMLImageElement): Promise<Blob | null> => {
  try {
    console.log("Iniciando procesamiento de imagen:", imageElement.src.substring(0, 100) + "...");
    console.log("Dimensiones de la imagen:", imageElement.naturalWidth, "x", imageElement.naturalHeight);
    
    toast.info("Procesando imagen, por favor espere...", { duration: 3000 });
    
    // SIEMPRE usar el método alternativo en este punto
    console.log("Usando método alternativo optimizado para todas las imágenes");
    return await useAlternativeBackgroundRemoval(imageElement);
  } catch (error) {
    console.error('Error al eliminar el fondo:', error);
    toast.error("Error al procesar la imagen. Inténtelo de nuevo.");
    return null;
  }
};

// Re-export the individual implementation functions
export { useAdvancedBackgroundRemoval, useAlternativeBackgroundRemoval };
