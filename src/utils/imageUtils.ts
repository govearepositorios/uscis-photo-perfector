import { PHOTO_REQUIREMENTS } from "./photoRequirements";

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

// Type augmentation for Navigator to include deviceMemory
interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number;
}

// Detect if running in Docker environment
export const isDockerEnvironment = (): boolean => {
  // Más métodos robustos para detectar Docker
  
  // 1. Verificar variables de entorno explícitas de Docker
  if (typeof process !== 'undefined' && 
      process.env && 
      (process.env.USE_ALTERNATIVE_BACKGROUND_REMOVAL === 'true' || 
       process.env.DOCKER_CONTAINER === 'true' ||
       process.env.RUNNING_IN_DOCKER === 'true')) {
    console.log("Detectado entorno Docker mediante variables de entorno");
    return true;
  }
  
  // 2. Verificar si estamos en un navegador con limitaciones de WebGL/WebGPU
  // que suelen ocurrir en contenedores
  const hasLimitedGPUCapabilities = (): boolean => {
    try {
      // Detectar si WebGL está disponible con capacidades limitadas
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) {
        console.log("WebGL no disponible - posible entorno Docker");
        return true;
      }
      
      // Verificar si WebGPU está disponible (generalmente no en Docker)
      if (typeof navigator !== 'undefined' && 'gpu' in navigator) {
        console.log("WebGPU disponible - probablemente no es Docker");
        return false;
      }
      
      return false;
    } catch (e) {
      console.log("Error al detectar capacidades GPU:", e);
      return true; // Ante la duda, asumir limitaciones
    }
  };
  
  // SIEMPRE ASUMIR DOCKER EN CASOS DE DUDA
  return true;
};

// Función de utilidad para forzar el uso del método alternativo
export const forceAlternativeMethodForDocker = (): boolean => {
  // Para Docker, SIEMPRE usar el método alternativo
  if (typeof window !== 'undefined' && (window as any).DOCKER_CONTAINER === true) {
    return true;
  }
  
  // Si estamos en Docker, forzar el método alternativo
  if (isDockerEnvironment()) {
    return true;
  }
  
  // Para desarrollo local, verificar una flag en localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    const forceAlternative = window.localStorage.getItem('forceAlternativeMethod');
    if (forceAlternative === 'true') {
      return true;
    }
  }
  
  return false;
};
