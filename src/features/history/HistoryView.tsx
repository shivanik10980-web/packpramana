import React, { useState, useEffect } from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { scenarioRepository } from '../../storage/scenarioRepository';
import {
  isSupabaseConfigured,
  uploadScenarioToCloud,
  fetchCloudScenarios,
} from '../../services/supabaseClient';
import type { SavedScenario } from '../../domain/types';
import {
  History,
  Eye,
  Play,
  Edit2,
  Copy,
  Trash2,
  Undo2,
  AlertTriangle,
  HardDrive,
  Calendar,
  Cloud,
  CloudUpload,
  CloudDownload,
  Info,
  CheckCircle2,
} from 'lucide-react';

export const HistoryView: React.FC = () => {
  const { loadSaved, runScenario } = useScenario();

  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);
  const [corruptedCount, setCorruptedCount] = useState<number>(0);
  const [storageError, setStorageError] = useState<string | undefined>();
  const [deletedScenario, setDeletedScenario] = useState<SavedScenario | null>(null);

  // Rename state
  const [renameTarget, setRenameTarget] = useState<SavedScenario | null>(null);
  const [newName, setNewName] = useState<string>('');

  // Supabase cloud state
  const [cloudConfigured] = useState<boolean>(isSupabaseConfigured());
  const [cloudModalOpen, setCloudModalOpen] = useState<boolean>(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<{
    loading?: boolean;
    success?: boolean;
    message?: string;
  } | null>(null);

  const refreshList = () => {
    const { scenarios: list, corruptedCount: count, storageError: err } = scenarioRepository.getAll();
    setScenarios(list);
    setCorruptedCount(count);
    setStorageError(err);
  };

  useEffect(() => {
    refreshList();
  }, []);

  const handleInspect = (s: SavedScenario) => {
    loadSaved(s);
  };

  const handleRerun = (s: SavedScenario) => {
    runScenario(s.input, `${s.name} (Rerun)`);
    window.location.hash = '#/results';
  };

  const handleDuplicate = (id: string) => {
    const dup = scenarioRepository.duplicate(id);
    if (dup) {
      refreshList();
    }
  };

  const handleDelete = (id: string) => {
    const res = scenarioRepository.delete(id);
    if (res.success && res.deleted) {
      setDeletedScenario(res.deleted);
      refreshList();
    }
  };

  const handleUndo = () => {
    if (scenarioRepository.undoDelete()) {
      setDeletedScenario(null);
      refreshList();
    }
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (renameTarget && newName.trim()) {
      scenarioRepository.rename(renameTarget.id, newName.trim());
      setRenameTarget(null);
      setNewName('');
      refreshList();
    }
  };

  const handleClearCorrupted = () => {
    scenarioRepository.clearAll();
    refreshList();
  };

  const handleSyncAllToCloud = async () => {
    if (!cloudConfigured) {
      setCloudModalOpen(true);
      return;
    }

    setCloudSyncStatus({ loading: true, message: 'Syncing local scenarios to Supabase cloud...' });
    let synced = 0;
    for (const sc of scenarios) {
      const res = await uploadScenarioToCloud(sc);
      if (res.success) synced++;
    }

    setCloudSyncStatus({
      success: true,
      message: `Successfully synchronized ${synced} scenario(s) to Supabase cloud table (packpramana_scenarios).`,
    });
    setTimeout(() => setCloudSyncStatus(null), 4000);
  };

  const handlePullFromCloud = async () => {
    if (!cloudConfigured) {
      setCloudModalOpen(true);
      return;
    }

    setCloudSyncStatus({ loading: true, message: 'Fetching scenarios from Supabase cloud...' });
    const res = await fetchCloudScenarios();
    if (res.success && res.data) {
      let imported = 0;
      for (const cloudScen of res.data) {
        const saveRes = scenarioRepository.save(
          cloudScen.name,
          cloudScen.input,
          cloudScen.result,
          cloudScen.note
        );
        if (saveRes.success) imported++;
      }
      refreshList();
      setCloudSyncStatus({
        success: true,
        message: `Fetched ${res.data.length} scenarios from Supabase (${imported} new imported locally).`,
      });
      setTimeout(() => setCloudSyncStatus(null), 4000);
    } else {
      setCloudSyncStatus({
        success: false,
        message: res.error || 'Failed to fetch cloud scenarios.',
      });
      setTimeout(() => setCloudSyncStatus(null), 4000);
    }
  };

  return (
    <div style={{ padding: 'var(--space-6) 0 var(--space-12) 0' }}>
      <div className="container">
        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-6)',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-primary-subtle)',
                color: 'var(--color-primary)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 700,
                textTransform: 'uppercase',
                marginBottom: 'var(--space-2)',
              }}
            >
              <History size={14} />
              Scenario Archive
            </div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)' }}>
              Saved Scenario Archive
            </h1>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface-sunken)',
                border: '1px solid var(--color-border)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-muted)',
              }}
            >
              <HardDrive size={14} />
              <span>Local Storage &bull; {scenarios.length} saved</span>
            </div>

            {/* Supabase Cloud Badge */}
            <button
              type="button"
              onClick={() => setCloudModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: cloudConfigured ? 'var(--color-success-subtle)' : 'var(--color-surface)',
                color: cloudConfigured ? 'var(--color-success)' : 'var(--color-text)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Cloud size={14} />
              <span>
                {cloudConfigured ? 'Supabase: Connected' : 'Supabase: Setup Cloud Sync'}
              </span>
            </button>

            {cloudConfigured && (
              <>
                <button
                  type="button"
                  onClick={handleSyncAllToCloud}
                  className="btn-outline btn-sm"
                  title="Push local scenarios to Supabase"
                >
                  <CloudUpload size={14} />
                  <span>Sync to Cloud</span>
                </button>
                <button
                  type="button"
                  onClick={handlePullFromCloud}
                  className="btn-secondary btn-sm"
                  title="Fetch scenarios from Supabase"
                >
                  <CloudDownload size={14} />
                  <span>Pull from Cloud</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Cloud Sync Status Banner */}
        {cloudSyncStatus && (
          <div
            className={`alert-box ${
              cloudSyncStatus.loading
                ? 'alert-info'
                : cloudSyncStatus.success
                ? 'alert-success'
                : 'alert-danger'
            }`}
            style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}
          >
            {cloudSyncStatus.success ? <CheckCircle2 size={18} /> : <Info size={18} />}
            <div>{cloudSyncStatus.message}</div>
          </div>
        )}

        {/* Undo Toast Notification */}
        {deletedScenario && (
          <div
            className="alert-box alert-info"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--space-6)',
            }}
          >
            <div>
              Deleted <strong>{deletedScenario.name}</strong>.
            </div>
            <button
              type="button"
              onClick={handleUndo}
              className="btn-primary btn-sm"
              id="btn-undo-delete"
            >
              <Undo2 size={14} />
              <span>Undo Deletion</span>
            </button>
          </div>
        )}

        {/* Storage Corruption / Quota Notice */}
        {(corruptedCount > 0 || storageError) && (
          <div className="alert-box alert-warning" style={{ marginBottom: 'var(--space-6)' }}>
            <AlertTriangle size={20} style={{ flexShrink: 0 }} />
            <div>
              <strong>Storage Warning: </strong>
              {storageError || `${corruptedCount} corrupted record(s) failed schema validation.`}
              <div style={{ marginTop: 'var(--space-2)' }}>
                <button
                  type="button"
                  onClick={handleClearCorrupted}
                  className="btn-danger btn-sm"
                >
                  Reset / Clear Invalid Storage
                </button>
              </div>
            </div>
          </div>
        )}

        {/* List of Scenarios */}
        {scenarios.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <History size={48} style={{ color: 'var(--color-text-faint)', margin: '0 auto var(--space-4) auto' }} />
            <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-2)' }}>
              No Saved Scenarios Yet
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', maxWidth: '460px', margin: '0 auto var(--space-6) auto' }}>
              Run any recommendation or demo, then click &ldquo;Save Scenario&rdquo; on the results page to store immutable snapshots here.
            </p>
            <a href="#/scenario" className="btn-primary">
              <span>Create New Scenario</span>
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {scenarios.map((s) => {
              const topCand = s.result.candidates[0];
              const dateStr = new Date(s.createdAt).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              });

              return (
                <div
                  key={s.id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 'var(--space-4)',
                    padding: 'var(--space-4) var(--space-6)',
                  }}
                >
                  {/* Left: Info */}
                  <div style={{ flex: '1 1 360px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: 'var(--font-size-md)' }}>{s.name}</h3>
                      <span className="badge badge-neutral">{s.input.commodityId}</span>
                      <span
                        className={`badge ${
                          s.result.status === 'demo_shortlist'
                            ? 'badge-fresh'
                            : s.result.status === 'review_required'
                            ? 'badge-dry'
                            : 'badge-alert'
                        }`}
                      >
                        {s.result.status}
                      </span>
                    </div>

                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} />
                        {dateStr}
                      </span>
                      <span>&bull;</span>
                      <span>
                        {s.input.temperatureC}°C, {s.input.relativeHumidityPct}% RH
                      </span>
                      <span>&bull;</span>
                      <span>{s.input.targetDays} days</span>
                      <span>&bull;</span>
                      <span>Budget: ₹{s.input.budgetInrPerPack}</span>
                    </div>

                    {topCand && (
                      <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-xs)' }}>
                        <strong>Top Candidate:</strong> {topCand.name} &bull; Score: {topCand.displayScore.toFixed(1)} / 100 &bull; Cost: ₹{topCand.unitCostInr}
                      </div>
                    )}

                    {s.note && (
                      <div
                        style={{
                          marginTop: 'var(--space-2)',
                          fontSize: '11px',
                          color: 'var(--color-text-faint)',
                          fontStyle: 'italic',
                        }}
                      >
                        Note: {s.note}
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', alignItems: 'center' }}>
                    {cloudConfigured && (
                      <button
                        type="button"
                        onClick={async () => {
                          const res = await uploadScenarioToCloud(s);
                          if (res.success) {
                            setCloudSyncStatus({ success: true, message: `Scenario "${s.name}" saved to Supabase cloud.` });
                            setTimeout(() => setCloudSyncStatus(null), 3000);
                          } else {
                            setCloudSyncStatus({ success: false, message: res.error });
                          }
                        }}
                        className="btn-secondary btn-sm"
                        title="Upload this scenario to Supabase"
                      >
                        <CloudUpload size={14} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleInspect(s)}
                      className="btn-secondary btn-sm"
                      title="Inspect original immutable snapshot"
                    >
                      <Eye size={14} />
                      <span>Inspect</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRerun(s)}
                      className="btn-outline btn-sm"
                      title="Recompute recommendation as fresh snapshot"
                    >
                      <Play size={14} />
                      <span>Re-run</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setRenameTarget(s);
                        setNewName(s.name);
                      }}
                      className="btn-secondary btn-sm"
                      title="Rename scenario"
                    >
                      <Edit2 size={14} />
                      <span>Rename</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDuplicate(s.id)}
                      className="btn-secondary btn-sm"
                      title="Duplicate scenario"
                    >
                      <Copy size={14} />
                      <span>Duplicate</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(s.id)}
                      className="btn-secondary btn-sm"
                      title="Delete scenario"
                      style={{ color: 'var(--color-danger)' }}
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Supabase Cloud Setup & Information Modal */}
      {cloudModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--space-4)',
          }}
        >
          <div className="card" style={{ maxWidth: '560px', width: '100%', padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-2)' }}>
              <Cloud size={20} style={{ color: 'var(--color-primary)' }} />
              <h2 style={{ fontSize: 'var(--font-size-lg)' }}>
                Supabase Cloud Persistence
              </h2>
            </div>

            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>
              PackPramana includes full Supabase integration for cloud synchronization of saved scenarios, collaborative review, and audit trail retention.
            </p>

            <div
              style={{
                backgroundColor: 'var(--color-surface-sunken)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-xs)',
                marginBottom: 'var(--space-4)',
                lineHeight: 1.6,
              }}
            >
              <div>
                <strong>Connection Status: </strong>
                {cloudConfigured ? (
                  <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>
                    Connected and Ready
                  </span>
                ) : (
                  <span style={{ color: 'var(--color-text-faint)' }}>
                    Not Configured (Running in offline-first LocalStorage mode)
                  </span>
                )}
              </div>

              <div style={{ marginTop: 'var(--space-3)' }}>
                <strong>How to Enable in Production / Vercel:</strong>
                <ol style={{ paddingLeft: 'var(--space-4)', marginTop: '4px' }}>
                  <li>
                    Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in your Vercel Environment Variables or local <code>.env</code> file.
                  </li>
                  <li>
                    Run the SQL migration script located in <code>supabase/schema.sql</code> in your Supabase SQL Editor.
                  </li>
                </ol>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
              <button
                type="button"
                onClick={() => setCloudModalOpen(false)}
                className="btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renameTarget && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--space-4)',
          }}
        >
          <div className="card" style={{ maxWidth: '420px', width: '100%', padding: 'var(--space-6)' }}>
            <h2 style={{ fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-2)' }}>
              Rename Scenario
            </h2>
            <form onSubmit={handleRenameSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="form-input"
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
                <button
                  type="button"
                  onClick={() => setRenameTarget(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Name
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
