import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { SavedScenario } from '../domain/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.trim().length > 0 &&
    supabaseAnonKey.trim().length > 0 &&
    !supabaseUrl.includes('placeholder')
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

export interface CloudSyncResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function uploadScenarioToCloud(scenario: SavedScenario): Promise<CloudSyncResult<SavedScenario>> {
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable cloud sync.',
    };
  }

  try {
    const { error } = await supabase.from('packpramana_scenarios').upsert(
      {
        id: scenario.id,
        name: scenario.name,
        created_at: scenario.createdAt,
        updated_at: scenario.updatedAt,
        schema_version: scenario.schemaVersion,
        input: scenario.input,
        result: scenario.result,
        note: scenario.note ?? null,
      },
      { onConflict: 'id' }
    );

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: scenario };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to upload scenario to Supabase' };
  }
}

export async function fetchCloudScenarios(): Promise<CloudSyncResult<SavedScenario[]>> {
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase is not configured.',
    };
  }

  try {
    const { data, error } = await supabase
      .from('packpramana_scenarios')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    const scenarios: SavedScenario[] = (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      schemaVersion: row.schema_version,
      input: row.input,
      result: row.result,
      note: row.note ?? undefined,
    }));

    return { success: true, data: scenarios };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to fetch scenarios from Supabase' };
  }
}

export async function deleteCloudScenario(id: string): Promise<CloudSyncResult<void>> {
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase is not configured.',
    };
  }

  try {
    const { error } = await supabase.from('packpramana_scenarios').delete().eq('id', id);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete scenario from Supabase' };
  }
}
