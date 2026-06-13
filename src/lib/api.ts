import type { Service, ContentType, ContentTone } from '@/data/services';

export interface GeneratedContent {
  captions: string[];
  hashtags: string[];
  imagePrompt: string;
  contentTips: string[];
  bestTimeToPost: string;
}

export interface GeneratedImage {
  url: string;
  prompt: string;
}

function buildCaptionPrompt(
  service: Service,
  contentType: ContentType,
  tone: ContentTone,
  clinicName: string,
  clinicCity: string,
): string {
  const toneInstructions: Record<string, string> = {
    educational: 'Usa un tono didáctico pero accesible. Explica el procedimiento de forma simple. Incluye 3 puntos clave. Termina con una pregunta que invite a comentar.',
    emotional: 'Cuenta una historia real (ficticia pero verosímil). Conecta con la emoción de transformación y autoestima. Usa "tú" directo. Humaniza el resultado.',
    promotional: 'Crea urgencia sin ser agresivo. Menciona una ventaja competitiva. CTA claro hacia reservar consulta. Puede incluir "consulta gratuita".',
    inspirational: 'Habla del bienestar, la confianza y el autocuidado. Inspira sin vender directamente. El servicio aparece como consecuencia natural del bienestar.',
    behindscenes: 'Muestra el equipo, la clínica, el proceso humano. Tono cálido y cercano. Presenta a alguien del equipo o describe un día típico de trabajo.',
  };

  return `Eres el community manager de ${clinicName}, una clínica especializada en medicina estética y cirugía capilar ubicada en ${clinicCity}, España.

Genera contenido para Instagram con estas características:
- Servicio: ${service.name} (${service.description})
- Tipo de contenido: ${contentType.name}
- Tono: ${tone.name}

Instrucciones de tono: ${toneInstructions[tone.id] || 'Profesional y cercano.'}

Por favor devuelve EXACTAMENTE el siguiente formato JSON (sin markdown, solo JSON puro):
{
  "captions": [
    "Caption opción 1 completa con emojis y saltos de línea naturales",
    "Caption opción 2 alternativa con enfoque diferente",
    "Caption opción 3 más corta y directa"
  ],
  "hashtags": ["#hashtag1", "#hashtag2", ...] (25 hashtags relevantes, mezcla de tamaños),
  "imagePrompt": "Prompt en inglés para generar imagen en DALL-E 3, muy descriptivo, estilo editorial médico-beauty, sin texto en la imagen",
  "contentTips": [
    "Consejo 1 para maximizar el alcance de este contenido",
    "Consejo 2 sobre el mejor ángulo o presentación visual"
  ],
  "bestTimeToPost": "Día y hora recomendada (ej: Martes 19:00-21:00)"
}`;
}

export async function generateContent(
  service: Service,
  contentType: ContentType,
  tone: ContentTone,
  apiKey: string,
  clinicName = 'Kavea Clinic',
  clinicCity = 'Madrid',
): Promise<GeneratedContent> {
  const prompt = buildCaptionPrompt(service, contentType, tone, clinicName, clinicCity);

  const baseUrl = import.meta.env.DEV ? '/api/anthropic' : 'https://api.anthropic.com';
  const response = await fetch(`${baseUrl}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text: string = data.content?.[0]?.text ?? '';

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    return JSON.parse(jsonMatch[0]) as GeneratedContent;
  } catch {
    throw new Error('No se pudo parsear la respuesta de Claude. Verifica tu API key.');
  }
}

export async function generateImage(
  prompt: string,
  apiKey: string,
): Promise<GeneratedImage> {
  const enhancedPrompt = `${prompt}. Professional aesthetic clinic photography, clean white background with soft rose gold accents, luxury European medical clinic, high-end editorial beauty photography, natural daylight, 4K quality, no text, no watermarks.`;

  const openaiBase = import.meta.env.DEV ? '/api/openai' : 'https://api.openai.com';
  const response = await fetch(`${openaiBase}/v1/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: enhancedPrompt,
      size: '1024x1024',
      quality: 'standard',
      n: 1,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const url: string = data.data?.[0]?.url ?? '';
  if (!url) throw new Error('No image URL returned from DALL-E');

  return { url, prompt: enhancedPrompt };
}

export function getFallbackContent(
  service: Service,
  contentType: ContentType,
  tone: ContentTone,
): GeneratedContent {
  const captionTemplates: Record<string, string[]> = {
    educational: [
      `¿Sabes exactamente cómo funciona ${service.name}? 🔬\n\nEn Kavea Clinic Madrid te lo explicamos en 3 puntos clave:\n\n1️⃣ ${service.description}\n2️⃣ El procedimiento es mínimamente invasivo y se realiza en un solo día\n3️⃣ Los resultados son naturales y duraderos\n\n¿Tienes dudas? Cuéntanos en comentarios 👇\n\n📍 Kavea Clinic Madrid — link en bio para consulta gratuita`,
      `Todo lo que necesitas saber sobre ${service.name} antes de decidirte ✨\n\n${service.description}\n\nEn Kavea llevamos años perfeccionando este tratamiento para darte resultados que de verdad se notan.\n\n👉 Consulta gratuita sin compromiso — link en bio\n\n#kaveaclinic #madrid #medicinaestetica`,
    ],
    emotional: [
      `"Llevaba años sin mirarme al espejo con confianza..."\n\nEsto nos dijo Maria después de su tratamiento de ${service.name} en Kavea Clinic. Y es exactamente por lo que hacemos lo que hacemos. 💛\n\nNo es solo medicina estética. Es recuperar la mejor versión de ti mismo.\n\n📍 Madrid — Consulta gratuita en bio\n\n#kaveaclinic #transformacion #confianza #autoestima`,
      `Hay decisiones que cambian cómo te ves... y cómo te sientes 💬\n\n${service.name} en Kavea Clinic Madrid es una de ellas.\n\nCada día recibimos mensajes de pacientes que nos dicen que ojalá lo hubieran hecho antes.\n\nTu historia empieza con una consulta 🤍\n\n📍 Kavea Clinic Madrid`,
    ],
    promotional: [
      `¿Estás pensando en ${service.name}? 🎯\n\nEn Kavea Clinic Madrid llevamos años ayudando a nuestros pacientes a conseguir los resultados que siempre habían soñado.\n\n✅ Equipo médico especializado\n✅ Técnicas más avanzadas\n✅ Resultados naturales garantizados\n✅ Consulta gratuita sin compromiso\n\nReserva ahora — link en bio 👆\n\n#kaveaclinic #madrid`,
      `Kavea Clinic Madrid | ${service.name} ✨\n\nConsulta gratuita disponible esta semana.\n\nLlámanos o escríbenos en DM — te atendemos encantados 💛\n\n#kaveaclinic #medicinaestetica #madrid #belleza`,
    ],
    inspirational: [
      `Cuidarte no es un lujo. Es una necesidad. ✨\n\nEn Kavea Clinic Madrid creemos que todo el mundo merece verse y sentirse bien. ${service.name} es solo una de las herramientas que tenemos para acompañarte en ese camino.\n\n¿Cuándo fue la última vez que invertiste en ti mismo? 💛\n\n#kaveaclinic #autocuidado #bienestar #belleza #madrid`,
      `La mejor versión de ti no está en el futuro — está a una decisión de distancia 💫\n\n${service.name} en Kavea Clinic Madrid.\n\nTu proceso empieza hoy.\n\n#kaveaclinic #transformacion #madrid #bienestar`,
    ],
    behindscenes: [
      `Un día más en Kavea Clinic Madrid 🤍\n\nDetrás de cada tratamiento hay un equipo que se preocupa de verdad por cada paciente. ${service.name} no es solo un procedimiento — es la suma de años de formación, dedicación y cariño por lo que hacemos.\n\n¿Te gustaría conocer nuestro equipo? Cuéntanos en comentarios 👇\n\n#kaveaclinic #equipo #madrid #medicinaestetica`,
      `Esto es lo que pasa dentro de Kavea Clinic antes de que llegues a tu cita 👀\n\nPreparando todo al detalle para que tu experiencia con ${service.name} sea perfecta desde el minuto 1.\n\n#kaveaclinic #detras de camaras #madrid`,
    ],
  };

  const captions = captionTemplates[tone.id] || captionTemplates.educational;

  return {
    captions,
    hashtags: [
      '#kaveaclinic', '#madrid', '#medicinaestetica', '#belleza',
      '#antesydespues', '#transformacion', '#clinicaestetica',
      '#bienestar', '#autocuidado', `#${service.id.replace('-', '')}`,
      '#spain', '#españa', '#tratamientomedico', '#resultados',
      '#estetica', '#cabello', '#piel', '#skincare', '#confianza',
      '#instabelleza', '#bellezmadrid', '#clinicamadrid',
      '#medicinaesteticamadrid', '#kaveaclinicmadrid', '#salud',
    ],
    imagePrompt: `Professional aesthetic clinic ${contentType.name} post for ${service.name}. ${service.imageKeywords}. Luxury medical aesthetics clinic in Madrid Spain.`,
    contentTips: [
      `Para un ${contentType.name} de ${tone.name}: usa las primeras 3 palabras para captar atención inmediata`,
      `Incluye siempre el CTA "link en bio" para mayor tasa de conversión`,
    ],
    bestTimeToPost: 'Martes o Jueves 19:00–21:00 (mayor actividad de tu audiencia)',
  };
}
