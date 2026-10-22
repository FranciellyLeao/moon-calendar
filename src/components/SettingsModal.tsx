import React, { useState, useEffect } from 'react';
import type { UserSettings } from '../types';
import {
  saveStoredSettings,
  getStoredSubscribers,
  exportSubscribersCSV,
  verifyAdminPin,
  saveStoredAdminPin,
  deleteSubscriber,
  clearAllSubscribers,
  type SubscriberEntry,
} from '../utils/storage';
import { t, type Language } from '../utils/i18n';
import { getStoredGeminiKey, saveStoredGeminiKey, generateGeminiContent } from '../utils/gemini';
import {
  Settings,
  Globe,
  MapPin,
  Bell,
  Compass,
  Sparkles,
  ExternalLink,
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  Trash2,
  Download,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

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

  // Admin PIN Protection State
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [subscribersList, setSubscribersList] = useState<SubscriberEntry[]>([]);
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinFeedback, setPinFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Security lock: reset administrative unlock whenever the modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsAdminUnlocked(false);
      setIsChangingPin(false);
      setPinInput('');
      setPinError(null);
      setPinFeedback(null);
      setSubscribersList([]);
    }
  }, [isOpen]);

  const handleCloseModal = () => {
    setIsAdminUnlocked(false);
    setIsChangingPin(false);
    setPinInput('');
    setPinError(null);
    setPinFeedback(null);
    setSubscribersList([]);
    onClose();
  };

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
    handleCloseModal();
  };

  const handlePinInputChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 4);
    setPinInput(cleaned);
    if (pinError) setPinError(null);

    // Instant unlock as soon as 4 numeric digits are entered
    if (cleaned.length === 4) {
      if (verifyAdminPin(cleaned)) {
        setIsAdminUnlocked(true);
        setPinError(null);
        setPinInput('');
        setSubscribersList(getStoredSubscribers());
      } else {
        setPinError('PIN incorreto. Tente novamente.');
      }
    }
  };

  const handleVerifyPin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pinInput.trim()) {
      setPinError('Insira o PIN de 4 dígitos.');
      return;
    }
    if (verifyAdminPin(pinInput)) {
      setIsAdminUnlocked(true);
      setPinError(null);
      setPinInput('');
      setSubscribersList(getStoredSubscribers());
    } else {
      setPinError('PIN incorreto. Tente novamente.');
    }
  };

  const handleLockAdmin = () => {
    setIsAdminUnlocked(false);
    setIsChangingPin(false);
    setPinFeedback(null);
    setSubscribersList([]);
  };

  const handleChangePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (newPinInput.length !== 4) {
      setPinFeedback({ success: false, message: 'O PIN deve conter exatamente 4 dígitos.' });
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setPinFeedback({ success: false, message: 'Os PINs informados não coincidem.' });
      return;
    }
    const result = saveStoredAdminPin(newPinInput);
    setPinFeedback(result);
    if (result.success) {
      setNewPinInput('');
      setConfirmPinInput('');
      setTimeout(() => {
        setIsChangingPin(false);
        setPinFeedback(null);
      }, 1800);
    }
  };

  const handleDeleteSubscriber = (email: string) => {
    if (window.confirm(`Tem certeza que deseja remover o inscrito "${email}"?`)) {
      deleteSubscriber(email);
      setSubscribersList(getStoredSubscribers());
    }
  };

  const handleClearAllSubscribers = () => {
    if (
      window.confirm(
        'ATENÇÃO: Deseja apagar permanentemente todos os inscritos da lista? Esta ação não pode ser desfeita.'
      )
    ) {
      clearAllSubscribers();
      setSubscribersList([]);
    }
  };

  const handleDownloadCSV = () => {
    const csv = exportSubscribersCSV();
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inscritos_diario_lunar_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fadeIn"
      onClick={(e) => e.target === e.currentTarget && handleCloseModal()}
    >
      <div className="bg-[#070709] rounded-[28px] p-6 sm:p-8 max-w-lg w-full space-y-5 border border-white/10 relative max-h-[90vh] overflow-y-auto shadow-2xl text-white">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Settings className="w-4 h-4 text-[#E6CA65]" />
            <h2>{t('settingsTitle', lang)}</h2>
          </div>
          <button onClick={handleCloseModal} className="p-1.5 rounded-xl bg-white/5 text-neutral-400 hover:text-white transition-colors">
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

          {/* Área Administrativa (Gestão de Inscritos) - Protegida por PIN */}
          {!isAdminUnlocked ? (
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-[#E6CA65]/10 border border-[#E6CA65]/20 flex items-center justify-center">
                    <Lock className="w-3.5 h-3.5 text-[#E6CA65]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-xs">Área Administrativa (Gestão de Inscritos)</h3>
                    <p className="text-[10px] text-neutral-400">Acesso restrito ao proprietário • Digite o PIN de 4 dígitos</p>
                  </div>
                </div>
                <span className="text-[10px] text-neutral-500 font-mono">Padrão: 2026</span>
              </div>

              <div className="pt-1 space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <KeyRound className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      maxLength={4}
                      inputMode="numeric"
                      value={pinInput}
                      onChange={(e) => handlePinInputChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleVerifyPin();
                        }
                      }}
                      placeholder="PIN de 4 dígitos..."
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-black border border-white/10 text-white font-mono text-xs tracking-widest focus:outline-none focus:border-[#E6CA65]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyPin}
                    className="px-4 py-2 rounded-xl bg-[#E6CA65]/15 hover:bg-[#E6CA65]/25 text-[#E6CA65] border border-[#E6CA65]/30 font-semibold text-xs flex items-center gap-1.5 transition-all shrink-0"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Desbloquear</span>
                  </button>
                </div>

                {pinError && (
                  <div className="flex items-center gap-1.5 text-[11px] text-[#E6CA65] bg-[#E6CA65]/10 border border-[#E6CA65]/20 px-3 py-1.5 rounded-lg">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{pinError}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-[#E6CA65]/30 space-y-3.5">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-xs">Área Administrativa • Autenticada</h3>
                    <span className="text-[10px] text-emerald-300 font-mono">
                      {subscribersList.length} {subscribersList.length === 1 ? 'inscrito registrado' : 'inscritos registrados'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLockAdmin}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 text-[11px] transition-all"
                  title="Encerrar sessão administrativa"
                >
                  <Lock className="w-3 h-3 text-neutral-400" />
                  <span>Bloquear</span>
                </button>
              </div>

              {/* Admin Actions Bar */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadCSV}
                  className="flex-1 min-w-[140px] py-2 px-3 rounded-xl bg-[#E6CA65]/15 hover:bg-[#E6CA65]/25 text-[#E6CA65] border border-[#E6CA65]/35 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-[#E6CA65]" />
                  <span>📥 Baixar Lista de Inscritos (.CSV)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsChangingPin(!isChangingPin)}
                  className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-all"
                >
                  <KeyRound className="w-3.5 h-3.5 text-[#E6CA65]" />
                  <span>{isChangingPin ? 'Fechar PIN' : 'Alterar PIN'}</span>
                </button>

                {subscribersList.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllSubscribers}
                    className="py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 text-xs font-medium flex items-center gap-1.5 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpar Lista</span>
                  </button>
                )}
              </div>

              {/* Change PIN Drawer */}
              {isChangingPin && (
                <div className="p-3.5 rounded-xl bg-black/70 border border-white/10 space-y-2.5">
                  <div className="text-[11px] font-semibold text-white flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#E6CA65]" /> Definir Novo PIN de 4 Dígitos
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="password"
                      maxLength={4}
                      inputMode="numeric"
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleChangePinSubmit(e);
                        }
                      }}
                      placeholder="Novo PIN (4 dígitos)"
                      className="px-3 py-2 rounded-xl bg-black border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#E6CA65]"
                    />
                    <input
                      type="password"
                      maxLength={4}
                      inputMode="numeric"
                      value={confirmPinInput}
                      onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleChangePinSubmit(e);
                        }
                      }}
                      placeholder="Confirmar PIN"
                      className="px-3 py-2 rounded-xl bg-black border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#E6CA65]"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPin(false);
                        setPinFeedback(null);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/5 text-neutral-400 hover:text-white text-[11px]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleChangePinSubmit}
                      className="px-3 py-1 rounded-lg bg-[#E6CA65] text-black font-semibold text-[11px] hover:bg-[#E6CA65]/90 transition-colors"
                    >
                      Salvar Novo PIN
                    </button>
                  </div>
                  {pinFeedback && (
                    <div
                      className={`text-[11px] p-2 rounded-lg flex items-center gap-1.5 ${
                        pinFeedback.success
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-300 border border-red-500/20'
                      }`}
                    >
                      {pinFeedback.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      <span>{pinFeedback.message}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Subscribers List */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-semibold text-neutral-300">
                  Lista de Inscritos ({subscribersList.length})
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
                  {subscribersList.length === 0 ? (
                    <div className="text-center py-6 text-neutral-500 text-xs bg-black/40 rounded-xl border border-white/5">
                      Nenhum inscrito registrado até o momento.
                    </div>
                  ) : (
                    subscribersList.map((sub) => (
                      <div
                        key={sub.email}
                        className="p-2.5 rounded-xl bg-black/50 border border-white/5 flex items-center justify-between hover:border-white/10 transition-all text-xs"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="font-mono text-white truncate text-xs font-medium">{sub.email}</div>
                          <div className="text-[10px] text-neutral-400 flex items-center gap-2 mt-0.5">
                            <span>{new Date(sub.subscribedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            <span>•</span>
                            <span className="text-[#E6CA65]/80">{sub.source || 'web'}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteSubscriber(sub.email)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0"
                          title="Excluir inscrito"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={handleCloseModal}
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
