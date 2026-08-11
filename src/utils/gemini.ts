import type { AstronomyData, NatalChart } from '../types';

const STORAGE_KEY_GEMINI_KEY = 'moon_app_gemini_key';

export function getStoredGeminiKey(): string {
  return localStorage.getItem(STORAGE_KEY_GEMINI_KEY) || '';
}

export function saveStoredGeminiKey(key: string): void {
  localStorage.setItem(STORAGE_KEY_GEMINI_KEY, key.trim());
}

/**
 * Generate completion using Google Gemini 2.0 Flash REST API
 */
export async function generateGeminiContent(prompt: string, apiKey?: string): Promise<string> {
  const key = apiKey || getStoredGeminiKey();

  if (!key) {
    throw new Error('MISSING_API_KEY');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    }),
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(errJson.error?.message || `API Error: ${response.status}`);
  }

  const data = await response.json();
  const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!generatedText) {
    throw new Error('Nenhuma resposta foi gerada pela IA.');
  }

  return generatedText;
}

/**
 * Generate AI Horoscope customized by Natal Chart & Moon Phase
 */
export async function generateAIHoroscope(
  sign: string,
  natalChart: NatalChart | undefined,
  astroData: AstronomyData,
  lang: string = 'pt-BR',
  apiKey?: string
): Promise<string> {
  const sun = natalChart?.sunSign || sign;
  const moon = natalChart?.moonSign || 'Desconhecido';
  const asc = natalChart?.risingSign || 'Desconhecido';

  const prompt = `Você é um astrólogo cósmico experiente e empático. Escreva uma leitura astrológica diária personalizada em ${lang}.
  
Dados do Usuário:
- Signo Solar: ${sun}
- Signo Lunar: ${moon}
- Ascendente: ${asc}
- Fase Lunar Atual: ${astroData.phaseName} (${astroData.illumination}% de iluminação)
- Signo da Lua Hoje: ${astroData.zodiacSign}

Formate a resposta em 3 parágrafos curtos com emojis adequados:
1. Energia Geral do Dia & Trânsito Lunar.
2. Conselho Prático para Relacionamentos & Trabalho.
3. Afirmação Sagrada do Dia.`;

  return generateGeminiContent(prompt, apiKey);
}

/**
 * Generate Deep Natal Chart AI Interpretation
 */
export async function generateAINatalChartReading(
  chart: NatalChart,
  lang: string = 'pt-BR',
  apiKey?: string
): Promise<string> {
  const prompt = `Você é um astrólogo especializado em psicologia arquetípica. Crie uma interpretação sintetizada e inspiradora do Mapa Astral a seguir em ${lang}.

Dados do Mapa:
- Signo Solar: ${chart.sunSign}
- Signo Lunar: ${chart.moonSign}
- Ascendente: ${chart.risingSign}
- Distribuição Elementar: Fogo ${chart.elements.fire}%, Terra ${chart.elements.earth}%, Ar ${chart.elements.air}%, Água ${chart.elements.water}%.

Escreva em seções claras com emojis:
1. ☀️ Missão Solar & Propósito Vital
2. ☽ Necessidades Emocionais & Alma (Lua em ${chart.moonSign})
3. 🌅 Máscara Social & Primeira Impressão (Ascendente em ${chart.risingSign})
4. ✨ Conselho de Harmonização dos Elementos`;

  return generateGeminiContent(prompt, apiKey);
}

/**
 * Generate Custom AI Ritual based on User Intent & Moon Phase
 */
export async function generateAIRitual(
  userIntent: string,
  astroData: AstronomyData,
  lang: string = 'pt-BR',
  apiKey?: string
): Promise<string> {
  const prompt = `Crie um ritual sagrado holístico e seguro alinhado à ${astroData.phaseName} em ${astroData.zodiacSign}.
Desejo do usuário: "${userIntent}"
Idioma: ${lang}

Formate como:
- 🌿 Ingredientes & Ervas Recomendadas
- 🕯️ Preparação do Espaço
- 🔮 Passo a Passo em 4 etapas
- ✨ Palavra de Poder / Oração Lunar`;

  return generateGeminiContent(prompt, apiKey);
}
