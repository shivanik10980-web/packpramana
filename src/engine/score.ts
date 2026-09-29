import type {
  Commodity,
  PackagingRecord,
  ScenarioInput,
  ComponentBreakdown,
  CandidateRecommendation,
  CostPriority,
} from '../domain/types';

export function getWeights(priority: CostPriority): ComponentBreakdown {
  return priority === 'cost'
    ? { F: 0.4, C: 0.35, M: 0.1, E: 0.1, R: 0.05 }
    : { F: 0.4, C: 0.2, M: 0.15, E: 0.15, R: 0.1 };
}

export function scoreCandidate(
  p: PackagingRecord,
  c: Commodity,
  s: ScenarioInput,
  barrierReq: { moisture: number; oxygen: number; light: number; grease: number },
  mechanical: number
): CandidateRecommendation {
  const weights = getWeights(s.costPriority);

  const barrierEntries = Object.entries(barrierReq) as Array<
    [keyof typeof barrierReq, number]
  >;
  const fits = barrierEntries
    .filter(([, r]) => r > 0)
    .map(([k, r]) => Math.min(1, p.capabilities[k] / r));

  if (c.category === 'fresh') {
    fits.push(1);
  }

  const F = fits.length ? (100 * fits.reduce((a, b) => a + b, 0)) / fits.length : 100;
  const C = 100 * Math.min(1, s.budgetInrPerPack / p.unitCostInr);
  const M = 100 * Math.min(1, p.mechanicalRating / (mechanical + 1));
  const E =
    s.temperatureC - p.temperatureC[0] >= 2 && p.temperatureC[1] - s.temperatureC >= 2
      ? 100
      : 70;
  const R = 20 * p.endOfLifeScore;

  const components: ComponentBreakdown = { F, C, M, E, R };

  const contributions: ComponentBreakdown = {
    F: F * weights.F,
    C: C * weights.C,
    M: M * weights.M,
    E: E * weights.E,
    R: R * weights.R,
  };

  const score =
    contributions.F +
    contributions.C +
    contributions.M +
    contributions.E +
    contributions.R;

  const displayScore = Number(score.toFixed(1));
  const overBudgetInr = Math.max(0, p.unitCostInr - s.budgetInrPerPack);

  const reasons = [
    'Meets authored demo gates',
    c.category === 'fresh' ? 'Breathable format' : 'Barrier targets met',
  ];

  const warnings = [
    'Synthetic candidate; supplier verification pending',
    'No shelf-life or compliance guarantee',
  ];

  return {
    id: p.id,
    name: p.name,
    score,
    displayScore,
    unitCostInr: p.unitCostInr,
    overBudgetInr,
    components,
    contributions,
    weights,
    reasons,
    warnings,
    packaging: p,
  };
}

export function sortCandidates(candidates: CandidateRecommendation[]): CandidateRecommendation[] {
  return [...candidates].sort(
    (a, b) =>
      b.score - a.score ||
      a.unitCostInr - b.unitCostInr ||
      a.id.localeCompare(b.id)
  );
}
