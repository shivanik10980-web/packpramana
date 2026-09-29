import React, { useState } from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { Sliders, RotateCcw, CheckCircle2 } from 'lucide-react';
import type { ScenarioInput } from '../../domain/types';

export const WhatIfView: React.FC = () => {
  const { input: baselineInput, result: baselineResult, whatIfInput, whatIfResult, applyWhatIf, restoreWhatIf } = useScenario();

  // Local state for the what-if form controls
  const [tempC, setTempC] = useState<number>(whatIfInput ? whatIfInput.temperatureC : baselineInput.temperatureC);
  const [rhPct, setRhPct] = useState<number>(whatIfInput ? whatIfInput.relativeHumidityPct : baselineInput.relativeHumidityPct);
  const [budget, setBudget] = useState<number>(whatIfInput ? whatIfInput.budgetInrPerPack : baselineInput.budgetInrPerPack);
  const [distKm, setDistKm] = useState<number>(whatIfInput ? whatIfInput.distanceKm : baselineInput.distanceKm);

  // Sync with baseline changes when not running an active what-if
  const [prevBaseline, setPrevBaseline] = useState(baselineInput);
  if (!whatIfInput && prevBaseline !== baselineInput) {
    setPrevBaseline(baselineInput);
    setTempC(baselineInput.temperatureC);
    setRhPct(baselineInput.relativeHumidityPct);
    setBudget(baselineInput.budgetInrPerPack);
    setDistKm(baselineInput.distanceKm);
  }

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ScenarioInput = {
      ...baselineInput,
      temperatureC: Number(tempC),
      relativeHumidityPct: Number(rhPct),
      budgetInrPerPack: Number(budget),
      distanceKm: Number(distKm),
    };
    applyWhatIf(updated);
  };

  const handleRestore = () => {
    setTempC(baselineInput.temperatureC);
    setRhPct(baselineInput.relativeHumidityPct);
    setBudget(baselineInput.budgetInrPerPack);
    setDistKm(baselineInput.distanceKm);
    restoreWhatIf();
  };

  // Determine what changed if simulation is active
  const hasRun = Boolean(whatIfResult);

  const targetDifferences: string[] = [];
  const candidateRankDifferences: string[] = [];
  let statusChanged = false;
  let noChanges = false;

  if (hasRun && whatIfResult) {
    statusChanged = baselineResult.status !== whatIfResult.status;
    if (statusChanged) {
      candidateRankDifferences.push(`Engine status shifted from ${baselineResult.status} to ${whatIfResult.status}.`);
    }

    // Target checks
    if (baselineResult.targets && whatIfResult.targets) {
      if (baselineResult.targets.moisture !== whatIfResult.targets.moisture) {
        targetDifferences.push(
          `Moisture target shifted from ${baselineResult.targets.moisture} to ${whatIfResult.targets.moisture}`
        );
      }
      if (baselineResult.targets.oxygen !== whatIfResult.targets.oxygen) {
        targetDifferences.push(
          `Oxygen target shifted from ${baselineResult.targets.oxygen} to ${whatIfResult.targets.oxygen}`
        );
      }
      if (baselineResult.targets.mechanical !== whatIfResult.targets.mechanical) {
        targetDifferences.push(
          `Mechanical target shifted from ${baselineResult.targets.mechanical} to ${whatIfResult.targets.mechanical}`
        );
      }
    }

    // Top candidate comparison
    const baseTop = baselineResult.candidates[0];
    const whatTop = whatIfResult.candidates[0];

    if (!baseTop && !whatTop) {
      // Both empty
    } else if (!baseTop && whatTop) {
      candidateRankDifferences.push(`New eligible top recommendation: ${whatTop.name} (${whatTop.displayScore.toFixed(1)} pts)`);
    } else if (baseTop && !whatTop) {
      candidateRankDifferences.push(`Previous top candidate (${baseTop.name}) became ineligible; no candidate now qualifies.`);
    } else if (baseTop && whatTop) {
      if (baseTop.id !== whatTop.id) {
        candidateRankDifferences.push(
          `Top candidate changed from ${baseTop.name} (${baseTop.displayScore.toFixed(1)} pts) to ${whatTop.name} (${whatTop.displayScore.toFixed(1)} pts)`
        );
      } else if (baseTop.displayScore !== whatTop.displayScore) {
        candidateRankDifferences.push(
          `Top candidate remained ${baseTop.name}, but score changed from ${baseTop.displayScore.toFixed(1)} to ${whatTop.displayScore.toFixed(1)} pts`
        );
      }
    }

    // Newly eligible candidates
    const baseCandidateIds = new Set(baselineResult.candidates.map((c) => c.id));
    const newlyEligible = whatIfResult.candidates.filter((c) => !baseCandidateIds.has(c.id));
    if (newlyEligible.length > 0) {
      newlyEligible.forEach((c) => {
        candidateRankDifferences.push(`Candidate ${c.name} became newly eligible (Score: ${c.displayScore.toFixed(1)} pts).`);
      });
    }

    // Newly rejected candidates
    const baseRejectedIds = new Set(baselineResult.rejected.map((r) => r.id));
    const newlyRejected = whatIfResult.rejected.filter((r) => !baseRejectedIds.has(r.id));
    if (newlyRejected.length > 0) {
      newlyRejected.forEach((r) => {
        candidateRankDifferences.push(`Candidate ${r.name} failed gates under modified conditions: ${r.reasons.join(', ')}`);
      });
    }

    // Other score adjustments
    for (const cand of whatIfResult.candidates) {
      const baseCand = baselineResult.candidates.find((bc) => bc.id === cand.id);
      if (baseCand && baseCand.displayScore !== cand.displayScore && baseCand.id !== baseTop?.id) {
        candidateRankDifferences.push(`${cand.name} score changed from ${baseCand.displayScore.toFixed(1)} to ${cand.displayScore.toFixed(1)} pts.`);
      }
    }

    if (
      !statusChanged &&
      targetDifferences.length === 0 &&
      candidateRankDifferences.length === 0
    ) {
      noChanges = true;
    }
  }

  return (
    <div style={{ padding: 'var(--space-6) 0 var(--space-12) 0' }}>
      <div className="container">
        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-6)',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-primary-subtle)',
                color: 'var(--color-primary)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 700,
                textTransform: 'uppercase',
                marginBottom: 'var(--space-2)',
              }}
            >
              <Sliders size={14} />
              Sensitivity Simulation
            </div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)' }}>
              What-If Parameter Stress Testing
            </h1>
          </div>

          <a href="#/results" className="btn-secondary btn-sm">
            <span>View Baseline Results</span>
          </a>
        </div>

        {/* 2-Column Layout: Controls on left, Live Diff on right */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 'var(--space-8)',
            maxWidth: '1100px',
            margin: '0 auto',
          }}
          className="what-if-grid"
        >
          {/* Controls Form */}
          <form onSubmit={handleApply} className="card" style={{ padding: 'var(--space-6)' }}>
            <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-2)' }}>
              Perturbation Controls
            </h2>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>
              Vary environmental and economic variables while preserving baseline inputs.
            </p>

            {/* Relative Humidity Slider/Input */}
            <div className="form-group">
              <label className="form-label" htmlFor="whatif-rh">
                <span>Relative Humidity (% RH)</span>
                <span className="unit">Baseline: {baselineInput.relativeHumidityPct}%</span>
              </label>
              <input
                id="whatif-rh"
                type="number"
                min="0"
                max="100"
                step="1"
                value={rhPct}
                onChange={(e) => setRhPct(Number(e.target.value))}
                className="form-input"
              />
              <div className="form-hint">
                Threshold: RH &ge; 75% bumps moisture barrier target for dry goods.
              </div>
            </div>

            {/* Target Budget */}
            <div className="form-group">
              <label className="form-label" htmlFor="whatif-budget">
                <span>Target Budget (₹ / pack)</span>
                <span className="unit">Baseline: ₹{baselineInput.budgetInrPerPack}</span>
              </label>
              <input
                id="whatif-budget"
                type="number"
                min="0.5"
                step="0.5"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="form-input"
              />
              <div className="form-hint">
                Alters candidate budget fit (Component C) and over-budget penalization.
              </div>
            </div>

            {/* Transit Distance */}
            <div className="form-group">
              <label className="form-label" htmlFor="whatif-distance">
                <span>Distribution Distance (km)</span>
                <span className="unit">Baseline: {baselineInput.distanceKm} km</span>
              </label>
              <input
                id="whatif-distance"
                type="number"
                min="0"
                step="10"
                value={distKm}
                onChange={(e) => setDistKm(Number(e.target.value))}
                className="form-input"
              />
              <div className="form-hint">
                Distances &gt; 300 km increment required mechanical package rating.
              </div>
            </div>

            {/* Storage Temperature */}
            <div className="form-group">
              <label className="form-label" htmlFor="whatif-temp">
                <span>Storage Temperature (°C)</span>
                <span className="unit">Baseline: {baselineInput.temperatureC}°C</span>
              </label>
              <input
                id="whatif-temp"
                type="number"
                step="0.5"
                value={tempC}
                onChange={(e) => setTempC(Number(e.target.value))}
                className="form-input"
              />
              <div className="form-hint">
                Exceeding commodity fixture interval will trigger review_required.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
              <button type="submit" className="btn-primary" id="btn-apply-whatif">
                <Sliders size={16} />
                <span>Apply Simulation</span>
              </button>
              <button
                type="button"
                onClick={handleRestore}
                className="btn-secondary"
                id="btn-restore-baseline"
              >
                <RotateCcw size={16} />
                <span>Restore Baseline</span>
              </button>
            </div>
          </form>

          {/* Results Comparison Pane */}
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-2)' }}>
              Simulation Outcome Diff
            </h2>

            {!hasRun ? (
              <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-4)' }}>
                Adjust any parameter on the left and click <strong>Apply Simulation</strong> to calculate differences against baseline.
              </div>
            ) : (
              <div>
                {/* Status Indicator */}
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <span
                    className={`badge ${
                      whatIfResult?.status === 'demo_shortlist'
                        ? 'badge-fresh'
                        : whatIfResult?.status === 'review_required'
                        ? 'badge-dry'
                        : 'badge-alert'
                    }`}
                  >
                    Outcome Status: {whatIfResult?.status}
                  </span>
                </div>

                {/* Explicit "Nothing changed" message */}
                {noChanges && (
                  <div className="alert-box alert-info" style={{ marginBottom: 'var(--space-4)' }}>
                    <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
                    <div style={{ fontSize: 'var(--font-size-sm)' }}>
                      <strong>No changes in candidate eligibility, ranking, or scores</strong> under these parameter variations. All barrier targets and scores remained identical to baseline.
                    </div>
                  </div>
                )}

                {/* Target Changes */}
                {targetDifferences.length > 0 && (
                  <div style={{ marginBottom: 'var(--space-4)' }}>
                    <h3 style={{ fontSize: 'var(--font-size-sm)', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
                      Derived Target Changes
                    </h3>
                    <ul style={{ paddingLeft: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
                      {targetDifferences.map((td, i) => (
                        <li key={i} style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
                          {td}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Ranking & Score Changes */}
                {candidateRankDifferences.length > 0 && (
                  <div style={{ marginBottom: 'var(--space-4)' }}>
                    <h3 style={{ fontSize: 'var(--font-size-sm)', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
                      Candidate & Rank Changes
                    </h3>
                    <ul style={{ paddingLeft: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
                      {candidateRankDifferences.map((crd, i) => (
                        <li key={i} style={{ marginBottom: '4px' }}>
                          {crd}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* What-If Top Candidate Preview */}
                {whatIfResult && whatIfResult.candidates.length > 0 && (
                  <div
                    style={{
                      padding: 'var(--space-4)',
                      backgroundColor: 'var(--color-surface-sunken)',
                      borderRadius: 'var(--radius-md)',
                      marginTop: 'var(--space-4)',
                    }}
                  >
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                      Current Simulated Top Candidate:
                    </div>
                    <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginTop: '2px' }}>
                      {whatIfResult.candidates[0].name}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', fontWeight: 600 }}>
                      Score: {whatIfResult.candidates[0].displayScore.toFixed(1)} / 100 &bull; Cost: ₹{whatIfResult.candidates[0].unitCostInr}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .what-if-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
