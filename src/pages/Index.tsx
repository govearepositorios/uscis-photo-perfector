
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import PhotoUploader from "@/components/PhotoUploader";
import PhotoEditor from "@/components/PhotoEditor";
import PhotoValidator from "@/components/PhotoValidator";
import USCISRequirements from "@/components/USCISRequirements";
import { processImage, ProcessedImage } from "@/utils/imageProcessing";
import { Camera, LayoutList, ImageIcon } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<ProcessedImage>({
    originalUrl: "",
    processedUrl: null,
    width: 0,
    height: 0,
    validations: [],
  });
  const [activeTab, setActiveTab] = useState("upload");

  const handleFileSelected = async (selectedFile: File) => {
    setFile(selectedFile);
    await handleProcessImage(selectedFile);
  };

  const handleProcessImage = async (selectedFile: File) => {
    try {
      setIsProcessing(true);
      setActiveTab("edit");
      
      const result = await processImage(selectedFile);
      setProcessedImage(result);
      
      if (result.processedUrl) {
        toast.success("Imagen procesada correctamente");
      } else {
        toast.error("No se pudo procesar la imagen");
      }
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Error al procesar la imagen. Inténtelo de nuevo.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReprocess = () => {
    if (file) {
      handleProcessImage(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-uscis-blue text-white p-4 shadow-md">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Camera className="h-8 w-8 mr-2" />
              <h1 className="text-2xl font-bold">USCIS PHOTO EDIT</h1>
            </div>
            <p className="text-sm text-blue-100">
              Edita y perfecciona fotos para trámites de inmigración
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <section className="mb-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Ajusta tu Foto para USCIS</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Sube tu foto, eliminaremos automáticamente el fondo y la ajustaremos a los requisitos exactos para trámites de inmigración de USCIS.
              </p>
            </div>

            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 mb-8">
                <TabsTrigger value="upload" disabled={isProcessing}>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Subir Foto
                </TabsTrigger>
                <TabsTrigger value="edit" disabled={!processedImage.processedUrl}>
                  <Camera className="h-4 w-4 mr-2" />
                  Editar Foto
                </TabsTrigger>
                <TabsTrigger value="requirements">
                  <LayoutList className="h-4 w-4 mr-2" />
                  Requisitos
                </TabsTrigger>
              </TabsList>
              
              <div className="grid md:grid-cols-2 gap-6">
                <TabsContent value="upload" className="mt-0 space-y-6">
                  <PhotoUploader 
                    onFileSelected={handleFileSelected} 
                    isProcessing={isProcessing} 
                  />
                  <USCISRequirements />
                </TabsContent>
                
                <TabsContent value="edit" className="mt-0 space-y-6">
                  <PhotoEditor 
                    processedImage={processedImage} 
                    isProcessing={isProcessing}
                    onReprocess={handleReprocess}
                  />
                  <PhotoValidator validations={processedImage.validations} />
                </TabsContent>
                
                <TabsContent value="requirements" className="mt-0 space-y-6 md:col-span-2">
                  <div className="grid md:grid-cols-2 gap-6">
                    <USCISRequirements />
                    <div>
                      <h3 className="text-lg font-medium mb-4">Ejemplo de foto correcta</h3>
                      <div className="bg-white p-4 rounded-lg shadow-sm flex justify-center">
                        <img 
                          src="https://travel.state.gov/content/dam/passports/content-page-resources/Template%20Images/photo-example.jpg" 
                          alt="Ejemplo de foto correcta para USCIS" 
                          className="max-h-80 object-contain"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-2 text-center">
                        Ejemplo oficial de foto aceptable para inmigración
                      </p>
                    </div>
                  </div>
                  <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-lg font-medium mb-2 text-uscis-blue">Cómo funciona esta aplicación</h3>
                    <ol className="list-decimal pl-5 space-y-2 text-sm">
                      <li>Sube una foto clara de tu rostro, preferiblemente contra un fondo sólido.</li>
                      <li>Nuestra inteligencia artificial elimina automáticamente el fondo y lo reemplaza con blanco.</li>
                      <li>La aplicación redimensiona la imagen a 2x2 pulgadas (600x600 píxeles a 300 dpi).</li>
                      <li>Verifica que el tamaño de tu cabeza ocupe entre el 50% y 69% de la altura de la foto.</li>
                      <li>Descarga tu foto procesada lista para usar en tus trámites de inmigración.</li>
                    </ol>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </section>

          <Separator className="my-8" />

          <section className="text-center text-sm text-gray-500">
            <p>
              Esta herramienta te ayuda a preparar fotografías que cumplan con los requisitos de USCIS, 
              pero no garantiza la aceptación de tus documentos. Siempre verifica los requisitos oficiales actuales.
            </p>
            <p className="mt-2">
              © {new Date().getFullYear()} USCIS Photo Perfector - Esta aplicación no está afiliada a USCIS o al gobierno de EE. UU.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Index;
