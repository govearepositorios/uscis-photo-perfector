import { useNavigate } from 'react-router-dom';
import { Sparkles, CalendarDays, Users, TrendingUp, Instagram, ArrowRight, Lightbulb } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSettings } from '@/hooks/useSettings';

const DAILY_TIPS = [
  'Los Reels con texto superpuesto en los primeros 3 segundos retienen 40% más audiencia.',
  'Publica historias con encuestas los martes — es cuando más interacción generan para clínicas en Madrid.',
  'El hashtag #injertocapilarmadrid tiene +85K posts pero baja competencia — úsalo en todos tus posts capilares.',
  'Un carrusel educativo de 5 slides genera 3x más guardados que un post estático.',
  'Responder a comentarios en la primera hora de publicar aumenta el alcance en un 15%.',
  'Los testimonios en vídeo de menos de 45 segundos son el contenido de mayor conversión en clínicas estéticas.',
  'Las fotos antes/después necesitan misma luz, mismo ángulo y misma distancia para ser convincentes.',
  'El domingo por la noche (20:00-22:00) es el mejor momento para publicar Reels de inspiración.',
];

const QUICK_STATS = [
  { label: 'Seguidores actuales', value: '—', hint: 'Actualiza en configuración', icon: Instagram },
  { label: 'Servicios configurados', value: '11', hint: 'Servicios disponibles', icon: Sparkles },
  { label: 'Campañas disponibles', value: '6', hint: 'Listas para usar', icon: CalendarDays },
  { label: 'Competidores analizados', value: '4', hint: 'Clinicas en Madrid', icon: Users },
];

const QUICK_ACTIONS = [
  {
    title: 'Generar Contenido',
    description: 'Crea captions, ideas e imágenes para Instagram con IA',
    icon: Sparkles,
    to: '/generator',
    color: 'bg-kavea-rose text-white',
    badge: 'IA',
  },
  {
    title: 'Ver Campañas',
    description: 'Campañas estacionales completas listas para publicar',
    icon: CalendarDays,
    to: '/campaigns',
    color: 'bg-kavea-gold text-white',
    badge: '6 activas',
  },
  {
    title: 'Analizar Competidores',
    description: 'Aprende lo mejor de las clínicas líderes en Madrid',
    icon: Users,
    to: '/competitors',
    color: 'bg-kavea-dark text-white',
    badge: 'Insights',
  },
  {
    title: 'Planificar Calendario',
    description: 'Organiza tus publicaciones del mes',
    icon: TrendingUp,
    to: '/calendar',
    color: 'bg-emerald-600 text-white',
    badge: 'Nuevo',
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { settings, hasClaudeKey, hasOpenAIKey } = useSettings();
  const randomTip = DAILY_TIPS[Math.floor(Math.random() * DAILY_TIPS.length)];
  const currentMonth = new Date().toLocaleDateString('es-ES', { month: 'long' });

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-kavea-rose rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl leading-none">K</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-kavea-dark">
              Hola, {settings.clinicName} 👋
            </h1>
            <p className="text-kavea-muted text-sm">
              {settings.clinicCity} · {settings.clinicInstagram}
            </p>
          </div>
        </div>
        <p className="text-kavea-muted mt-3 text-sm">
          Tu centro de creación de contenido para Instagram. Genera ideas, imágenes y campañas para diferenciarte en el mercado estético de {settings.clinicCity}.
        </p>
      </div>

      {/* API Key warning */}
      {(!hasClaudeKey || !hasOpenAIKey) && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <span className="text-amber-500 text-xl mt-0.5">⚠️</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-900">
              {!hasClaudeKey && !hasOpenAIKey
                ? 'Configura tus API keys para usar la generación con IA'
                : !hasClaudeKey
                ? 'Falta tu API key de Claude para generar captions'
                : 'Falta tu API key de OpenAI para generar imágenes'}
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Sin API keys puedes usar las plantillas y campañas pre-construidas.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/settings')}
            className="border-amber-300 text-amber-800 hover:bg-amber-100 text-xs"
          >
            Configurar
          </Button>
        </div>
      )}

      {/* Daily tip */}
      <div className="mb-6 p-4 bg-kavea-rose-pale border border-kavea-rose-light rounded-xl flex items-start gap-3">
        <Lightbulb size={18} className="text-kavea-rose mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs font-semibold text-kavea-rose uppercase tracking-wide mb-1">
            Consejo del día
          </p>
          <p className="text-sm text-kavea-dark">{randomTip}</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-kavea-muted uppercase tracking-wide mb-4">
          Acciones rápidas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.to}
              onClick={() => navigate(action.to)}
              className="group text-left p-4 bg-white border border-gray-100 rounded-xl hover:border-kavea-rose-light hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color} shadow-sm`}>
                  <action.icon size={18} />
                </div>
                <Badge variant="secondary" className="text-xs bg-gray-100 text-kavea-muted">
                  {action.badge}
                </Badge>
              </div>
              <p className="font-semibold text-kavea-dark text-sm mb-1">{action.title}</p>
              <p className="text-xs text-kavea-muted leading-relaxed">{action.description}</p>
              <div className="flex items-center gap-1 mt-3 text-kavea-rose text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Ir ahora</span>
                <ArrowRight size={12} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-kavea-muted uppercase tracking-wide mb-4">
          Resumen
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_STATS.map((stat) => (
            <Card key={stat.label} className="border-gray-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon size={14} className="text-kavea-rose" />
                  <span className="text-xs text-kavea-muted font-medium">{stat.label}</span>
                </div>
                <p className="text-xl font-bold text-kavea-dark">{stat.value}</p>
                <p className="text-xs text-kavea-muted mt-0.5">{stat.hint}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Content ideas for the month */}
      <div>
        <h2 className="text-sm font-semibold text-kavea-muted uppercase tracking-wide mb-4">
          Ideas para {currentMonth}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { emoji: '🎬', type: 'Reel', idea: 'Antes/Después injerto capilar — 12 meses de evolución', cta: 'Alta conversión' },
            { emoji: '📚', type: 'Carrusel', idea: '5 preguntas frecuentes sobre ácido hialurónico respondidas', cta: 'Alto guardado' },
            { emoji: '💬', type: 'Post', idea: 'Testimonio de paciente con texto emocional sobre confianza', cta: 'Alto engagement' },
          ].map((idea, i) => (
            <div key={i} className="p-4 bg-white border border-gray-100 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{idea.emoji}</span>
                <Badge variant="outline" className="text-xs">{idea.type}</Badge>
              </div>
              <p className="text-sm text-kavea-dark font-medium leading-snug mb-2">{idea.idea}</p>
              <span className="text-xs text-kavea-rose font-medium">{idea.cta}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Button
            onClick={() => navigate('/generator')}
            className="bg-kavea-rose hover:bg-kavea-rose/90 text-white"
          >
            <Sparkles size={16} className="mr-2" />
            Generar contenido personalizado
          </Button>
        </div>
      </div>
    </div>
  );
}
