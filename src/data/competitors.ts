export interface CompetitorStrength {
  area: string;
  description: string;
}

export interface ContentExample {
  type: string;
  description: string;
  performance: 'alta' | 'media' | 'baja';
}

export interface Competitor {
  id: string;
  name: string;
  handle: string;
  specialty: string;
  emoji: string;
  tier: 'premium' | 'mid' | 'local';
  location: string;
  estimatedFollowers: string;
  postFrequency: string;
  dominantContentType: string;
  strengths: CompetitorStrength[];
  contentExamples: ContentExample[];
  opportunity: string;
  visualStyle: string;
  hashtags: string[];
}

export interface BestPractice {
  id: string;
  title: string;
  description: string;
  example: string;
  icon: string;
  category: 'contenido' | 'visual' | 'estrategia' | 'engagement';
}

export const COMPETITORS: Competitor[] = [
  {
    id: 'insparya',
    name: 'Insparya',
    handle: '@insparya',
    specialty: 'Cirugía Capilar Premium',
    emoji: '🏆',
    tier: 'premium',
    location: 'Madrid + Internacional',
    estimatedFollowers: '150K+',
    postFrequency: '5-7 publicaciones/semana',
    dominantContentType: 'Reels testimoniales, casos de éxito con celebridades',
    visualStyle: 'Altísima producción. Negro, plata y blanco. Estética de clínica internacional de lujo.',
    strengths: [
      {
        area: 'Asociación con Cristiano Ronaldo',
        description: 'El endorsement de CR7 da credibilidad masiva y alcance global. Sus posts con el jugador generan millones de views.',
      },
      {
        area: 'Tecnología robótica ARTAS',
        description: 'Posicionan su tecnología como superior. Los videos del robot implantando folículos son hipnóticos y muy compartidos.',
      },
      {
        area: 'Contenido educativo en video',
        description: 'Explican cada procedimiento con animaciones médicas de alta calidad que educan y generan confianza.',
      },
      {
        area: 'Resultados a 12 meses documentados',
        description: 'Series de posts que muestran la evolución mensual del mismo paciente — genera seguimiento continuado.',
      },
    ],
    contentExamples: [
      { type: 'Reel transformación 12 meses', description: 'Evolución completa con música épica', performance: 'alta' },
      { type: 'Detrás de cámaras del quirófano', description: 'Proceso de la cirugía sin ser explícito', performance: 'alta' },
      { type: 'Testimonio en inglés para mercado global', description: 'Pacientes internacionales', performance: 'media' },
    ],
    opportunity: 'Kavea puede diferenciarse con un tono más humano y cercano, sin la frialdad corporativa de Insparya. La gente conecta más con clínicas que se sienten "accesibles".',
    hashtags: ['#insparya', '#injertocapilar', '#hairtransplant', '#cristiano', '#alopecia'],
  },
  {
    id: 'imema',
    name: 'Clínica Imema',
    handle: '@clinicaimema',
    specialty: 'Tricología + Medicina Estética',
    emoji: '🔬',
    tier: 'mid',
    location: 'Madrid',
    estimatedFollowers: '15K-25K',
    postFrequency: '3-4 publicaciones/semana',
    dominantContentType: 'Posts educativos, infografías, antes/después',
    visualStyle: 'Blanco clínico, azul marino. Enfoque médico-científico. Muy limpio pero algo frío.',
    strengths: [
      {
        area: 'Contenido educativo en profundidad',
        description: 'Publican infografías detalladas sobre tricología, tipos de alopecia, tratamientos. Muy alto nivel de guardados.',
      },
      {
        area: 'Dr. como cara visible',
        description: 'El médico jefe aparece explicando procedimientos — genera confianza y autoridad médica.',
      },
      {
        area: 'Resultados documentados con rigor',
        description: 'Fotos antes/después estandarizadas con misma luz y ángulo. Muy profesional.',
      },
    ],
    contentExamples: [
      { type: 'Carrusel "Tipos de alopecia"', description: 'Diagnóstico visual de los distintos grados', performance: 'alta' },
      { type: 'El médico explica el procedimiento', description: 'Vídeo corto de 60 segundos informal', performance: 'media' },
      { type: 'FAQ en historias', description: 'Preguntas y respuestas sobre injerto', performance: 'media' },
    ],
    opportunity: 'Kavea puede añadir el elemento emocional que a Imema le falta. Sus posts son informativos pero no generan conexión emocional. Combina el rigor de Imema con historias humanas.',
    hashtags: ['#clinicaimema', '#tricologia', '#injertocapilar', '#alopecia', '#madrid'],
  },
  {
    id: 'clinica-velazquez',
    name: 'Clínica Capilar Velázquez',
    handle: '@clinicacapilarvelazquez',
    specialty: 'Cirugía Capilar FUE Zafiro',
    emoji: '💎',
    tier: 'mid',
    location: 'Madrid',
    estimatedFollowers: '8K-15K',
    postFrequency: '2-3 publicaciones/semana',
    dominantContentType: 'Posts estáticos antes/después, contenido de la Dra. Larrarte',
    visualStyle: 'Elegant, beige y negro. La doctora como protagonista. Estilo boutique médico.',
    strengths: [
      {
        area: 'La Dra. Larrarte como personal brand',
        description: 'Con +30 años de experiencia, la doctora es el activo principal. Su expertise se transmite en cada post.',
      },
      {
        area: 'Especialización en mujer',
        description: 'Una de las pocas clínicas que comunica específicamente la alopecia femenina, mercado poco atendido.',
      },
      {
        area: 'Técnica FUE Zafiro bien explicada',
        description: 'Buenos posts explicando por qué el zafiro es mejor — contenido diferenciador.',
      },
    ],
    contentExamples: [
      { type: 'Antes/después femenino', description: 'Alopecia difusa en mujer — muy compartido', performance: 'alta' },
      { type: 'La Dra. explica en directo', description: 'Live o Reel informal desde la consulta', performance: 'media' },
    ],
    opportunity: 'Kavea puede aprender el valor del "personal brand médico" y aplicarlo con un enfoque más moderno en Reels y Stories, llegando a un público más joven.',
    hashtags: ['#clinicavelazquez', '#fuezafiro', '#injertocapilar', '#alopeciafemenina', '#madrid'],
  },
  {
    id: 'elite-medical',
    name: 'Elite Medical Madrid',
    handle: '@elitemedicalmadrid',
    specialty: 'Cirugía Capilar + Medicina Estética',
    emoji: '⭐',
    tier: 'mid',
    location: 'Madrid',
    estimatedFollowers: '5K-10K',
    postFrequency: '2-4 publicaciones/semana',
    dominantContentType: 'Mix de capilar y estética, posts informativos',
    visualStyle: 'Moderno, rosa pálido y blanco. Más cercano a la estética de wellness/beauty.',
    strengths: [
      {
        area: 'Oferta de servicios combinada',
        description: 'Combinan bien el mensaje de cirugía capilar con medicina estética — cross-selling natural.',
      },
      {
        area: 'Precio comunicado con claridad',
        description: 'No tienen miedo de hablar de financiación y rangos de precio — genera más leads cualificados.',
      },
    ],
    contentExamples: [
      { type: 'Post "¿Cuánto cuesta el injerto?"', description: 'El post más guardado — la gente quiere saber precios', performance: 'alta' },
      { type: 'Reel de la clínica tour', description: 'Enseñando las instalaciones', performance: 'media' },
    ],
    opportunity: 'Kavea puede hacer un contenido sobre precios/financiación más sofisticado — no como tabla de precios sino como "inversión en ti mismo".',
    hashtags: ['#elitemedicalmadrid', '#injertocapilar', '#medicinaestetica', '#madrid'],
  },
];

export const BEST_PRACTICES: BestPractice[] = [
  {
    id: 'before-after',
    title: 'Los Antes/Después son el Rey del Contenido',
    description: 'El contenido de antes y después tiene la mayor tasa de guardado y conversión. El secreto está en la estandarización: misma luz, mismo ángulo, misma distancia. Los espectadores tienen que poder hacer la comparación visualmente sin esfuerzo.',
    example: 'Post carrusel con foto antes (día 0), mes 3, mes 6 y mes 12. Caption contando la historia del paciente en 3 líneas.',
    icon: '📸',
    category: 'contenido',
  },
  {
    id: 'reels-domination',
    title: 'Los Reels Generan Alcance, los Posts Retienen',
    description: 'El algoritmo de Instagram en 2025 prioriza los Reels para descubrimiento. Un Reel bien ejecutado puede llegar a 10x más personas que un post estático. Sin embargo, los posts y carruseles tienen mayor tasa de guardado y son los que convierten a la larga.',
    example: 'Estrategia ideal: 3 Reels/semana para alcance + 1-2 carruseles educativos/semana para conversión.',
    icon: '🎬',
    category: 'estrategia',
  },
  {
    id: 'medical-trust',
    title: 'La Confianza Médica es tu Mayor Activo',
    description: 'Las clínicas que muestran a su equipo médico habitual, el quirófano real, los instrumentos y el proceso generan 3x más consultas que las que solo muestran resultados. La transparencia médica reduce el miedo y la fricción de contacto.',
    example: 'Reel corto del médico dando 3 consejos post-operatorios. Simple, auténtico, genera confianza inmediata.',
    icon: '🩺',
    category: 'contenido',
  },
  {
    id: 'hooks',
    title: 'Los Primeros 3 Segundos Deciden Todo',
    description: 'En Reels, si no capturas la atención en los primeros 3 segundos, el usuario hace scroll. Los mejores hooks para clínicas estéticas: una pregunta directa al dolor del usuario ("¿Llevas años sin ver crecer tu pelo?"), una estadística sorprendente, o un antes/después impactante desde el primer frame.',
    example: '"Esta mujer llevaba 8 años con alopecia. Esto le pasó en 12 meses →" [empieza con el después, revela el antes al final]',
    icon: '🎣',
    category: 'visual',
  },
  {
    id: 'hashtag-strategy',
    title: 'Mezcla Hashtags de 3 Niveles',
    description: 'La estrategia de hashtags más efectiva combina hashtags grandes (>1M posts), medianos (100K-1M) y nicho (<100K). Los grandes te dan exposición, los de nicho te conectan con tu audiencia real.',
    example: 'Grande: #belleza #madrid. Mediano: #medicinaestetica #injertocapilar. Nicho: #kaveaclinic #clinicaestéticamadrid',
    icon: '#️⃣',
    category: 'estrategia',
  },
  {
    id: 'cta-every-post',
    title: 'Todo Post Necesita un CTA Claro',
    description: 'El 80% de los posts de clínicas estéticas no tienen una llamada a la acción clara. El CTA no tiene que ser "reserva ahora" — puede ser "cuéntame en comentarios", "guarda si te interesa" o "envíanos DM para resolver tu duda". El CTA de baja fricción convierte más.',
    example: '"¿Tienes alguna duda sobre el injerto? Escríbela en comentarios y te respondo 👇" — genera engagement orgánico y leads en DM.',
    icon: '🎯',
    category: 'engagement',
  },
  {
    id: 'caption-keywords',
    title: 'Las Palabras Clave en la Caption Posicionan en Búsqueda',
    description: 'Instagram en 2025 es un motor de búsqueda. El algoritmo indexa el texto de tus captions. Clínicas que incluyen "injerto capilar Madrid", "medicina estética Madrid" en la primera línea de la caption aparecen en búsquedas relevantes.',
    example: 'Primera línea: "El injerto capilar en Madrid que estabas buscando 👇" — contiene las keywords principales de forma natural.',
    icon: '🔍',
    category: 'estrategia',
  },
  {
    id: 'consistent-aesthetic',
    title: 'La Coherencia Visual Vale Más que la Frecuencia',
    description: 'Una clínica con 2 posts semanales de alta calidad visual supera a una con 7 posts inconsistentes. Define 3 paletas de color, 2-3 tipografías y un estilo fotográfico. La coherencia hace que tu perfil sea reconocible al instante en el feed.',
    example: 'Kavea: fondo blanco + tonos rosa pálido y dorado + tipografía sans-serif elegante para todos los posts diseñados.',
    icon: '🎨',
    category: 'visual',
  },
];
