import type { CandidateRecommendation } from '../domain/types';

export const COMPONENT_LABELS: Record<'F' | 'C' | 'M' | 'E' | 'R', { label: string; desc: string }> = {
  F: {
    label: 'Requirement fit',
    desc: 'Barrier matching against target moisture, oxygen, light and grease thresholds (plus breathability for fresh commodities). Passing hard gates ensures F=100 for surviving candidates.',
  },
  C: {
    label: 'Budget fit',
    desc: 'Comparison of candidate pack unit cost against target budget per pack.',
  },
  M: {
    label: 'Transport margin',
    desc: 'Candidate structural mechanical resistance relative to journey distance and transport severity.',
  },
  E: {
    label: 'Temperature margin',
    desc: 'Candidate operating temperature interval buffer relative to storage temperature (100 if >=2°C inside boundaries, 70 otherwise).',
  },
  R: {
    label: 'Disposal assumption',
    desc: 'Synthetic ordinal end-of-life route score (0 to 5) scaled to 100 points.',
  },
};

export const EVIDENCE_LIMITATIONS = [
  'All fixture values are synthetic prototype data (catalogue-demo-1.0, rules-1.0).',
  'OTR (Oxygen Transmission Rate) and WVTR (Water Vapor Transmission Rate) are unmeasured pending standardized lab trials with defined temperature, RH, thickness, and test methods.',
  'Food-contact suitability is pending supplier verification and compliance certification.',
  'Modified Atmosphere Packaging (MAP) gas mixtures and shelf-life projections require specialist food science validation.',
  'No FSSAI or regulatory safety compliance is inferred or guaranteed.',
];

export function explainTieBreak(
  current: CandidateRecommendation,
  other: CandidateRecommendation
): string | null {
  const displayTied = current.displayScore === other.displayScore;
  const rawTied = Math.abs(current.score - other.score) < 0.0001;

  if (displayTied || rawTied) {
    if (current.unitCostInr < other.unitCostInr) {
      return `Tied with ${other.name} (${other.displayScore} pts); ranked higher due to lower unit cost (₹${current.unitCostInr} vs ₹${other.unitCostInr}).`;
    }
    if (current.unitCostInr === other.unitCostInr) {
      return `Tied with ${other.name} on score and unit cost; ordered alphabetically by catalogue ID (${current.id} vs ${other.id}).`;
    }
  }
  return null;
}

export function formatContributionMath(c: CandidateRecommendation): string {
  const comp = c.components;
  const w = c.weights;
  const contrib = c.contributions;

  return [
    `F: ${comp.F.toFixed(0)} × ${w.F} = ${contrib.F.toFixed(1)}`,
    `C: ${comp.C.toFixed(0)} × ${w.C} = ${contrib.C.toFixed(1)}`,
    `M: ${comp.M.toFixed(0)} × ${w.M} = ${contrib.M.toFixed(1)}`,
    `E: ${comp.E.toFixed(0)} × ${w.E} = ${contrib.E.toFixed(1)}`,
    `R: ${comp.R.toFixed(0)} × ${w.R} = ${contrib.R.toFixed(1)}`,
  ].join(' | ');
}
