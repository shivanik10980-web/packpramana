import React, { useState } from 'react';
import { extractScenarioFromTextOrImage } from '../../services/aiFoodScienceService';
import { isGeminiConfigured } from '../../services/geminiClient';
import type { ScenarioExtractionResult } from '../../domain/types';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  X,
  Image as ImageIcon,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApply: (extracted: ScenarioExtractionResult) => void;
  onOpenSettings: () => void;
}

export const SmartAiIngestModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onApply,
  onOpenSettings,
}) => {
  const [inputText, setInputText] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedResult, setExtractedResult] = useState<ScenarioExtractionResult | null>(null);

  if (!isOpen) return null;

  const configured = isGeminiConfigured();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      // Strip data url prefix for Gemini API inlineData
      const base64 = result.split(',')[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setImageBase64(null);
    setImagePreview(null);
    setMimeType(null);
  };

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !imageBase64) {
      setError('Please provide a product description text or upload a product photo.');
      return;
    }

    if (!configured) {
      onOpenSettings();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await extractScenarioFromTextOrImage({
        text: inputText.trim() || undefined,
        imageBase64: imageBase64 || undefined,
        mimeType: mimeType || undefined,
      });
      setExtractedResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to extract parameters with Gemini.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToForm = () => {
    if (extractedResult) {
      onApply(extractedResult);
      onClose();
    }
  };

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
      <div
        className="card"
        style={{
          maxWidth: '620px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 'var(--space-6)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={22} style={{ color: 'var(--color-primary)' }} />
            <h2 style={{ fontSize: 'var(--font-size-lg)' }}>AI Smart Scenario Ingestion</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>
          Paste a freeform description of your food product or upload a product packaging photo.
          Gemini will analyze the food composition, respiration rate, and distribution environment to populate the recommendation parameters automatically.
        </p>

        {!configured && (
          <div className="alert-box alert-warning" style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-xs)' }}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              Gemini API key is required for AI Smart Ingestion.
            </div>
            <button type="button" onClick={onOpenSettings} className="btn-primary btn-sm">
              Configure Key
            </button>
          </div>
        )}

        {!extractedResult ? (
          <form onSubmit={handleExtract}>
            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label" htmlFor="ai-input-text">
                <span>Product Description & Operating Context</span>
              </label>
              <textarea
                id="ai-input-text"
                rows={3}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="e.g. We pack roasted salted cashews in Gujarat. Warm climate (35°C, 75% RH). 500g net pouch, transported 250km by road. Looking for 6 months shelf life under ₹8/pack."
                className="form-input"
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Image Upload Area */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label">
                <span>Optional Product / Packaging Photo</span>
              </label>

              {imagePreview ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <img
                    src={imagePreview}
                    alt="Upload Preview"
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                  />
                  <div>
                    <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>Image loaded for vision analysis</div>
                    <button
                      type="button"
                      onClick={handleClearImage}
                      className="btn-outline btn-sm"
                      style={{ marginTop: '4px', fontSize: '11px' }}
                    >
                      Remove Photo
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-4)',
                    cursor: 'pointer',
                    backgroundColor: 'var(--color-surface-sunken)',
                    transition: 'border-color var(--transition-fast)',
                  }}
                >
                  <ImageIcon size={24} style={{ color: 'var(--color-text-muted)', marginBottom: '4px' }} />
                  <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>Click to upload food photo or label spec</span>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>JPEG, PNG, WebP</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>

            {error && (
              <div className="alert-box alert-danger" style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-xs)' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
              <button type="button" onClick={onClose} className="btn-secondary btn-sm">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !configured || (!inputText.trim() && !imageBase64)}
                className="btn-primary btn-sm"
              >
                {loading ? 'Analyzing with Gemini...' : 'Analyze & Extract'}
              </button>
            </div>
          </form>
        ) : (
          /* Extracted Result Confirmation View */
          <div>
            <div className="alert-box alert-success" style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-xs)' }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>Parameters Extracted Successfully! </strong>
                Confidence Score: {(extractedResult.confidenceScore * 100).toFixed(0)}%
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--color-surface-sunken)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-4)',
                fontSize: 'var(--font-size-xs)',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-2)' }}>
                {extractedResult.commodityName} ({extractedResult.commodityId})
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: 'var(--space-3)' }}>
                <div><strong>Storage Mode:</strong> {extractedResult.storageType}</div>
                <div><strong>Temperature:</strong> {extractedResult.temperatureC} °C</div>
                <div><strong>Relative Humidity:</strong> {extractedResult.relativeHumidityPct}% RH</div>
                <div><strong>Shelf Life Target:</strong> {extractedResult.targetDays} days</div>
                <div><strong>Pack Net Mass:</strong> {extractedResult.packMassG} g</div>
                <div><strong>Target Budget:</strong> ₹{extractedResult.budgetInrPerPack} / pack</div>
                <div><strong>Transit Distance:</strong> {extractedResult.distanceKm} km ({extractedResult.transportSeverity})</div>
                <div><strong>Weighting:</strong> {extractedResult.costPriority}</div>
              </div>

              {extractedResult.inferredHazards.length > 0 && (
                <div>
                  <strong>Inferred Food Hazards: </strong>
                  <span>{extractedResult.inferredHazards.join(', ')}</span>
                </div>
              )}

              <div style={{ marginTop: '8px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                Rationale: {extractedResult.rationale}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
              <button
                type="button"
                onClick={() => setExtractedResult(null)}
                className="btn-secondary btn-sm"
              >
                Re-enter Query
              </button>

              <button
                type="button"
                onClick={handleApplyToForm}
                className="btn-primary btn-sm"
                id="btn-apply-ai-ingest"
              >
                <span>Apply to Scenario Wizard</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
