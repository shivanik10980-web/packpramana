import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useScenario } from '../context/ScenarioContext';
import {
  Package,
  Layers,
  Sparkles,
  Sliders,
  History,
  BookOpen,
  FileText,
  Sun,
  Moon,
  Laptop,
  Menu,
  X,
} from 'lucide-react';

interface NavbarProps {
  currentRoute: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute }) => {
  const { theme, effectiveTheme, setTheme } = useTheme();
  const { input, result } = useScenario();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cycleTheme = () => {
    if (theme === 'system') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('system');
  };

  const navItems = [
    { route: '#/', label: 'Home', icon: Package },
    { route: '#/scenario', label: 'New Scenario', icon: Sliders },
    { route: '#/results', label: 'Results', icon: Sparkles },
    { route: '#/compare', label: 'Compare', icon: Layers },
    { route: '#/what-if', label: 'What-If', icon: Sliders },
    { route: '#/history', label: 'History', icon: History },
    { route: '#/catalogue', label: 'Catalogue', icon: BookOpen },
    { route: '#/report', label: 'Decision Report', icon: FileText },
  ];

  return (
    <header
      className="no-print"
      style={{
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '64px',
          gap: 'var(--space-4)',
        }}
      >
        {/* Brand */}
        <a
          href="#/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-primary-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '18px',
            }}
          >
            P
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 'var(--font-size-md)', lineHeight: 1.1 }}>
              PackPramana
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--color-text-muted)',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
              }}
            >
              Food Packaging Decision Studio
            </div>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav
          aria-label="Main Navigation"
          style={{
            display: 'none',
            alignItems: 'center',
            gap: 'var(--space-1)',
          }}
          className="desktop-nav"
        >
          {navItems.map((item) => {
            const isActive = currentRoute === item.route;
            const Icon = item.icon;
            return (
              <a
                key={item.route}
                href={item.route}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
                  backgroundColor: isActive ? 'var(--color-primary-subtle)' : 'transparent',
                  transition: 'background-color var(--transition-fast)',
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Actions & Theme */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          {result && (
            <div
              className="active-commodity-pill"
              style={{
                display: 'none',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-surface-sunken)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor:
                    result.status === 'demo_shortlist'
                      ? 'var(--color-success)'
                      : result.status === 'review_required'
                      ? 'var(--color-warning)'
                      : 'var(--color-danger)',
                }}
              />
              <span style={{ textTransform: 'capitalize' }}>{input.commodityId}</span>
              <span style={{ color: 'var(--color-text-muted)' }}>
                ({result.candidates.length} eligible)
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={cycleTheme}
            className="btn-secondary btn-sm"
            aria-label={`Current theme: ${theme}. Click to switch theme`}
            title={`Theme: ${theme} (Click to switch)`}
            style={{ width: '40px', padding: 0 }}
          >
            {theme === 'system' ? (
              <Laptop size={18} />
            ) : effectiveTheme === 'dark' ? (
              <Moon size={18} />
            ) : (
              <Sun size={18} />
            )}
          </button>

          {/* Mobile hamburger toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn-secondary btn-sm mobile-menu-toggle"
            aria-label="Toggle navigation menu"
            style={{ width: '40px', padding: 0 }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            borderTop: '1px solid var(--color-border)',
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'var(--color-surface)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
          }}
        >
          {navItems.map((item) => {
            const isActive = currentRoute === item.route;
            const Icon = item.icon;
            return (
              <a
                key={item.route}
                href={item.route}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: '10px var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  fontSize: 'var(--font-size-base)',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
                  backgroundColor: isActive ? 'var(--color-primary-subtle)' : 'transparent',
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </div>
      )}

      <style>{`
        @media (min-width: 900px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-toggle {
            display: none !important;
          }
          .active-commodity-pill {
            display: inline-flex !important;
          }
        }
      `}</style>
    </header>
  );
};
