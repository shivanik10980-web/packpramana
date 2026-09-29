import React, { useState } from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { COMPONENT_LABELS, explainTieBreak, formatContributionMath, EVIDENCE_LIMITATIONS } from '../../engine';
import {
  Sparkles,
  AlertTriangle,
  XCircle,
  Layers,
  Sliders,
  BookmarkPlus,
  Printer,
  ChevronDown,
  ChevronUp,
  Info,
  ShieldAlert,
} from 'lucide-react';
import type { CandidateRecommendation } from '../../domain/types';

export const ResultsView: React.FC = () => {
  const {
    input,
    result,
    scenarioName,
    saveCurrentScenario,
    toggleCompareId,
    compareIds,
  } = useScenario();

  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveName, setSaveName] = useState(scenarioName);
  const [saveNote, setSaveNote] = useState('');
  const [saveStatus, setSaveStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const [expandedCandidateId, setExpandedCandidateId] = useState<string | null>(null);
  const [showRejected, setShowRejected] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const res = saveCurrentScenario(saveName, saveNote);
    if (res.success) {
      setSaveStatus({ success: true, message: 'Scenario snapshot saved successfully.' });
      setTimeout(() => {
        setSaveModalOpen(false);
        setSaveStatus(null);
      }, 1200);
    } else {
      setSaveStatus({ success: false, message: res.error });
    }
  };

  const topCandidate = result.candidates[0] as CandidateRecommendation | undefined;
  const alternatives = result.candidates.slice(1, 3); // Up to two alternatives, never padded

  return (
    <div style={{ padding: 'var(--space-6) 0 var(--space-12) 0' }}>
      <div className="container">
        {/* Header & Quick Actions */}
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
              <Sparkles size={14} />
              Evaluation Outcome
            </div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)' }}>
              {scenarioName || 'Packaging Material Recommendation'}
            </h1>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <button
              type="button"
              onClick={() => {
                setSaveName(scenarioName);
                setSaveModalOpen(true);
              }}
              className="btn-secondary btn-sm"
              id="btn-save-scenario"
            >
              <BookmarkPlus size={16} />
              <span>Save Scenario</span>
            </button>
            <a href="#/what-if" className="btn-secondary btn-sm">
              <Sliders size={16} />
              <span>What-If Simulation</span>
            </a>
            <a href="#/compare" className="btn-secondary btn-sm">
              <Layers size={16} />
              <span>Compare ({compareIds.length})</span>
            </a>
            <a href="#/report" className="btn-primary btn-sm">
              <Printer size={16} />
              <span>Print Decision Report</span>
            </a>
          </div>
        </div>

        {/* Aria-live status announcement for screen readers */}
        <div className="sr-only" aria-live="polite" role="status">
          Recommendation complete. Status: {result.status}. Found {result.candidates.length} eligible candidates and {result.rejected.length} rejected candidates.
        </div>

        {/* Scenario Input Summary Strip */}
        <div
          className="card"
          style={{
            padding: 'var(--space-4) var(--space-6)',
            marginBottom: 'var(--space-6)',
            backgroundColor: 'var(--color-surface-subtle)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', alignItems: 'center' }}>
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Food: </span>
              <strong>{input.commodityId.toUpperCase()}</strong>
            </div>
            <span style={{ color: 'var(--color-border-strong)' }}>&bull;</span>
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Storage: </span>
              <strong>
                {input.temperatureC}°C, {input.relativeHumidityPct}% RH ({input.storageType})
              </strong>
            </div>
            <span style={{ color: 'var(--color-border-strong)' }}>&bull;</span>
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Duration: </span>
              <strong>{input.targetDays} days</strong>
            </div>
            <span style={{ color: 'var(--color-border-strong)' }}>&bull;</span>
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Transit: </span>
              <strong>
                {input.distanceKm} km ({input.transportSeverity})
              </strong>
            </div>
            <span style={{ color: 'var(--color-border-strong)' }}>&bull;</span>
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Budget: </span>
              <strong>₹{input.budgetInrPerPack} / pack</strong>
            </div>
            <span style={{ color: 'var(--color-border-strong)' }}>&bull;</span>
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Weighting: </span>
              <strong>{input.costPriority}</strong>
            </div>
          </div>

          <a href="#/scenario" className="btn-outline btn-sm">
            <span>Modify Inputs</span>
          </a>
        </div>

        {/* STATUS: INVALID */}
        {result.status === 'invalid' && (
          <div className="alert-box alert-danger" style={{ marginBottom: 'var(--space-6)' }}>
            <XCircle size={24} style={{ flexShrink: 0 }} />
            <div>
              <h2 style={{ fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-1)' }}>
                Input Validation Failed
              </h2>
              <p style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-2)' }}>
                The scenario could not be processed due to the following parameter errors:
              </p>
              <ul style={{ paddingLeft: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
                {result.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* STATUS: REVIEW REQUIRED */}
        {result.status === 'review_required' && (
          <div className="alert-box alert-warning" style={{ marginBottom: 'var(--space-6)' }}>
            <AlertTriangle size={24} style={{ flexShrink: 0 }} />
            <div>
              <h2 style={{ fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-1)' }}>
                Expert Science Review Required (No Automated Ranking)
              </h2>
              <p style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-2)', lineHeight: 1.6 }}>
                Parameters extend beyond calibrated seed fixture boundaries. To maintain scientific integrity, the engine does not infer unvalidated shelf lives or temperatures outside authored rules:
              </p>
              <ul style={{ paddingLeft: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
                {result.reasons.map((r, i) => (
                  <li key={i}>
                    <strong>{r}</strong>
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: 'var(--space-4)' }}>
                <a href="#/scenario" className="btn-secondary btn-sm">
                  <span>Return to Scenario Form to Adjust</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* STATUS: NO MATCH */}
        {result.status === 'no_match' && (
          <div className="alert-box alert-danger" style={{ marginBottom: 'var(--space-6)' }}>
            <XCircle size={24} style={{ flexShrink: 0 }} />
            <div>
              <h2 style={{ fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-1)' }}>
                No Packaging Candidates Met Hard Safety & Mechanical Gates
              </h2>
              <p style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.6 }}>
                Every packaging candidate in the catalogue failed at least one essential physical gate (e.g., category compatibility, breathability requirement for respiring produce, mechanical resistance deficit, or barrier insufficiency). See rejected candidates below for details.
              </p>
            </div>
          </div>
        )}

        {/* STATUS: DEMO SHORTLIST */}
        {result.status === 'demo_shortlist' && (
          <div>
            {/* Hard Gates Safety Banner */}
            <div
              style={{
                backgroundColor: 'var(--color-surface-sunken)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
                marginBottom: 'var(--space-6)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-muted)',
                lineHeight: 1.5,
              }}
            >
              <strong>Hard Gating Principle: </strong>
              All surviving candidates below passed 100% of authored safety and mechanical gates (F = 100).
              Hard gates ensure that low-cost but unprotective or non-breathable packages cannot win purely on price.
            </div>

            {/* TOP RECOMMENDATION CARD */}
            {topCandidate && (
              <section style={{ marginBottom: 'var(--space-8)' }}>
                <div
                  className="card"
                  style={{
                    border: '2px solid var(--color-primary)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-primary-text)',
                      padding: '4px 16px',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      borderBottomRightRadius: 'var(--radius-md)',
                    }}
                  >
                    Primary Recommendation
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr',
                      gap: 'var(--space-6)',
                      paddingTop: 'var(--space-6)',
                    }}
                    className="top-candidate-grid"
                  >
                    {/* Left: Identity and Scores */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                        <h2 style={{ fontSize: 'var(--font-size-xl)' }}>{topCandidate.name}</h2>
                        <span className="badge badge-neutral">{topCandidate.id}</span>
                      </div>

                      <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>
                        {topCandidate.packaging.structure} &bull; {topCandidate.packaging.format} &bull;{' '}
                        {topCandidate.packaging.breathable ? 'Breathable (vented/perforated)' : 'Sealed barrier'}
                      </div>

                      {/* Score Highlight Box */}
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          gap: 'var(--space-4)',
                          padding: 'var(--space-4)',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--color-surface-subtle)',
                          marginBottom: 'var(--space-4)',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                            Suitability Score
                          </div>
                          <div
                            style={{
                              fontSize: 'var(--font-size-3xl)',
                              fontWeight: 800,
                              color: 'var(--color-primary)',
                              lineHeight: 1,
                            }}
                          >
                            {topCandidate.displayScore.toFixed(1)}
                            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text-muted)' }}>
                              {' '}/ 100
                            </span>
                          </div>
                        </div>

                        <div style={{ width: '1px', height: '40px', backgroundColor: 'var(--color-border)' }} />

                        <div>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                            Unit Cost / Pack
                          </div>
                          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1 }}>
                            ₹{topCandidate.unitCostInr}
                          </div>
                          {topCandidate.overBudgetInr > 0 ? (
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-danger)', fontWeight: 600 }}>
                              +₹{topCandidate.overBudgetInr.toFixed(1)} over target budget
                            </div>
                          ) : (
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-success)', fontWeight: 600 }}>
                              Within ₹{input.budgetInrPerPack} budget
                            </div>
                          )}
                        </div>

                        <div style={{ width: '1px', height: '40px', backgroundColor: 'var(--color-border)' }} />

                        <div>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                            Mechanical Strength
                          </div>
                          <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>
                            Rating {topCandidate.packaging.mechanicalRating} / 5
                          </div>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                            Target requirement: {result.targets?.mechanical}
                          </div>
                        </div>
                      </div>

                      {/* Tie-break note if applicable */}
                      {alternatives.length > 0 &&
                        explainTieBreak(topCandidate, alternatives[0]) && (
                          <div
                            className="alert-box alert-info"
                            style={{ padding: 'var(--space-3)', fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-4)' }}
                          >
                            <Info size={16} style={{ flexShrink: 0 }} />
                            <span>
                              <strong>Tie-Break Resolution: </strong>
                              {explainTieBreak(topCandidate, alternatives[0])}
                            </span>
                          </div>
                        )}
                    </div>

                    {/* Right: Exact Component Contributions */}
                    <div
                      style={{
                        padding: 'var(--space-4)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-surface-sunken)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <h3 style={{ fontSize: 'var(--font-size-sm)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 'var(--space-3)' }}>
                        Transparent Component Contributions
                      </h3>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        {(['F', 'C', 'M', 'E', 'R'] as const).map((compKey) => {
                          const meta = COMPONENT_LABELS[compKey];
                          const rawVal = topCandidate.components[compKey];
                          const weight = topCandidate.weights[compKey];
                          const contrib = topCandidate.contributions[compKey];

                          return (
                            <div key={compKey} style={{ fontSize: 'var(--font-size-xs)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                <span>
                                  <strong>{compKey} &bull; {meta.label}</strong> ({weight * 100}% weight)
                                </span>
                                <span>
                                  {rawVal.toFixed(0)} pts &times; {weight} = <strong>+{contrib.toFixed(1)}</strong>
                                </span>
                              </div>
                              <div
                                style={{
                                  height: '4px',
                                  width: '100%',
                                  backgroundColor: 'var(--color-border)',
                                  borderRadius: 'var(--radius-full)',
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  style={{
                                    height: '100%',
                                    width: `${Math.min(100, rawVal)}%`,
                                    backgroundColor: 'var(--color-primary)',
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div
                        style={{
                          marginTop: 'var(--space-3)',
                          paddingTop: 'var(--space-2)',
                          borderTop: '1px solid var(--color-border)',
                          fontSize: '11px',
                          color: 'var(--color-text-muted)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        Total: {formatContributionMath(topCandidate)} = {topCandidate.displayScore.toFixed(1)} pts
                      </div>
                    </div>
                  </div>

                  {/* Evidence Gaps & Disclosures for Top Candidate */}
                  <div
                    style={{
                      marginTop: 'var(--space-4)',
                      paddingTop: 'var(--space-4)',
                      borderTop: '1px solid var(--color-border-subtle)',
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      fontSize: 'var(--font-size-xs)',
                    }}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                      <span className="badge badge-neutral">OTR: not measured</span>
                      <span className="badge badge-neutral">WVTR: not measured</span>
                      <span className="badge badge-neutral">Food contact: supplier verification pending</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleCompareId(topCandidate.id)}
                      className={compareIds.includes(topCandidate.id) ? 'btn-primary btn-sm' : 'btn-outline btn-sm'}
                    >
                      <Layers size={14} />
                      <span>{compareIds.includes(topCandidate.id) ? 'In Compare' : 'Add to Compare'}</span>
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* ALTERNATIVES SECTION (Up to 2, never padded) */}
            {alternatives.length > 0 && (
              <section style={{ marginBottom: 'var(--space-8)' }}>
                <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-4)' }}>
                  Eligible Alternatives ({alternatives.length})
                </h2>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: 'var(--space-4)',
                  }}
                >
                  {alternatives.map((alt, idx) => {
                    const isExpanded = expandedCandidateId === alt.id;
                    const tieNote = explainTieBreak(alt, topCandidate!);

                    return (
                      <div key={alt.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                          <div>
                            <span
                              style={{
                                fontSize: 'var(--font-size-xs)',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                color: 'var(--color-text-muted)',
                              }}
                            >
                              Alternative #{idx + 1}
                            </span>
                            <h3 style={{ fontSize: 'var(--font-size-md)' }}>{alt.name}</h3>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-primary)' }}>
                              {alt.displayScore.toFixed(1)}
                            </div>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                              ₹{alt.unitCostInr} / pack
                            </div>
                          </div>
                        </div>

                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
                          {alt.packaging.structure} &bull; Rating {alt.packaging.mechanicalRating}/5
                        </div>

                        {tieNote && (
                          <div
                            style={{
                              padding: '6px 10px',
                              backgroundColor: 'var(--color-info-subtle)',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '11px',
                              marginBottom: 'var(--space-3)',
                            }}
                          >
                            {tieNote}
                          </div>
                        )}

                        {/* Collapsible Component math */}
                        <button
                          type="button"
                          onClick={() => setExpandedCandidateId(isExpanded ? null : alt.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 0',
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--color-primary)',
                            fontWeight: 600,
                            marginTop: 'auto',
                          }}
                        >
                          <span>{isExpanded ? 'Hide contribution math' : 'Inspect contribution math'}</span>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        {isExpanded && (
                          <div
                            style={{
                              marginTop: 'var(--space-2)',
                              padding: 'var(--space-3)',
                              backgroundColor: 'var(--color-surface-sunken)',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '11px',
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            {formatContributionMath(alt)}
                          </div>
                        )}

                        <div
                          style={{
                            marginTop: 'var(--space-3)',
                            paddingTop: 'var(--space-3)',
                            borderTop: '1px solid var(--color-border-subtle)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                            ID: {alt.id}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleCompareId(alt.id)}
                            className={compareIds.includes(alt.id) ? 'btn-primary btn-sm' : 'btn-outline btn-sm'}
                          >
                            <Layers size={14} />
                            <span>{compareIds.includes(alt.id) ? 'In Compare' : 'Add to Compare'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}

        {/* REJECTED CANDIDATES SECTION */}
        <section style={{ marginTop: 'var(--space-8)' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--space-4)',
            }}
          >
            <div>
              <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-1)' }}>
                Rejected Ineligible Formats ({result.rejected.length})
              </h2>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                Materials eliminated during hard gating with explicit physical, barrier, or category failure reasons.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowRejected(!showRejected)}
              className="btn-secondary btn-sm"
            >
              <span>{showRejected ? 'Hide Rejections' : 'Show Rejections'}</span>
              {showRejected ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {showRejected && (
            <div className="table-responsive card" style={{ padding: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>ID</th>
                    <th style={{ width: '220px' }}>Candidate Name</th>
                    <th>Explicit Gate Failure Reasons</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rejected.map((rej) => (
                    <tr key={rej.id}>
                      <td>
                        <code>{rej.id}</code>
                      </td>
                      <td style={{ fontWeight: 600 }}>{rej.name}</td>
                      <td>
                        <ul style={{ paddingLeft: 'var(--space-4)', margin: 0 }}>
                          {rej.reasons.map((r, i) => (
                            <li key={i} style={{ color: 'var(--color-danger)' }}>
                              {r}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                  {result.rejected.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        All catalogue packaging formats were eligible.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Evidence Status & Governance Disclosures */}
        <section
          style={{
            marginTop: 'var(--space-8)',
            padding: 'var(--space-6)',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-surface-sunken)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-2)' }}>
            <ShieldAlert size={18} style={{ color: 'var(--color-warning)' }} />
            <h3 style={{ fontSize: 'var(--font-size-md)' }}>Evidence Status & Scientific Verification Gaps</h3>
          </div>
          <ul style={{ paddingLeft: 'var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            {EVIDENCE_LIMITATIONS.map((lim, i) => (
              <li key={i}>{lim}</li>
            ))}
          </ul>
        </section>
      </div>

      {/* Save Scenario Modal */}
      {saveModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--space-4)',
          }}
        >
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: 'var(--space-6)' }}>
            <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-2)' }}>
              Save Scenario Snapshot
            </h2>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
              Saves a complete immutable snapshot into local browser storage.
            </p>

            {saveStatus && (
              <div
                className={`alert-box ${saveStatus.success ? 'alert-success' : 'alert-danger'}`}
                style={{ padding: 'var(--space-3)', fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-4)' }}
              >
                {saveStatus.message}
              </div>
            )}

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label" htmlFor="saveScenarioName">
                  Scenario Name
                </label>
                <input
                  id="saveScenarioName"
                  type="text"
                  required
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  className="form-input"
                  placeholder="e.g. Strawberry Chilled Baseline"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="saveScenarioNote">
                  Operational Note (Optional)
                </label>
                <textarea
                  id="saveScenarioNote"
                  rows={3}
                  value={saveNote}
                  onChange={(e) => setSaveNote(e.target.value)}
                  className="form-textarea"
                  placeholder="Notes on supplier lead time, retailer trials, or testing conditions..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
                <button
                  type="button"
                  onClick={() => setSaveModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" id="btn-confirm-save">
                  Save Snapshot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 900px) {
          .top-candidate-grid {
            grid-template-columns: 3fr 2fr !important;
          }
        }
      `}</style>
    </div>
  );
};
