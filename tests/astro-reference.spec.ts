import { describe, expect, it } from 'vitest';
import { calcFullNatalChart } from '../src/utils/planetaryPositions';

const close = (actual: number, expected: number, tolerance = 0.01) => {
  const diff = Math.abs(actual - expected);
  expect(diff).toBeLessThanOrEqual(tolerance);
};

describe('Swiss Ephemeris Reference Benchmark — Balneário Camboriú 20/07/2001 05:53 BRT (UTC-3)', () => {
  it('matches Astro.com Swiss Ephemeris exact benchmark within 0.01° tolerance', async () => {
    const chart = await calcFullNatalChart(
      2001, 7, 20,
      5, 53,
      -26.9906, -48.6347,
      -3,
      'Placidus'
    );

    const getLng = (name: string) => chart.tropical.find(p => p.planet === name)!.longitude;

    // Astro.com Reference Target Values:
    // Sol: 27°42' Câncer (117.70957°)
    close(getLng('Sol'), 117.70957);

    // Lua: 21°22' Câncer (111.37937°)
    close(getLng('Lua'), 111.37937);

    // Mercúrio: 10°39' Câncer (100.65843°)
    close(getLng('Mercúrio'), 100.65843);

    // Vênus: 16°12' Gêmeos (76.21186°)
    close(getLng('Vênus'), 76.21186);

    // Marte: 15°06' Sagitário (255.10940°)
    close(getLng('Marte'), 255.10940);

    // Júpiter: 1°37' Câncer (91.62097°)
    close(getLng('Júpiter'), 91.62097);

    // Saturno: 11°05' Gêmeos (71.09216°)
    close(getLng('Saturno'), 71.09216);

    // Urano: 23°51' Aquário ℞ (323.85785°)
    close(getLng('Urano'), 323.85785);
    expect(chart.tropical.find(p => p.planet === 'Urano')!.isRetrograde).toBe(true);

    // Netuno: 7°39' Aquário ℞ (307.65424°)
    close(getLng('Netuno'), 307.65424);
    expect(chart.tropical.find(p => p.planet === 'Netuno')!.isRetrograde).toBe(true);

    // Plutão: 12°50' Sagitário ℞ (252.84274°)
    close(getLng('Plutão'), 252.84274);
    expect(chart.tropical.find(p => p.planet === 'Plutão')!.isRetrograde).toBe(true);

    // Nodo Norte: 6°18' Câncer (96.31595°)
    close(getLng('Nodo Norte'), 96.31595);

    // Quíron: 23°49' Sagitário (263.81930°)
    close(getLng('Quíron'), 263.81930);

    // Ascendente: 9°26' Câncer (99.43975°)
    close(chart.ascendant, 99.43975);

    // MC: 24°38' Áries (24.63713°)
    close(chart.midheaven, 24.63713);
  });
});
