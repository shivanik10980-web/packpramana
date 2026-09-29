import { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ScenarioProvider } from './context/ScenarioContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

import { HomeView } from './features/home/HomeView';
import { ScenarioFormView } from './features/scenario/ScenarioFormView';
import { ResultsView } from './features/results/ResultsView';
import { CompareView } from './features/compare/CompareView';
import { WhatIfView } from './features/whatif/WhatIfView';
import { HistoryView } from './features/history/HistoryView';
import { PrintableReportView } from './features/report/PrintableReportView';
import { CatalogueView } from './features/catalogue/CatalogueView';

export function AppContent() {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.hash || '#/';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#/';
      setCurrentRoute(hash);
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderView = () => {
    switch (currentRoute) {
      case '#/':
        return <HomeView />;
      case '#/scenario':
        return <ScenarioFormView />;
      case '#/results':
        return <ResultsView />;
      case '#/compare':
        return <CompareView />;
      case '#/what-if':
        return <WhatIfView />;
      case '#/history':
        return <HistoryView />;
      case '#/report':
        return <PrintableReportView />;
      case '#/catalogue':
        return <CatalogueView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Navbar currentRoute={currentRoute} />

      <main id="main-content" tabIndex={-1} style={{ flex: 1 }}>
        <ErrorBoundary>{renderView()}</ErrorBoundary>
      </main>

      <Footer />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ScenarioProvider>
        <AppContent />
      </ScenarioProvider>
    </ThemeProvider>
  );
}
