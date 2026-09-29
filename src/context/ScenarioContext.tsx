import React, { createContext, useContext, useState } from 'react';
import type { ScenarioInput, EngineResult, SavedScenario } from '../domain/types';
import { recommend, defaultSeedData } from '../engine';
import { scenarioRepository } from '../storage/scenarioRepository';

export const DEFAULT_INPUT: ScenarioInput = {
  commodityId: 'strawberry',
  storageType: 'chilled',
  temperatureC: 4,
  relativeHumidityPct: 90,
  targetDays: 5,
  distanceKm: 120,
  transportSeverity: 'normal',
  packMassG: 250,
  budgetInrPerPack: 8,
  costPriority: 'balanced',
};

interface ScenarioContextType {
  input: ScenarioInput;
  result: EngineResult;
  savedId: string | null;
  scenarioName: string;
  setScenarioName: (name: string) => void;
  whatIfInput: ScenarioInput | null;
  whatIfResult: EngineResult | null;
  compareIds: string[];
  runScenario: (newInput: ScenarioInput, name?: string) => EngineResult;
  loadDemo: (demoId: 'strawberry' | 'turmeric') => void;
  loadSaved: (scenario: SavedScenario) => void;
  applyWhatIf: (newWhatIf: ScenarioInput) => void;
  restoreWhatIf: () => void;
  toggleCompareId: (candidateId: string) => void;
  saveCurrentScenario: (name: string, note?: string) => { success: boolean; error?: string };
}

const ScenarioContext = createContext<ScenarioContextType | undefined>(undefined);

export const ScenarioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [input, setInput] = useState<ScenarioInput>(() => {
    const draft = scenarioRepository.getDraft();
    return draft || DEFAULT_INPUT;
  });

  const [scenarioName, setScenarioName] = useState<string>('Strawberry Chilled Baseline');
  const [savedId, setSavedId] = useState<string | null>(null);

  const [result, setResult] = useState<EngineResult>(() => recommend(input));

  const [whatIfInput, setWhatIfInput] = useState<ScenarioInput | null>(null);
  const [whatIfResult, setWhatIfResult] = useState<EngineResult | null>(null);

  const [compareIds, setCompareIds] = useState<string[]>(() => {
    const initial = recommend(input);
    return initial.candidates.slice(0, 3).map((c) => c.id);
  });

  // Re-run recommendation and update state
  const runScenario = (newInput: ScenarioInput, name?: string): EngineResult => {
    const res = recommend(newInput);
    setInput(newInput);
    setResult(res);
    scenarioRepository.saveDraft(newInput);

    if (name) {
      setScenarioName(name);
    }
    setSavedId(null); // Fresh execution creates a new snapshot

    // Initialize compare with top survivors
    const topIds = res.candidates.slice(0, 3).map((c) => c.id);
    setCompareIds(topIds);

    // Reset what-if on new baseline
    setWhatIfInput(null);
    setWhatIfResult(null);

    return res;
  };

  const loadDemo = (demoId: 'strawberry' | 'turmeric') => {
    const foundDemo = defaultSeedData.demoScenarios.find((d) => d.id === demoId);
    if (!foundDemo) return;

    const { id, ...scenarioData } = foundDemo;
    const name = demoId === 'strawberry' ? 'Fresh Strawberry Demo' : 'Turmeric Powder Demo';
    runScenario(scenarioData, name);
    window.location.hash = '#/results';
    try {
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    } catch {
      window.dispatchEvent(new Event('hashchange'));
    }
  };

  const loadSaved = (saved: SavedScenario) => {
    // Preserve the original snapshot
    setInput(saved.input);
    setResult(saved.result);
    setSavedId(saved.id);
    setScenarioName(saved.name);
    setCompareIds(saved.result.candidates.slice(0, 3).map((c) => c.id));
    setWhatIfInput(null);
    setWhatIfResult(null);
    window.location.hash = '#/results';
    try {
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    } catch {
      window.dispatchEvent(new Event('hashchange'));
    }
  };

  const applyWhatIf = (newWhatIf: ScenarioInput) => {
    setWhatIfInput(newWhatIf);
    const res = recommend(newWhatIf);
    setWhatIfResult(res);
  };

  const restoreWhatIf = () => {
    setWhatIfInput(null);
    setWhatIfResult(null);
  };

  const toggleCompareId = (candidateId: string) => {
    setCompareIds((prev) => {
      if (prev.includes(candidateId)) {
        if (prev.length <= 1) return prev; // Keep at least one
        return prev.filter((id) => id !== candidateId);
      } else {
        if (prev.length >= 3) {
          // Replace the last one to stay at max 3
          return [prev[0], prev[1], candidateId];
        }
        return [...prev, candidateId];
      }
    });
  };

  const saveCurrentScenario = (name: string, note?: string) => {
    const saveRes = scenarioRepository.save(name, input, result, note);
    if (saveRes.success && saveRes.scenario) {
      setSavedId(saveRes.scenario.id);
      setScenarioName(saveRes.scenario.name);
      return { success: true };
    }
    return { success: false, error: saveRes.error || 'Failed to save scenario' };
  };

  return (
    <ScenarioContext.Provider
      value={{
        input,
        result,
        savedId,
        scenarioName,
        setScenarioName,
        whatIfInput,
        whatIfResult,
        compareIds,
        runScenario,
        loadDemo,
        loadSaved,
        applyWhatIf,
        restoreWhatIf,
        toggleCompareId,
        saveCurrentScenario,
      }}
    >
      {children}
    </ScenarioContext.Provider>
  );
};

export const useScenario = (): ScenarioContextType => {
  const context = useContext(ScenarioContext);
  if (!context) {
    throw new Error('useScenario must be used within a ScenarioProvider');
  }
  return context;
};
