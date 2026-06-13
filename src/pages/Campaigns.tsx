import { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, Copy, CheckCircle2, Target, Users, TrendingUp, Hash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CAMPAIGNS, type Campaign, type CampaignPost } from '@/data/campaigns';
import { toast } from 'sonner';

function copyToClipboard(text: string, label: string) {
  navigator.clipboard.writeText(text).then(() => {
    toast.success(`${label} copiado al portapapeles`);
  });
}

function PostCard({ post }: { post: CampaignPost }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(post.caption).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Caption copiada');
    });
  };

  return (
    <div className="border border-gray-100 rounded-xl bg-white overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">{post.type}</Badge>
            <span className="text-xs text-kavea-muted">Semana {post.week} · {post.day}</span>
          </div>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="text-kavea-muted hover:text-kavea-dark"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
        <p className="text-sm font-medium text-kavea-dark leading-snug">{post.topic}</p>
      </div>

      {expanded && (
        <div className="border-t border-gray-50 bg-gray-50/50">
          <div className="p-4 space-y-4">
            {/* Caption */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-kavea-muted uppercase tracking-wide">Caption</p>
                <button
                  onClick={handleCopyCaption}
                  className="flex items-center gap-1 text-xs text-kavea-rose hover:text-kavea-rose/80 transition-colors"
                >
                  {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <p className="text-sm text-kavea-dark whitespace-pre-wrap leading-relaxed bg-white rounded-lg p-3 border border-gray-100">
                {post.caption}
              </p>
            </div>

            {/* Hashtags */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-kavea-muted uppercase tracking-wide">Hashtags</p>
                <button
                  onClick={() => copyToClipboard(post.hashtags.join(' '), 'Hashtags')}
                  className="flex items-center gap-1 text-xs text-kavea-rose hover:text-kavea-rose/80"
                >
                  <Copy size={12} /> Copiar
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {post.hashtags.map((tag) => (
                  <span key={tag} className="text-xs bg-kavea-rose-pale text-kavea-rose px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Tip */}
            <div className="bg-amber-50 rounded-lg p-3 flex items-start gap-2">
              <span className="text-amber-500 text-sm mt-0.5">💡</span>
              <p className="text-xs text-amber-800 leading-relaxed">{post.tip}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const [expanded, setExpanded] = useState(false);
  const currentMonth = new Date().getMonth() + 1;
  const isCurrentMonth = campaign.months.includes(currentMonth);

  return (
    <Card className={`border-gray-100 overflow-hidden ${isCurrentMonth ? 'ring-2 ring-kavea-rose/30' : ''}`}>
      <div className={`h-1.5 bg-gradient-to-r ${campaign.gradient}`} />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{campaign.icon}</span>
            <div>
              <CardTitle className="text-base">{campaign.name.replace(/^[^\s]+\s/, '')}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Calendar size={12} className="text-kavea-muted" />
                <span className="text-xs text-kavea-muted">{campaign.period}</span>
                {isCurrentMonth && (
                  <Badge className="bg-kavea-rose text-white text-xs h-4">Activa ahora</Badge>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="p-2 rounded-lg hover:bg-gray-50 text-kavea-muted hover:text-kavea-dark transition-colors"
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
        <p className="text-sm text-kavea-muted leading-relaxed">{campaign.objective}</p>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 space-y-5">
          {/* Description */}
          <p className="text-sm text-kavea-dark leading-relaxed bg-gray-50 rounded-xl p-3">
            {campaign.description}
          </p>

          {/* Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50">
              <Users size={14} className="text-blue-600 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-blue-800 mb-1">Audiencia objetivo</p>
                <p className="text-xs text-blue-700">{campaign.targetAudience}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 sm:col-span-2">
              <TrendingUp size={14} className="text-emerald-600 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-emerald-800 mb-1">KPIs sugeridos</p>
                <ul className="space-y-0.5">
                  {campaign.kpis.map((kpi, i) => (
                    <li key={i} className="text-xs text-emerald-700">· {kpi}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Hashtags of campaign */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Hash size={13} className="text-kavea-muted" />
                <p className="text-xs font-semibold text-kavea-muted uppercase tracking-wide">Hashtags de campaña</p>
              </div>
              <button
                onClick={() => copyToClipboard(campaign.hashtags.join(' '), 'Hashtags de campaña')}
                className="flex items-center gap-1 text-xs text-kavea-rose hover:text-kavea-rose/80"
              >
                <Copy size={12} /> Copiar todos
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {campaign.hashtags.map((tag) => (
                <span key={tag} className="text-xs bg-kavea-rose-pale text-kavea-rose px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Posts */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <Target size={13} className="text-kavea-muted" />
              <p className="text-xs font-semibold text-kavea-muted uppercase tracking-wide">
                Posts de la campaña ({campaign.posts.length})
              </p>
            </div>
            <div className="space-y-2">
              {campaign.posts.map((post, i) => (
                <PostCard key={i} post={post} />
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function Campaigns() {
  const currentMonth = new Date().getMonth() + 1;
  const activeCampaigns = CAMPAIGNS.filter((c) => c.months.includes(currentMonth));
  const upcomingCampaigns = CAMPAIGNS.filter((c) => !c.months.includes(currentMonth));

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-kavea-dark mb-1">Campañas de Publicación</h1>
        <p className="text-kavea-muted text-sm">
          Estrategias completas con posts, captions y hashtags listos para publicar. Haz clic en cada campaña para ver los contenidos.
        </p>
      </div>

      {/* Active campaigns */}
      {activeCampaigns.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-kavea-rose rounded-full animate-pulse" />
            <h2 className="text-sm font-semibold text-kavea-dark">Activas este mes</h2>
            <Badge className="bg-kavea-rose text-white text-xs">{activeCampaigns.length}</Badge>
          </div>
          <div className="space-y-4">
            {activeCampaigns.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming */}
      <div>
        <h2 className="text-sm font-semibold text-kavea-dark mb-4">Todas las campañas</h2>
        <div className="space-y-4">
          {upcomingCampaigns.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      </div>

      {/* Empty state for active */}
      {activeCampaigns.length === 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl text-center text-sm text-kavea-muted">
          No hay campañas activas para el mes actual. Consulta las disponibles abajo.
        </div>
      )}
    </div>
  );
}
