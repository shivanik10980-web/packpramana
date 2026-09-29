import React from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { defaultSeedData } from '../../engine';
import { Layers, ArrowLeft, Check, Plus, AlertCircle } from 'lucide-react';
import type { PackagingRecord, CandidateRecommendation } from '../../domain/types';

export const CompareView: React.FC = () => {
  const { compareIds, toggleCompareId, result } = useScenario();

  // Find candidate details from current result or catalogue
  const getCandidateData = (id: string): { packaging: PackagingRecord; candidate?: CandidateRecommendation } => {
    const fromResult = result.candidates.find((c) => c.id === id);
    if (fromResult) {
      return { packaging: fromResult.packaging, candidate: fromResult };
    }
    const fromSeed = defaultSeedData.packaging.find((p) => p.id === id);
    return { packaging: fromSeed! };
  };

  const selectedPackages = compareIds.map(getCandidateData).filter((x) => Boolean(x.packaging));

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
              <Layers size={14} />
              Material Comparison
            </div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)' }}>
              Candidate Packaging Comparison
            </h1>
          </div>

          <a href="#/results" className="btn-secondary btn-sm">
            <ArrowLeft size={16} />
            <span>Return to Results</span>
          </a>
        </div>

        {/* Candidate Selector Badges */}
        <div className="card" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
            Select 2 or 3 candidates to compare (active: {compareIds.length}/3):
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {defaultSeedData.packaging.map((pkg) => {
              const isSelected = compareIds.includes(pkg.id);
              const fromResult = result.candidates.find((c) => c.id === pkg.id);

              return (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => toggleCompareId(pkg.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                    backgroundColor: isSelected ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
                    color: isSelected ? 'var(--color-primary)' : 'var(--color-text)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {isSelected ? <Check size={14} /> : <Plus size={14} />}
                  <span>{pkg.name}</span>
                  {fromResult && (
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-primary-text)',
                        fontSize: '10px',
                      }}
                    >
                      {fromResult.displayScore.toFixed(1)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {selectedPackages.length === 0 ? (
          <div className="alert-box alert-warning">
            <AlertCircle size={20} />
            <div>Please select at least 2 packaging candidates above to view comparison.</div>
          </div>
        ) : (
          <div className="table-responsive card" style={{ padding: 0 }}>
            <table className="data-table" style={{ minWidth: '700px' }}>
              <thead>
                <tr>
                  <th style={{ width: '220px' }}>Specification Dimension</th>
                  {selectedPackages.map(({ packaging, candidate }) => (
                    <th key={packaging.id} style={{ minWidth: '220px' }}>
                      <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>
                        {packaging.name}
                      </div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                        ID: {packaging.id}
                      </div>
                      {candidate && (
                        <div
                          style={{
                            marginTop: 'var(--space-2)',
                            padding: '4px 8px',
                            backgroundColor: 'var(--color-primary-subtle)',
                            color: 'var(--color-primary)',
                            borderRadius: 'var(--radius-sm)',
                            fontWeight: 700,
                            display: 'inline-block',
                          }}
                        >
                          Score: {candidate.displayScore.toFixed(1)} / 100
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Structure */}
                <tr>
                  <td>
                    <strong>Material Structure</strong>
                  </td>
                  {selectedPackages.map(({ packaging }) => (
                    <td key={packaging.id}>{packaging.structure}</td>
                  ))}
                </tr>

                {/* Pack Format */}
                <tr>
                  <td>
                    <strong>Pack Format</strong>
                  </td>
                  {selectedPackages.map(({ packaging }) => (
                    <td key={packaging.id} style={{ textTransform: 'capitalize' }}>
                      {packaging.format}
                    </td>
                  ))}
                </tr>

                {/* Gas Exchange / Breathability */}
                <tr>
                  <td>
                    <strong>Gas Exchange / Breathability</strong>
                  </td>
                  {selectedPackages.map(({ packaging }) => (
                    <td key={packaging.id}>
                      <span className={`badge ${packaging.breathable ? 'badge-fresh' : 'badge-neutral'}`}>
                        {packaging.breathable ? 'Breathable (vented/perforated)' : 'Sealed barrier'}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Thickness */}
                <tr>
                  <td>
                    <strong>Thickness Range</strong>
                  </td>
                  {selectedPackages.map(({ packaging }) => (
                    <td key={packaging.id}>
                      {packaging.thicknessMicron[0]} &ndash; {packaging.thicknessMicron[1]} &micro;m
                    </td>
                  ))}
                </tr>

                {/* Seal Method */}
                <tr>
                  <td>
                    <strong>Seal Method</strong>
                  </td>
                  {selectedPackages.map(({ packaging }) => (
                    <td key={packaging.id}>{packaging.sealMethod}</td>
                  ))}
                </tr>

                {/* Mechanical Rating */}
                <tr>
                  <td>
                    <strong>Mechanical Rating (1–5)</strong>
                  </td>
                  {selectedPackages.map(({ packaging }) => (
                    <td key={packaging.id}>
                      <strong>{packaging.mechanicalRating} / 5</strong>
                    </td>
                  ))}
                </tr>

                {/* Unit Cost */}
                <tr>
                  <td>
                    <strong>Price per Pack</strong>
                  </td>
                  {selectedPackages.map(({ packaging, candidate }) => (
                    <td key={packaging.id}>
                      <span style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>
                        ₹{packaging.unitCostInr}
                      </span>
                      {candidate && candidate.overBudgetInr > 0 && (
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-danger)' }}>
                          +₹{candidate.overBudgetInr.toFixed(1)} over budget
                        </div>
                      )}
                    </td>
                  ))}
                </tr>

                {/* OTR */}
                <tr>
                  <td>
                    <strong>OTR (Oxygen Transmission Rate)</strong>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                      cm&sup3;/(m&sup2; day)
                    </div>
                  </td>
                  {selectedPackages.map(({ packaging }) => (
                    <td key={packaging.id}>
                      {packaging.otr.value !== null ? packaging.otr.value : (
                        <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                          not measured
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* WVTR */}
                <tr>
                  <td>
                    <strong>WVTR (Water Vapor Transmission)</strong>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                      g/(m&sup2; day)
                    </div>
                  </td>
                  {selectedPackages.map(({ packaging }) => (
                    <td key={packaging.id}>
                      {packaging.wvtr.value !== null ? packaging.wvtr.value : (
                        <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                          not measured
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Gas Permeability */}
                <tr>
                  <td>
                    <strong>Whole-Pack Gas Permeability</strong>
                  </td>
                  {selectedPackages.map(({ packaging }) => (
                    <td key={packaging.id}>
                      <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                        {packaging.gasPermeability.replace('_', ' ')}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* MAP Status */}
                <tr>
                  <td>
                    <strong>MAP Feasibility</strong>
                  </td>
                  {selectedPackages.map(({ packaging }) => (
                    <td key={packaging.id}>
                      <span className="badge badge-neutral">
                        {packaging.mapStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Food Contact Status */}
                <tr>
                  <td>
                    <strong>Food Contact Status</strong>
                  </td>
                  {selectedPackages.map(({ packaging }) => (
                    <td key={packaging.id}>
                      <span className="badge badge-neutral">
                        {packaging.foodContactStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* End of Life Assumption */}
                <tr>
                  <td>
                    <strong>End-of-Life Score (0–5)</strong>
                  </td>
                  {selectedPackages.map(({ packaging }) => (
                    <td key={packaging.id}>
                      <div style={{ fontWeight: 600 }}>{packaging.endOfLifeScore} / 5</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        {packaging.endOfLifeNote}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
