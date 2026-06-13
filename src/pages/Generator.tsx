import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Copy, CheckCircle2, Download, CalendarPlus,
  RefreshCw, Image, Loader2, AlertCircle, Hash,
  ChevronRight, Settings, ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useSettings } from '@/hooks/useSettings';
import { SERVICES, CONTENT_TYPES, CONTENT_TONES, SERVICE_CATEGORIES } from '@/data/services';
import { generateContent, generateImage, getFallbackContent, type GeneratedContent } from '@/lib/api';
import type { CalendarPost } from './CalendarPage';
import { format } from 'date-fns';

const STEPS = [
  { id: 1, label: 'Configurar', icon: Settings },
  { id: 2, label: 'Generar', icon: Sparkles },
  { id: 3, label: 'Exportar', icon: Download },
];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-1 mb-8">
      {STEPS.map((step, i) => (
        <div key={step.id} className="flex items-center">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              currentStep === step.id
                ? 'bg-kavea-rose text-white'
                : currentStep > step.id
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-kavea-muted'
            }`}
          >
            {currentStep > step.id ? (
              <CheckCircle2 size={12} />
            ) : (
              <step.icon size={12} />
            )}
            <span>{step.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <ChevronRight size={14} className="mx-1 text-gray-300" />
          )}
        </div>
      ))}
    </div>
  );
}

function OptionButton({
  selected,
  onClick,
  children,
  className = '',
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left p-3 rounded-xl border transition-all duration-150 ${
        selected
          ? 'border-kavea-rose bg-kavea-rose-pale shadow-sm'
          : 'border-gray-100 bg-white hover:border-kavea-rose-light hover:bg-kavea-rose-pale/30'
      } ${className}`}
    >
      {children}
    </button>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success(`${label} copiado`);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-xs text-kavea-rose hover:text-kavea-rose/80 transition-colors"
    >
      {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
      {copied ? 'Copiado' : 'Copiar'}
    </button>
  );
}

export default function Generator() {
  const navigate = useNavigate();
  const { settings, hasClaudeKey, hasOpenAIKey } = useSettings();

  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState('');
  const [contentTypeId, setContentTypeId] = useState('');
  const [toneId, setToneId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generated, setGenerated] = useState<GeneratedContent | null>(null);
  const [selectedCaption, setSelectedCaption] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedService = SERVICES.find((s) => s.id === serviceId);
  const selectedContentType = CONTENT_TYPES.find((c) => c.id === contentTypeId);
  const selectedTone = CONTENT_TONES.find((t) => t.id === toneId);

  const canProceed = serviceId && contentTypeId && toneId;

  const handleGenerate = async () => {
    if (!selectedService || !selectedContentType || !selectedTone) return;
    setStep(2);
    setIsGenerating(true);
    setError(null);
    setGenerated(null);
    setImageUrl(null);

    if (hasClaudeKey) {
      try {
        const result = await generateContent(
          selectedService,
          selectedContentType,
          selectedTone,
          settings.claudeApiKey,
          settings.clinicName,
          settings.clinicCity,
        );
        setGenerated(result);
        setSelectedCaption(0);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error al generar contenido';
        setError(msg);
        setGenerated(getFallbackContent(selectedService, selectedContentType, selectedTone));
      }
    } else {
      setGenerated(getFallbackContent(selectedService, selectedContentType, selectedTone));
    }
    setIsGenerating(false);
  };

  const handleGenerateImage = async () => {
    if (!generated?.imagePrompt) return;
    if (!hasOpenAIKey) {
      setImageError('Configura tu API key de OpenAI en Configuración para generar imágenes.');
      return;
    }
    setIsGeneratingImage(true);
    setImageError(null);
    try {
      const result = await generateImage(generated.imagePrompt, settings.openaiApiKey);
      setImageUrl(result.url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al generar imagen';
      setImageError(msg);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSaveToCalendar = () => {
    if (!generated || !selectedService) return;
    const post: CalendarPost = {
      id: `post_${Date.now()}`,
      date: format(new Date(), 'yyyy-MM-dd'),
      type: selectedContentType?.name ?? 'Post',
      topic: `${selectedService.name} — ${selectedTone?.name}`,
      caption: generated.captions[selectedCaption] ?? '',
      hashtags: generated.hashtags,
      service: selectedService.name,
    };
    try {
      const stored = localStorage.getItem('kavea_calendar_posts');
      const existing: CalendarPost[] = stored ? JSON.parse(stored) : [];
      existing.push(post);
      localStorage.setItem('kavea_calendar_posts', JSON.stringify(existing));
      toast.success('Post guardado en el calendario', {
        action: { label: 'Ver calendario', onClick: () => navigate('/calendar') },
      });
    } catch {
      toast.error('No se pudo guardar en el calendario');
    }
  };

  const handleReset = () => {
    setStep(1);
    setGenerated(null);
    setImageUrl(null);
    setError(null);
    setImageError(null);
  };

  // Group services by category
  const servicesByCategory = SERVICES.reduce<Record<string, typeof SERVICES>>((acc, s) => {
    acc[s.category] = acc[s.category] || [];
    acc[s.category].push(s);
    return acc;
  }, {});

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-kavea-dark mb-1">Generador de Contenido</h1>
        <p className="text-kavea-muted text-sm">
          Crea captions, hashtags e imágenes personalizadas para Instagram con IA.
        </p>
      </div>

      <StepIndicator currentStep={step} />

      {/* STEP 1: Configure */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Service selector */}
          <div>
            <p className="text-sm font-semibold text-kavea-dark mb-3">
              1. ¿Sobre qué servicio quieres crear contenido?
            </p>
            <div className="space-y-3">
              {(Object.entries(servicesByCategory) as [string, typeof SERVICES][]).map(([cat, services]) => (
                <div key={cat}>
                  <p className="text-xs font-medium text-kavea-muted mb-2 flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${SERVICE_CATEGORIES[cat as keyof typeof SERVICE_CATEGORIES]?.color}`}>
                      {SERVICE_CATEGORIES[cat as keyof typeof SERVICE_CATEGORIES]?.label}
                    </span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {services.map((service) => (
                      <OptionButton
                        key={service.id}
                        selected={serviceId === service.id}
                        onClick={() => setServiceId(service.id)}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-base">{service.emoji}</span>
                          <div>
                            <p className="text-sm font-medium text-kavea-dark">{service.name}</p>
                            <p className="text-xs text-kavea-muted leading-snug mt-0.5">{service.description}</p>
                          </div>
                        </div>
                      </OptionButton>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Content type */}
          <div>
            <p className="text-sm font-semibold text-kavea-dark mb-3">
              2. ¿Qué tipo de contenido?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {CONTENT_TYPES.map((ct) => (
                <OptionButton
                  key={ct.id}
                  selected={contentTypeId === ct.id}
                  onClick={() => setContentTypeId(ct.id)}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-base">{ct.emoji}</span>
                    <div>
                      <p className="text-sm font-medium text-kavea-dark">{ct.name}</p>
                      <p className="text-xs text-kavea-muted leading-snug mt-0.5">{ct.description}</p>
                    </div>
                  </div>
                </OptionButton>
              ))}
            </div>
          </div>

          <Separator />

          {/* Tone */}
          <div>
            <p className="text-sm font-semibold text-kavea-dark mb-3">
              3. ¿Qué tono?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CONTENT_TONES.map((tone) => (
                <OptionButton
                  key={tone.id}
                  selected={toneId === tone.id}
                  onClick={() => setToneId(tone.id)}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-base">{tone.emoji}</span>
                    <div>
                      <p className="text-sm font-medium text-kavea-dark">{tone.name}</p>
                      <p className="text-xs text-kavea-muted leading-snug mt-0.5">{tone.description}</p>
                    </div>
                  </div>
                </OptionButton>
              ))}
            </div>
          </div>

          {/* API key notice */}
          {!hasClaudeKey && (
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-2">
              <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">
                Sin API key de Claude se usarán plantillas predefinidas.{' '}
                <button onClick={() => navigate('/settings')} className="underline hover:no-underline">
                  Configura tu key
                </button>{' '}
                para obtener captions personalizadas con IA.
              </p>
            </div>
          )}

          {/* CTA */}
          <Button
            onClick={handleGenerate}
            disabled={!canProceed}
            className="w-full bg-kavea-rose hover:bg-kavea-rose/90 text-white h-12 text-base font-semibold disabled:opacity-40"
          >
            <Sparkles size={18} className="mr-2" />
            Generar contenido
          </Button>
        </div>
      )}

      {/* STEP 2: Generate (loading + results) */}
      {step === 2 && (
        <div className="space-y-5">
          {/* Config summary */}
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedService && (
              <Badge variant="secondary" className="text-xs">
                {selectedService.emoji} {selectedService.name}
              </Badge>
            )}
            {selectedContentType && (
              <Badge variant="secondary" className="text-xs">
                {selectedContentType.emoji} {selectedContentType.name}
              </Badge>
            )}
            {selectedTone && (
              <Badge variant="secondary" className="text-xs">
                {selectedTone.emoji} {selectedTone.name}
              </Badge>
            )}
            <button onClick={handleReset} className="text-xs text-kavea-rose hover:underline">
              Cambiar
            </button>
          </div>

          {/* Loading */}
          {isGenerating && (
            <div className="py-16 text-center">
              <Loader2 size={32} className="animate-spin text-kavea-rose mx-auto mb-4" />
              <p className="text-sm font-medium text-kavea-dark">
                {hasClaudeKey ? 'Claude está creando tu contenido...' : 'Preparando plantillas...'}
              </p>
              <p className="text-xs text-kavea-muted mt-1">Esto puede tardar unos segundos</p>
            </div>
          )}

          {/* Error banner */}
          {error && !isGenerating && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">
              <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-red-700">Error al conectar con Claude API</p>
                <p className="text-xs text-red-600 mt-0.5">{error}</p>
                <p className="text-xs text-red-600 mt-0.5">
                  Mostrando plantillas predefinidas.{' '}
                  <button onClick={() => navigate('/settings')} className="underline">
                    Revisa tu API key
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* Results */}
          {generated && !isGenerating && (
            <>
              {/* Captions */}
              <Card className="border-gray-100">
                <CardContent className="pt-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-kavea-muted uppercase tracking-wide">
                      Captions generadas
                    </p>
                    {!hasClaudeKey && (
                      <span className="text-xs text-amber-600">📋 Plantilla predefinida</span>
                    )}
                  </div>
                  {generated.captions.map((caption, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedCaption === i
                          ? 'border-kavea-rose bg-kavea-rose-pale'
                          : 'border-gray-100 hover:border-kavea-rose-light'
                      }`}
                      onClick={() => setSelectedCaption(i)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">Opción {i + 1}</Badge>
                        <CopyButton text={caption} label="Caption" />
                      </div>
                      <p className="text-sm text-kavea-dark whitespace-pre-wrap leading-relaxed">
                        {caption}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Hashtags */}
              <Card className="border-gray-100">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-kavea-muted uppercase tracking-wide flex items-center gap-1">
                      <Hash size={11} /> Hashtags ({generated.hashtags.length})
                    </p>
                    <CopyButton text={generated.hashtags.join(' ')} label="Hashtags" />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {generated.hashtags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-kavea-rose-pale text-kavea-rose px-2 py-0.5 rounded-full cursor-pointer hover:bg-kavea-rose hover:text-white transition-colors"
                        onClick={() => { navigator.clipboard.writeText(tag); toast.success(`${tag} copiado`); }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Image generation */}
              <Card className="border-gray-100">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-kavea-muted uppercase tracking-wide flex items-center gap-1">
                      <Image size={11} /> Imagen con IA
                    </p>
                    {!hasOpenAIKey && (
                      <button
                        onClick={() => navigate('/settings')}
                        className="text-xs text-kavea-rose hover:underline flex items-center gap-1"
                      >
                        Configurar DALL-E <ExternalLink size={10} />
                      </button>
                    )}
                  </div>

                  {/* Image prompt display */}
                  <div className="bg-gray-50 rounded-xl p-3 mb-3">
                    <p className="text-xs text-kavea-muted mb-1 font-medium">Prompt de imagen:</p>
                    <p className="text-xs text-kavea-dark italic leading-relaxed">
                      {generated.imagePrompt}
                    </p>
                    <CopyButton text={generated.imagePrompt} label="Prompt de imagen" />
                  </div>

                  {/* Generated image */}
                  {imageUrl && (
                    <div className="mb-3">
                      <img
                        src={imageUrl}
                        alt="Imagen generada"
                        className="w-full rounded-xl border border-gray-100"
                      />
                      <a
                        href={imageUrl}
                        download="kavea-post.jpg"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-kavea-rose hover:underline mt-2"
                      >
                        <Download size={12} /> Descargar imagen
                      </a>
                    </div>
                  )}

                  {imageError && (
                    <p className="text-xs text-red-500 mb-3">{imageError}</p>
                  )}

                  <Button
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage}
                    variant="outline"
                    size="sm"
                    className="w-full border-kavea-rose text-kavea-rose hover:bg-kavea-rose-pale"
                  >
                    {isGeneratingImage ? (
                      <>
                        <Loader2 size={14} className="animate-spin mr-2" />
                        Generando imagen...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} className="mr-2" />
                        {imageUrl ? 'Regenerar imagen' : 'Generar imagen con DALL-E 3'}
                      </>
                    )}
                  </Button>

                  {!hasOpenAIKey && (
                    <p className="text-xs text-kavea-muted mt-2 text-center">
                      Copia el prompt arriba y úsalo en{' '}
                      <a
                        href="https://chat.openai.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-kavea-rose hover:underline"
                      >
                        ChatGPT
                      </a>{' '}
                      o{' '}
                      <a
                        href="https://www.midjourney.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-kavea-rose hover:underline"
                      >
                        Midjourney
                      </a>
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Tips */}
              {generated.contentTips.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <p className="text-xs font-semibold text-amber-800 mb-2">💡 Consejos de publicación</p>
                  <ul className="space-y-1">
                    {generated.contentTips.map((tip, i) => (
                      <li key={i} className="text-xs text-amber-700">• {tip}</li>
                    ))}
                  </ul>
                  {generated.bestTimeToPost && (
                    <p className="text-xs text-amber-700 mt-2 font-medium">
                      🕐 Mejor hora: {generated.bestTimeToPost}
                    </p>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleSaveToCalendar}
                  variant="outline"
                  className="flex-1 border-kavea-dark text-kavea-dark hover:bg-kavea-dark hover:text-white"
                >
                  <CalendarPlus size={16} className="mr-2" />
                  Guardar en calendario
                </Button>
                <Button
                  onClick={() => {
                    const caption = generated.captions[selectedCaption] ?? '';
                    const hashtags = generated.hashtags.join(' ');
                    navigator.clipboard.writeText(`${caption}\n\n${hashtags}`);
                    toast.success('Caption + hashtags copiados listos para Instagram');
                    setStep(3);
                  }}
                  className="flex-1 bg-kavea-rose hover:bg-kavea-rose/90 text-white"
                >
                  <Copy size={16} className="mr-2" />
                  Copiar todo para Instagram
                </Button>
              </div>

              <button
                onClick={handleGenerate}
                className="flex items-center gap-1.5 text-xs text-kavea-muted hover:text-kavea-dark mx-auto"
              >
                <RefreshCw size={12} />
                Regenerar contenido
              </button>
            </>
          )}
        </div>
      )}

      {/* STEP 3: Export / Done */}
      {step === 3 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-kavea-dark mb-2">¡Contenido listo! 🎉</h2>
          <p className="text-sm text-kavea-muted mb-8 max-w-sm mx-auto">
            Tu caption y hashtags están copiados en el portapapeles. Ya puedes pegarlos directamente en Instagram.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleReset}
              className="bg-kavea-rose hover:bg-kavea-rose/90 text-white"
            >
              <Sparkles size={16} className="mr-2" />
              Generar otro contenido
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/calendar')}
              className="border-gray-200 text-kavea-dark"
            >
              Ver calendario
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
