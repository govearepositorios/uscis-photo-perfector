import { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, Star, Lightbulb, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { COMPETITORS, BEST_PRACTICES, type Competitor } from '@/data/competitors';

const TIER_LABELS: Record<string, { label: string; color: string }> = {
  premium: { label: 'Premium', color: 'bg-purple-100 text-purple-800' },
  mid: { label: 'Mid Market', color: 'bg-blue-100 text-blue-800' },
  local: { label: 'Local', color: 'bg-gray-100 text-gray-700' },
};

const CATEGORY_COLORS: Record<string, string> = {
  contenido: 'bg-kavea-rose-pale text-kavea-rose',
  visual: 'bg-purple-100 text-purple-700',
  estrategia: 'bg-blue-100 text-blue-800',
  engagement: 'bg-emerald-100 text-emerald-700',
};

function CompetitorCard({ competitor }: { competitor: Competitor }) {
  const [expanded, setExpanded] = useState(false);
  const tier = TIER_LABELS[competitor.tier];

  return (
    <Card className="border-gray-100 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-kavea-dark rounded-xl flex items-center justify-center text-xl">
              {competitor.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-base">{competitor.name}</CardTitle>
                <Badge className={`text-xs ${tier.color}`}>{tier.label}</Badge>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-kavea-muted">
                <span>{competitor.handle}</span>
                <span>·</span>
                <span>{competitor.estimatedFollowers} seguidores</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="p-2 rounded-lg hover:bg-gray-50 text-kavea-muted hover:text-kavea-dark"
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
          <div className="bg-gray-50 rounded-lg p-2">
            <span className="text-kavea-muted">Frecuencia:</span>
            <p className="font-medium text-kavea-dark mt-0.5">{competitor.postFrequency}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <span className="text-kavea-muted">Especialidad:</span>
            <p className="font-medium text-kavea-dark mt-0.5">{competitor.specialty}</p>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 space-y-4 border-t border-gray-50">
          {/* Visual style */}
          <div className="bg-purple-50 rounded-xl p-3">
            <p className="text-xs font-semibold text-purple-800 mb-1">🎨 Estilo visual</p>
            <p className="text-xs text-purple-700">{competitor.visualStyle}</p>
          </div>

          {/* Strengths */}
          <div>
            <p className="text-xs font-semibold text-kavea-muted uppercase tracking-wide mb-2 flex items-center gap-1">
              <Star size={11} className="text-amber-500" /> Fortalezas de contenido
            </p>
            <div className="space-y-2">
              {competitor.strengths.map((s, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs font-semibold text-kavea-dark mb-0.5">{s.area}</p>
                  <p className="text-xs text-kavea-muted leading-relaxed">{s.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Content examples */}
          <div>
            <p className="text-xs font-semibold text-kavea-muted uppercase tracking-wide mb-2 flex items-center gap-1">
              <TrendingUp size={11} /> Contenidos destacados
            </p>
            <div className="space-y-2">
              {competitor.contentExamples.map((ex, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-white border border-gray-100 rounded-lg">
                  <Badge
                    className={`text-xs shrink-0 mt-0.5 ${
                      ex.performance === 'alta' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {ex.performance === 'alta' ? '🔥 Alto' : '📊 Medio'}
                  </Badge>
                  <div>
                    <p className="text-xs font-medium text-kavea-dark">{ex.type}</p>
                    <p className="text-xs text-kavea-muted">{ex.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Opportunity */}
          <div className="bg-kavea-rose-pale border border-kavea-rose-light rounded-xl p-3 flex items-start gap-2">
            <Target size={14} className="text-kavea-rose mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-kavea-rose mb-1">Oportunidad para Kavea</p>
              <p className="text-xs text-kavea-dark leading-relaxed">{competitor.opportunity}</p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function Competitors() {
  const [activePracticeCategory, setActivePracticeCategory] = useState<string | null>(null);

  const filteredPractices = activePracticeCategory
    ? BEST_PRACTICES.filter((p) => p.category === activePracticeCategory)
    : BEST_PRACTICES;

  const categories = ['contenido', 'visual', 'estrategia', 'engagement'] as const;

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-kavea-dark mb-1">Análisis de Competidores</h1>
        <p className="text-kavea-muted text-sm">
          Aprende lo mejor de las clínicas líderes en Madrid. Extrae estrategias ganadoras y aplícalas en Kavea.
        </p>
      </div>

      {/* Summary insight */}
      <div className="mb-8 p-4 bg-kavea-dark rounded-xl text-white">
        <p className="text-xs text-white/60 uppercase tracking-wide font-medium mb-2">Insight principal</p>
        <p className="text-sm leading-relaxed">
          Las clínicas líderes en Madrid combinen <strong>alta producción visual</strong> con <strong>credibilidad médica</strong>. La gran brecha que puede aprovechar Kavea: ninguna de las clínicas top tiene un tono verdaderamente cercano y humano — dominan el lujo frío o el médico distante.
        </p>
        <p className="text-xs text-white/60 mt-3">
          La oportunidad de Kavea: ser la clínica de confianza que combina excelencia médica + calidez humana.
        </p>
      </div>

      {/* Competitor cards */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-kavea-dark mb-4 flex items-center gap-2">
          <span>Competidores analizados</span>
          <Badge variant="outline" className="text-xs">{COMPETITORS.length}</Badge>
        </h2>
        <div className="space-y-4">
          {COMPETITORS.map((c) => (
            <CompetitorCard key={c.id} competitor={c} />
          ))}
        </div>
      </div>

      {/* Best practices */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Lightbulb size={16} className="text-amber-500" />
          <h2 className="text-sm font-semibold text-kavea-dark">Mejores prácticas del sector</h2>
        </div>
        <p className="text-xs text-kavea-muted mb-4">
          Las 8 estrategias que más impactan en resultados según el análisis del sector estético en España.
        </p>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setActivePracticeCategory(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !activePracticeCategory
                ? 'bg-kavea-dark text-white'
                : 'bg-gray-100 text-kavea-muted hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActivePracticeCategory(activePracticeCategory === cat ? null : cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${
                activePracticeCategory === cat
                  ? 'bg-kavea-rose text-white'
                  : 'bg-gray-100 text-kavea-muted hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredPractices.map((practice) => (
            <div key={practice.id} className="bg-white border border-gray-100 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{practice.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-semibold text-kavea-dark">{practice.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[practice.category]}`}>
                      {practice.category}
                    </span>
                  </div>
                  <p className="text-xs text-kavea-muted leading-relaxed mb-2">{practice.description}</p>
                  <div className="bg-amber-50 rounded-lg p-2 flex items-start gap-1.5">
                    <span className="text-amber-500 text-xs font-bold mt-0.5">→</span>
                    <p className="text-xs text-amber-800 italic">{practice.example}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
