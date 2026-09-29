import type {
  EngineResult,
  ScenarioInput,
  SeedData,
  CandidateRecommendation,
  RejectedCandidate,
  RecommendationStatus,
  DerivedTargets,
} from '../domain/types';
import rawSeedData from '../data/seed-data.json';
import { validateScenarioInput } from './validate';
import { deriveTargets } from './deriveTargets';
import { evaluateGates } from './gates';
import { scoreCandidate, sortCandidates } from './score';

export const defaultSeedData: SeedData = rawSeedData as unknown as SeedData;

export function recommend(
  s: ScenarioInput,
  d: SeedData = defaultSeedData
): EngineResult {
  const meta = {
    rulesVersion: d.rulesVersion,
    catalogueVersion: d.catalogueVersion,
    evidenceStatus: 'synthetic_demo',
  };

  const createResult = (
    status: RecommendationStatus,
    reasons: string[] = [],
    candidates: CandidateRecommendation[] = [],
    rejected: RejectedCandidate[] = [],
    targets: DerivedTargets | null = null
  ): EngineResult => ({
    status,
    reasons,
    candidates,
    rejected,
    targets,
    ...meta,
  });

  const validation = validateScenarioInput(s, d.commodities);
  if (validation.status === 'invalid') {
    return createResult('invalid', validation.errors);
  }
  if (validation.status === 'review_required') {
    return createResult('review_required', validation.errors);
  }

  const commodity = validation.commodity!;
  const targets = deriveTargets(s, commodity);
  const barrierReq = {
    moisture: targets.moisture,
    oxygen: targets.oxygen,
    light: targets.light,
    grease: targets.grease,
  };

  const candidates: CandidateRecommendation[] = [];
  const rejected: RejectedCandidate[] = [];

  for (const p of d.packaging) {
    const reasons = evaluateGates(p, commodity, s, targets);
    if (reasons.length > 0) {
      rejected.push({ id: p.id, name: p.name, reasons });
      continue;
    }

    const candidate = scoreCandidate(p, commodity, s, barrierReq, targets.mechanical);
    candidates.push(candidate);
  }

  const sorted = sortCandidates(candidates);

  return createResult(
    sorted.length ? 'demo_shortlist' : 'no_match',
    [],
    sorted,
    rejected,
    targets
  );
}

export * from './validate';
export * from './deriveTargets';
export * from './gates';
export * from './score';
export * from './explain';
