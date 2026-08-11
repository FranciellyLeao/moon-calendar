import React, { useState } from 'react';
import type { AstronomyData, UserSettings } from '../types';
import { calculateNatalChart } from '../utils/astrology';
import { calculateSynastry, type SynastryResult } from '../utils/synastry';
import { generateGeminiContent } from '../utils/gemini';
import { Heart, Users, Sparkles, ShieldAlert, HeartHandshake, Compass, Bot, Loader2 } from 'lucide-react';

interface SynastryChartProps {
  settings: UserSettings;
  astroData: AstronomyData;
}

export const SynastryChart: React.FC<SynastryChartProps> = ({ settings, astroData }) => {
  const lang = settings.language;
  const userChart = settings.natalChart || calculateNatalChart('1995-05-15', '08:30', 'São Paulo');

  const [p1Date, setP1Date] = useState(userChart.birthDate || '1995-05-15');
  const [p1Time, setP1Time] = useState(userChart.birthTime || '08:30');
  const [p1City, setP1City] = useState(userChart.birthCity || 'São Paulo');

  const [p2Date, setP2Date] = useState('1997-11-20');
  const [p2Time, setP2Time] = useState('14:15');
  const [p2City, setP2City] = useState('Rio de Janeiro');

  const [synastry, setSynastry] = useState<SynastryResult>(() => {
    const chart1 = calculateNatalChart(p1Date, p1Time, p1City);
    const chart2 = calculateNatalChart(p2Date, p2Time, p2City);
    return calculateSynastry(chart1, chart2);
  });

  const [aiReading, setAiReading] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);

  const handleCalculateSynastry = (e: React.FormEvent) => {
    e.preventDefault();
    const chart1 = calculateNatalChart(p1Date, p1Time, p1City);
    const chart2 = calculateNatalChart(p2Date, p2Time, p2City);
    const result = calculateSynastry(chart1, chart2);
    setSynastry(result);
    setAiReading(null);
  };

  const handleGenerateAISynastry = async () => {
    setIsGeneratingAI(true);
    try {
      const prompt = `Você é um astrólogo de relacionamentos especialista em Sinastria Amorosa e Platônica.
Analise a compatibilidade entre duas pessoas em ${lang}:
Pessoa 1: Sol em ${synastry.person1.sunSign}, Lua em ${synastry.person1.moonSign}, Ascendente em ${synastry.person1.risingSign}.
Pessoa 2: Sol em ${synastry.person2.sunSign}, Lua em ${synastry.person2.moonSign}, Ascendente em ${synastry.person2.risingSign}.
Fase Lunar Atual: ${astroData.phaseName} em ${astroData.zodiacSign}.

Escreva uma leitura de sinastria em 3 seções inspiradoras com emojis:
1. ❤️ Química & Química Emocional
2. 🗣️ Comunicação & Parceria
3. ✨ Conselho Cósmico para o Casal nesta Fase Lunar`;

      const text = await generateGeminiContent(prompt);
      setAiReading(text);
    } catch {
      setAiReading(`✨ **ANÁLISE DE SINASTRIA SINTETIZADA (MOTOR INTERNO)**

❤️ **Química & Química Emocional:**
A combinação do Sol em ${synastry.person1.sunSign} com Sol em ${synastry.person2.sunSign} cria uma atração magnética renovada. O alinhamento das Luas favorece o acolhimento mútuo nas fases de introspecção.

🗣️ **Comunicação & Parceria:**
Vocês se complementam nos objetivos de vida. Nas conversas, a clareza trará soluções rápidas para qualquer divergência de ritmo.

✨ **Conselho Cósmico para o Casal (${astroData.phaseName}):**
Aproveitem a energia da ${astroData.phaseName} para planejar metas conjuntas e renovar os votos de carinho e cúmplice união.`);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#1c1c1e] rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300 text-xs font-medium mb-3">
            <HeartHandshake className="w-3.5 h-3.5 text-white" /> Sinastria & Relacionamentos
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Compatibilidade Astrológica
          </h1>
          <p className="text-sm text-neutral-400 max-w-xl mt-1">
            Sintonia de alma, comunicação e afinidade entre dois mapas astrais.
          </p>
        </div>

        <button
          onClick={handleGenerateAISynastry}
          disabled={isGeneratingAI}
          className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-all flex items-center gap-2 shrink-0"
        >
          {isGeneratingAI ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Analisando...
            </>
          ) : (
            <>
              <Bot className="w-4 h-4" /> Análise IA
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleCalculateSynastry} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-[#1c1c1e] rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4" /> Pessoa 1 (Você)
            </h2>
            <span className="text-xs text-neutral-400 font-medium">
              {synastry.person1.sunSymbol} {synastry.person1.sunSign}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-neutral-400 mb-1">Data</label>
              <input
                type="date"
                value={p1Date}
                onChange={(e) => setP1Date(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-white"
                required
              />
            </div>
            <div>
              <label className="block text-neutral-400 mb-1">Hora</label>
              <input
                type="time"
                value={p1Time}
                onChange={(e) => setP1Time(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-white"
                required
              />
            </div>
            <div>
              <label className="block text-neutral-400 mb-1">Cidade</label>
              <input
                type="text"
                value={p1City}
                onChange={(e) => setP1City(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-white"
                required
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 bg-[#1c1c1e] rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-white" /> Pessoa 2 (Conexão)
            </h2>
            <span className="text-xs text-neutral-400 font-medium">
              {synastry.person2.sunSymbol} {synastry.person2.sunSign}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-neutral-400 mb-1">Data</label>
              <input
                type="date"
                value={p2Date}
                onChange={(e) => setP2Date(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-white"
                required
              />
            </div>
            <div>
              <label className="block text-neutral-400 mb-1">Hora</label>
              <input
                type="time"
                value={p2Time}
                onChange={(e) => setP2Time(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-white"
                required
              />
            </div>
            <div>
              <label className="block text-neutral-400 mb-1">Cidade</label>
              <input
                type="text"
                value={p2City}
                onChange={(e) => setP2City(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-white"
                required
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-12 flex justify-center">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-black" />
            Calcular Sinastria Completa
          </button>
        </div>
      </form>

      {aiReading && (
        <div className="bg-[#1c1c1e] rounded-3xl p-6 sm:p-8 border border-white/10 space-y-3 animate-fadeIn">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Sparkles className="w-4 h-4 text-white" /> Síntese de Sinastria por IA
          </div>

          <div className="text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap bg-black/50 p-5 rounded-2xl border border-white/10">
            {aiReading}
          </div>
        </div>
      )}

      {/* Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-[#1c1c1e] rounded-2xl p-5 border border-white/10 text-center space-y-1">
          <div className="text-xs text-neutral-400 font-semibold uppercase">Compatibilidade Geral</div>
          <div className="text-3xl font-extrabold text-white">{synastry.overallScore}%</div>
          <div className="w-full h-1.5 rounded-full bg-black overflow-hidden mt-2">
            <div className="h-full bg-white transition-all duration-700" style={{ width: `${synastry.overallScore}%` }} />
          </div>
        </div>

        <div className="bg-[#1c1c1e] rounded-2xl p-5 border border-white/10 text-center space-y-1">
          <div className="text-xs text-neutral-400 font-semibold uppercase">Química Romântica</div>
          <div className="text-2xl font-bold text-white">{synastry.romanticScore}%</div>
          <div className="w-full h-1.5 rounded-full bg-black overflow-hidden mt-2">
            <div className="h-full bg-white/80 transition-all duration-700" style={{ width: `${synastry.romanticScore}%` }} />
          </div>
        </div>

        <div className="bg-[#1c1c1e] rounded-2xl p-5 border border-white/10 text-center space-y-1">
          <div className="text-xs text-neutral-400 font-semibold uppercase">Sintonia Mental</div>
          <div className="text-2xl font-bold text-white">{synastry.communicationScore}%</div>
          <div className="w-full h-1.5 rounded-full bg-black overflow-hidden mt-2">
            <div className="h-full bg-white/60 transition-all duration-700" style={{ width: `${synastry.communicationScore}%` }} />
          </div>
        </div>

        <div className="bg-[#1c1c1e] rounded-2xl p-5 border border-white/10 text-center space-y-1">
          <div className="text-xs text-neutral-400 font-semibold uppercase">Acolhimento Emocional</div>
          <div className="text-2xl font-bold text-white">{synastry.emotionalScore}%</div>
          <div className="w-full h-1.5 rounded-full bg-black overflow-hidden mt-2">
            <div className="h-full bg-white/40 transition-all duration-700" style={{ width: `${synastry.emotionalScore}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-[#1c1c1e] rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            Dinâmicas Astrológicas do Casal
          </h2>

          <div className="space-y-3 text-xs text-neutral-300">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <div className="font-semibold text-white">☀️ Alinhamento Solar</div>
              <p className="leading-relaxed">{synastry.sunCompatibility}</p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <div className="font-semibold text-white">☽ Conexão Lunar (Sentimentos)</div>
              <p className="leading-relaxed">{synastry.moonCompatibility}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3 text-xs">
            <Compass className="w-4 h-4 text-white shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white uppercase tracking-wider text-[11px]">
                Conselho Cósmico do Casal
              </div>
              <div className="text-neutral-300 mt-1 leading-relaxed">
                {synastry.relationshipAdvice}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#1c1c1e] rounded-3xl p-6 border border-white/10 space-y-3">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-white" /> Desafios em Potencial
            </h3>
            <ul className="space-y-2 text-xs text-neutral-300">
              {synastry.challenges.map((c, idx) => (
                <li key={idx} className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-start gap-2">
                  <span className="text-white font-bold">•</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
