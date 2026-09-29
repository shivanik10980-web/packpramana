import { ShieldAlert, BookOpen } from 'lucide-react';
import { defaultSeedData } from '../engine';

export const Footer: React.FC = () => {
  return (
    <footer
      className="no-print"
      style={{
        borderTop: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        marginTop: 'auto',
        padding: 'var(--space-8) 0 var(--space-6) 0',
      }}
    >
      <div className="container">
        {/* Synthetic Prototype Notice Banner */}
        <div
          className="alert-box alert-warning"
          style={{
            marginBottom: 'var(--space-6)',
            fontSize: 'var(--font-size-sm)',
            lineHeight: 1.5,
          }}
        >
          <ShieldAlert size={20} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--color-warning)' }} />
          <div>
            <strong>Transparent Prototype Notice: </strong>
            {defaultSeedData.disclaimer} All scoring, candidate capabilities, barrier thresholds, and economic estimations are authored synthetic test fixtures. Never treat this system as validated food-safety advice, certified shelf-life predictions, or supplier quotes.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 'var(--space-4)',
            paddingTop: 'var(--space-4)',
            borderTop: '1px solid var(--color-border-subtle)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-muted)',
          }}
        >
          <div>
            <strong>PackPramana</strong> &bull; SIH26236 Food Packaging Decision Studio
            <span style={{ margin: '0 var(--space-2)' }}>|</span>
            Catalogue: <code>{defaultSeedData.catalogueVersion}</code>
            <span style={{ margin: '0 var(--space-2)' }}>|</span>
            Rules: <code>{defaultSeedData.rulesVersion}</code>
            <span style={{ margin: '0 var(--space-2)' }}>|</span>
            Schema: <code>v{defaultSeedData.schemaVersion}</code>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
            <a
              href="#/catalogue"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              <BookOpen size={14} />
              <span>Evidence Sources & Glossary</span>
            </a>
            <span style={{ color: 'var(--color-border-strong)' }}>&bull;</span>
            <span>Local Browser Storage &bull; No Secret Keys Required</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
