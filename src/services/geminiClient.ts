import { GoogleGenAI } from '@google/genai';

const LOCAL_STORAGE_KEY = 'packpramana_gemini_api_key';
const LOCAL_STORAGE_MODEL_KEY = 'packpramana_gemini_model';
const DEFAULT_MODEL = 'gemini-2.5-flash';

export function getGeminiApiKey(): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    const customKey = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (customKey && customKey.trim().length > 0) {
      return customKey.trim();
    }
  }

  const envKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (envKey && envKey.trim().length > 0 && !envKey.includes('placeholder')) {
    return envKey.trim();
  }

  return null;
}

export function setCustomGeminiKey(key: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    if (key.trim()) {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, key.trim());
    } else {
      window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }
}

export function clearCustomGeminiKey(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
}

export function isGeminiConfigured(): boolean {
  return Boolean(getGeminiApiKey());
}

export function getSelectedModel(): string {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem(LOCAL_STORAGE_MODEL_KEY) || DEFAULT_MODEL;
  }
  return DEFAULT_MODEL;
}

export function setSelectedModel(model: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(LOCAL_STORAGE_MODEL_KEY, model);
  }
}

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  try {
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
    return null;
  }
}
