import type { Commodity, ScenarioInput, CommodityComposition } from '../domain/types';

export interface ValidationOutput {
  status: 'valid' | 'invalid' | 'review_required';
  errors: string[];
  commodity?: Commodity;
}

export function validateScenarioInput(s: ScenarioInput, commodities: Commodity[]): ValidationOutput {
  const invalid: string[] = [];

  for (const k of ['temperatureC', 'relativeHumidityPct', 'targetDays', 'distanceKm', 'packMassG', 'budgetInrPerPack'] as const) {
    if (!Number.isFinite(s[k])) {
      invalid.push(`${k}: finite number required`);
    }
  }

  if (s.relativeHumidityPct < 0 || s.relativeHumidityPct > 100) {
    invalid.push('RH must be 0–100%');
  }

  for (const k of ['targetDays', 'packMassG', 'budgetInrPerPack'] as const) {
    if (s[k] <= 0) {
      invalid.push(`${k} must be positive`);
    }
  }

  if (s.distanceKm < 0) {
    invalid.push('Distance cannot be negative');
  }

  if (!['gentle', 'normal', 'rough'].includes(s.transportSeverity)) {
    invalid.push('Unknown transport severity');
  }

  if (!['balanced', 'cost'].includes(s.costPriority)) {
    invalid.push('Unknown priority');
  }

  if (!['ambient', 'chilled', 'frozen'].includes(s.storageType)) {
    invalid.push('Unknown storage type');
  }

  if (invalid.length > 0) {
    return { status: 'invalid', errors: invalid };
  }

  const c = commodities.find((x) => x.id === s.commodityId);
  if (!c) {
    return { status: 'invalid', errors: ['Unknown commodity'] };
  }

  if (s.composition) {
    const a = s.composition;
    const bounds: Array<[keyof CommodityComposition, number]> = [
      ['moisturePct', 100],
      ['fatPct', 100],
      ['pH', 14],
    ];

    for (const [k, max] of bounds) {
      const val = a[k];
      if (val != null && (!Number.isFinite(val) || val < 0 || val > max)) {
        invalid.push(`Invalid ${k}`);
      }
    }

    if ((a.moisturePct ?? 0) + (a.fatPct ?? 0) > 100) {
      invalid.push('Moisture plus fat exceeds 100%');
    }

    if (
      a.respirationMlCO2KgHour != null &&
      (!Number.isFinite(a.respirationMlCO2KgHour) ||
        a.respirationMlCO2KgHour < 0 ||
        !Number.isFinite(a.respirationTemperatureC))
    ) {
      invalid.push('Respiration needs a non-negative value and reference temperature');
    }

    if (invalid.length > 0) {
      return { status: 'invalid', errors: invalid };
    }

    const compositionKeys = Object.keys(a) as Array<keyof CommodityComposition>;
    if (compositionKeys.some((k) => a[k] !== c.composition[k])) {
      return {
        status: 'review_required',
        errors: ['Composition differs from the authored fixture'],
        commodity: c,
      };
    }
  }

  const unsupported: string[] = [];
  if (s.packMassG !== 250) {
    unsupported.push('Pack size outside 250 g prototype catalogue');
  }
  if (s.storageType !== c.storageType) {
    unsupported.push('Storage type outside commodity fixture');
  }
  if (s.temperatureC < c.temperatureC[0] || s.temperatureC > c.temperatureC[1]) {
    unsupported.push('Temperature outside commodity fixture');
  }
  if (s.targetDays > c.prototypeMaxDays) {
    unsupported.push('Duration outside fixture coverage; shelf life is not predicted');
  }

  if (unsupported.length > 0) {
    return { status: 'review_required', errors: unsupported, commodity: c };
  }

  return { status: 'valid', errors: [], commodity: c };
}
