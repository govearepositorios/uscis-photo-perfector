
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, RefreshCw, ZoomIn, ZoomOut, Move } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { ProcessedImage } from "@/utils/imageProcessing";
import { toast } from "sonner";

interface PhotoEditorProps {
  processedImage: ProcessedImage;
  isProcessing: boolean;
  onReprocess: () => void;
}

const PhotoEditor = ({ processedImage, isProcessing, onReprocess }: PhotoEditorProps) => {
  const [scale, setScale] = useState(100);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Reset adjustments when a new image is loaded
    setScale(100);
    setPosition({ x: 0, y: 0 });
  }, [processedImage.processedUrl]);

  const handleDownload = () => {
    if (!processedImage.processedUrl) return;
    
    // Create a download link and trigger it
    const link = document.createElement("a");
    link.href = processedImage.processedUrl;
    link.download = "uscis_photo.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Imagen descargada correctamente");
  };

  const handleScaleChange = (value: number[]) => {
    setScale(value[0]);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!processedImage.processedUrl) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Limit movement to prevent the image from being dragged too far
    const containerWidth = containerRef.current?.clientWidth || 0;
    const containerHeight = containerRef.current?.clientHeight || 0;
    const imageWidth = imageRef.current?.clientWidth || 0;
    const imageHeight = imageRef.current?.clientHeight || 0;
    
    const maxX = (imageWidth * scale / 100 - containerWidth) / 2;
    const maxY = (imageHeight * scale / 100 - containerHeight) / 2;
    
    setPosition({
      x: Math.min(Math.max(newX, -maxX), maxX),
      y: Math.min(Math.max(newY, -maxY), maxY),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    // Add global mouse up and move handlers
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };
    
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      setPosition({ x: newX, y: newY });
    };
    
    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("mousemove", handleGlobalMouseMove);
    
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("mousemove", handleGlobalMouseMove);
    };
  }, [isDragging, dragStart]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">Editar Foto</h3>
        
        <div 
          ref={containerRef}
          className="w-full aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden relative"
        >
          {processedImage.processedUrl ? (
            <div 
              className="absolute top-0 left-0 w-full h-full flex items-center justify-center"
              style={{ 
                cursor: isDragging ? "grabbing" : "grab",
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              <img
                ref={imageRef}
                src={processedImage.processedUrl}
                alt="Foto procesada"
                className="object-contain transition-transform"
                style={{ 
                  transform: `translate(${position.x}px, ${position.y}px) scale(${scale / 100})`,
                  maxWidth: "100%",
                  maxHeight: "100%"
                }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              {isProcessing ? (
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 text-uscis-blue mx-auto mb-2 animate-spin" />
                  <p>Procesando imagen...</p>
                </div>
              ) : (
                <p className="text-gray-400">No hay imagen procesada</p>
              )}
            </div>
          )}
        </div>
        
        {processedImage.processedUrl && (
          <>
            <div className="space-y-4 mb-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm flex items-center">
                    <ZoomOut className="h-4 w-4 mr-1" />
                    Zoom
                  </span>
                  <span className="text-sm">{scale}%</span>
                </div>
                <Slider
                  value={[scale]}
                  min={50}
                  max={150}
                  step={1}
                  onValueChange={handleScaleChange}
                />
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center">
                  <Move className="h-4 w-4 mr-1" />
                  Posición
                </span>
                <span>Arrastra la imagen para ajustar</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                className="flex-1 bg-uscis-blue hover:bg-uscis-lightBlue"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
              <Button
                variant="outline"
                onClick={onReprocess}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reprocesar
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PhotoEditor;
