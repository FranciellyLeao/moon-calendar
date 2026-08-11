export interface PlanetaryTransit {
  planet: string;
  symbol: string;
  sign: string;
  degree: number;
  isRetrograde: boolean;
  element: string;
  influence: string;
}

export interface PlanetaryHour {
  hourName: string;
  ruler: string;
  symbol: string;
  startTime: string;
  endTime: string;
}

const PLANET_NAMES = [
  { name: 'Mercúrio', symbol: '☿', speed: 4.15, baseSignIdx: 1 },
  { name: 'Vênus', symbol: '♀', speed: 1.62, baseSignIdx: 2 },
  { name: 'Marte', symbol: '♂', speed: 0.53, baseSignIdx: 0 },
  { name: 'Júpiter', symbol: '♃', speed: 0.08, baseSignIdx: 3 },
  { name: 'Saturno', symbol: '♄', speed: 0.03, baseSignIdx: 10 },
  { name: 'Urano', symbol: '♅', speed: 0.01, baseSignIdx: 1 },
  { name: 'Netuno', symbol: '♆', speed: 0.006, baseSignIdx: 11 },
  { name: 'Plutão', symbol: '♇', speed: 0.004, baseSignIdx: 9 },
];

const SIGNS = [
  { name: 'Áries', element: 'Fogo' },
  { name: 'Touro', element: 'Terra' },
  { name: 'Gêmeos', element: 'Ar' },
  { name: 'Câncer', element: 'Água' },
  { name: 'Leão', element: 'Fogo' },
  { name: 'Virgem', element: 'Terra' },
  { name: 'Libra', element: 'Ar' },
  { name: 'Escorpião', element: 'Água' },
  { name: 'Sagitário', element: 'Fogo' },
  { name: 'Capricórnio', element: 'Terra' },
  { name: 'Aquário', element: 'Ar' },
  { name: 'Peixes', element: 'Água' },
];

const INFLUENCES: Record<string, string> = {
  Mercúrio: 'Regente da comunicação, contratos, viagens curtas e aprendizados. Alerta para revisão nos períodos retrógrados.',
  Vênus: 'Regente do amor, finanças, relacionamentos e senso estético. Favorece a harmonia e a apreciação da beleza.',
  Marte: 'Regente da ação, coragem, energia física e impulso criativo. Motiva a conquista de objetivos desafiadores.',
  Júpiter: 'Regente da expansão, abundância, estudos superiores e sorte celestial. Amplifica as oportunidades de crescimento.',
  Saturno: 'Regente da disciplina, estrutura, limites e realizações de longo prazo. Pede paciência e foco constante.',
  Urano: 'Regente da inovação, intuição súbita, liberdade e mudanças revolucionárias.',
  Netuno: 'Regente da intuição espiritual, imaginação, sonhos e sensibilidade artística.',
  Plutão: 'Regente da transformação profunda, regeneração da alma e renascimento pessoal.',
};

export function getPlanetaryTransits(date: Date = new Date()): PlanetaryTransit[] {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));

  return PLANET_NAMES.map((p, idx) => {
    const rawDeg = (dayOfYear * p.speed + p.baseSignIdx * 30) % 360;
    const signIdx = Math.floor(rawDeg / 30) % 12;
    const degree = Math.round(rawDeg % 30);
    const signObj = SIGNS[signIdx];

    // Retrograde simulation (e.g. Mercury retrograde 3 times a year)
    const isRetrograde = idx === 0 ? dayOfYear % 120 < 21 : idx === 1 ? dayOfYear % 300 < 40 : dayOfYear % 200 < 30;

    return {
      planet: p.name,
      symbol: p.symbol,
      sign: signObj.name,
      degree,
      isRetrograde,
      element: signObj.element,
      influence: INFLUENCES[p.name] || 'Trânsito de influência planetária ativa.',
    };
  });
}
