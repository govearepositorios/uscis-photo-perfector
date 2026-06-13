import { useState } from 'react';
import { Eye, EyeOff, Save, Trash2, ExternalLink, CheckCircle2, AlertCircle, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSettings, type AppSettings } from '@/hooks/useSettings';
import { toast } from 'sonner';

function ApiKeyField({
  label,
  value,
  onChange,
  placeholder,
  helpUrl,
  helpText,
  isSet,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  helpUrl: string;
  helpText: string;
  isSet: boolean;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-kavea-dark">{label}</Label>
        {isSet ? (
          <Badge className="bg-emerald-100 text-emerald-700 text-xs">
            <CheckCircle2 size={10} className="mr-1" /> Configurada
          </Badge>
        ) : (
          <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs">
            <AlertCircle size={10} className="mr-1" /> No configurada
          </Badge>
        )}
      </div>
      <div className="relative">
        <Input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pr-10 font-mono text-sm"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-kavea-muted hover:text-kavea-dark"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      <p className="text-xs text-kavea-muted">
        {helpText}{' '}
        <a
          href={helpUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-kavea-rose hover:underline inline-flex items-center gap-0.5"
        >
          Obtener key <ExternalLink size={10} />
        </a>
      </p>
    </div>
  );
}

const TONE_OPTIONS: { value: AppSettings['tonePreference']; label: string; description: string }[] = [
  { value: 'profesional', label: 'Profesional', description: 'Lenguaje médico con calidez, autoridad clínica' },
  { value: 'cercano', label: 'Cercano', description: 'Tuteamos, somos amigos, sin perder rigor médico' },
  { value: 'aspiracional', label: 'Aspiracional', description: 'Lujo, exclusividad, resultados excepcionales' },
];

export default function Settings() {
  const { settings, saveSettings, clearApiKeys } = useSettings();
  const [form, setForm] = useState<AppSettings>({ ...settings });
  const [saved, setSaved] = useState(false);

  const update = (key: keyof AppSettings, value: AppSettings[keyof AppSettings]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    saveSettings(form);
    setSaved(true);
    toast.success('Configuración guardada correctamente');
  };

  const handleClearKeys = () => {
    update('claudeApiKey', '');
    update('openaiApiKey', '');
    clearApiKeys();
    toast.info('API keys eliminadas');
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-kavea-dark mb-1">Configuración</h1>
        <p className="text-kavea-muted text-sm">
          Personaliza Kavea Studio con tus API keys y preferencias de clínica.
        </p>
      </div>

      {/* API Keys section */}
      <Card className="mb-6 border-gray-100">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-kavea-rose-pale rounded-lg flex items-center justify-center">
              <Key size={16} className="text-kavea-rose" />
            </div>
            <div>
              <CardTitle className="text-base">API Keys de IA</CardTitle>
              <CardDescription className="text-xs">
                Necesarias para generar captions e imágenes automáticamente
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <ApiKeyField
            label="Claude API Key (Anthropic)"
            value={form.claudeApiKey}
            onChange={(v) => update('claudeApiKey', v)}
            placeholder="sk-ant-api03-..."
            helpUrl="https://console.anthropic.com/"
            helpText="Usada para generar captions, hashtags y estrategias de contenido."
            isSet={Boolean(form.claudeApiKey)}
          />

          <Separator />

          <ApiKeyField
            label="OpenAI API Key (DALL-E 3)"
            value={form.openaiApiKey}
            onChange={(v) => update('openaiApiKey', v)}
            placeholder="sk-..."
            helpUrl="https://platform.openai.com/api-keys"
            helpText="Usada para generar imágenes para tus posts con DALL-E 3."
            isSet={Boolean(form.openaiApiKey)}
          />

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
            <p className="font-medium mb-1">🔒 Seguridad de tus keys</p>
            <p>Tus API keys se guardan solo en tu navegador (localStorage). Nunca salen de tu dispositivo a ningún servidor externo excepto directamente a Anthropic y OpenAI.</p>
          </div>

          {(form.claudeApiKey || form.openaiApiKey) && (
            <button
              onClick={handleClearKeys}
              className="flex items-center gap-2 text-xs text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 size={12} />
              Eliminar todas las API keys
            </button>
          )}
        </CardContent>
      </Card>

      {/* Clinic profile */}
      <Card className="mb-6 border-gray-100">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Perfil de la Clínica</CardTitle>
          <CardDescription className="text-xs">
            Esta información personaliza el contenido generado por la IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Nombre de la clínica</Label>
              <Input
                value={form.clinicName}
                onChange={(e) => update('clinicName', e.target.value)}
                placeholder="Kavea Clinic"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Ciudad</Label>
              <Input
                value={form.clinicCity}
                onChange={(e) => update('clinicCity', e.target.value)}
                placeholder="Madrid"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Instagram handle</Label>
            <Input
              value={form.clinicInstagram}
              onChange={(e) => update('clinicInstagram', e.target.value)}
              placeholder="@kaveaclinic"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tone preference */}
      <Card className="mb-8 border-gray-100">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Tono de Comunicación</CardTitle>
          <CardDescription className="text-xs">
            ¿Cómo quieres sonar en redes sociales?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {TONE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  form.tonePreference === opt.value
                    ? 'border-kavea-rose bg-kavea-rose-pale'
                    : 'border-gray-100 hover:border-kavea-rose-light'
                }`}
              >
                <input
                  type="radio"
                  name="tone"
                  value={opt.value}
                  checked={form.tonePreference === opt.value}
                  onChange={() => update('tonePreference', opt.value)}
                  className="mt-0.5 accent-kavea-rose"
                />
                <div>
                  <p className="text-sm font-medium text-kavea-dark">{opt.label}</p>
                  <p className="text-xs text-kavea-muted">{opt.description}</p>
                </div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          className="bg-kavea-rose hover:bg-kavea-rose/90 text-white flex-1 sm:flex-none"
        >
          <Save size={16} className="mr-2" />
          Guardar configuración
        </Button>
        {saved && (
          <div className="flex items-center gap-1.5 text-emerald-600 text-sm">
            <CheckCircle2 size={16} />
            <span>Guardado</span>
          </div>
        )}
      </div>
    </div>
  );
}
