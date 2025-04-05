
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, AlertCircle, Info } from "lucide-react";
import { ValidationResult } from "@/utils/imageProcessing";

interface PhotoValidatorProps {
  validations: ValidationResult[];
}

const PhotoValidator = ({ validations }: PhotoValidatorProps) => {
  // Group validations by type
  const successValidations = validations.filter(v => v.type === "success");
  const errorValidations = validations.filter(v => v.type === "error");
  const warningValidations = validations.filter(v => v.type === "warning");
  const infoValidations = validations.filter(v => v.type === "info");
  
  // Determine the overall status
  const hasErrors = errorValidations.length > 0;
  const hasWarnings = warningValidations.length > 0;
  
  let statusColor = "";
  let statusText = "";
  let StatusIcon = Check;
  
  if (hasErrors) {
    statusColor = "text-uscis-red";
    statusText = "No cumple con los requisitos";
    StatusIcon = X;
  } else if (hasWarnings) {
    statusColor = "text-yellow-500";
    statusText = "Requiere verificación";
    StatusIcon = AlertCircle;
  } else if (validations.length > 0) {
    statusColor = "text-uscis-green";
    statusText = "Cumple con los requisitos";
    StatusIcon = Check;
  }

  const renderValidationItem = (validation: ValidationResult, index: number) => {
    let Icon = Info;
    let textColor = "text-gray-600";
    
    switch (validation.type) {
      case "success":
        Icon = Check;
        textColor = "text-uscis-green";
        break;
      case "error":
        Icon = X;
        textColor = "text-uscis-red";
        break;
      case "warning":
        Icon = AlertCircle;
        textColor = "text-yellow-500";
        break;
      case "info":
        Icon = Info;
        textColor = "text-uscis-blue";
        break;
    }
    
    return (
      <li key={index} className="flex items-start mb-2">
        <div className={`mt-0.5 mr-2 ${textColor}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className={`text-sm ${textColor}`}>{validation.message}</span>
      </li>
    );
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">Validación USCIS</h3>
        
        {validations.length > 0 ? (
          <>
            <div className={`flex items-center mb-4 ${statusColor}`}>
              <StatusIcon className="h-5 w-5 mr-2" />
              <span className="font-medium">{statusText}</span>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Resultados de la validación:</h4>
              <ul className="space-y-1">
                {[...errorValidations, ...warningValidations, ...successValidations, ...infoValidations]
                  .map(renderValidationItem)}
              </ul>
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-center py-4">
            Sube una foto para validarla
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PhotoValidator;
