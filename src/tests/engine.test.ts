import { describe, it, expect } from 'vitest';
import { recommend, defaultSeedData } from '../engine';
import type { ScenarioInput } from '../domain/types';

describe('PackPramana Engine Parity and Contract Tests', () => {
  const strawberryScenario: ScenarioInput = {
    commodityId: 'strawberry',
    storageType: 'chilled',
    temperatureC: 4,
    relativeHumidityPct: 90,
    targetDays: 5,
    distanceKm: 120,
    transportSeverity: 'normal',
    packMassG: 250,
    budgetInrPerPack: 8,
    costPriority: 'balanced',
  };

  const turmericScenario: ScenarioInput = {
    commodityId: 'turmeric',
    storageType: 'ambient',
    temperatureC: 25,
    relativeHumidityPct: 50,
    targetDays: 30,
    distanceKm: 120,
    transportSeverity: 'normal',
    packMassG: 250,
    budgetInrPerPack: 5,
    costPriority: 'balanced',
  };

  it('passes reference engine selfTest cases for Strawberry (fresh chilled)', () => {
    const res = recommend(strawberryScenario);
    expect(res.status).toBe('demo_shortlist');
    expect(res.rulesVersion).toBe('rules-1.0');
    expect(res.candidates.length).toBeGreaterThanOrEqual(3);

    // p02 wins tie over p01 by price (₹6 vs ₹7)
    expect(res.candidates[0].id).toBe('p02');
    expect(res.candidates[0].score).toBe(96);
    expect(res.candidates[0].displayScore).toBe(96.0);
    expect(res.candidates[0].unitCostInr).toBe(6);

    expect(res.candidates[1].id).toBe('p01');
    expect(res.candidates[1].score).toBe(96);
    expect(res.candidates[1].displayScore).toBe(96.0);
    expect(res.candidates[1].unitCostInr).toBe(7);

    expect(res.candidates[2].id).toBe('p03');
    expect(res.candidates[2].displayScore).toBe(90.3);

    // p08 (sealed foil) is rejected because fresh produce requires breathable format
    const p08Reject = res.rejected.find((x) => x.id === 'p08');
    expect(p08Reject).toBeDefined();
    expect(
      p08Reject?.reasons.some((r) => r.includes('breathable format'))
    ).toBe(true);
  });

  it('passes reference engine selfTest cases for Turmeric (dry ambient)', () => {
    const res = recommend(turmericScenario);
    expect(res.status).toBe('demo_shortlist');

    // p06 (92.0), p07 (92.0), p10 (90.3), p08 (82.5)
    expect(res.candidates[0].id).toBe('p06');
    expect(res.candidates[0].displayScore).toBe(92.0);
    expect(res.candidates[0].unitCostInr).toBe(4);

    expect(res.candidates[1].id).toBe('p07');
    expect(res.candidates[1].displayScore).toBe(92.0);
    expect(res.candidates[1].unitCostInr).toBe(5);

    expect(res.candidates[2].id).toBe('p10');
    expect(res.candidates[2].displayScore).toBe(90.3);

    expect(res.candidates[3].id).toBe('p08');
    expect(res.candidates[3].displayScore).toBe(82.5);
  });

  it('re-evaluates Turmeric at 85% RH: target moisture becomes 4, p06 fails gate, p07 leads', () => {
    const wetScenario = { ...turmericScenario, relativeHumidityPct: 85 };
    const res = recommend(wetScenario);

    expect(res.status).toBe('demo_shortlist');
    expect(res.targets?.moisture).toBe(4);
    // p06 has moisture capability 3, so fails gate at moisture target 4
    expect(res.candidates.some((c) => c.id === 'p06')).toBe(false);
    expect(res.candidates[0].id).toBe('p07');
    expect(res.candidates[0].displayScore).toBe(92.0);

    const p06Rejected = res.rejected.find((r) => r.id === 'p06');
    expect(p06Rejected).toBeDefined();
    expect(
      p06Rejected?.reasons.some((r) => r.includes('moisture capability 3 below target 4'))
    ).toBe(true);
  });

  it('returns review_required for strawberry at 28°C (temperature outside commodity fixture)', () => {
    const hotStrawberry = { ...strawberryScenario, temperatureC: 28 };
    const res = recommend(hotStrawberry);
    expect(res.status).toBe('review_required');
    expect(res.candidates.length).toBe(0);
    expect(res.reasons).toContain('Temperature outside commodity fixture');
  });

  it('returns no_match for rough transport over 500 km when no candidate meets mechanical target 5', () => {
    const roughProduce = {
      ...strawberryScenario,
      transportSeverity: 'rough' as const,
      distanceKm: 500,
    };
    const res = recommend(roughProduce);
    expect(res.status).toBe('no_match');
    expect(res.targets?.mechanical).toBe(5);
    expect(res.candidates.length).toBe(0);
    expect(res.rejected.length).toBe(defaultSeedData.packaging.length);
  });

  it('validates exact threshold boundaries for RH (74% vs 75%) on dry commodities', () => {
    const rh74 = recommend({ ...turmericScenario, relativeHumidityPct: 74 });
    const rh75 = recommend({ ...turmericScenario, relativeHumidityPct: 75 });

    expect(rh74.targets?.moisture).toBe(3);
    expect(rh75.targets?.moisture).toBe(4);
  });

  it('validates exact threshold boundaries for duration (30 days vs 31 days) on dry commodities', () => {
    const d30 = recommend({ ...turmericScenario, targetDays: 30 });
    const d31 = recommend({ ...turmericScenario, targetDays: 31 });

    expect(d30.targets?.oxygen).toBe(3);
    expect(d31.targets?.oxygen).toBe(4);
  });

  it('validates exact threshold boundaries for distance (300 km vs 301 km)', () => {
    const dist300 = recommend({ ...strawberryScenario, distanceKm: 300, transportSeverity: 'normal' });
    const dist301 = recommend({ ...strawberryScenario, distanceKm: 301, transportSeverity: 'normal' });

    expect(dist300.targets?.mechanical).toBe(3);
    expect(dist301.targets?.mechanical).toBe(4);
  });

  it('validates component weights sum exactly to 1.0 and scores are 0-100', () => {
    const resBalanced = recommend(strawberryScenario);
    const resCost = recommend({ ...strawberryScenario, costPriority: 'cost' });

    for (const r of [resBalanced, resCost]) {
      for (const cand of r.candidates) {
        const sumWeights = Object.values(cand.weights).reduce((a, b) => a + b, 0);
        expect(Math.abs(sumWeights - 1.0)).toBeLessThan(1e-9);

        const sumContrib = Object.values(cand.contributions).reduce((a, b) => a + b, 0);
        expect(Math.abs(sumContrib - cand.score)).toBeLessThan(1e-9);

        expect(cand.score).toBeGreaterThanOrEqual(0);
        expect(cand.score).toBeLessThanOrEqual(100);
      }
    }
  });

  it('rejects invalid numeric inputs, negative distance, NaN, and out of range RH', () => {
    expect(recommend({ ...strawberryScenario, budgetInrPerPack: 0 }).status).toBe('invalid');
    expect(recommend({ ...strawberryScenario, relativeHumidityPct: 101 }).status).toBe('invalid');
    expect(recommend({ ...strawberryScenario, relativeHumidityPct: -1 }).status).toBe('invalid');
    expect(recommend({ ...strawberryScenario, distanceKm: -10 }).status).toBe('invalid');
    expect(recommend({ ...strawberryScenario, targetDays: 0 }).status).toBe('invalid');
    expect(recommend({ ...strawberryScenario, packMassG: -250 }).status).toBe('invalid');
    expect(recommend({ ...strawberryScenario, temperatureC: NaN }).status).toBe('invalid');
  });

  it('rejects unknown commodity with invalid status', () => {
    const res = recommend({ ...strawberryScenario, commodityId: 'nonexistent-fruit' });
    expect(res.status).toBe('invalid');
    expect(res.reasons).toContain('Unknown commodity');
  });

  it('handles custom composition: valid differences yield review_required, invalid yields invalid', () => {
    // Valid composition difference
    const diffPh = recommend({
      ...strawberryScenario,
      composition: { pH: 4.8 },
    });
    expect(diffPh.status).toBe('review_required');
    expect(diffPh.reasons).toContain('Composition differs from the authored fixture');

    // Invalid moisture + fat sum
    const invalidComp = recommend({
      ...strawberryScenario,
      composition: { moisturePct: 80, fatPct: 30 },
    });
    expect(invalidComp.status).toBe('invalid');
    expect(invalidComp.reasons).toContain('Moisture plus fat exceeds 100%');

    // Negative respiration or invalid reference temp
    const invalidResp = recommend({
      ...strawberryScenario,
      composition: { respirationMlCO2KgHour: -5, respirationTemperatureC: 5 },
    });
    expect(invalidResp.status).toBe('invalid');
  });

  it('returns review_required for unsupported pack size or duration', () => {
    expect(recommend({ ...strawberryScenario, packMassG: 500 }).status).toBe('review_required');
    expect(recommend({ ...strawberryScenario, targetDays: 999 }).status).toBe('review_required');
  });

  it('is completely deterministic and idempotent', () => {
    const r1 = recommend(strawberryScenario);
    const r2 = recommend(strawberryScenario);
    expect(r1).toEqual(r2);
  });
});
