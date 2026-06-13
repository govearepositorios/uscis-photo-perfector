export interface HashtagSet {
  id: string;
  name: string;
  emoji: string;
  description: string;
  tags: string[];
  category: string;
}

export const HASHTAG_SETS: HashtagSet[] = [
  {
    id: 'capilar-general',
    name: 'Cirugía Capilar — General',
    emoji: '💇',
    category: 'capilar',
    description: 'Para cualquier post sobre injerto o tratamientos capilares',
    tags: [
      '#injertocapilar', '#injertocapilarmadrid', '#trasplantecapilar',
      '#cirugiacapilar', '#alopecia', '#calvicie', '#cabello',
      '#FUE', '#DHI', '#fuezafiro', '#kaveaclinic', '#madrid',
      '#antesydespues', '#resultados', '#cabellonuevo',
      '#capilar', '#pelo', '#perdidadecabello', '#tratamientocapilar',
      '#clinicacapilar', '#medicinacapilar',
    ],
  },
  {
    id: 'capilar-masculino',
    name: 'Injerto Capilar Masculino',
    emoji: '👨',
    category: 'capilar',
    description: 'Orientado al público masculino con alopecia androgenética',
    tags: [
      '#injertocapilar', '#alopecia', '#calvicie', '#alopeciamadrid',
      '#hombresbelleza', '#autocuidadomasculino', '#barbershop',
      '#FUEtransplant', '#hairtransplant', '#hairloss', '#hairgrowth',
      '#kaveaclinic', '#madrid', '#transformacion', '#confianza',
      '#resultado12meses', '#injertocapilarmadrid', '#esteticamente',
    ],
  },
  {
    id: 'capilar-femenino',
    name: 'Alopecia Femenina',
    emoji: '👩',
    category: 'capilar',
    description: 'Especialmente relevante para mujeres con pérdida capilar',
    tags: [
      '#alopeciafemenina', '#perdidacabellomujer', '#hairlosswomen',
      '#cabellofemenino', '#trasplantecapilarmujer', '#kaveaclinic',
      '#bellezafemenina', '#autoestima', '#transformacionfemenina',
      '#madrid', '#medicaestetica', '#cabellonatural',
      '#alopeciamadrid', '#tratamientocapilar', '#PRPcapilar',
    ],
  },
  {
    id: 'medicina-estetica',
    name: 'Medicina Estética',
    emoji: '✨',
    category: 'estetica',
    description: 'Para posts de botox, rellenos y tratamientos inyectables',
    tags: [
      '#medicinaestetica', '#medicinaesteticamadrid', '#botox',
      '#botoxmadrid', '#acidohialuronico', '#rellenos', '#labios',
      '#antienvejecimiento', '#rejuvenecimiento', '#bienestar',
      '#belleza', '#kaveaclinic', '#madrid', '#clinicaestetica',
      '#estetica', '#skincare', '#beautytreatment', '#naturallook',
      '#antiedad', '#resultado', '#pieldevída',
    ],
  },
  {
    id: 'facial',
    name: 'Tratamientos Faciales',
    emoji: '🌊',
    category: 'facial',
    description: 'Para hydrafacial, peelings, bioestimuladores y skincare',
    tags: [
      '#hydrafacial', '#peelingquimico', '#bioestimuladores', '#colágeno',
      '#skincare', '#skincareaddict', '#cuidadodlapiel', '#piel',
      '#gleamingskin', '#glowingskin', '#luminosisskin', '#pielsana',
      '#tratamientofacial', '#tratamientopiel', '#kaveaclinic',
      '#bellezamadrid', '#madrid', '#facialtreatment', '#skingoals',
    ],
  },
  {
    id: 'madrid-local',
    name: 'Madrid + Local',
    emoji: '📍',
    category: 'local',
    description: 'Para geolocalizar el contenido en Madrid y España',
    tags: [
      '#madrid', '#madrid🇪🇸', '#madridmola', '#madridstyle',
      '#bellezamadrid', '#clinicaesteticamadrid', '#medicinaesteticamadrid',
      '#españa', '#spain', '#clinicamadrid', '#tratamientosmadrid',
      '#kaveaclinic', '#kaveaclinicmadrid', '#esteticamadrid',
      '#mejorclinicamadrid', '#salud', '#bienestar',
    ],
  },
  {
    id: 'engagement',
    name: 'Engagement & Descubrimiento',
    emoji: '🎯',
    category: 'engagement',
    description: 'Hashtags de alto volumen para descubrimiento orgánico',
    tags: [
      '#belleza', '#beauty', '#salud', '#bienestar', '#wellness',
      '#transformacion', '#antesydespues', '#beforeandafter',
      '#confianza', '#autoestima', '#selfcare', '#cuidateprimero',
      '#resultados', '#testimonio', '#experiencia', '#clinica',
      '#doctor', '#medicina', '#estetica', '#natural',
    ],
  },
  {
    id: 'seasonal-spring',
    name: 'Temporada: Primavera',
    emoji: '🌸',
    category: 'seasonal',
    description: 'Hashtags específicos para campañas de primavera',
    tags: [
      '#primavera', '#spring', '#primavera2025', '#renovacion',
      '#nuevatú', '#cambiodelook', '#primaveralesbelleza',
      '#antesdeelverano', '#preparandoelverano', '#listaprimavera',
      '#kaveaclinic', '#madrid',
    ],
  },
  {
    id: 'seasonal-summer',
    name: 'Temporada: Verano',
    emoji: '☀️',
    category: 'seasonal',
    description: 'Hashtags específicos para campañas de verano',
    tags: [
      '#verano', '#verano2025', '#summer', '#summerbody',
      '#listaparaelverano', '#preparadaparaeelverano', '#veranoespañol',
      '#vacaciones', '#playa', '#skincareverano', '#kaveaclinic',
    ],
  },
];

export function getHashtagsForService(serviceId: string): string[] {
  const serviceMap: Record<string, string[]> = {
    fue: ['#injertocapilar', '#FUE', '#injertocapilarmadrid', '#trasplantecapilar', '#alopecia', '#kaveaclinic', '#madrid', '#cabello', '#antesydespues', '#calvicie', '#hairtransplant', '#hairloss', '#resultado', '#transformacion', '#cirugiacapilar'],
    dhi: ['#DHI', '#injertocapilar', '#DHIimplantation', '#altadensidad', '#kaveaclinic', '#madrid', '#hairtransplant', '#trasplantecapilar', '#tecnicaDHI', '#mejorresultado'],
    'fue-sapphire': ['#fuezafiro', '#FUEzafiro', '#safirotecnica', '#injertocapilar', '#kaveaclinic', '#madrid', '#precision', '#sincikatrices', '#trasplantecapilar'],
    prp: ['#PRPcapilar', '#PRP', '#plasmacapilar', '#crecimientocapilar', '#tratamientocapilar', '#kaveaclinic', '#madrid', '#alopecia', '#cabello'],
    mesotherapy: ['#mesoterapiacapilar', '#mesoterapia', '#tratamientocapilar', '#capilar', '#kaveaclinic', '#madrid', '#crecimientocapilar'],
    botox: ['#botox', '#botoxmadrid', '#toxinabotulínica', '#arrugas', '#rejuvenecimiento', '#medicinaestetica', '#kaveaclinic', '#madrid', '#antienvejecimiento', '#naturalresult'],
    hyaluronic: ['#acidohialuronico', '#rellenos', '#labios', '#volumen', '#medicinaestetica', '#kaveaclinic', '#madrid', '#belleznnatural', '#filler'],
    biostimulators: ['#bioestimuladores', '#colageno', '#skinbooster', '#rejuvenecimiento', '#medicinaestetica', '#kaveaclinic', '#madrid', '#pielnueva'],
    hydrafacial: ['#hydrafacial', '#hydrafacialmadrid', '#limpieza facial', '#piel', '#skincare', '#cuidadodlapiel', '#kaveaclinic', '#madrid', '#tratamientofacial'],
    antiaging: ['#antiedad', '#antienvejecimiento', '#pieljoven', '#rejuvenecimiento', '#medicinaestetica', '#kaveaclinic', '#madrid', '#beautytreatment'],
    'chemical-peel': ['#peelingquimico', '#renovacioncelular', '#manchas', '#acne', '#piel', '#kaveaclinic', '#madrid', '#skincare', '#tratamientopiel'],
  };
  return serviceMap[serviceId] || ['#kaveaclinic', '#madrid', '#medicinaestetica'];
}
