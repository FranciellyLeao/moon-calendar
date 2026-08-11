import React, { useState } from 'react';
import type { AstronomyData, UserSettings } from '../types';
import { t } from '../utils/i18n';
import { LayoutGrid, Smartphone, Copy, Check } from 'lucide-react';

interface WidgetSimulatorProps {
  settings: UserSettings;
  astroData: AstronomyData;
}

export const WidgetSimulator: React.FC<WidgetSimulatorProps> = ({ settings, astroData }) => {
  const lang = settings.language;
  const [widgetSize, setWidgetSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [widgetTheme, setWidgetTheme] = useState<'oled' | 'glass' | 'monochrome'>('oled');
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyEmbed = () => {
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#1c1c1e] rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300 text-xs font-medium mb-3">
            <LayoutGrid className="w-3.5 h-3.5 text-white" /> Simulador de Widgets iOS / Android
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Widgets da Tela Inicial
          </h1>
          <p className="text-sm text-neutral-400 max-w-xl mt-1">
            Personalize e visualize como os widgets de fases lunares aparecem na sua tela inicial.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyEmbed}
            className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-all flex items-center gap-2"
          >
            {copiedCode ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4 text-black" />}
            {copiedCode ? 'Código Copiado!' : 'Copiar Embed Widget'}
          </button>
        </div>
      </div>

      {/* Selector Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Size Selector */}
        <div className="bg-[#1c1c1e] rounded-2xl p-5 border border-white/10 space-y-3">
          <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">
            1. Escolha o Tamanho do Widget
          </label>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              { id: 'small', label: 'Pequeno (2x2)' },
              { id: 'medium', label: 'Médio (4x2)' },
              { id: 'large', label: 'Grande (4x4)' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setWidgetSize(s.id as any)}
                className={`py-2 rounded-xl font-medium transition-all ${
                  widgetSize === s.id
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'bg-black/40 text-neutral-400 border border-white/5 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Selector */}
        <div className="bg-[#1c1c1e] rounded-2xl p-5 border border-white/10 space-y-3">
          <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">
            2. Estilo do Tema
          </label>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              { id: 'oled', label: 'OLED Black' },
              { id: 'glass', label: 'Apple Glass' },
              { id: 'monochrome', label: 'Minimalist' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setWidgetTheme(t.id as any)}
                className={`py-2 rounded-xl font-medium transition-all ${
                  widgetTheme === t.id
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'bg-black/40 text-neutral-400 border border-white/5 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Widget Preview Frame */}
      <div className="bg-[#1c1c1e] rounded-3xl p-6 sm:p-10 border border-white/10 flex flex-col items-center justify-center space-y-6">
        <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
          <Smartphone className="w-4 h-4 text-white" /> Pré-visualização na Tela Inicial iOS
        </div>

        {/* Simulated iOS Phone Container */}
        <div className="w-full max-w-md bg-black rounded-[40px] p-6 border-4 border-neutral-800 shadow-2xl relative space-y-6">
          {/* Dynamic Island / Notch */}
          <div className="w-24 h-4 bg-neutral-900 rounded-full mx-auto" />

          {/* Widget Preview Render */}
          <div className="flex justify-center my-4">
            {/* Small 2x2 Widget */}
            {widgetSize === 'small' && (
              <div
                className={`w-36 h-36 rounded-3xl p-4 flex flex-col justify-between border transition-all ${
                  widgetTheme === 'oled'
                    ? 'bg-black text-white border-white/20'
                    : widgetTheme === 'glass'
                    ? 'bg-[#1c1c1e]/80 backdrop-blur-xl text-white border-white/10'
                    : 'bg-neutral-900 text-white border-white/10'
                }`}
              >
                <div className="flex justify-between items-start text-[11px] text-neutral-400 font-medium">
                  <span>LUA</span>
                  <span>{astroData.illumination}%</span>
                </div>

                <div className="text-center my-auto">
                  <div className="text-3xl my-1">{astroData.zodiacSymbol}</div>
                  <div className="text-xs font-bold truncate">{t(astroData.phaseName, lang)}</div>
                </div>

                <div className="text-[10px] text-neutral-500 truncate text-center">
                  {astroData.zodiacSign}
                </div>
              </div>
            )}

            {/* Medium 4x2 Widget */}
            {widgetSize === 'medium' && (
              <div
                className={`w-full max-w-sm h-36 rounded-3xl p-4 flex items-center justify-between border transition-all ${
                  widgetTheme === 'oled'
                    ? 'bg-black text-white border-white/20'
                    : widgetTheme === 'glass'
                    ? 'bg-[#1c1c1e]/80 backdrop-blur-xl text-white border-white/10'
                    : 'bg-neutral-900 text-white border-white/10'
                }`}
              >
                <div className="space-y-1">
                  <div className="text-[11px] text-neutral-400 font-semibold uppercase">Moon Phase</div>
                  <div className="text-base font-bold">{t(astroData.phaseName, lang)}</div>
                  <div className="text-xs text-neutral-400">
                    Signo: <strong className="text-white">{astroData.zodiacSymbol} {astroData.zodiacSign}</strong>
                  </div>
                  <div className="text-[11px] text-neutral-500 pt-2">
                    Próxima Cheia: {astroData.nextFullMoon.date}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 shrink-0">
                  <span className="text-3xl">{astroData.zodiacSymbol}</span>
                  <span className="text-[10px] text-neutral-400 mt-1">{astroData.illumination}%</span>
                </div>
              </div>
            )}

            {/* Large 4x4 Widget */}
            {widgetSize === 'large' && (
              <div
                className={`w-full max-w-sm h-72 rounded-3xl p-5 flex flex-col justify-between border transition-all ${
                  widgetTheme === 'oled'
                    ? 'bg-black text-white border-white/20'
                    : widgetTheme === 'glass'
                    ? 'bg-[#1c1c1e]/80 backdrop-blur-xl text-white border-white/10'
                    : 'bg-neutral-900 text-white border-white/10'
                }`}
              >
                <div className="flex justify-between items-start border-b border-white/10 pb-3">
                  <div>
                    <div className="text-[11px] text-neutral-400 font-semibold uppercase">Moon Calendar</div>
                    <div className="text-lg font-bold">{t(astroData.phaseName, lang)}</div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-bold text-white">{astroData.illumination}%</div>
                    <div className="text-[10px] text-neutral-400">{astroData.zodiacSign}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-[10px] text-neutral-400">Nascer da Lua</div>
                    <div className="font-semibold">{astroData.moonrise}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-[10px] text-neutral-400">Ocultamento</div>
                    <div className="font-semibold">{astroData.moonset}</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-1">
                  <div className="font-semibold text-white">Afirmação do Dia:</div>
                  <p className="text-[11px] text-neutral-300 italic">
                    "Eu honro os ritmos sagrados do meu corpo e da lua."
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Simulated App Grid Icons */}
          <div className="grid grid-cols-4 gap-4 pt-2 border-t border-neutral-900">
            <div className="w-12 h-12 rounded-2xl bg-neutral-800 mx-auto" />
            <div className="w-12 h-12 rounded-2xl bg-neutral-800 mx-auto" />
            <div className="w-12 h-12 rounded-2xl bg-neutral-800 mx-auto" />
            <div className="w-12 h-12 rounded-2xl bg-neutral-800 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};
