
import { toast } from "sonner";
import { removeBackground as simpleRemoveBackground } from "./backgroundRemover";

// Process image using simple method (no background removal, just resize and center)
export const removeBackground = async (imageElement: HTMLImageElement): Promise<Blob | null> => {
  try {
    console.log("Iniciando procesamiento básico de imagen:", imageElement.src.substring(0, 100) + "...");
    console.log("Dimensiones de la imagen:", imageElement.naturalWidth, "x", imageElement.naturalHeight);
    
    toast.info("Procesando imagen, por favor espere...", { duration: 3000 });
    
    console.log("Usando método de redimensionamiento simple");
    return await simpleRemoveBackground(imageElement);
  } catch (error) {
    console.error('Error al procesar la imagen:', error);
    toast.error("Error al procesar la imagen. Inténtelo de nuevo.");
    return null;
  }
};
