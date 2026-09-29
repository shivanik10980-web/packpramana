// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from '../App';
import { scenarioRepository } from '../storage/scenarioRepository';

describe('PackPramana Full End-to-End Component and Flow Verification', () => {
  beforeEach(() => {
    scenarioRepository.clearAll();
    window.location.hash = '#/';
  });

  it('renders Home view with brand promise, 3-step pipeline, and prototype notice', () => {
    render(<App />);

    expect(screen.getAllByText(/PackPramana/i).length).toBeGreaterThan(0);
    expect(
      screen.getByText(/Intelligent, explainable food packaging recommendations/i)
    ).toBeDefined();
    expect(screen.getByText(/Start New Recommendation/i)).toBeDefined();
    expect(document.getElementById('btn-run-strawberry-demo')).not.toBeNull();
    expect(document.getElementById('btn-run-turmeric-demo')).not.toBeNull();
    expect(screen.getByText(/Prototype Data & Rule Governance Notice/i)).toBeDefined();
  });

  it('executes Strawberry demo and verifies results, tie-break, and rejected candidates', async () => {
    render(<App />);

    const strawberryBtn = document.getElementById('btn-run-strawberry-demo');
    expect(strawberryBtn).not.toBeNull();

    await act(async () => {
      fireEvent.click(strawberryBtn!);
    });

    // Should switch route to results and display top candidate
    expect(window.location.hash).toBe('#/results');

    // Top candidate: Vented PP punnet (p02) at 96.0 pts
    expect(screen.getAllByText('Vented PP punnet').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Primary Recommendation').length).toBeGreaterThan(0);

    // Check tie break explanation
    expect(screen.getAllByText(/Tie-Break Resolution:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Tied with Vented PET punnet/i).length).toBeGreaterThan(0);

    // Check rejected candidates section
    expect(screen.getAllByText(/Rejected Ineligible Formats/i).length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/Fresh produce requires breathable format in demo rules/i).length
    ).toBeGreaterThan(0);
  });

  it('verifies Compare view with consistent rows and "not measured" values', () => {
    window.location.hash = '#/compare';
    render(<App />);

    expect(screen.getByText(/Candidate Packaging Comparison/i)).toBeDefined();
    expect(screen.getByText(/Material Structure/i)).toBeDefined();
    expect(screen.getByText(/Pack Format/i)).toBeDefined();
    expect(screen.getByText(/Gas Exchange \/ Breathability/i)).toBeDefined();

    // Verify unmeasured laboratory parameters display 'not measured'
    const notMeasuredElements = screen.getAllByText(/not measured/i);
    expect(notMeasuredElements.length).toBeGreaterThan(0);
  });

  it('verifies What-If simulation diff and restore baseline functionality', () => {
    window.location.hash = '#/what-if';
    render(<App />);

    expect(screen.getByText(/What-If Parameter Stress Testing/i)).toBeDefined();
    const applyBtn = document.getElementById('btn-apply-whatif');
    const restoreBtn = document.getElementById('btn-restore-baseline');

    expect(applyBtn).not.toBeNull();
    expect(restoreBtn).not.toBeNull();

    // Apply baseline as simulation
    fireEvent.click(applyBtn!);

    // Verify outcome diff displays
    expect(screen.getByText(/Simulation Outcome Diff/i)).toBeDefined();
  });

  it('verifies Catalogue view with commodities, packaging, and glossary', () => {
    window.location.hash = '#/catalogue';
    render(<App />);

    expect(screen.getByText(/Catalogue & Scientific Glossary/i)).toBeDefined();

    // Click glossary tab
    const glossaryTab = screen.getByRole('button', { name: /Glossary & Sources/i });
    fireEvent.click(glossaryTab);

    expect(screen.getAllByText(/OTR \(Oxygen Transmission Rate\)/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/WVTR \(Water Vapor Transmission Rate\)/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Breathability & Produce Gas Exchange/i)).toBeDefined();
  });

  it('verifies Printable Decision Report with rules version and disclaimer', () => {
    window.location.hash = '#/report';
    render(<App />);

    expect(screen.getByText(/PackPramana Decision Report/i)).toBeDefined();
    expect(screen.getByText(/1\. Scenario Input Assumptions/i)).toBeDefined();
    expect(screen.getByText(/3\. Ranked Eligible Candidates/i)).toBeDefined();
    expect(screen.getByText(/5\. Transparent Scoring Methodology/i)).toBeDefined();
    expect(screen.getByText(/6\. Verification Gaps & Prototype Data Disclosures/i)).toBeDefined();
  });
});
