import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useScenario } from '../../context/ScenarioContext';
import { defaultSeedData } from '../../engine';
import type { ScenarioInput, StorageType, TransportSeverity, CostPriority } from '../../domain/types';
import {
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Info,
  CheckCircle2,
  Settings2,
  Sparkles,
} from 'lucide-react';
import { SmartAiIngestModal } from './SmartAiIngestModal';
import { AiSettingsModal } from '../../components/AiSettingsModal';
import type { ScenarioExtractionResult } from '../../domain/types';

const formSchema = z.object({
  commodityId: z.string().min(1, 'Please select a commodity'),
  storageType: z.enum(['ambient', 'chilled', 'frozen']),
  temperatureC: z.number(),
  relativeHumidityPct: z
    .number()
    .min(0, 'Relative humidity cannot be below 0%')
    .max(100, 'Relative humidity cannot exceed 100%'),
  targetDays: z
    .number()
    .positive('Duration must be greater than 0 days'),
  distanceKm: z
    .number()
    .min(0, 'Distance cannot be negative'),
  transportSeverity: z.enum(['gentle', 'normal', 'rough']),
  packMassG: z
    .number()
    .positive('Pack mass must be positive'),
  budgetInrPerPack: z
    .number()
    .positive('Budget per pack must be greater than ₹0'),
  costPriority: z.enum(['balanced', 'cost']),
  customComposition: z.boolean(),
  moisturePct: z.number().min(0).max(100).nullable().optional(),
  fatPct: z.number().min(0).max(100).nullable().optional(),
  pH: z.number().min(0).max(14).nullable().optional(),
  respirationMlCO2KgHour: z.number().min(0).nullable().optional(),
  respirationTemperatureC: z.number().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const ScenarioFormView: React.FC = () => {
  const { input, runScenario } = useScenario();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [errorSummary, setErrorSummary] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(Boolean(input.composition));
  const [aiModalOpen, setAiModalOpen] = useState<boolean>(false);
  const [aiSettingsOpen, setAiSettingsOpen] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      commodityId: input.commodityId,
      storageType: input.storageType,
      temperatureC: input.temperatureC,
      relativeHumidityPct: input.relativeHumidityPct,
      targetDays: input.targetDays,
      distanceKm: input.distanceKm,
      transportSeverity: input.transportSeverity,
      packMassG: input.packMassG,
      budgetInrPerPack: input.budgetInrPerPack,
      costPriority: input.costPriority,
      customComposition: Boolean(input.composition),
      moisturePct: input.composition?.moisturePct ?? null,
      fatPct: input.composition?.fatPct ?? null,
      pH: input.composition?.pH ?? null,
      respirationMlCO2KgHour: input.composition?.respirationMlCO2KgHour ?? null,
      respirationTemperatureC: input.composition?.respirationTemperatureC ?? null,
    },
  });

  const selectedCommodityId = watch('commodityId');
  const selectedCommodity = defaultSeedData.commodities.find((c) => c.id === selectedCommodityId);

  // When commodity changes, update suggested default storage conditions
  const handleCommodityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setValue('commodityId', id);
    const comm = defaultSeedData.commodities.find((c) => c.id === id);
    if (comm) {
      setValue('storageType', comm.storageType);
      setValue('temperatureC', comm.temperatureC[0]);
      setValue('targetDays', Math.min(comm.prototypeMaxDays, 7));
      setValue('moisturePct', comm.composition.moisturePct);
      setValue('fatPct', comm.composition.fatPct);
      setValue('pH', comm.composition.pH);
      setValue('respirationMlCO2KgHour', comm.composition.respirationMlCO2KgHour);
    }
  };

  const handleApplyAiExtraction = (extracted: ScenarioExtractionResult) => {
    setValue('commodityId', extracted.commodityId);
    setValue('storageType', extracted.storageType);
    setValue('temperatureC', extracted.temperatureC);
    setValue('relativeHumidityPct', extracted.relativeHumidityPct);
    setValue('targetDays', extracted.targetDays);
    setValue('distanceKm', extracted.distanceKm);
    setValue('transportSeverity', extracted.transportSeverity);
    setValue('packMassG', extracted.packMassG);
    setValue('budgetInrPerPack', extracted.budgetInrPerPack);
    setValue('costPriority', extracted.costPriority);
  };

  const onSubmit = (data: FormValues) => {
    setErrorSummary([]);

    // Check composition validation if custom enabled
    let compositionData: ScenarioInput['composition'] = undefined;
    if (showAdvanced) {
      if (data.moisturePct != null || data.fatPct != null || data.pH != null) {
        if ((data.moisturePct ?? 0) + (data.fatPct ?? 0) > 100) {
          setErrorSummary(['Moisture % plus Fat % cannot exceed 100%']);
          return;
        }
        compositionData = {
          moisturePct: data.moisturePct ?? null,
          fatPct: data.fatPct ?? null,
          pH: data.pH ?? null,
          respirationMlCO2KgHour: data.respirationMlCO2KgHour ?? null,
          respirationTemperatureC: data.respirationTemperatureC ?? null,
        };
      }
    }

    const payload: ScenarioInput = {
      commodityId: data.commodityId,
      storageType: data.storageType as StorageType,
      temperatureC: data.temperatureC,
      relativeHumidityPct: data.relativeHumidityPct,
      targetDays: data.targetDays,
      distanceKm: data.distanceKm,
      transportSeverity: data.transportSeverity as TransportSeverity,
      packMassG: data.packMassG,
      budgetInrPerPack: data.budgetInrPerPack,
      costPriority: data.costPriority as CostPriority,
      composition: compositionData,
    };

    runScenario(payload, `${selectedCommodity?.name ?? 'Custom'} Scenario`);
    window.location.hash = '#/results';
    try {
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    } catch {
      window.dispatchEvent(new Event('hashchange'));
    }
  };

  const onInvalid = (fieldErrors: any) => {
    const messages = Object.values(fieldErrors).map((e: any) => e.message as string);
    setErrorSummary(messages);
    const summaryEl = document.getElementById('form-error-summary');
    if (summaryEl) {
      summaryEl.focus();
    }
  };

  const currentValues = watch();

  return (
    <div style={{ padding: 'var(--space-6) 0 var(--space-12) 0' }}>
      <div className="container">
        {/* Header with Title and AI Smart Ingest Action */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-6)',
          }}
        >
          <div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', margin: 0 }}>Configure Packaging Scenario</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
              Define food commodity characteristics, environmental storage conditions, and distribution parameters.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setAiModalOpen(true)}
            className="btn-secondary"
            id="btn-open-ai-ingest"
            style={{
              borderColor: 'var(--color-primary)',
              color: 'var(--color-primary)',
              backgroundColor: 'var(--color-primary-subtle)',
              fontWeight: 700,
            }}
          >
            <Sparkles size={16} />
            <span>AI Smart Ingest (Photo / Text)</span>
          </button>
        </div>

        {/* Step Progress Tracker */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--space-2)',
              maxWidth: '680px',
              margin: '0 auto',
            }}
          >
            {[
              { num: 1, label: 'Food & Storage' },
              { num: 2, label: 'Conditions & Transit' },
              { num: 3, label: 'Economics & Composition' },
            ].map((step, idx) => (
              <React.Fragment key={step.num}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(step.num)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: currentStep === step.num ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    fontWeight: currentStep === step.num ? 700 : 500,
                    fontSize: 'var(--font-size-sm)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor:
                      currentStep === step.num ? 'var(--color-primary-subtle)' : 'transparent',
                  }}
                >
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor:
                        currentStep === step.num
                          ? 'var(--color-primary)'
                          : currentStep > step.num
                          ? 'var(--color-success)'
                          : 'var(--color-surface-sunken)',
                      color: currentStep >= step.num ? '#FFFFFF' : 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    {currentStep > step.num ? '✓' : step.num}
                  </span>
                  <span>{step.label}</span>
                </button>
                {idx < 2 && (
                  <div
                    style={{
                      flex: 1,
                      height: '2px',
                      backgroundColor:
                        currentStep > step.num ? 'var(--color-primary)' : 'var(--color-border)',
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Error Summary Banner if any */}
        {errorSummary.length > 0 && (
          <div
            id="form-error-summary"
            tabIndex={-1}
            role="alert"
            aria-live="assertive"
            className="alert-box alert-danger"
            style={{ maxWidth: '960px', margin: '0 auto var(--space-6) auto' }}
          >
            <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Please correct the following inputs before proceeding:</strong>
              <ul style={{ paddingLeft: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
                {errorSummary.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 2-Pane Form & Live Preview Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 'var(--space-8)',
            maxWidth: '1100px',
            margin: '0 auto',
          }}
          className="form-grid"
        >
          {/* Main Form */}
          <form
            onSubmit={handleSubmit(onSubmit, onInvalid)}
            className="card"
            style={{ padding: 'var(--space-6)' }}
          >
            {/* STEP 1: Food & Storage */}
            {currentStep === 1 && (
              <div>
                <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-1)' }}>
                  Step 1: Food Commodity & Storage Mode
                </h2>
                <p
                  style={{
                    color: 'var(--color-text-muted)',
                    fontSize: 'var(--font-size-sm)',
                    marginBottom: 'var(--space-6)',
                  }}
                >
                  Choose from authored seed commodities and baseline storage mode.
                </p>

                {/* Commodity Selector */}
                <div className="form-group">
                  <label htmlFor="commodityId" className="form-label">
                    <span>Target Commodity</span>
                    <span className="unit">8 authored fixtures available</span>
                  </label>
                  <select
                    id="commodityId"
                    className="form-select"
                    value={watch('commodityId')}
                    onChange={handleCommodityChange}
                  >
                    {defaultSeedData.commodities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.category.toUpperCase()}) &bull; {c.storageType} ({c.temperatureC[0]}-{c.temperatureC[1]}°C)
                      </option>
                    ))}
                  </select>
                  {selectedCommodity && (
                    <div
                      style={{
                        padding: 'var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-surface-sunken)',
                        marginTop: 'var(--space-2)',
                        fontSize: 'var(--font-size-xs)',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 'var(--space-3)',
                      }}
                    >
                      <div>
                        <strong>Category:</strong> {selectedCommodity.category}
                      </div>
                      <div>
                        <strong>Fixture Temp:</strong> {selectedCommodity.temperatureC[0]}°C to{' '}
                        {selectedCommodity.temperatureC[1]}°C
                      </div>
                      <div>
                        <strong>Max Fixture Days:</strong> {selectedCommodity.prototypeMaxDays}d
                      </div>
                    </div>
                  )}
                </div>

                {/* Storage Type */}
                <div className="form-group">
                  <label className="form-label" htmlFor="storageType">
                    <span>Storage Mode</span>
                    <span className="unit">Fixture calibration</span>
                  </label>
                  <select id="storageType" className="form-select" {...register('storageType')}>
                    <option value="ambient">Ambient (15°C to 30°C)</option>
                    <option value="chilled">Chilled (0°C to 15°C)</option>
                    <option value="frozen">Frozen (&lt; 0°C - Unsupported in seed fixtures)</option>
                  </select>
                  {watch('storageType') === 'frozen' && (
                    <div className="form-hint" style={{ color: 'var(--color-warning)' }}>
                      Note: Frozen mode is visible but outside current seed fixtures and will trigger
                      an expert review status.
                    </div>
                  )}
                  {errors.storageType && <div className="form-error">{errors.storageType.message}</div>}
                </div>

                {/* Target Shelf Duration */}
                <div className="form-group">
                  <label className="form-label" htmlFor="targetDays">
                    <span>Target Storage / Shelf Duration</span>
                    <span className="unit">days</span>
                  </label>
                  <input
                    id="targetDays"
                    type="number"
                    step="1"
                    min="1"
                    className="form-input"
                    {...register('targetDays', { valueAsNumber: true })}
                  />
                  <div className="form-hint">
                    Maximum fixture coverage for {selectedCommodity?.name}: {selectedCommodity?.prototypeMaxDays} days. Shelf life is not predicted.
                  </div>
                  {errors.targetDays && <div className="form-error">{errors.targetDays.message}</div>}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-6)' }}>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="btn-primary"
                  >
                    <span>Next: Environmental Conditions</span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Conditions & Transit */}
            {currentStep === 2 && (
              <div>
                <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-1)' }}>
                  Step 2: Environmental & Distribution Conditions
                </h2>
                <p
                  style={{
                    color: 'var(--color-text-muted)',
                    fontSize: 'var(--font-size-sm)',
                    marginBottom: 'var(--space-6)',
                  }}
                >
                  Configure thermal, atmospheric, and transit parameters.
                </p>

                {/* Storage Temperature */}
                <div className="form-group">
                  <label className="form-label" htmlFor="temperatureC">
                    <span>Actual Storage Temperature</span>
                    <span className="unit">°C</span>
                  </label>
                  <input
                    id="temperatureC"
                    type="number"
                    step="0.5"
                    className="form-input"
                    {...register('temperatureC', { valueAsNumber: true })}
                  />
                  <div className="form-hint">
                    Commodity fixture range: {selectedCommodity?.temperatureC[0]}°C to {selectedCommodity?.temperatureC[1]}°C. Values outside trigger review.
                  </div>
                  {errors.temperatureC && <div className="form-error">{errors.temperatureC.message}</div>}
                </div>

                {/* Relative Humidity */}
                <div className="form-group">
                  <label className="form-label" htmlFor="relativeHumidityPct">
                    <span>Ambient Relative Humidity</span>
                    <span className="unit">% RH (0–100)</span>
                  </label>
                  <input
                    id="relativeHumidityPct"
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    className="form-input"
                    {...register('relativeHumidityPct', { valueAsNumber: true })}
                  />
                  <div className="form-hint">
                    For dry foods: relative humidity &ge; 75% increases target moisture barrier requirement.
                  </div>
                  {errors.relativeHumidityPct && (
                    <div className="form-error">{errors.relativeHumidityPct.message}</div>
                  )}
                </div>

                {/* Distribution Distance */}
                <div className="form-group">
                  <label className="form-label" htmlFor="distanceKm">
                    <span>Transit Distance</span>
                    <span className="unit">km</span>
                  </label>
                  <input
                    id="distanceKm"
                    type="number"
                    step="10"
                    min="0"
                    className="form-input"
                    {...register('distanceKm', { valueAsNumber: true })}
                  />
                  <div className="form-hint">
                    Journeys over 300 km increment required mechanical package strength target.
                  </div>
                  {errors.distanceKm && <div className="form-error">{errors.distanceKm.message}</div>}
                </div>

                {/* Transport Severity */}
                <div className="form-group">
                  <label className="form-label" htmlFor="transportSeverity">
                    <span>Handling / Road Severity</span>
                    <span className="unit">Mechanical stress</span>
                  </label>
                  <select
                    id="transportSeverity"
                    className="form-select"
                    {...register('transportSeverity')}
                  >
                    <option value="gentle">Gentle (Direct refrigerated / smooth logistics)</option>
                    <option value="normal">Normal (Standard road freight / multi-handling)</option>
                    <option value="rough">Rough (Unpaved rural roads / severe vibration)</option>
                  </select>
                  {errors.transportSeverity && (
                    <div className="form-error">{errors.transportSeverity.message}</div>
                  )}
                </div>

                {/* Pack Mass */}
                <div className="form-group">
                  <label className="form-label" htmlFor="packMassG">
                    <span>Pack Net Mass</span>
                    <span className="unit">grams (g)</span>
                  </label>
                  <input
                    id="packMassG"
                    type="number"
                    step="50"
                    className="form-input"
                    {...register('packMassG', { valueAsNumber: true })}
                  />
                  <div className="form-hint">
                    Author catalogue format is calibrated for 250 g. Other sizes will require expert structural sizing.
                  </div>
                  {errors.packMassG && <div className="form-error">{errors.packMassG.message}</div>}
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: 'var(--space-6)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="btn-secondary"
                  >
                    <ChevronLeft size={18} />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="btn-primary"
                  >
                    <span>Next: Economics & Composition</span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Economics & Composition */}
            {currentStep === 3 && (
              <div>
                <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-1)' }}>
                  Step 3: Economics & Commodity Composition
                </h2>
                <p
                  style={{
                    color: 'var(--color-text-muted)',
                    fontSize: 'var(--font-size-sm)',
                    marginBottom: 'var(--space-6)',
                  }}
                >
                  Define packaging cost constraints and optional composition parameters.
                </p>

                {/* Budget per Pack */}
                <div className="form-group">
                  <label className="form-label" htmlFor="budgetInrPerPack">
                    <span>Target Budget per Pack</span>
                    <span className="unit">₹ INR</span>
                  </label>
                  <input
                    id="budgetInrPerPack"
                    type="number"
                    step="0.5"
                    min="0.1"
                    className="form-input"
                    {...register('budgetInrPerPack', { valueAsNumber: true })}
                  />
                  <div className="form-hint">
                    Budget is treated as a soft preference. Over-budget candidates are not gated out, but receive scaled penalties.
                  </div>
                  {errors.budgetInrPerPack && (
                    <div className="form-error">{errors.budgetInrPerPack.message}</div>
                  )}
                </div>

                {/* Cost Priority */}
                <div className="form-group">
                  <label className="form-label" htmlFor="costPriority">
                    <span>Decision Weighting Strategy</span>
                    <span className="unit">Multi-attribute balance</span>
                  </label>
                  <select id="costPriority" className="form-select" {...register('costPriority')}>
                    <option value="balanced">Balanced (40% Fit, 20% Budget, 15% Transit, 15% Temp, 10% End-of-Life)</option>
                    <option value="cost">Cost-Sensitive (40% Fit, 35% Budget, 10% Transit, 10% Temp, 5% End-of-Life)</option>
                  </select>
                  {errors.costPriority && (
                    <div className="form-error">{errors.costPriority.message}</div>
                  )}
                </div>

                {/* Advanced Commodity Composition Toggle */}
                <div
                  style={{
                    marginTop: 'var(--space-6)',
                    paddingTop: 'var(--space-4)',
                    borderTop: '1px solid var(--color-border)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="btn-outline btn-sm"
                    style={{ marginBottom: 'var(--space-4)' }}
                  >
                    <Settings2 size={16} />
                    <span>
                      {showAdvanced ? 'Hide Advanced Composition' : 'Expose Advanced Composition'}
                    </span>
                  </button>

                  {showAdvanced && (
                    <div
                      style={{
                        padding: 'var(--space-4)',
                        backgroundColor: 'var(--color-surface-sunken)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--space-4)',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--color-text-muted)',
                          marginBottom: 'var(--space-3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Info size={14} />
                        <span>
                          Default values reflect authored fixture baselines. Changing these values returns “review_required” rather than silently reusing pre-calibrated rules.
                        </span>
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                          gap: 'var(--space-3)',
                        }}
                      >
                        <div>
                          <label className="form-label" htmlFor="moisturePct" style={{ fontSize: '11px' }}>
                            <span>Moisture</span>
                            <span className="unit">%</span>
                          </label>
                          <input
                            id="moisturePct"
                            type="number"
                            step="0.1"
                            className="form-input"
                            {...register('moisturePct', { valueAsNumber: true })}
                          />
                        </div>

                        <div>
                          <label className="form-label" htmlFor="fatPct" style={{ fontSize: '11px' }}>
                            <span>Fat</span>
                            <span className="unit">%</span>
                          </label>
                          <input
                            id="fatPct"
                            type="number"
                            step="0.1"
                            className="form-input"
                            {...register('fatPct', { valueAsNumber: true })}
                          />
                        </div>

                        <div>
                          <label className="form-label" htmlFor="pH" style={{ fontSize: '11px' }}>
                            <span>pH</span>
                            <span className="unit">0–14</span>
                          </label>
                          <input
                            id="pH"
                            type="number"
                            step="0.1"
                            className="form-input"
                            {...register('pH', { valueAsNumber: true })}
                          />
                        </div>

                        <div>
                          <label className="form-label" htmlFor="respirationMlCO2KgHour" style={{ fontSize: '11px' }}>
                            <span>Respiration</span>
                            <span className="unit">ml/kg-h</span>
                          </label>
                          <input
                            id="respirationMlCO2KgHour"
                            type="number"
                            step="1"
                            className="form-input"
                            {...register('respirationMlCO2KgHour', { valueAsNumber: true })}
                          />
                        </div>

                        <div>
                          <label className="form-label" htmlFor="respirationTemperatureC" style={{ fontSize: '11px' }}>
                            <span>Resp. Ref Temp</span>
                            <span className="unit">°C</span>
                          </label>
                          <input
                            id="respirationTemperatureC"
                            type="number"
                            step="1"
                            className="form-input"
                            {...register('respirationTemperatureC', { valueAsNumber: true })}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: 'var(--space-6)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="btn-secondary"
                  >
                    <ChevronLeft size={18} />
                    <span>Back</span>
                  </button>
                  <button type="submit" className="btn-primary" id="btn-submit-scenario">
                    <span>Evaluate & Generate Shortlist</span>
                    <CheckCircle2 size={18} />
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Live Scenario Assumption Summary Pane */}
          <aside className="card" style={{ height: 'fit-content', padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-3)' }}>
              Scenario Assumption Summary
            </h3>
            <p
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-muted)',
                marginBottom: 'var(--space-4)',
              }}
            >
              Real-time snapshot of parameters fed into the hard gating and scoring pipeline.
            </p>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: '1px solid var(--color-border-subtle)',
                }}
              >
                <span style={{ color: 'var(--color-text-muted)' }}>Commodity</span>
                <span style={{ fontWeight: 600 }}>{selectedCommodity?.name}</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: '1px solid var(--color-border-subtle)',
                }}
              >
                <span style={{ color: 'var(--color-text-muted)' }}>Storage Mode</span>
                <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                  {currentValues.storageType}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: '1px solid var(--color-border-subtle)',
                }}
              >
                <span style={{ color: 'var(--color-text-muted)' }}>Temperature</span>
                <span style={{ fontWeight: 600 }}>{currentValues.temperatureC}°C</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: '1px solid var(--color-border-subtle)',
                }}
              >
                <span style={{ color: 'var(--color-text-muted)' }}>Relative Humidity</span>
                <span style={{ fontWeight: 600 }}>{currentValues.relativeHumidityPct}%</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: '1px solid var(--color-border-subtle)',
                }}
              >
                <span style={{ color: 'var(--color-text-muted)' }}>Target Duration</span>
                <span style={{ fontWeight: 600 }}>{currentValues.targetDays} days</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: '1px solid var(--color-border-subtle)',
                }}
              >
                <span style={{ color: 'var(--color-text-muted)' }}>Distance & Stress</span>
                <span style={{ fontWeight: 600 }}>
                  {currentValues.distanceKm} km &bull; {currentValues.transportSeverity}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: '1px solid var(--color-border-subtle)',
                }}
              >
                <span style={{ color: 'var(--color-text-muted)' }}>Target Budget</span>
                <span style={{ fontWeight: 600 }}>₹{currentValues.budgetInrPerPack} / pack</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: '1px solid var(--color-border-subtle)',
                }}
              >
                <span style={{ color: 'var(--color-text-muted)' }}>Weight Strategy</span>
                <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                  {currentValues.costPriority}
                </span>
              </div>
            </div>

            <div
              style={{
                marginTop: 'var(--space-4)',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface-subtle)',
                border: '1px solid var(--color-border-subtle)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-muted)',
              }}
            >
              Draft parameters are persisted automatically to local storage.
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .form-grid {
            grid-template-columns: 2fr 1fr !important;
          }
        }
      `}</style>

      {/* AI Smart Ingestion Modal */}
      <SmartAiIngestModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onApply={handleApplyAiExtraction}
        onOpenSettings={() => {
          setAiModalOpen(false);
          setAiSettingsOpen(true);
        }}
      />

      {/* AI Settings Modal */}
      <AiSettingsModal
        isOpen={aiSettingsOpen}
        onClose={() => setAiSettingsOpen(false)}
      />
    </div>
  );
};
