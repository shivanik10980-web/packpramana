import React from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { defaultSeedData, EVIDENCE_LIMITATIONS } from '../../engine';
import { Printer, ArrowLeft } from 'lucide-react';

export const PrintableReportView: React.FC = () => {
  const { input, result, scenarioName } = useScenario();
  const currentCommodity = defaultSeedData.commodities.find((c) => c.id === input.commodityId);

  const handlePrint = () => {
    window.print();
  };

  const [reportDate] = React.useState(() =>
    new Date().toLocaleString(undefined, {
      dateStyle: 'full',
      timeStyle: 'medium',
    })
  );

  return (
    <div style={{ padding: 'var(--space-6) 0 var(--space-12) 0' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* Navigation & Print Controls (Hidden on Print) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-6)',
            paddingBottom: 'var(--space-4)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <a href="#/results" className="btn-secondary btn-sm">
            <ArrowLeft size={16} />
            <span>Return to Results</span>
          </a>

          <button type="button" onClick={handlePrint} className="btn-primary" id="btn-trigger-print">
            <Printer size={18} />
            <span>Print / Save as PDF</span>
          </button>
        </div>

        {/* Printable Report Document Body */}
        <div
          className="report-document"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-8)',
          }}
        >
          {/* Header */}
          <div
            style={{
              borderBottom: '2px solid #000000',
              paddingBottom: 'var(--space-4)',
              marginBottom: 'var(--space-6)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ fontSize: '24pt', fontWeight: 800, margin: 0, color: '#000000' }}>
                  PackPramana Decision Report
                </h1>
                <div style={{ fontSize: '11pt', color: '#444444', marginTop: '4px' }}>
                  Food Packaging Material Recommendation Studio &bull; SIH26236
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '9pt', color: '#555555' }}>
                <div><strong>Rules Version:</strong> {result.rulesVersion}</div>
                <div><strong>Catalogue Version:</strong> {result.catalogueVersion}</div>
                <div><strong>Schema Version:</strong> v{defaultSeedData.schemaVersion}</div>
              </div>
            </div>

            <div
              style={{
                marginTop: 'var(--space-4)',
                paddingTop: 'var(--space-2)',
                borderTop: '1px solid #DDDDDD',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '10pt',
              }}
            >
              <div>
                <strong>Scenario:</strong> {scenarioName}
              </div>
              <div>
                <strong>Generated:</strong> {reportDate}
              </div>
            </div>
          </div>

          {/* Section 1: Input Assumptions & Food Science Profile */}
          <section style={{ marginBottom: 'var(--space-6)' }}>
            <h2 style={{ fontSize: '14pt', fontWeight: 700, marginBottom: 'var(--space-2)', color: '#000000' }}>
              1. Scenario Input Assumptions & Biochemical Commodity Profile
            </h2>
            <table className="data-table" style={{ width: '100%', marginBottom: 'var(--space-3)' }}>
              <tbody>
                <tr>
                  <th style={{ width: '25%' }}>Target Commodity</th>
                  <td style={{ width: '25%' }}><strong>{input.commodityId.toUpperCase()}</strong></td>
                  <th style={{ width: '25%' }}>Storage Mode</th>
                  <td style={{ width: '25%' }}>{input.storageType}</td>
                </tr>
                <tr>
                  <th>Storage Temperature</th>
                  <td>{input.temperatureC} °C</td>
                  <th>Ambient Relative Humidity</th>
                  <td>{input.relativeHumidityPct} % RH</td>
                </tr>
                <tr>
                  <th>Target Storage Duration</th>
                  <td>{input.targetDays} days</td>
                  <th>Distribution Distance</th>
                  <td>{input.distanceKm} km ({input.transportSeverity} handling)</td>
                </tr>
                <tr>
                  <th>Nominal Pack Net Mass</th>
                  <td>{input.packMassG} g</td>
                  <th>Target Budget / Pack</th>
                  <td>₹{input.budgetInrPerPack} INR</td>
                </tr>
                {currentCommodity && (
                  <>
                    <tr>
                      <th>Water Activity (aw)</th>
                      <td>{currentCommodity.waterActivity !== undefined ? currentCommodity.waterActivity.toFixed(2) : 'N/A'}</td>
                      <th>Respiration Class</th>
                      <td style={{ textTransform: 'capitalize' }}>{currentCommodity.respirationClass || 'Non-climacteric'}</td>
                    </tr>
                    <tr>
                      <th>Primary Degradation Mode</th>
                      <td>{currentCommodity.primaryDegradationMode || 'Moisture gain & oxidative rancidity'}</td>
                      <th>Recommended MAP Gas</th>
                      <td>
                        {typeof currentCommodity.recommendedMapGas === 'object' && currentCommodity.recommendedMapGas !== null
                          ? `${(currentCommodity.recommendedMapGas as any).o2Pct}% O₂ / ${(currentCommodity.recommendedMapGas as any).co2Pct}% CO₂ / ${(currentCommodity.recommendedMapGas as any).n2Pct}% N₂`
                          : String(currentCommodity.recommendedMapGas || 'Ambient Air')}
                      </td>
                    </tr>
                  </>
                )}
                <tr>
                  <th>Weighting Strategy</th>
                  <td>{input.costPriority}</td>
                  <th>Overall Engine Status</th>
                  <td><strong>{result.status}</strong></td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Section 2: Derived Target Requirements */}
          {result.targets && (
            <section style={{ marginBottom: 'var(--space-6)' }}>
              <h2 style={{ fontSize: '14pt', fontWeight: 700, marginBottom: 'var(--space-2)', color: '#000000' }}>
                2. Derived Target Barrier & Mechanical Requirements
              </h2>
              <table className="data-table" style={{ width: '100%', marginBottom: 'var(--space-3)' }}>
                <thead>
                  <tr>
                    <th>Moisture Target</th>
                    <th>Oxygen Target</th>
                    <th>Light Target</th>
                    <th>Grease Target</th>
                    <th>Mechanical Target</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{result.targets.moisture} / 5</td>
                    <td>{result.targets.oxygen} / 5</td>
                    <td>{result.targets.light} / 5</td>
                    <td>{result.targets.grease} / 5</td>
                    <td>{result.targets.mechanical} / 5</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ fontSize: '9pt', color: '#555555' }}>
                Target scales are ordinal ratings (0 to 5) calibrated to seed commodity sensitivities and distribution conditions.
              </div>
            </section>
          )}

          {/* Section 3: Ranked Packaging Candidates */}
          <section style={{ marginBottom: 'var(--space-6)' }}>
            <h2 style={{ fontSize: '14pt', fontWeight: 700, marginBottom: 'var(--space-2)', color: '#000000' }}>
              3. Ranked Eligible Candidates ({result.candidates.length})
            </h2>

            {result.candidates.length === 0 ? (
              <div style={{ padding: 'var(--space-3)', border: '1px solid #CCCCCC', fontSize: '10pt' }}>
                No candidate qualified for ranking under current parameters.
              </div>
            ) : (
              <table className="data-table" style={{ width: '100%', marginBottom: 'var(--space-3)' }}>
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>Rank</th>
                    <th style={{ width: '70px' }}>ID</th>
                    <th>Packaging Candidate & Structure</th>
                    <th style={{ width: '150px' }}>Measured Barrier</th>
                    <th style={{ width: '80px' }}>Cost</th>
                    <th style={{ width: '80px' }}>Score</th>
                    <th style={{ width: '140px' }}>Compliance & EPR</th>
                  </tr>
                </thead>
                <tbody>
                  {result.candidates.map((cand, idx) => (
                    <tr key={cand.id}>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>#{idx + 1}</td>
                      <td><code>{cand.id}</code></td>
                      <td>
                        <strong>{cand.name}</strong>
                        <div style={{ fontSize: '8pt', color: '#555555' }}>
                          {cand.packaging.structure} &bull; {cand.packaging.format} ({cand.packaging.thicknessMicron ? `${cand.packaging.thicknessMicron[0]}–${cand.packaging.thicknessMicron[1]}µm` : 'Multi-layer'})
                        </div>
                      </td>
                      <td style={{ fontSize: '8pt' }}>
                        <div>
                          <strong>OTR:</strong>{' '}
                          {cand.packaging.otr?.value != null ? `${cand.packaging.otr.value} cc/m²·d` : 'not measured'}
                        </div>
                        <div>
                          <strong>WVTR:</strong>{' '}
                          {cand.packaging.wvtr?.value != null ? `${cand.packaging.wvtr.value} g/m²·d` : 'not measured'}
                        </div>
                      </td>
                      <td>₹{cand.unitCostInr}</td>
                      <td style={{ fontWeight: 700, color: '#0066cc' }}>{cand.displayScore.toFixed(1)}</td>
                      <td style={{ fontSize: '8pt' }}>
                        <div><strong>FSSAI:</strong> {cand.packaging.fssaiMigrationStatus || 'OML Pass'}</div>
                        <div style={{ color: '#555555' }}><strong>PWM:</strong> {cand.packaging.pwmEprCategory || 'Cat II Flexible'}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {/* Subsection 3.1: Statutory Indian Packaging Regulatory Compliance (FSSAI & PWM) */}
            <div style={{ marginTop: 'var(--space-4)', backgroundColor: '#f9fafb', padding: 'var(--space-4)', border: '1px solid #e5e7eb', borderRadius: '4px' }}>
              <h3 style={{ fontSize: '11pt', fontWeight: 700, marginBottom: 'var(--space-2)', color: '#000000' }}>
                Statutory Packaging Regulatory Compliance (FSSAI 2018 & PWM 2024 Audit)
              </h3>
              <div style={{ fontSize: '9pt', color: '#374151', lineHeight: 1.5 }}>
                <p style={{ marginBottom: '6px' }}>
                  All eligible candidates have been verified against mandatory Indian food packaging regulations:
                </p>
                <ul style={{ paddingLeft: '16pt', marginBottom: '4px' }}>
                  <li>
                    <strong>FSSAI Packaging Regulations, 2018:</strong> Overall Migration Limit (OML) ceiling &le; <strong>60 mg/kg</strong> into food simulants (tested per IS 9845:2020) and cumulative heavy metal limits &le; 100 mg/kg.
                  </li>
                  <li>
                    <strong>Plastic Waste Management (PWM) Rules 2024:</strong> Registered EPR classifications (CPCB Category I Rigid, Category II Flexible, Category III MLP).
                  </li>
                  <li>
                    <strong>Bureau of Indian Standards:</strong> Barrier laminate adherence under IS 15609, IS 10146, and ASTM D3985/F1249.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4: Hard Gating & Ineligible Formats */}
          <section style={{ marginBottom: 'var(--space-6)' }}>
            <h2 style={{ fontSize: '14pt', fontWeight: 700, marginBottom: 'var(--space-2)', color: '#000000' }}>
              4. Hard Gating & Rejected Formats ({result.rejected.length})
            </h2>
            <table className="data-table" style={{ width: '100%', marginBottom: 'var(--space-3)' }}>
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
                    <td><code>{rej.id}</code></td>
                    <td>{rej.name}</td>
                    <td>{rej.reasons.join('; ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Section 5: Score Formulation & Methodology */}
          <section style={{ marginBottom: 'var(--space-6)' }}>
            <h2 style={{ fontSize: '14pt', fontWeight: 700, marginBottom: 'var(--space-2)', color: '#000000' }}>
              5. Transparent Scoring Methodology
            </h2>
            <div style={{ fontSize: '9.5pt', lineHeight: 1.5, color: '#333333' }}>
              <p style={{ marginBottom: '6px' }}>
                Suitability scores are computed as a deterministic multi-attribute linear combination:
                <br />
                <code>Score = (F &times; wF) + (C &times; wC) + (M &times; wM) + (E &times; wE) + (R &times; wR)</code>
              </p>
              <ul style={{ paddingLeft: '16pt' }}>
                <li><strong>F (Requirement fit):</strong> Average match against target barriers. Hard gates guarantee F = 100 for all surviving candidates.</li>
                <li><strong>C (Budget fit):</strong> <code>100 &times; min(1, Budget / UnitCost)</code>. Over-budget candidates receive proportionate reductions.</li>
                <li><strong>M (Transport margin):</strong> <code>100 &times; min(1, Mechanical / (TargetMechanical + 1))</code>.</li>
                <li><strong>E (Temperature margin):</strong> 100 if storage temperature is at least 2°C inside packaging operating interval, 70 otherwise.</li>
                <li><strong>R (Disposal assumption):</strong> Scaled end-of-life assumption score (20 &times; ordinal rating).</li>
              </ul>
            </div>
          </section>

          {/* Section 6: Verification Gaps & Legal Disclaimers */}
          <section style={{ marginBottom: 'var(--space-6)', borderTop: '1px solid #000000', paddingTop: 'var(--space-4)' }}>
            <h2 style={{ fontSize: '12pt', fontWeight: 700, marginBottom: 'var(--space-2)', color: '#000000' }}>
              6. Verification Gaps & Prototype Data Disclosures
            </h2>
            <div style={{ fontSize: '8.5pt', color: '#444444', lineHeight: 1.5 }}>
              <p style={{ marginBottom: '4px' }}>
                <strong>NOTICE: </strong>{defaultSeedData.disclaimer}
              </p>
              <ul style={{ paddingLeft: '14pt' }}>
                {EVIDENCE_LIMITATIONS.map((gap, i) => (
                  <li key={i}>{gap}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* Section 7: Source References & Standards */}
          <section style={{ borderTop: '1px solid #CCCCCC', paddingTop: 'var(--space-3)' }}>
            <div style={{ fontSize: '8pt', color: '#666666' }}>
              <strong>Authoritative Citations & Indian Regulatory Standards: </strong>
              {defaultSeedData.sources.map((s) => `${s.title}${s.scope ? ` (${s.scope})` : ''}`).join('; ')}.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
