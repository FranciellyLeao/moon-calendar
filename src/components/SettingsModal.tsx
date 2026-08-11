import React, { useState } from 'react';
import type { UserSettings } from '../types';
import { saveStoredSettings } from '../utils/storage';
import { t, type Language } from '../utils/i18n';
import { getStoredGeminiKey, saveStoredGeminiKey, generateGeminiContent } from '../utils/gemini';
import { Settings, Globe, MapPin, Bell, Compass, Sparkles, ExternalLink } from 'lucide-react';

interface SettingsModalProps {
  settings: UserSettings;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSettings: (newSettings: UserSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  isOpen,
  onClose,
  onUpdateSettings,
}) => {
  const lang = settings.language;
  const [currentLang, setCurrentLang] = useState<Language>(settings.language);
  const [cityName, setCityName] = useState(settings.location.name);
  const [lat, setLat] = useState(settings.location.lat);
  const [lng, setLng] = useState(settings.location.lng);
  const [fullMoonNotif, setFullMoonNotif] = useState(settings.notifications.fullMoon);
  const [newMoonNotif, setNewMoonNotif] = useState(settings.notifications.newMoon);
  const [horoscopeNotif, setHoroscopeNotif] = useState(settings.notifications.dailyHoroscope);

  const [geminiKey, setGeminiKey] = useState(getStoredGeminiKey());
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyTestStatus, setKeyTestStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
          setCityName('Sua Localização Atual');
        },
        () => {
          alert('Não foi possível obter a localização do dispositivo.');
        }
      );
    }
  };

  const handleTestKey = async () => {
    if (!geminiKey.trim()) {
      setKeyTestStatus('Por favor, insira uma chave antes de testar.');
      return;
    }
    setIsTestingKey(true);
    setKeyTestStatus(null);
    try {
      await generateGeminiContent('Responda apenas: OK', geminiKey.trim());
      setKeyTestStatus('✅ Chave Gemini 2.0 Flash Válida e Conectada!');
      saveStoredGeminiKey(geminiKey.trim());
    } catch (err: any) {
      setKeyTestStatus(`❌ Erro: ${err.message || 'Chave inválida'}`);
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredGeminiKey(geminiKey.trim());

    const updated: UserSettings = {
      ...settings,
      language: currentLang,
      location: {
        name: cityName,
        lat,
        lng,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      notifications: {
        ...settings.notifications,
        fullMoon: fullMoonNotif,
        newMoon: newMoonNotif,
        dailyHoroscope: horoscopeNotif,
      },
    };

    saveStoredSettings(updated);
    onUpdateSettings(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#1c1c1e] rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 border border-white/10 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Settings className="w-4 h-4 text-white" />
            <h2>{t('settingsTitle', lang)}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-white/5 text-neutral-400 hover:text-white">
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5 text-xs">
          {/* Gemini API Key */}
          <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-white font-semibold flex items-center gap-1.5 text-xs">
                <Sparkles className="w-4 h-4 text-white" /> Google Gemini 2.0 Flash (IA)
              </label>

              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-neutral-400 underline flex items-center gap-1 hover:text-white"
              >
                Criar Chave Grátis <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex gap-2">
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="Cole sua API Key do Google AI Studio..."
                className="flex-1 px-3 py-2 rounded-xl bg-black border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-white"
              />
              <button
                type="button"
                onClick={handleTestKey}
                disabled={isTestingKey}
                className="px-3 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs shrink-0"
              >
                {isTestingKey ? 'Testando...' : 'Testar'}
              </button>
            </div>

            {keyTestStatus && (
              <div className="text-[11px] font-medium text-neutral-300 bg-black/60 p-2 rounded-lg border border-white/10">
                {keyTestStatus}
              </div>
            )}
          </div>

          {/* Language Selector */}
          <div className="space-y-2">
            <label className="block text-neutral-400 font-semibold flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-white" /> {t('language', lang)}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { code: 'pt-BR', label: 'Português' },
                { code: 'en', label: 'English' },
                { code: 'es', label: 'Español' },
                { code: 'fr', label: 'Français' },
              ].map((item) => (
                <button
                  type="button"
                  key={item.code}
                  onClick={() => setCurrentLang(item.code as Language)}
                  className={`p-2.5 rounded-xl border text-center font-medium transition-all ${
                    currentLang === item.code
                      ? 'bg-white text-black font-bold border-white'
                      : 'bg-black/40 text-neutral-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location Settings */}
          <div className="space-y-2">
            <label className="block text-neutral-400 font-semibold flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-white" /> {t('location', lang)}
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                placeholder={t('searchCityPlaceholder', lang)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-white"
              />
              <button
                type="button"
                onClick={handleDetectLocation}
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 font-bold"
                title={t('detectLocation', lang)}
              >
                <Compass className="w-4 h-4" />
              </button>
            </div>
            <div className="text-[10px] text-neutral-500">
              Coordenadas: Lat {lat.toFixed(2)}, Lng {lng.toFixed(2)}
            </div>
          </div>

          {/* Notifications Toggles */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <label className="block text-neutral-400 font-semibold flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-white" /> {t('notifications', lang)}
            </label>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10 cursor-pointer">
                <span className="text-white">Alertas de Lua Cheia</span>
                <input
                  type="checkbox"
                  checked={fullMoonNotif}
                  onChange={(e) => setFullMoonNotif(e.target.checked)}
                  className="w-4 h-4 accent-white"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10 cursor-pointer">
                <span className="text-white">Alertas de Lua Nova</span>
                <input
                  type="checkbox"
                  checked={newMoonNotif}
                  onChange={(e) => setNewMoonNotif(e.target.checked)}
                  className="w-4 h-4 accent-white"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10 cursor-pointer">
                <span className="text-white">Horóscopo Diário</span>
                <input
                  type="checkbox"
                  checked={horoscopeNotif}
                  onChange={(e) => setHoroscopeNotif(e.target.checked)}
                  className="w-4 h-4 accent-white"
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 text-neutral-300 border border-white/10"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold shadow-md"
            >
              {t('saveSettings', lang)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
