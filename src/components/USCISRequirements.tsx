
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const USCISRequirements = () => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-2">Requisitos Oficiales de USCIS</h3>
        <p className="text-sm text-gray-500 mb-4">
          Las fotos para inmigración de USCIS deben cumplir estrictamente con estos requisitos:
        </p>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-sm font-medium">
              Requisitos de tamaño y composición
            </AccordionTrigger>
            <AccordionContent className="text-sm">
              <ul className="list-disc pl-5 space-y-1">
                <li>2 x 2 pulgadas (51 x 51 mm)</li>
                <li>La cabeza debe medir entre 1 y 1⅜ pulgadas (25-35 mm) desde la parte inferior del mentón hasta la parte superior de la cabeza</li>
                <li>Resolución mínima de 300 ppp (píxeles por pulgada)</li>
                <li>Fondo blanco o blanco roto (off-white), sin sombras</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-sm font-medium">
              Requisitos de apariencia
            </AccordionTrigger>
            <AccordionContent className="text-sm">
              <ul className="list-disc pl-5 space-y-1">
                <li>Expresión facial neutral</li>
                <li>Ojos abiertos y claramente visibles</li>
                <li>Mirar directamente a la cámara</li>
                <li>No usar gafas (excepto por razones médicas con documentación)</li>
                <li>Usar ropa normal, no uniformes ni vestimenta religiosa (excepto por razones religiosas)</li>
                <li>No usar sombreros o coberturas que oculten el cabello o la línea del cabello (excepto por razones religiosas)</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-3">
            <AccordionTrigger className="text-sm font-medium">
              Calidad de la foto
            </AccordionTrigger>
            <AccordionContent className="text-sm">
              <ul className="list-disc pl-5 space-y-1">
                <li>Impresa en papel de alta calidad con acabado mate o brillante</li>
                <li>Fotografía a color</li>
                <li>Fotografía tomada en los últimos 6 meses</li>
                <li>Iluminación uniforme, sin sombras en la cara o fondo</li>
                <li>Imagen nítida y enfocada, sin pixelación</li>
                <li>La cara no debe estar cubierta por el cabello</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <Separator className="my-4" />
        
        <p className="text-xs text-gray-500">
          Para más información, consulta la página oficial de 
          <a 
            href="https://travel.state.gov/content/travel/en/passports/how-apply/photos.html" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-uscis-blue hover:underline ml-1"
          >
            requisitos de fotografías del Departamento de Estado de EE. UU.
          </a>
        </p>
      </CardContent>
    </Card>
  );
};

export default USCISRequirements;
