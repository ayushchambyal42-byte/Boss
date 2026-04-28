import { useRef } from "react";
import { formatKelvin, formatMeV } from "../../domain/bcs/displayUnits.ts";
import { getParameterControlDefinitions } from "../../domain/bcs/parameters.ts";
import type { BaselineSnapshot, ParameterKey, ParameterVector, SessionInspection } from "../../domain/bcs/types.ts";

type ControlsPanelProps = {
  parameters: ParameterVector;
  playing: boolean;
  baseline: BaselineSnapshot | null;
  inspectedSession: SessionInspection | null;
  importedSessionError: string | null;
  canCaptureBaseline: boolean;
  exportVersion: string;
  exportTrustStatus: string;
  onParameterChange: (parameters: Partial<ParameterVector>) => void;
  onTogglePlaying: () => void;
  onCaptureBaseline: () => void;
  onImportSession: (file: File) => void;
  onRestoreImportedSession: () => void;
  onClearImportedSession: () => void;
  onExportPlot: () => void;
  onExportSession: () => void;
  onReset: () => void;
};

const VALUE_FORMATTERS: Record<ParameterKey, (value: number) => string> = {
  lambda: (value) => value.toFixed(2),
  omega_D_ref: (value) => formatMeV(value, 3),
  E_F: (value) => formatMeV(value, 3),
  T: (value) => formatKelvin(value, 3),
};

export function ControlsPanel({
  parameters,
  playing,
  baseline,
  inspectedSession,
  importedSessionError,
  canCaptureBaseline,
  exportVersion,
  exportTrustStatus,
  onParameterChange,
  onTogglePlaying,
  onCaptureBaseline,
  onImportSession,
  onRestoreImportedSession,
  onClearImportedSession,
  onExportPlot,
  onExportSession,
  onReset,
}: ControlsPanelProps) {
  const controls = getParameterControlDefinitions(parameters);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <section className="panel">
      <header className="panel-header">
        <h2>Controls</h2>
        <div className="header-actions">
          <button type="button" className="secondary" onClick={onTogglePlaying}>
            {playing ? "Pause" : "Play"}
          </button>
          <button type="button" className="secondary" onClick={onCaptureBaseline} disabled={!canCaptureBaseline}>
            {baseline ? "Update baseline" : "Set baseline"}
          </button>
          <button type="button" className="secondary" onClick={() => importInputRef.current?.click()}>
            Inspect session
          </button>
          <button type="button" className="secondary" onClick={onExportSession}>
            Export session
          </button>
          <button type="button" className="secondary" onClick={onExportPlot}>
            Export plot
          </button>
          <button type="button" className="secondary" onClick={onReset}>
            Reset
          </button>
        </div>
      </header>
      <div className="controls-stack">
        {controls.map((control) => (
          <div key={control.key} className="control-card">
            <div className="control-heading">
              <label htmlFor={`parameter-${control.key}`} className="control-label">
                {control.label} ({control.symbol})
              </label>
              <span className="control-unit">{control.unit}</span>
            </div>
            <input
              id={`parameter-${control.key}`}
              name={control.key}
              type="range"
              min={control.min}
              max={control.max}
              step={control.step}
              value={parameters[control.key]}
              onChange={(event) =>
                onParameterChange({
                  [control.key]: Number(event.currentTarget.value),
                })
              }
            />
            <div className="control-reading">
              <output htmlFor={`parameter-${control.key}`}>{VALUE_FORMATTERS[control.key](parameters[control.key])}</output>
              <span>
                {VALUE_FORMATTERS[control.key](control.min)} to {VALUE_FORMATTERS[control.key](control.max)}
              </span>
            </div>
          </div>
        ))}
      </div>
      <dl className="data-grid" aria-label="Current parameter state">
        {controls.map((control) => (
          <div key={`state-${control.key}`}>
            <dt>
              {control.symbol} <span className="inline-unit">{control.unit}</span>
            </dt>
            <dd>{VALUE_FORMATTERS[control.key](parameters[control.key])}</dd>
          </div>
        ))}
      </dl>
      <p className="baseline-note">
        {baseline
          ? `Baseline captured from state version ${baseline.capturedAtStateVersion}. Reset clears the comparison.`
          : "No baseline captured yet."}
      </p>
      <p className="baseline-note" aria-label="Export session note">
        Local export includes app version {exportVersion} and current trust status {exportTrustStatus}.
      </p>
      <p className="baseline-note" aria-label="Export plot note">
        Plot export stays local, is triggered only by explicit user action, and includes session-identifying trust context.
      </p>
      <input
        ref={importInputRef}
        type="file"
        accept="application/json"
        className="file-input-hidden"
        aria-label="Inspect session file"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file) {
            onImportSession(file);
          }
          event.currentTarget.value = "";
        }}
      />
      {inspectedSession ? (
        <div className="inspection-note" aria-label="Imported session note">
          <p className="baseline-note">
            Imported session from app version {inspectedSession.package.app.version} diagnosed as {inspectedSession.issueCategory}.
          </p>
          <div className="header-actions">
            <button type="button" className="secondary" onClick={onRestoreImportedSession}>
              Restore imported parameters
            </button>
            <button type="button" className="secondary" onClick={onClearImportedSession}>
              Clear imported session
            </button>
          </div>
        </div>
      ) : importedSessionError ? (
        <div className="inspection-note" aria-label="Imported session note">
          <p className="baseline-note">{importedSessionError}</p>
          <div className="header-actions">
            <button type="button" className="secondary" onClick={onClearImportedSession}>
              Clear imported session
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
