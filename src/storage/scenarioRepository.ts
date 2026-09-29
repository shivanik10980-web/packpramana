import { z } from 'zod';
import type { SavedScenario, ScenarioInput, EngineResult } from '../domain/types';

const SCHEMA_VERSION = 1;
const STORAGE_KEY = 'packpramana_saved_scenarios_v1';
const DRAFT_KEY = 'packpramana_scenario_draft_v1';

// Strict Zod schema for validation
export const ScenarioInputSchema = z.object({
  commodityId: z.string().min(1),
  storageType: z.enum(['ambient', 'chilled', 'frozen']),
  temperatureC: z.number(),
  relativeHumidityPct: z.number().min(0).max(100),
  targetDays: z.number().positive(),
  distanceKm: z.number().nonnegative(),
  transportSeverity: z.enum(['gentle', 'normal', 'rough']),
  packMassG: z.number().positive(),
  budgetInrPerPack: z.number().positive(),
  costPriority: z.enum(['balanced', 'cost']),
  composition: z
    .object({
      moisturePct: z.number().nullable().optional(),
      fatPct: z.number().nullable().optional(),
      pH: z.number().nullable().optional(),
      respirationMlCO2KgHour: z.number().nullable().optional(),
      respirationTemperatureC: z.number().nullable().optional(),
    })
    .optional(),
});

export const SavedScenarioSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  schemaVersion: z.number(),
  input: ScenarioInputSchema,
  result: z.object({
    status: z.enum(['demo_shortlist', 'review_required', 'invalid', 'no_match']),
    reasons: z.array(z.string()),
    candidates: z.array(z.any()),
    rejected: z.array(z.any()),
    targets: z.any().nullable(),
    rulesVersion: z.string(),
    catalogueVersion: z.string(),
    evidenceStatus: z.string(),
  }),
  note: z.string().optional(),
});

class MemoryStorage {
  private store: Map<string, string> = new Map();
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, val: string): void {
    this.store.set(key, val);
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}

const memoryStore = new MemoryStorage();

function getStorage(): { getItem: (k: string) => string | null; setItem: (k: string, v: string) => void; removeItem: (k: string) => void; clear?: () => void } {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return memoryStore;
}

export class ScenarioRepository {
  private lastDeleted: SavedScenario | null = null;

  getAll(): { scenarios: SavedScenario[]; corruptedCount: number; storageError?: string } {
    try {
      const storage = getStorage();
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return { scenarios: [], corruptedCount: 0 };

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return { scenarios: [], corruptedCount: 1, storageError: 'Corrupt storage format: expected array.' };
      }

      const validList: SavedScenario[] = [];
      let corrupted = 0;

      for (const item of parsed) {
        const check = SavedScenarioSchema.safeParse(item);
        if (check.success) {
          validList.push(check.data as SavedScenario);
        } else {
          corrupted++;
        }
      }

      return { scenarios: validList, corruptedCount: corrupted };
    } catch (err) {
      return {
        scenarios: [],
        corruptedCount: 1,
        storageError: err instanceof Error ? err.message : 'Failed to parse stored scenarios',
      };
    }
  }

  getById(id: string): SavedScenario | null {
    const { scenarios } = this.getAll();
    return scenarios.find((s) => s.id === id) || null;
  }

  save(
    name: string,
    input: ScenarioInput,
    result: EngineResult,
    note?: string
  ): { success: boolean; scenario?: SavedScenario; error?: string } {
    try {
      const { scenarios } = this.getAll();

      // Check for exact duplicate input to prevent spamming
      const isDuplicate = scenarios.some((s) => {
        return (
          s.input.commodityId === input.commodityId &&
          s.input.storageType === input.storageType &&
          s.input.temperatureC === input.temperatureC &&
          s.input.relativeHumidityPct === input.relativeHumidityPct &&
          s.input.targetDays === input.targetDays &&
          s.input.distanceKm === input.distanceKm &&
          s.input.transportSeverity === input.transportSeverity &&
          s.input.packMassG === input.packMassG &&
          s.input.budgetInrPerPack === input.budgetInrPerPack &&
          s.input.costPriority === input.costPriority &&
          s.name.trim().toLowerCase() === name.trim().toLowerCase()
        );
      });

      if (isDuplicate) {
        return {
          success: false,
          error: 'An identical scenario with this name and parameters already exists in history.',
        };
      }

      const id = `scen_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const now = new Date().toISOString();

      const newScenario: SavedScenario = {
        id,
        name: name.trim() || `Scenario ${new Date().toLocaleTimeString()}`,
        createdAt: now,
        updatedAt: now,
        schemaVersion: SCHEMA_VERSION,
        input: JSON.parse(JSON.stringify(input)), // Deep clone snapshot
        result: JSON.parse(JSON.stringify(result)), // Deep clone snapshot
        note,
      };

      const updated = [newScenario, ...scenarios];
      getStorage().setItem(STORAGE_KEY, JSON.stringify(updated));

      return { success: true, scenario: newScenario };
    } catch (err: any) {
      if (err.name === 'QuotaExceededError' || err.code === 22) {
        return {
          success: false,
          error: 'Browser storage quota exceeded. Please delete older scenarios to free up space.',
        };
      }
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown storage error',
      };
    }
  }

  rename(id: string, newName: string): boolean {
    const { scenarios } = this.getAll();
    const index = scenarios.findIndex((s) => s.id === id);
    if (index === -1) return false;

    scenarios[index].name = newName.trim();
    scenarios[index].updatedAt = new Date().toISOString();

    try {
      getStorage().setItem(STORAGE_KEY, JSON.stringify(scenarios));
      return true;
    } catch {
      return false;
    }
  }

  duplicate(id: string): SavedScenario | null {
    const existing = this.getById(id);
    if (!existing) return null;

    const dupName = `${existing.name} (Copy)`;
    const saveRes = this.save(dupName, existing.input, existing.result, existing.note);
    return saveRes.scenario || null;
  }

  delete(id: string): { success: boolean; deleted?: SavedScenario } {
    const { scenarios } = this.getAll();
    const target = scenarios.find((s) => s.id === id);
    if (!target) return { success: false };

    const remaining = scenarios.filter((s) => s.id !== id);
    try {
      getStorage().setItem(STORAGE_KEY, JSON.stringify(remaining));
      this.lastDeleted = target;
      return { success: true, deleted: target };
    } catch {
      return { success: false };
    }
  }

  undoDelete(): boolean {
    if (!this.lastDeleted) return false;
    const { scenarios } = this.getAll();
    const updated = [this.lastDeleted, ...scenarios];
    try {
      getStorage().setItem(STORAGE_KEY, JSON.stringify(updated));
      this.lastDeleted = null;
      return true;
    } catch {
      return false;
    }
  }

  importScenario(scenario: SavedScenario): { success: boolean; imported?: SavedScenario; error?: string } {
    try {
      const check = SavedScenarioSchema.safeParse(scenario);
      if (!check.success) {
        return { success: false, error: 'Invalid scenario payload schema' };
      }
      const { scenarios } = this.getAll();
      const existingIndex = scenarios.findIndex((s) => s.id === scenario.id);
      let updated: SavedScenario[];
      if (existingIndex >= 0) {
        updated = [...scenarios];
        updated[existingIndex] = scenario;
      } else {
        updated = [scenario, ...scenarios];
      }
      getStorage().setItem(STORAGE_KEY, JSON.stringify(updated));
      return { success: true, imported: scenario };
    } catch (err: any) {
      return { success: false, error: err instanceof Error ? err.message : 'Storage write failed' };
    }
  }

  saveDraft(input: ScenarioInput): void {
    try {
      getStorage().setItem(DRAFT_KEY, JSON.stringify(input));
    } catch {
      // Ignore draft save failures
    }
  }

  getDraft(): ScenarioInput | null {
    try {
      const raw = getStorage().getItem(DRAFT_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const check = ScenarioInputSchema.safeParse(parsed);
      return check.success ? (check.data as ScenarioInput) : null;
    } catch {
      return null;
    }
  }

  clearDraft(): void {
    try {
      getStorage().removeItem(DRAFT_KEY);
    } catch {
      // Ignore
    }
  }

  clearAll(): void {
    const storage = getStorage();
    if (storage.clear) {
      storage.clear();
    } else {
      storage.removeItem(STORAGE_KEY);
      storage.removeItem(DRAFT_KEY);
    }
  }
}

export const scenarioRepository = new ScenarioRepository();
export { getStorage, STORAGE_KEY };
