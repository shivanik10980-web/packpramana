import type { Commodity, PackagingRecord, ScenarioInput, DerivedTargets } from '../domain/types';

export function evaluateGates(
  p: PackagingRecord,
  c: Commodity,
  s: ScenarioInput,
  req: DerivedTargets
): string[] {
  const reasons: string[] = [];

  if (!p.compatibleCategories.includes(c.category)) {
    reasons.push('Category mismatch');
  }

  if (p.nominalPackMassG !== s.packMassG) {
    reasons.push('Pack size mismatch');
  }

  if (s.temperatureC < p.temperatureC[0] || s.temperatureC > p.temperatureC[1]) {
    reasons.push('Outside candidate temperature interval');
  }

  if (c.category === 'fresh' && !p.breathable) {
    reasons.push('Fresh produce requires breathable format in demo rules');
  }

  if (p.mechanicalRating < req.mechanical) {
    reasons.push(`Mechanical rating ${p.mechanicalRating} below ${req.mechanical}`);
  }

  const barrierKeys: Array<'moisture' | 'oxygen' | 'light' | 'grease'> = [
    'moisture',
    'oxygen',
    'light',
    'grease',
  ];

  for (const k of barrierKeys) {
    const targetVal = req[k];
    if (p.capabilities[k] < targetVal) {
      reasons.push(`${k} capability ${p.capabilities[k]} below target ${targetVal}`);
    }
  }

  return reasons;
}
