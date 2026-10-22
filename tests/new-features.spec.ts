import { describe, expect, it, beforeEach } from 'vitest';
import {
  saveSubscriber,
  getStoredSubscribers,
  saveStoredSubscribers,
  exportSubscribersCSV,
  safeStorage,
  type SubscriberEntry,
} from '../src/utils/storage';
import { getAstronomyData, getMoonZodiacSign } from '../src/utils/astronomy';
import { getDayActivityGuide } from '../src/utils/activityTiming';
import * as SunCalc from 'suncalc';

describe('Email Subscription System & CSV Export', () => {
  beforeEach(() => {
    safeStorage.clear();
  });

  it('validates email format and rejects invalid emails', () => {
    const res1 = saveSubscriber('invalid-email');
    expect(res1.success).toBe(false);
    expect(res1.message).toContain('e-mail válido');

    const res2 = saveSubscriber('missing@domain');
    expect(res2.success).toBe(false);

    const res3 = saveSubscriber('');
    expect(res3.success).toBe(false);
  });

  it('accepts and normalizes valid emails', () => {
    const res = saveSubscriber('  User.Test@Example.COM  ', 'test_source');
    expect(res.success).toBe(true);
    expect(res.message).toContain('confirmada com sucesso');

    const list = getStoredSubscribers();
    expect(list.some(s => s.email === 'user.test@example.com')).toBe(true);
  });

  it('prevents duplicate subscriber entries', () => {
    const res1 = saveSubscriber('lunar@example.com');
    expect(res1.success).toBe(true);

    const res2 = saveSubscriber('lunar@example.com');
    expect(res2.success).toBe(false);
    expect(res2.isDuplicate).toBe(true);
    expect(res2.message).toContain('já está inscrito');
  });

  it('supports saveStoredSubscribers batch save and retrieval', () => {
    const batch: SubscriberEntry[] = [
      { email: 'sub1@example.com', subscribedAt: '2026-01-01T00:00:00Z', status: 'active', source: 'import' },
      { email: 'sub2@example.com', subscribedAt: '2026-01-02T00:00:00Z', status: 'active', source: 'import' },
    ];
    saveStoredSubscribers(batch);
    const retrieved = getStoredSubscribers();
    expect(retrieved.length).toBe(2);
    expect(retrieved[0].email).toBe('sub1@example.com');
  });

  it('exports RFC 4180 compliant CSV string with proper quote escaping', () => {
    saveSubscriber('alice@lunar.com', 'site "special" promo');
    saveSubscriber('bob@lunar.com', 'newsletter');

    const csv = exportSubscribersCSV();
    expect(csv).toContain('Email,Data_Inscricao,Origem,Status');
    expect(csv).toContain('"alice@lunar.com"');
    expect(csv).toContain('site ""special"" promo');
    expect(csv).toContain('"bob@lunar.com"');
  });

  it('efficiently handles 5,000+ subscriber CSV generation without freezing', () => {
    const largeList: SubscriberEntry[] = [];
    for (let i = 0; i < 5000; i++) {
      largeList.push({
        email: `subscriber_${i}@mooncalendar.org`,
        subscribedAt: '2026-01-01T12:00:00Z',
        source: 'benchmark_test',
        status: 'active',
      });
    }
    saveStoredSubscribers(largeList);

    const startTime = performance.now();
    const csv = exportSubscribersCSV();
    const duration = performance.now() - startTime;

    expect(duration).toBeLessThan(100); // Should finish well under 100ms
    expect(csv.split('\n').length).toBe(5002); // Header + 5000 rows + trailing newline
  });
});

describe('Moon Astrometric Math & SunCalc 2.0 Integration', () => {
  it('correctly handles SunCalc 2.0 native degrees without corrupting near-horizon or near-north angles', () => {
    const lat = -23.5505;
    const lng = -46.6333;
    const date = new Date(2026, 9, 22, 12, 0, 0);

    const pos = SunCalc.getMoonPosition(date, lat, lng);
    const astro = getAstronomyData(date, lat, lng);

    expect(typeof pos.altitude).toBe('number');
    expect(typeof pos.azimuth).toBe('number');

    // SunCalc 2.0 returns altitude directly in degrees between -90 and 90
    expect(pos.altitude).toBeGreaterThanOrEqual(-90);
    expect(pos.altitude).toBeLessThanOrEqual(90);

    // SunCalc 2.0 returns north-based azimuth directly in degrees between 0 and 360
    expect(pos.azimuth).toBeGreaterThanOrEqual(0);
    expect(pos.azimuth).toBeLessThan(360);

    // Verify astronomy helper normalizes without distorting
    expect(astro.altitudeDeg).toBe(Math.round(pos.altitude * 10) / 10);
    expect(astro.azimuthDeg).toBe(Math.round((((pos.azimuth % 360) + 360) % 360) * 10) / 10);
  });

  it('guarantees 24h standard HH:MM time format without AM/PM anomalies', () => {
    const date = new Date(2026, 9, 22);
    const astro = getAstronomyData(date, -23.5505, -46.6333);

    // If moonrise/sunset exists, verify it matches standard 24-hour pattern HH:MM
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$|^--:--$/;
    expect(timeRegex.test(astro.sunrise)).toBe(true);
    expect(timeRegex.test(astro.sunset)).toBe(true);
    expect(timeRegex.test(astro.moonrise)).toBe(true);
    expect(timeRegex.test(astro.moonset)).toBe(true);
  });
});

describe('Cosmic Muhurtha & Activity Timing Engine', () => {
  it('evaluates activity guide for current moon date and sign', () => {
    const testDate = new Date(2026, 9, 22);
    const zodiac = getMoonZodiacSign(testDate);
    const astro = getAstronomyData(testDate);

    const guide = getDayActivityGuide(
      testDate,
      astro.phaseName,
      zodiac.name,
      zodiac.symbol,
      astro.isVoidOfCourse
    );

    expect(guide.activities.length).toBe(10);
    expect(guide.overallEnergy).toBeGreaterThanOrEqual(0);
    expect(guide.overallEnergy).toBeLessThanOrEqual(100);
    expect(guide.planetaryDayRuler).toBeDefined();

    const topActivity = guide.activities[0];
    expect(topActivity.score).toBeGreaterThanOrEqual(guide.activities[guide.activities.length - 1].score);
  });
});
