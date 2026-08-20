import React, { useState, useEffect } from 'react';
import type { AstronomyData, UserSettings } from '../types';
import { calculateNatalChart } from '../utils/astrology';
import { calculateSynastry, type SynastryResult } from '../utils/synastry';
import { generateGeminiContent } from '../utils/gemini';
import { Heart, Users, Sparkles, HeartHandshake, Compass, Bot, Loader2 } from 'lucide-react';

interface SynastryChartProps {
  settings: UserSettings;
  astroData: AstronomyData;
}

export const SynastryChart: React.FC<SynastryChartProps> = ({ settings }) => {
  const userChart = settings.natalChart || null;

  const [p1Date, setP1Date] = useState(userChart?.birthDate || '1995-05-15');
  const [p1Time, setP1Time] = useState(userChart?.birthTime || '08:30');
  const [p1City, setP1City] = useState(userChart?.birthCity || 'São Paulo');

  const [p2Date, setP2Date] = useState('1997-11-20');
  const [p2Time, setP2Time] = useState('14:15');
  const [p2City, setP2City] = useState('Rio de Janeiro');

  const [synastry, setSynastry] = useState<SynastryResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(true);
  const [aiReading, setAiReading] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);

  useEffect(() => {
    let isSubscribed = true;
    async function loadInitial() {
      setIsCalculating(true);
      const chart1 = await calculateNatalChart(p1Date, p1Time, p1City);
      const chart2 = await calculateNatalChart(p2Date, p2Time, p2City);
      const res = calculateSynastry(chart1, chart2);
      if (isSubscribed) {
        setSynastry(res);
        setIsCalculating(false);
      }
    }
    loadInitial();
    return () => { isSubscribed = false; };
  }, []);

  const handleCalculateSynastry = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    const chart1 = await calculateNatalChart(p1Date, p1Time, p1City);
    const chart2 = await calculateNatalChart(p2Date, p2Time, p2City);
    const result = calculateSynastry(chart1, chart2);
    setSynastry(result);
    setAiReading(null);
    setIsCalculating(false);
  };

  const handleGenerateAISynastry = async () => {
    if (!synastry) return;
    setIsGeneratingAI(true);
    try {
      const prompt = `Analise a sinastria entre ${p1City} e ${p2City}. Score Geral: ${synastry.overallScore}%. Romântico: ${synastry.romanticScore}%. Comunicação: ${synastry.communicationScore}%. Emocional: ${synastry.emotionalScore}%. Compatibilidade Solar: ${synastry.sunCompatibility}. Forneça conselhos práticos e profundos para o casal.`;
      const response = await generateGeminiContent(prompt);
      setAiReading(response);
    } catch {
      setAiReading("Não foi possível conectar com a IA no momento. Verifique a compatibilidade detalhada abaixo.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#1c1c1e] rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-300 text-xs font-semibold mb-3">
              <Heart className="w-3.5 h-3.5" /> Compatibilidade Astrológica de Casal
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Sinastria de Casal
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-xl mt-2 leading-relaxed">
              Compare dois mapas astrais calculados com precisão para descobrir a afinidade elemental, comunicação e alinhamento emocional.
            </p>
          </div>

          <button
            onClick={handleGenerateAISynastry}
            disabled={isGeneratingAI || !synastry}
            className="px-4 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg"
          >
            {isGeneratingAI ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Gerando Síntese...</>
            ) : (
              <><Bot className="w-4 h-4" /> Análise IA do Casal</>
            )}
          </button>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-[#1c1c1e] rounded-3xl p-6 border border-white/10 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Compass className="w-4 h-4 text-pink-400" /> Dados dos Parceiros
        </h2>

        <form onSubmit={handleCalculateSynastry} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Person 1 */}
            <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="font-bold text-pink-300 flex items-center gap-1.5 text-xs">
                <Users className="w-3.5 h-3.5" /> Pessoa 1 (Você)
              </h3>
              <div>
                <label className="block text-neutral-400 mb-1">Data de Nascimento</label>
                <input type="date" value={p1Date} onChange={(e) => setP1Date(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 mb-1">Hora (HH:MM)</label>
                  <input type="time" value={p1Time} onChange={(e) => setP1Time(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none" required />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Cidade</label>
                  <input type="text" value={p1City} onChange={(e) => setP1City(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none" required />
                </div>
              </div>
            </div>

            {/* Person 2 */}
            <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="font-bold text-pink-300 flex items-center gap-1.5 text-xs">
                <HeartHandshake className="w-3.5 h-3.5" /> Pessoa 2 (Parceiro/a)
              </h3>
              <div>
                <label className="block text-neutral-400 mb-1">Data de Nascimento</label>
                <input type="date" value={p2Date} onChange={(e) => setP2Date(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 mb-1">Hora (HH:MM)</label>
                  <input type="time" value={p2Time} onChange={(e) => setP2Time(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none" required />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Cidade</label>
                  <input type="text" value={p2City} onChange={(e) => setP2City(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none" required />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={isCalculating}
            className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all text-xs border border-white/10 flex items-center justify-center gap-2">
            {isCalculating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Calcular Compatibilidade de Sinastria'}
          </button>
        </form>
      </div>

      {/* AI Reading */}
      {aiReading && (
        <div className="bg-[#1c1c1e] rounded-3xl p-6 border border-pink-500/30 space-y-3 shadow-2xl">
          <div className="flex items-center gap-2 text-pink-300 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Análise de Sinastria Gerada por IA
          </div>
          <div className="text-xs text-neutral-200 leading-relaxed whitespace-pre-wrap bg-black/50 p-4 rounded-2xl border border-white/10">
            {aiReading}
          </div>
        </div>
      )}

      {/* Results Section */}
      {synastry && (
        <div className="space-y-6">
          {/* Score Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#1c1c1e] p-5 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] text-neutral-400 uppercase font-semibold">Geral</span>
              <div className="text-2xl font-extrabold text-pink-400 mt-1">{synastry.overallScore}%</div>
            </div>
            <div className="bg-[#1c1c1e] p-5 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] text-neutral-400 uppercase font-semibold">Romântico</span>
              <div className="text-2xl font-extrabold text-red-400 mt-1">{synastry.romanticScore}%</div>
            </div>
            <div className="bg-[#1c1c1e] p-5 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] text-neutral-400 uppercase font-semibold">Comunicação</span>
              <div className="text-2xl font-extrabold text-blue-400 mt-1">{synastry.communicationScore}%</div>
            </div>
            <div className="bg-[#1c1c1e] p-5 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] text-neutral-400 uppercase font-semibold">Emocional</span>
              <div className="text-2xl font-extrabold text-amber-400 mt-1">{synastry.emotionalScore}%</div>
            </div>
          </div>

          {/* Elemental & Advice */}
          <div className="bg-[#1c1c1e] rounded-3xl p-6 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" /> Síntese da Relação
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {synastry.relationshipAdvice}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold">Compatibilidade Solar</span>
                <p className="text-xs text-neutral-200">{synastry.sunCompatibility}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold">Compatibilidade Lunar</span>
                <p className="text-xs text-neutral-200">{synastry.moonCompatibility}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
