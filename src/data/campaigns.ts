export interface CampaignPost {
  week: number;
  day: string;
  type: string;
  topic: string;
  caption: string;
  hashtags: string[];
  tip: string;
}

export interface Campaign {
  id: string;
  name: string;
  period: string;
  months: number[];
  objective: string;
  description: string;
  posts: CampaignPost[];
  hashtags: string[];
  gradient: string;
  icon: string;
  targetAudience: string;
  kpis: string[];
}

export const CAMPAIGNS: Campaign[] = [
  {
    id: 'spring-beauty',
    name: '🌸 Primavera de la Belleza',
    period: 'Marzo — Abril',
    months: [3, 4],
    icon: '🌸',
    objective: 'Renovación estética antes del verano — captar nuevos pacientes de injerto capilar',
    description: 'La primavera es el momento ideal para el injerto capilar FUE, ya que el crecimiento del cabello alcanza su pico entre los meses 9-12, justo para el verano del año siguiente. Además, la gente busca renovarse después del invierno.',
    gradient: 'from-rose-100 to-pink-200',
    targetAudience: 'Hombres 28-45 con alopecia, mujeres interesadas en medicina estética',
    kpis: ['Consultas de injerto capilar +30%', 'Nuevos seguidores +15%', 'Guardados de posts educativos'],
    hashtags: [
      '#primaverabelleza', '#renovacionprimavera', '#injertocapilarmadrid',
      '#medicinaesteticamadrid', '#kaveaclinic', '#nuevatú',
      '#antesydespues', '#trasplantecapilar', '#primavera2025',
    ],
    posts: [
      {
        week: 1,
        day: 'Lunes',
        type: 'Reel',
        topic: '¿Por qué la primavera es el mejor momento para el injerto capilar?',
        caption: '¿Sabías que la PRIMAVERA es el momento ideal para tu injerto capilar? 🌸\n\nEl pelo trasplantado necesita entre 9 y 12 meses para mostrar el resultado definitivo. Si te operas ahora en primavera... ¡llegarás al verano siguiente con tu melena al completo! ☀️\n\nEn Kavea Clinic Madrid trabajamos con la técnica FUE Zafiro para resultados 100% naturales, sin cicatrices visibles.\n\n👉 Consulta gratuita en el link de la bio\n\n#kaveaclinic #injertocapilarmadrid #fuezafiro #primavera #trasplantecapilar',
        hashtags: ['#kaveaclinic', '#injertocapilarmadrid', '#fuezafiro', '#primavera', '#trasplantecapilar', '#alopecia', '#cabello', '#madrid'],
        tip: 'Graba el Reel mostrando el cronograma de crecimiento con texto animado sobre pantalla negra — simple pero muy compartible',
      },
      {
        week: 1,
        day: 'Jueves',
        type: 'Post / Carrusel',
        topic: 'Antes y después: 12 meses post injerto FUE en Kavea',
        caption: '12 meses. Una decisión. Un resultado que cambia todo. ✨\n\nDesliza para ver la transformación completa de Mario, paciente de Kavea Clinic Madrid. De la consulta inicial hasta los 12 meses post-injerto FUE Zafiro.\n\nResultados naturales, sin cicatrices, en nuestra clínica del corazón de Madrid.\n\n📞 Reserva tu consulta gratuita — link en bio\n\n#antesydespues #injertocapilar #resultados #kaveaclinic #madrid',
        hashtags: ['#antesydespues', '#injertocapilar', '#resultados', '#kaveaclinic', '#madrid', '#alopecia', '#cabello', '#trasplante'],
        tip: 'Usa el carrusel mostrando meses 0, 3, 6, 9 y 12 con las mismas condiciones de luz — el progreso es la historia',
      },
      {
        week: 2,
        day: 'Martes',
        type: 'Reel Educativo',
        topic: 'Diferencias entre FUE, DHI y FUE Zafiro explicadas en 60 segundos',
        caption: '¿FUE, DHI o Zafiro? 🔬 Te lo explico en 60 segundos...\n\nCada técnica tiene sus ventajas. Lo importante es que en Kavea evaluamos TU caso específico para recomendarte la más adecuada.\n\n✅ FUE clásico: el más versátil\n✅ FUE Zafiro: máxima precisión\n✅ DHI: mayor densidad por centímetro\n\n¿Tienes dudas? Respóndeme en los comentarios 👇\n\n#injertocapilar #FUE #DHI #fuezafiro #kaveaclinic #preguntame',
        hashtags: ['#injertocapilar', '#FUE', '#DHI', '#fuezafiro', '#kaveaclinic', '#preguntame', '#madrid', '#cirugiacacapilar'],
        tip: 'Usa pantallas de texto animado con cada técnica. Termina siempre con "¿Cuál se adapta mejor a ti? 👇"',
      },
      {
        week: 3,
        day: 'Miércoles',
        type: 'Historia + Story Poll',
        topic: '¿Te ha preocupado la caída del cabello esta temporada?',
        caption: 'Una encuesta rápida: ¿Has notado más caída de cabello este invierno? 🤔\n\n[Poll: Sí, bastante / No, igual que siempre]\n\nSi has votado SÍ, cuéntanos en DM — a veces es estacional, a veces indica algo más. Siempre es bueno consultarlo 💬',
        hashtags: [],
        tip: 'Las historias con encuestas generan 3x más interacción. El DM que llega es un lead caliente.',
      },
      {
        week: 4,
        day: 'Viernes',
        type: 'Reel Testimonial',
        topic: 'Testimonio en vídeo: "El día más importante de mi vida"',
        caption: '"No imaginaba que cambiaría tanto... y no solo el cabello" 💬\n\nAlejandro vino a Kavea Clinic hace 14 meses con alopecia grado IV. Hoy nos cuenta su experiencia — desde la consulta inicial hasta el resultado que le cambió la vida.\n\nEstas son las historias que nos dan sentido. 🙏\n\n📍 Kavea Clinic Madrid\n🔗 Consulta gratuita en bio\n\n#testimonio #injertocapilar #transformacion #kaveaclinic #alopecia #confianza',
        hashtags: ['#testimonio', '#injertocapilar', '#transformacion', '#kaveaclinic', '#alopecia', '#confianza', '#madrid'],
        tip: 'El testimonio en vídeo es el contenido de mayor conversión. Un smartphone bien iluminado basta — la autenticidad es el valor.',
      },
    ],
  },
  {
    id: 'summer-ready',
    name: '☀️ Lista para el Verano',
    period: 'Mayo — Junio',
    months: [5, 6],
    icon: '☀️',
    objective: 'Tratamientos rápidos pre-verano: botox, ácido hialurónico, hidrafacial',
    description: 'Mayo y junio son los meses de mayor demanda en medicina estética. Todo el mundo quiere verse bien en verano. Es el momento para posicionar los tratamientos express y los bundles (paquetes) de preparación estival.',
    gradient: 'from-amber-100 to-yellow-200',
    targetAudience: 'Mujeres 30-55 que quieren resultados para el verano',
    kpis: ['Reservas de botox e hialurónico +40%', 'Paquete "Lista para el Verano" vendido', 'Engagement en Reels de resultados'],
    hashtags: [
      '#verano2025', '#listaparaelverano', '#botoxmadrid', '#acidohialuronico',
      '#medicinaestetica', '#kaveaclinic', '#bellezaverano', '#hidrafacial',
    ],
    posts: [
      {
        week: 1,
        day: 'Lunes',
        type: 'Carrusel',
        topic: '5 tratamientos para estar radiante este verano — con tiempo de recuperación',
        caption: 'Cuenta atrás para el verano ☀️ ¿Cuánto tiempo necesitas para cada tratamiento?\n\nDesliza para ver nuestro TOP 5 de tratamientos pre-verano con los tiempos reales de recuperación — sin sorpresas:\n\n1️⃣ Botox — 24h (evitar sol directo)\n2️⃣ Ácido Hialurónico — 48h\n3️⃣ Hydrafacial — 0h (¡te vas brillando!)\n4️⃣ Peeling Químico — 5-7 días\n5️⃣ Bioestimuladores — 72h\n\nReserva tu consulta y te asesoramos sin compromiso 💛\n\n#kaveaclinic #listaparaelverano #botox #acidohialuronico #bellezamadrid',
        hashtags: ['#kaveaclinic', '#listaparaelverano', '#botox', '#acidohialuronico', '#bellezamadrid', '#verano', '#medicinaestetica', '#madrid'],
        tip: 'Cada slide del carrusel = un tratamiento. Diseño limpio con fondo blanco y tipografía grande. El último slide = CTA "¿Cuál te interesa?"',
      },
      {
        week: 2,
        day: 'Martes',
        type: 'Reel',
        topic: 'Resultado Hydrafacial inmediato — en cámara real',
        caption: 'La piel ANTES y DESPUÉS de un Hydrafacial en Kavea... en tiempo real 🌊✨\n\nCero retoque. Cero filtro. Solo el resultado real de 60 minutos de tratamiento.\n\nLimpieza profunda + exfoliación + hidratación = piel de bebé 👶\n\n¿Lo quieres? Consulta disponibilidad en nuestra bio 💬\n\n#hydrafacial #antesydespues #kaveaclinic #piel #bellezamadrid #tratamientofacial',
        hashtags: ['#hydrafacial', '#antesydespues', '#kaveaclinic', '#piel', '#bellezamadrid', '#tratamientofacial', '#madrid'],
        tip: 'Graba en el mismo espacio y luz — antes sin maquillaje, después sin filtros. La autenticidad convierte.',
      },
    ],
  },
  {
    id: 'fall-recovery',
    name: '🍂 Vuelta a la Rutina',
    period: 'Septiembre — Octubre',
    months: [9, 10],
    icon: '🍂',
    objective: 'Post-verano: recuperación capilar y piel tras la exposición solar',
    description: 'Septiembre es el mes de vuelta a la rutina. La piel y el cabello sufren en verano: sol, agua de mar, cloro. Es el momento perfecto para hablar de tratamientos de recuperación y planificar el injerto de otoño.',
    gradient: 'from-orange-100 to-amber-200',
    targetAudience: 'Público general que ha estado en verano, hombres con alopecia',
    kpis: ['Consultas post-verano', 'Tratamientos de recuperación vendidos', 'Nuevos leads capilares'],
    hashtags: [
      '#vueltaalarutina', '#cuidadopiel', '#recuperacioncapilar', '#kaveaclinic',
      '#otono2025', '#medicinaestetica', '#madrid', '#antesydespues',
    ],
    posts: [
      {
        week: 1,
        day: 'Lunes',
        type: 'Reel Educativo',
        topic: 'El verano y tu cabello — daños que no conocías',
        caption: 'El verano es brutal para tu cabello... y muchos no lo saben 😬\n\nEl sol, el agua del mar, el cloro de la piscina y los gorros de baño crean el cóctel perfecto para la caída aumentada en otoño.\n\nEn Kavea te explicamos cómo recuperar tu densidad capilar antes de fin de año:\n\n✅ PRP capilar\n✅ Mesoterapia\n✅ Valoración gratuita de tu caso\n\n👉 Link en bio para tu cita\n\n#cabello #cuidadocapilar #kaveaclinic #recuperacion #otono',
        hashtags: ['#cabello', '#cuidadocapilar', '#kaveaclinic', '#recuperacion', '#otono', '#madrid', '#alopecia'],
        tip: 'Muestra con infografía animada los 3 agresores del verano. Simple y muy guardable.',
      },
    ],
  },
  {
    id: 'new-year',
    name: '✨ Nueva Tú en el Nuevo Año',
    period: 'Enero — Febrero',
    months: [1, 2],
    icon: '✨',
    objective: 'Captar decisiones de cambio de año nuevo: injerto capilar y renovación estética',
    description: 'Enero es el mes de las decisiones. "Este año sí me lo hago" es el pensamiento de miles de personas con alopecia. El injerto capilar es la resolución número 1 de bienestar masculino. Capitaliza ese momento.',
    gradient: 'from-purple-100 to-indigo-200',
    targetAudience: 'Hombres 28-50 que llevan años pensando en el injerto',
    kpis: ['Consultas de injerto enero +50%', 'Conversiones de consulta gratuita a cirugía'],
    hashtags: [
      '#propositosnuevoanno', '#nuevaño', '#injertocapilarmadrid', '#kaveaclinic',
      '#esteannosi', '#transformacion2025', '#alopecia', '#cabellonuevo',
    ],
    posts: [
      {
        week: 1,
        day: 'Lunes',
        type: 'Reel',
        topic: '"Este año sí me lo hago" — el injerto capilar que siempre has pospuesto',
        caption: '"Llevo 5 años diciéndome: el año que viene me lo hago..." 🤔\n\n¿Te suena? Pues este año, el año que viene... es AHORA.\n\nEn Kavea Clinic te acompañamos en todo el proceso:\n📋 Consulta gratuita + diagnóstico\n💉 Cirugía en un solo día\n📈 Primeros resultados a los 3 meses\n🎉 Resultado definitivo a los 12 meses\n\n2025 es TU año. Empieza bien. 💛\n\n#esteannosi #injertocapilar #kaveaclinic #propositosannuevo #madrid #alopecia',
        hashtags: ['#esteannosi', '#injertocapilar', '#kaveaclinic', '#propositosnuevoanno', '#madrid', '#alopecia'],
        tip: 'Usa "Este año sí" como hook de texto al inicio del Reel — texto grande, fondo negro. Conecta con la emoción de la procrastinación.',
      },
    ],
  },
  {
    id: 'valentines',
    name: '💝 San Valentín',
    period: 'Febrero',
    months: [2],
    icon: '💝',
    objective: 'Tratamientos en pareja y regalos de bienestar y belleza',
    description: 'San Valentín no es solo flores. Cada vez más parejas se regalan experiencias de bienestar y tratamientos estéticos. Es una oportunidad para paquetes especiales y contenido emocional.',
    gradient: 'from-red-100 to-rose-200',
    targetAudience: 'Parejas 25-45, personas que quieren regalar algo diferente',
    kpis: ['Ventas de bonos regalo', 'Reservas en febrero', 'Engagement en contenido romántico'],
    hashtags: [
      '#sanvalentin', '#regalosanvalentin', '#kaveaclinic', '#bienestar',
      '#tratamientoestetico', '#regalooriginal', '#belleza', '#madrid',
    ],
    posts: [
      {
        week: 1,
        day: 'Martes',
        type: 'Post / Carrusel',
        topic: 'Ideas de regalo de San Valentín que duran para siempre',
        caption: 'Este San Valentín, regala algo que de verdad importa 💝\n\nLas flores se marchitan. El chocolate se acaba. Pero la confianza que te da verte bien... ¡esa se queda!\n\nNuestros bonos regalo para San Valentín 2025:\n🌊 Hydrafacial Express — El tratamiento sorpresa\n✨ Pack Botox Premium — Para quien quiere empezar\n💎 Consulta de Injerto + Plan Personalizado — El regalo de vida\n\nSorpréndela (o sorpréndete) este 14F 💛\n📩 Escríbenos para personalizar tu bono regalo\n\n#sanvalentin #regalobelleza #kaveaclinic #madrid',
        hashtags: ['#sanvalentin', '#regalobelleza', '#kaveaclinic', '#madrid', '#tratamientoestetico', '#bonregalo'],
        tip: 'Diseño con colores suaves rosa/gold. Termina el carrusel con "¿A quién se lo regalarías?" — genera interacción.',
      },
    ],
  },
  {
    id: 'fathers-day',
    name: '👨 Día del Padre',
    period: 'Junio',
    months: [6],
    icon: '👨',
    objective: 'Posicionar el injerto capilar como el mejor regalo para el Día del Padre',
    description: 'El Día del Padre en España (19 de marzo, aunque en muchas culturas en junio) es una oportunidad perfecta para hablar del autocuidado masculino y el injerto capilar como regalo transformador.',
    gradient: 'from-blue-100 to-indigo-200',
    targetAudience: 'Hijos/parejas que quieren regalar algo especial, hombres que quieren hacerse el injerto',
    kpis: ['Consultas de hombres +20%', 'Ventas de bonos regalo masculinos'],
    hashtags: [
      '#diadelpadre', '#regalopadre', '#injertocapilar', '#kaveaclinic',
      '#autocuidadomasculino', '#hombresbelleza', '#madrid', '#barber',
    ],
    posts: [
      {
        week: 1,
        day: 'Lunes',
        type: 'Reel',
        topic: '¿Qué regalar al padre que lo tiene todo? — El injerto que lleva años posponiendo',
        caption: 'Para el padre que lo tiene todo... menos cabello 😄\n\nEste Día del Padre, dale el regalo que lleva años queriendo pero nunca se ha decidido a hacer: su consulta gratuita de injerto capilar en Kavea Clinic Madrid.\n\nRegala confianza. Regala transformación. Regala que se vea como siempre se ha sentido por dentro.\n\n💛 Bonos consulta disponibles\n📩 DM o link en bio\n\n#diadelpadre #injertocapilar #kaveaclinic #regalo #papá #madrid',
        hashtags: ['#diadelpadre', '#injertocapilar', '#kaveaclinic', '#regalo', '#papá', '#madrid', '#autocuidado'],
        tip: 'Tono cálido y con humor. El gancho "que lo tiene todo menos cabello" rompe el hielo y es muy compartible.',
      },
    ],
  },
];
