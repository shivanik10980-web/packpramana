import React, { useState } from 'react';
import { defaultSeedData } from '../../engine';
import { BookOpen, Search, ExternalLink } from 'lucide-react';

export const CatalogueView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'packaging' | 'commodities' | 'glossary'>('packaging');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPackaging = defaultSeedData.packaging.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.structure.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCommodities = defaultSeedData.commodities.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <BookOpen size={14} />
              Reference Library
            </div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)' }}>
              Catalogue & Scientific Glossary
            </h1>
          </div>

          <div
            style={{
              display: 'inline-flex',
              padding: '4px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface-sunken)',
              border: '1px solid var(--color-border)',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('packaging')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
                fontWeight: activeTab === 'packaging' ? 700 : 500,
                backgroundColor: activeTab === 'packaging' ? 'var(--color-surface)' : 'transparent',
                color: activeTab === 'packaging' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                boxShadow: activeTab === 'packaging' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              Packaging ({defaultSeedData.packaging.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('commodities')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
                fontWeight: activeTab === 'commodities' ? 700 : 500,
                backgroundColor: activeTab === 'commodities' ? 'var(--color-surface)' : 'transparent',
                color: activeTab === 'commodities' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                boxShadow: activeTab === 'commodities' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              Commodities ({defaultSeedData.commodities.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('glossary')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
                fontWeight: activeTab === 'glossary' ? 700 : 500,
                backgroundColor: activeTab === 'glossary' ? 'var(--color-surface)' : 'transparent',
                color: activeTab === 'glossary' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                boxShadow: activeTab === 'glossary' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              Glossary & Sources
            </button>
          </div>
        </div>

        {/* Search bar for packaging or commodities */}
        {activeTab !== 'glossary' && (
          <div className="card" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-3) var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Search size={18} style={{ color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === 'packaging'
                    ? 'Search packaging formats by name, polymer structure, or ID...'
                    : 'Search commodities by name or category...'
                }
                style={{
                  border: 'none',
                  background: 'transparent',
                  width: '100%',
                  fontSize: 'var(--font-size-sm)',
                  outline: 'none',
                  color: 'var(--color-text)',
                }}
              />
            </div>
          </div>
        )}

        {/* TAB 1: PACKAGING MATERIALS */}
        {activeTab === 'packaging' && (
          <div className="table-responsive card" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '70px' }}>ID</th>
                  <th style={{ width: '200px' }}>Material Name</th>
                  <th>Structure & Format</th>
                  <th style={{ width: '130px' }}>Thickness</th>
                  <th style={{ width: '150px' }}>Seal Method</th>
                  <th style={{ width: '90px' }}>Mechanical</th>
                  <th style={{ width: '90px' }}>Unit Cost</th>
                  <th style={{ width: '160px' }}>ASTM Measured Barrier</th>
                  <th style={{ width: '160px' }}>Compliance & EPR</th>
                  <th style={{ width: '120px' }}>Evidence Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPackaging.map((p) => (
                  <tr key={p.id}>
                    <td><code>{p.id}</code></td>
                    <td>
                      <strong>{p.name}</strong>
                      <div>
                        <span className={`badge ${p.breathable ? 'badge-fresh' : 'badge-neutral'}`} style={{ marginTop: '4px' }}>
                          {p.breathable ? 'Breathable' : 'Sealed'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div>{p.structure}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        Format: {p.format} &bull; Compatible: {p.compatibleCategories.join(', ')}
                      </div>
                    </td>
                    <td>{p.thicknessMicron[0]}&ndash;{p.thicknessMicron[1]} &micro;m</td>
                    <td>{p.sealMethod}</td>
                    <td><strong>{p.mechanicalRating} / 5</strong></td>
                    <td><strong>₹{p.unitCostInr}</strong></td>
                    <td>
                      <div style={{ fontSize: '11px' }}>
                        <div>
                          <strong>OTR:</strong>{' '}
                          {p.otr?.value != null ? `${p.otr.value} ${p.otr.unit}` : 'not measured'}
                        </div>
                        <div>
                          <strong>WVTR:</strong>{' '}
                          {p.wvtr?.value != null ? `${p.wvtr.value} ${p.wvtr.unit}` : 'not measured'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '11px' }}>
                        <div>
                          <strong>BIS:</strong>{' '}
                          {Array.isArray(p.standardsRef) ? p.standardsRef.join(', ') : p.standardsRef || 'IS 15609'}
                        </div>
                        <div style={{ color: 'var(--color-text-muted)' }}>{p.pwmEprCategory || 'PWM Cat II'}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${p.evidenceStatus === 'astm_measured' || p.otr?.status === 'measured' ? 'badge-fresh' : 'badge-neutral'}`} style={{ textTransform: 'none' }}>
                        {p.otr?.status === 'measured' ? 'ASTM Measured' : p.evidenceStatus || 'synthetic_demo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: COMMODITIES */}
        {activeTab === 'commodities' && (
          <div className="table-responsive card" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '70px' }}>ID</th>
                  <th style={{ width: '160px' }}>Commodity</th>
                  <th style={{ width: '90px' }}>Category</th>
                  <th style={{ width: '130px' }}>Storage Mode</th>
                  <th style={{ width: '110px' }}>Safe Temp</th>
                  <th style={{ width: '110px' }}>Max Days</th>
                  <th>Calibrated Barrier Targets (0–5)</th>
                  <th>Composition Baseline</th>
                </tr>
              </thead>
              <tbody>
                {filteredCommodities.map((c) => (
                  <tr key={c.id}>
                    <td><code>{c.id}</code></td>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td>
                      <span className={`badge ${c.category === 'fresh' ? 'badge-fresh' : 'badge-dry'}`}>
                        {c.category}
                      </span>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{c.storageType}</td>
                    <td>{c.temperatureC[0]}°C to {c.temperatureC[1]}°C</td>
                    <td>{c.prototypeMaxDays} days</td>
                    <td>
                      <div style={{ fontSize: '11px' }}>
                        Moisture: {c.required.moisture} &bull; Oxygen: {c.required.oxygen}<br />
                        Light: {c.required.light} &bull; Grease: {c.required.grease}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        Moisture: {c.composition.moisturePct}% &bull; Fat: {c.composition.fatPct}% &bull; pH: {c.composition.pH}
                        {c.waterActivity !== undefined && (
                          <div>aw: <strong>{c.waterActivity}</strong> &bull; Class: <span style={{ textTransform: 'capitalize' }}>{c.respirationClass || 'normal'}</span></div>
                        )}
                        {c.recommendedMapGas && (
                          <div style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                            MAP:{' '}
                            {typeof c.recommendedMapGas === 'object' && c.recommendedMapGas !== null
                              ? `${(c.recommendedMapGas as any).o2Pct}% O₂ / ${(c.recommendedMapGas as any).co2Pct}% CO₂ / ${(c.recommendedMapGas as any).n2Pct}% N₂`
                              : String(c.recommendedMapGas)}
                          </div>
                        )}
                        {c.composition.respirationMlCO2KgHour != null && (
                          <div>Rate: {c.composition.respirationMlCO2KgHour} ml/kg-h @ {c.composition.respirationTemperatureC}°C</div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: GLOSSARY & SOURCES */}
        {activeTab === 'glossary' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Scientific Definitions */}
            <div className="card">
              <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-4)' }}>
                Packaging Barrier Terminology & Standard Measurement Protocols
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', fontSize: 'var(--font-size-sm)', lineHeight: 1.6 }}>
                <div>
                  <h3 style={{ fontSize: 'var(--font-size-md)', color: 'var(--color-primary)', marginBottom: '4px' }}>
                    OTR (Oxygen Transmission Rate)
                  </h3>
                  <p>
                    <strong>Standard Units:</strong> cm&sup3; / (m&sup2; &bull; day &bull; atm) or cc/(m&sup2; &bull; 24h).
                    <br />
                    OTR measures the volume of gaseous oxygen passing through a continuous plastic film per unit area and time under standard barometric pressure. Standard testing protocols (such as ASTM D3985 or ISO 15105) require exact control of temperature (e.g. 23&deg;C), relative humidity gradient (e.g. 0% or 50% RH), and certified micrometric film thickness. In this prototype, OTR values are displayed as <em>“not measured”</em> because synthetic approximations cannot substitute for physical coulometric sensor test results.
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: 'var(--space-4)' }}>
                  <h3 style={{ fontSize: 'var(--font-size-md)', color: 'var(--color-primary)', marginBottom: '4px' }}>
                    WVTR (Water Vapor Transmission Rate)
                  </h3>
                  <p>
                    <strong>Standard Units:</strong> g / (m&sup2; &bull; day).
                    <br />
                    WVTR quantifies the mass of moisture vapor permeating through a substrate under an applied relative humidity differential (e.g. 90% RH on one side, 0% RH on the dry side at 37.8&deg;C per ASTM F1249 / ISO 15106). Whole-pack assemblies with mechanical seals or micro-perforations require whole-package gravimetric cup testing rather than planar flat-film assumptions.
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: 'var(--space-4)' }}>
                  <h3 style={{ fontSize: 'var(--font-size-md)', color: 'var(--color-primary)', marginBottom: '4px' }}>
                    Breathability & Produce Gas Exchange
                  </h3>
                  <p>
                    Fresh produce (such as strawberries, tomatoes, and spinach) continues cellular respiration after harvesting, consuming O&sub2; and evolving CO&sub2; and water vapor. Airtight, high-barrier moisture/oxygen films lead to anaerobic fermentation, ethanol accumulation, and off-flavors. PackPramana hard rules require breathable formats (punnets with macroscopic vents or laser micro-perforated pouches) for all fresh commodities.
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: 'var(--space-4)' }}>
                  <h3 style={{ fontSize: 'var(--font-size-md)', color: 'var(--color-primary)', marginBottom: '4px' }}>
                    Food Contact Suitability
                  </h3>
                  <p>
                    Under Indian and international food packaging regulations (FSSAI Packaging Regulations, IS 9845, US FDA 21 CFR), plastic food packaging must undergo overall and specific migration testing using designated food simulants. All catalogue materials are labelled <em>“supplier_verification_pending”</em> until lot-specific Migration Test Certificates are verified.
                  </p>
                </div>
              </div>
            </div>

            {/* Authoritative Sources */}
            <div className="card">
              <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-4)' }}>
                Authoritative Reference Literature & Frameworks
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
                {defaultSeedData.sources.map((src) => (
                  <div
                    key={src.id}
                    style={{
                      padding: 'var(--space-4)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-surface-subtle)',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: '4px' }}>
                      {src.title}
                    </div>
                    {src.scope && (
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)', flex: 1 }}>
                        {src.scope}
                      </div>
                    )}
                    {src.url ? (
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: 600,
                          marginTop: 'auto',
                        }}
                      >
                        <span>Official Source Link</span>
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-faint)', fontStyle: 'italic' }}>
                        Authored fixture data
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
