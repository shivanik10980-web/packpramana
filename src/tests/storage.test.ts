import { describe, it, expect, beforeEach } from 'vitest';
import { scenarioRepository, getStorage, STORAGE_KEY } from '../storage/scenarioRepository';
import type { ScenarioInput, EngineResult } from '../domain/types';

describe('ScenarioRepository Snapshot and Error Recovery Tests', () => {
  const dummyInput: ScenarioInput = {
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

  const dummyResult: EngineResult = {
    status: 'demo_shortlist',
    reasons: [],
    candidates: [],
    rejected: [],
    targets: { moisture: 0, oxygen: 0, light: 0, grease: 0, mechanical: 3 },
    rulesVersion: 'rules-1.0',
    catalogueVersion: 'demo-1.0',
    evidenceStatus: 'synthetic_demo',
  };

  beforeEach(() => {
    scenarioRepository.clearAll();
  });

  it('saves and retrieves a scenario with immutable snapshot', () => {
    const saveRes = scenarioRepository.save('Test Run 1', dummyInput, dummyResult);
    expect(saveRes.success).toBe(true);
    expect(saveRes.scenario).toBeDefined();

    const retrieved = scenarioRepository.getById(saveRes.scenario!.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.name).toBe('Test Run 1');
    expect(retrieved?.input.commodityId).toBe('strawberry');
  });

  it('prevents saving an identical scenario under the same name', () => {
    scenarioRepository.save('Duplicate Test', dummyInput, dummyResult);
    const secondSave = scenarioRepository.save('Duplicate Test', dummyInput, dummyResult);

    expect(secondSave.success).toBe(false);
    expect(secondSave.error).toContain('already exists');
  });

  it('renames and duplicates scenarios', () => {
    const s1 = scenarioRepository.save('Base Scenario', dummyInput, dummyResult).scenario!;
    const renamed = scenarioRepository.rename(s1.id, 'Renamed Scenario');
    expect(renamed).toBe(true);

    const checkRenamed = scenarioRepository.getById(s1.id);
    expect(checkRenamed?.name).toBe('Renamed Scenario');

    const duplicated = scenarioRepository.duplicate(s1.id);
    expect(duplicated).not.toBeNull();
    expect(duplicated?.name).toContain('(Copy)');
    expect(duplicated?.input.commodityId).toBe('strawberry');
  });

  it('deletes and undoes deletion cleanly', () => {
    const s1 = scenarioRepository.save('To Delete', dummyInput, dummyResult).scenario!;
    const delRes = scenarioRepository.delete(s1.id);
    expect(delRes.success).toBe(true);
    expect(scenarioRepository.getById(s1.id)).toBeNull();

    const undoRes = scenarioRepository.undoDelete();
    expect(undoRes).toBe(true);
    expect(scenarioRepository.getById(s1.id)).not.toBeNull();
  });

  it('safely recovers from corrupt localStorage entries without crashing', () => {
    getStorage().setItem(
      STORAGE_KEY,
      JSON.stringify([
        { id: 'corrupt_item', badField: true }, // missing required fields
        {
          id: 'valid_item',
          name: 'Valid One',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          schemaVersion: 1,
          input: dummyInput,
          result: dummyResult,
        },
      ])
    );

    const { scenarios, corruptedCount } = scenarioRepository.getAll();
    expect(corruptedCount).toBe(1);
    expect(scenarios.length).toBe(1);
    expect(scenarios[0].id).toBe('valid_item');
  });

  it('imports valid cloud scenarios and updates existing scenarios cleanly', () => {
    const cloudItem = {
      id: 'cloud_scen_123',
      name: 'Cloud Strawberry Batch',
      createdAt: '2026-03-29T10:00:00.000Z',
      updatedAt: '2026-03-29T10:00:00.000Z',
      schemaVersion: 1,
      input: dummyInput,
      result: dummyResult,
      note: 'Fetched from Supabase',
    };

    const importRes = scenarioRepository.importScenario(cloudItem);
    expect(importRes.success).toBe(true);

    const fetched = scenarioRepository.getById('cloud_scen_123');
    expect(fetched).not.toBeNull();
    expect(fetched?.name).toBe('Cloud Strawberry Batch');
    expect(fetched?.note).toBe('Fetched from Supabase');

    // Update the same cloud item
    const updatedCloudItem = {
      ...cloudItem,
      name: 'Cloud Strawberry Batch (Updated)',
    };
    const updateRes = scenarioRepository.importScenario(updatedCloudItem);
    expect(updateRes.success).toBe(true);
    expect(scenarioRepository.getById('cloud_scen_123')?.name).toBe('Cloud Strawberry Batch (Updated)');
    expect(scenarioRepository.getAll().scenarios.length).toBe(1);

    // Rejects invalid payload
    const badRes = scenarioRepository.importScenario({} as any);
    expect(badRes.success).toBe(false);
  });
});
