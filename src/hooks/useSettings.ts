import { useState, useEffect } from 'react';

export interface AppSettings {
  claudeApiKey: string;
  openaiApiKey: string;
  clinicName: string;
  clinicCity: string;
  clinicInstagram: string;
  mainServices: string[];
  tonePreference: 'profesional' | 'cercano' | 'aspiracional';
  languagePreference: 'es' | 'en';
}

const DEFAULT_SETTINGS: AppSettings = {
  claudeApiKey: '',
  openaiApiKey: '',
  clinicName: 'Kavea Clinic',
  clinicCity: 'Madrid',
  clinicInstagram: '@kaveaclinic',
  mainServices: ['fue', 'botox', 'hyaluronic', 'hydrafacial'],
  tonePreference: 'cercano',
  languagePreference: 'es',
};

const STORAGE_KEY = 'kavea_studio_settings';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {
      // ignore parse errors
    }
    return DEFAULT_SETTINGS;
  });

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const saveSettings = (newSettings: AppSettings) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch {
      // ignore
    }
    setSettings(newSettings);
  };

  const clearApiKeys = () => {
    updateSettings({ claudeApiKey: '', openaiApiKey: '' });
  };

  const hasClaudeKey = Boolean(settings.claudeApiKey);
  const hasOpenAIKey = Boolean(settings.openaiApiKey);

  return {
    settings,
    updateSettings,
    saveSettings,
    clearApiKeys,
    hasClaudeKey,
    hasOpenAIKey,
  };
}
