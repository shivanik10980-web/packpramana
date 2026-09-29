import type { Commodity, ScenarioInput, DerivedTargets } from '../domain/types';

export function deriveTargets(s: ScenarioInput, c: Commodity): DerivedTargets {
  const req = { ...c.required };

  if (c.category === 'dry' && s.relativeHumidityPct >= 75) {
    req.moisture = Math.min(5, req.moisture + 1);
  }

  if (c.category === 'dry' && s.targetDays > 30) {
    req.oxygen = Math.min(5, req.oxygen + 1);
  }

  const severityBase: Record<ScenarioInput['transportSeverity'], number> = {
    gentle: 2,
    normal: 3,
    rough: 4,
  };

  const mechanical = Math.min(
    5,
    severityBase[s.transportSeverity] + (s.distanceKm > 300 ? 1 : 0)
  );

  return {
    ...req,
    mechanical,
  };
}
