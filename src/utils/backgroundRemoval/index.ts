
import { toast } from "sonner";
import { loadImage } from "../imageUtils";
import { removeBackground as huggingfaceRemoveBackground } from "./backgroundRemover";

// Remove background from an image using the most reliable method
export const removeBackground = async (imageElement: HTMLImageElement): Promise<Blob | null> => {
  try {
    console.log("Iniciando procesamiento de imagen:", imageElement.src.substring(0, 100) + "...");
    console.log("Dimensiones de la imagen:", imageElement.naturalWidth, "x", imageElement.naturalHeight);
    
    toast.info("Procesando imagen, por favor espere...", { duration: 3000 });
    
    console.log("Usando método Hugging Face con modelo de segmentación");
    return await huggingfaceRemoveBackground(imageElement);
  } catch (error) {
    console.error('Error al eliminar el fondo:', error);
    toast.error("Error al procesar la imagen. Inténtelo de nuevo.");
    return null;
  }
};
