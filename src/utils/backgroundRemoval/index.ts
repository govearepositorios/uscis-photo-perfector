
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
    
    // Para Docker, SIEMPRE usar el método alternativo
    if (windowDockerEnv || windowForceAlt) {
      console.log("Detectado entorno Docker por variables globales - usando método optimizado para Docker");
      toast.info("Entorno Docker detectado - usando algoritmo optimizado", { duration: 3000 });
      return await useAlternativeBackgroundRemoval(imageElement);
    }
    
    // Usar las variables de window o caer en los métodos de detección
    const dockerDetected = isDockerEnvironment();
    const forceAlternative = forceAlternativeMethodForDocker();
    
    console.log("¿Entorno Docker detectado?", dockerDetected);
    console.log("¿Forzar método alternativo?", forceAlternative);
    
    if (dockerDetected || forceAlternative) {
      console.log("Detectado entorno Docker o limitaciones - usando método alternativo de procesamiento");
      toast.info("Utilizando método optimizado para Docker", { duration: 4000 });
      return await useAlternativeBackgroundRemoval(imageElement);
    }
    
    console.log("Usando método estándar de eliminación de fondo...");
    
    try {
      // Intentar usar el método avanzado de eliminación de fondo con transformers.js
      return await useAdvancedBackgroundRemoval(imageElement);
    } catch (transformersError) {
      console.error('Error con la biblioteca transformers:', transformersError);
      
      // Si falla el método anterior, usar método alternativo más simple
      console.log("Transformers falló. Intentando método alternativo de procesamiento...");
      toast.info("Cambiando a método alternativo de procesamiento", { duration: 3000 });
      return await useAlternativeBackgroundRemoval(imageElement);
    }
  } catch (error) {
    console.error('Error al eliminar el fondo:', error);
    toast.error("Error al procesar la imagen. Inténtelo de nuevo.");
    return null;
  }
};

// Re-export the individual implementation functions
export { useAdvancedBackgroundRemoval, useAlternativeBackgroundRemoval };
