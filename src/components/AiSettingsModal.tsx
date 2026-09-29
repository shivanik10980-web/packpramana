import React, { useState } from 'react';
import {
  getGeminiApiKey,
  setCustomGeminiKey,
  clearCustomGeminiKey,
  isGeminiConfigured,
  getSelectedModel,
  setSelectedModel,
} from '../services/geminiClient';
import { Sparkles, Key, CheckCircle2, AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated?: () => void;
}

export const AiSettingsModal: React.FC<Props> = ({ isOpen, onClose, onKeyUpdated }) => {
  const [apiKey, setApiKey] = useState<string>(() => getGeminiApiKey() || '');
  const [model, setModel] = useState<string>(() => getSelectedModel());
  const [testStatus, setTestStatus] = useState<{
    loading?: boolean;
    success?: boolean;
    message?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      setCustomGeminiKey(apiKey.trim());
    } else {
      clearCustomGeminiKey();
    }
    setSelectedModel(model);
    onKeyUpdated?.();
    setTestStatus({ success: true, message: 'Gemini settings saved successfully.' });
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleTestConnection = async () => {
    const keyToTest = apiKey.trim() || getGeminiApiKey();
    if (!keyToTest) {
      setTestStatus({ success: false, message: 'Please enter a Gemini API key first.' });
      return;
    }

    setTestStatus({ loading: true, message: 'Testing connection to Gemini API...' });
    try {
      const client = new GoogleGenAI({ apiKey: keyToTest });
      const res = await client.models.generateContent({
        model,
        contents: 'Confirm connection in 5 words: Food packaging intelligence ready.',
      });

      if (res.text) {
        setTestStatus({
          success: true,
          message: `Connected successfully! Response: "${res.text.trim()}"`,
        });
      } else {
        setTestStatus({ success: false, message: 'Connection succeeded but returned empty response.' });
      }
    } catch (err: any) {
      setTestStatus({
        success: false,
        message: err.message || 'Failed to connect. Please verify your API key and quota.',
      });
    }
  };

  const handleClear = () => {
    clearCustomGeminiKey();
    setApiKey('');
    onKeyUpdated?.();
    setTestStatus({ message: 'Saved key cleared. Running in offline rule engine mode.' });
  };

  const configured = isGeminiConfigured();

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: 'var(--space-4)',
      }}
    >
      <div className="card" style={{ maxWidth: '520px', width: '100%', padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-2)' }}>
          <Sparkles size={22} style={{ color: 'var(--color-primary)' }} />
          <h2 style={{ fontSize: 'var(--font-size-lg)' }}>Gemini AI Intelligence Settings</h2>
        </div>

        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>
          PackPramana leverages Google Gemini to provide multimodal scenario extraction, food deterioration kinetics modeling, and Indian FSSAI/PWM regulatory audits.
        </p>

        {/* Status Banner */}
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: configured ? 'var(--color-success-subtle)' : 'var(--color-surface-sunken)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-4)',
            fontSize: 'var(--font-size-xs)',
          }}
        >
          {configured ? (
            <>
              <CheckCircle2 size={18} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
              <div>
                <strong>Gemini AI Active: </strong>
                Full AI features enabled (Smart Ingestion, Co-Pilot Assistant, Deep Biochemical Analysis).
              </div>
            </>
          ) : (
            <>
              <AlertTriangle size={18} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
              <div>
                <strong>AI Key Not Configured: </strong>
                Running in deterministic rule-engine mode. Provide a Gemini API key below to unlock AI co-pilot and multimodal ingestion.
              </div>
            </>
          )}
        </div>

        <form onSubmit={handleSave}>
          <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
            <label className="form-label" htmlFor="gemini-key">
              <span>Google Gemini API Key</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: '11px',
                  color: 'var(--color-primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <span>Get Free Key</span>
                <ExternalLink size={12} />
              </a>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="gemini-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="form-input"
                style={{ paddingLeft: '34px', fontFamily: 'monospace' }}
              />
              <Key
                size={16}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                }}
              />
            </div>
            <div className="form-hint">
              Stored securely in your local browser storage. Never transmitted to third-party servers.
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
            <label className="form-label" htmlFor="gemini-model">
              <span>Reasoning Model</span>
            </label>
            <select
              id="gemini-model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="form-select"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended: Fast & Multimodal)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Food Science Reasoning)</option>
            </select>
          </div>

          {/* Test Feedback */}
          {testStatus && (
            <div
              className={`alert-box ${
                testStatus.success ? 'alert-success' : testStatus.loading ? 'alert-info' : 'alert-warning'
              }`}
              style={{ padding: 'var(--space-3)', fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-4)' }}
            >
              <div>{testStatus.message}</div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              {configured && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="btn-outline btn-sm"
                  style={{ color: 'var(--color-danger)' }}
                >
                  Clear Key
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testStatus?.loading}
                className="btn-secondary btn-sm"
              >
                <RefreshCw size={14} className={testStatus?.loading ? 'animate-spin' : ''} />
                <span>Test Connection</span>
              </button>
              <button type="button" onClick={onClose} className="btn-secondary btn-sm">
                Cancel
              </button>
              <button type="submit" className="btn-primary btn-sm">
                Save & Apply
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
