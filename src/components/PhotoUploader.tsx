
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import { PHOTO_REQUIREMENTS } from "@/utils/imageProcessing";

interface PhotoUploaderProps {
  onFileSelected: (file: File) => void;
  isProcessing: boolean;
}

const PhotoUploader = ({ onFileSelected, isProcessing }: PhotoUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndProcessFile = (file: File) => {
    // Check file type
    if (!PHOTO_REQUIREMENTS.allowedFileTypes.includes(file.type)) {
      toast.error("El archivo debe ser una imagen en formato JPEG, JPG o PNG.");
      return false;
    }

    // Check file size
    const fileSizeKB = file.size / 1024;
    if (fileSizeKB > PHOTO_REQUIREMENTS.maxFileSizeKB) {
      toast.error(`El archivo excede el tamaño máximo de ${PHOTO_REQUIREMENTS.maxFileSizeKB} KB.`);
      return false;
    }

    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      if (validateAndProcessFile(file)) {
        handleFileChange(file);
      }
    }
  };

  const handleFileChange = (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    onFileSelected(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      if (validateAndProcessFile(file)) {
        handleFileChange(file);
      }
    }
  };

  const clearSelectedFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 ${
            dragActive ? "border-uscis-blue bg-blue-50" : "border-gray-300"
          } ${selectedFile ? "pt-2" : "pt-12 pb-12"} flex flex-col items-center justify-center`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          {selectedFile && previewUrl ? (
            <>
              <div className="absolute top-2 right-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={clearSelectedFile}
                  disabled={isProcessing}
                >
                  <X className="h-5 w-5 text-gray-500" />
                </Button>
              </div>
              <div className="w-full rounded-lg overflow-hidden mb-4 mt-6">
                <img
                  src={previewUrl}
                  alt="Vista previa"
                  className="w-full h-auto object-contain max-h-64"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
              </p>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 bg-gray-100 p-4 rounded-full">
                  <ImageIcon className="h-8 w-8 text-uscis-blue" />
                </div>
                <h3 className="mb-2 text-lg font-medium">Sube tu foto</h3>
                <p className="mb-4 text-sm text-gray-500">
                  Arrastra y suelta tu imagen aquí, o haz clic para seleccionar
                </p>
                <Button 
                  onClick={triggerFileInput} 
                  className="bg-uscis-blue hover:bg-uscis-lightBlue"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Seleccionar imagen
                </Button>
                <p className="mt-2 text-xs text-gray-500">
                  Formatos: JPG, JPEG, PNG (máx. {PHOTO_REQUIREMENTS.maxFileSizeKB / 1024} MB)
                </p>
              </div>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".jpg,.jpeg,.png"
            onChange={handleFileInputChange}
            disabled={isProcessing}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotoUploader;
