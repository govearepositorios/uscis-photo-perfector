export interface Service {
  id: string;
  name: string;
  emoji: string;
  category: 'capilar' | 'estetica' | 'facial';
  description: string;
  imageKeywords: string;
}

export interface ContentType {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export interface ContentTone {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export const SERVICES: Service[] = [
  {
    id: 'fue',
    name: 'Injerto Capilar FUE',
    emoji: '💇',
    category: 'capilar',
    description: 'Trasplante de cabello folículo por folículo sin cicatriz visible',
    imageKeywords: 'hair transplant before after, natural hairline restoration, man confident hair',
  },
  {
    id: 'dhi',
    name: 'Técnica DHI',
    emoji: '🔬',
    category: 'capilar',
    description: 'Implantación directa de pelo con máxima densidad y naturalidad',
    imageKeywords: 'DHI hair implantation, precision hair transplant, dense natural hair',
  },
  {
    id: 'fue-sapphire',
    name: 'FUE Zafiro',
    emoji: '💎',
    category: 'capilar',
    description: 'Microcortes con bisturí de zafiro para resultados ultra precisos',
    imageKeywords: 'sapphire FUE hair transplant, premium hair restoration, precision surgery',
  },
  {
    id: 'prp',
    name: 'PRP Capilar',
    emoji: '🩸',
    category: 'capilar',
    description: 'Plasma rico en plaquetas para estimular el crecimiento natural',
    imageKeywords: 'PRP hair treatment, platelet rich plasma, hair growth therapy',
  },
  {
    id: 'mesotherapy',
    name: 'Mesoterapia Capilar',
    emoji: '🌿',
    category: 'capilar',
    description: 'Microinyecciones nutritivas para fortalecer el cabello desde la raíz',
    imageKeywords: 'mesotherapy hair treatment, scalp injection therapy, hair strengthening',
  },
  {
    id: 'botox',
    name: 'Toxina Botulínica',
    emoji: '✨',
    category: 'estetica',
    description: 'Suaviza arrugas de expresión de forma natural y duradera',
    imageKeywords: 'botox before after, smooth forehead, natural rejuvenation, elegant woman',
  },
  {
    id: 'hyaluronic',
    name: 'Ácido Hialurónico',
    emoji: '💉',
    category: 'estetica',
    description: 'Relleno dérmico para restaurar volumen y redefinir el contorno facial',
    imageKeywords: 'hyaluronic acid filler, lip filler before after, cheek volume, facial contour',
  },
  {
    id: 'biostimulators',
    name: 'Bioestimuladores',
    emoji: '⚡',
    category: 'estetica',
    description: 'Estimula el colágeno propio para rejuvenecimiento progresivo y natural',
    imageKeywords: 'biostimulator injection, collagen stimulation, skin rejuvenation, radiant skin',
  },
  {
    id: 'hydrafacial',
    name: 'Hydrafacial',
    emoji: '🌊',
    category: 'facial',
    description: 'Limpieza profunda, exfoliación e hidratación en un solo tratamiento',
    imageKeywords: 'hydrafacial treatment, glowing skin, clean pores, hydrated face',
  },
  {
    id: 'antiaging',
    name: 'Tratamiento Antiedad',
    emoji: '🕰️',
    category: 'facial',
    description: 'Protocolo completo para revertir los signos del envejecimiento',
    imageKeywords: 'anti-aging treatment, skin renewal, youthful glow, mature woman beauty',
  },
  {
    id: 'chemical-peel',
    name: 'Peeling Químico',
    emoji: '🌟',
    category: 'facial',
    description: 'Renovación celular con ácidos para una piel luminosa y uniforme',
    imageKeywords: 'chemical peel results, even skin tone, brightening treatment, smooth skin',
  },
];

export const CONTENT_TYPES: ContentType[] = [
  {
    id: 'reel',
    name: 'Reel',
    emoji: '🎬',
    description: 'Video corto 15-90s — mayor alcance orgánico en 2025',
  },
  {
    id: 'post',
    name: 'Post Estático',
    emoji: '📷',
    description: 'Imagen única — ideal para antes/después impactantes',
  },
  {
    id: 'carousel',
    name: 'Carrusel',
    emoji: '🖼️',
    description: 'Hasta 10 imágenes — perfecto para guías y tutoriales',
  },
  {
    id: 'story',
    name: 'Historia',
    emoji: '⚡',
    description: 'Contenido efímero 24h — alta interacción y respuestas',
  },
];

export const CONTENT_TONES: ContentTone[] = [
  {
    id: 'educational',
    name: 'Educativo',
    emoji: '📚',
    description: 'Explicar procedimientos, resolver dudas, educar al paciente',
  },
  {
    id: 'emotional',
    name: 'Emocional / Testimonial',
    emoji: '💬',
    description: 'Historias reales, transformaciones, confianza y autoestima',
  },
  {
    id: 'promotional',
    name: 'Promocional',
    emoji: '🎯',
    description: 'Ofertas, lanzamientos de servicios, llamadas a la acción',
  },
  {
    id: 'inspirational',
    name: 'Inspiracional',
    emoji: '✨',
    description: 'Bienestar, autoestima, motivación para cuidarse',
  },
  {
    id: 'behindscenes',
    name: 'Detrás de Cámaras',
    emoji: '🎥',
    description: 'Equipo médico, clínica, día a día — humanización de marca',
  },
];

export const SERVICE_CATEGORIES = {
  capilar: { label: 'Cirugía & Tratamientos Capilares', color: 'bg-emerald-100 text-emerald-800' },
  estetica: { label: 'Medicina Estética', color: 'bg-rose-100 text-rose-800' },
  facial: { label: 'Tratamientos Faciales', color: 'bg-amber-100 text-amber-800' },
};
