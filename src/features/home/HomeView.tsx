import React from 'react';
import { useScenario } from '../../context/ScenarioContext';
import {
  PackageCheck,
  Play,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { defaultSeedData } from '../../engine';

export const HomeView: React.FC = () => {
  const { loadDemo } = useScenario();

  return (
    <div style={{ padding: 'var(--space-8) 0 var(--space-12) 0' }}>
      <div className="container">
        {/* Editorial Hero Section */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 'var(--space-8)',
            alignItems: 'center',
            marginBottom: 'var(--space-12)',
          }}
        >
          <div style={{ maxWidth: '820px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-primary-subtle)',
                color: 'var(--color-primary)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 'var(--space-4)',
              }}
            >
              <PackageCheck size={14} />
              SIH26236 Food Packaging Decision Studio
            </div>

            <h1
              style={{
                fontSize: 'clamp(2rem, 4vw, 3.25rem)',
                lineHeight: 1.15,
                marginBottom: 'var(--space-4)',
                color: 'var(--color-text)',
              }}
            >
              Intelligent, explainable food packaging recommendations for small food processors.
            </h1>

            <p
              style={{
                fontSize: 'var(--font-size-lg)',
                lineHeight: 1.6,
                color: 'var(--color-text-muted)',
                marginBottom: 'var(--space-6)',
              }}
            >
              Author-driven, reproducible packaging material evaluations for fresh produce and dry foods based on physical barrier targets, supply chain distribution stresses, and verified unit economics.
            </p>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--space-4)',
                alignItems: 'center',
              }}
            >
              <a href="#/scenario" className="btn-primary" style={{ textDecoration: 'none' }}>
                <span>Start New Recommendation</span>
                <ArrowRight size={18} />
              </a>

              <button
                type="button"
                onClick={() => loadDemo('strawberry')}
                className="btn-secondary"
                id="btn-run-strawberry-demo"
              >
                <Play size={16} />
                <span>Run Strawberry Demo</span>
              </button>

              <button
                type="button"
                onClick={() => loadDemo('turmeric')}
                className="btn-outline"
                id="btn-run-turmeric-demo"
              >
                <Play size={16} />
                <span>Run Turmeric Demo</span>
              </button>
            </div>
          </div>
        </section>

        {/* Transparent Prototype Notice */}
        <section
          style={{
            backgroundColor: 'var(--color-surface-sunken)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-6)',
            marginBottom: 'var(--space-12)',
            display: 'flex',
            gap: 'var(--space-4)',
            alignItems: 'flex-start',
          }}
        >
          <AlertCircle size={24} style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h2 style={{ fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-1)' }}>
              Prototype Data & Rule Governance Notice
            </h2>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              {defaultSeedData.disclaimer} PackPramana uses deterministic authored rules (rules-1.0) and synthetic catalogue fixtures (demo-1.0). When empirical measurements like OTR or WVTR are absent, the studio explicitly displays “not measured” or “expert review required” instead of inventing plausible laboratory numbers.
            </p>
          </div>
        </section>

        {/* 3-Step Decision Flow */}
        <section style={{ marginBottom: 'var(--space-12)' }}>
          <div style={{ textAlign: 'left', marginBottom: 'var(--space-8)' }}>
            <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-2)' }}>
              How PackPramana Evaluates Packaging
            </h2>
            <p style={{ color: 'var(--color-text-muted)' }}>
              A 3-step transparent evaluation pipeline engineered for reproducible decisions without opaque black-box scoring.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-6)',
            }}
          >
            {/* Step 1 */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary-subtle)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '18px',
                  marginBottom: 'var(--space-4)',
                }}
              >
                1
              </div>
              <h3 style={{ fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-2)' }}>
                Food & Distribution Inputs
              </h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', lineHeight: 1.5, flex: 1 }}>
                Select commodity from authored fixtures, specify storage temperature, ambient humidity, travel distance, transport severity, and packaging unit budget.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary-subtle)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '18px',
                  marginBottom: 'var(--space-4)',
                }}
              >
                2
              </div>
              <h3 style={{ fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-2)' }}>
                Hard Gating & Multi-Attribute Scoring
              </h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', lineHeight: 1.5, flex: 1 }}>
                Ineligible formats (e.g. unvented packs for respiring produce, low mechanical rating for rough transit) are rejected with explicit reasons. Surviving candidates are scored on Requirement Fit, Budget, Transport Margin, Temperature Margin, and End-of-Life route.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary-subtle)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '18px',
                  marginBottom: 'var(--space-4)',
                }}
              >
                3
              </div>
              <h3 style={{ fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-2)' }}>
                Compare, What-If & Printable Reports
              </h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', lineHeight: 1.5, flex: 1 }}>
                Inspect side-by-side barrier specifications, simulate supply chain perturbations in what-if mode, persist versioned history locally, and print an audit-ready PDF decision report.
              </p>
            </div>
          </div>
        </section>

        {/* Seed Commodities Overview */}
        <section className="card">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 'var(--space-4)',
            }}
          >
            <div>
              <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-1)' }}>
                Covered Commodity Fixtures ({defaultSeedData.commodities.length})
              </h2>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                Each seed commodity has calibrated baseline composition, storage thresholds, and ordinal barrier targets.
              </p>
            </div>
            <a href="#/catalogue" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
              View Complete Catalogue &rarr;
            </a>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 'var(--space-3)',
            }}
          >
            {defaultSeedData.commodities.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{c.name}</span>
                  <span className={`badge ${c.category === 'fresh' ? 'badge-fresh' : 'badge-dry'}`}>
                    {c.category}
                  </span>
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                  Storage: {c.storageType} ({c.temperatureC[0]}°C to {c.temperatureC[1]}°C) &bull; Max: {c.prototypeMaxDays}d
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
