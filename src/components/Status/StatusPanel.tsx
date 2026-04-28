import { APP_VERSION } from "../../appMetadata.ts";
import { formatMeV } from "../../domain/bcs/displayUnits.ts";
import { buildTrustStatusSummary } from "../../domain/bcs/trustStatus.ts";
import { buildValidityGuidance, guidanceToneClass } from "../../domain/bcs/validityGuidance.ts";
import type { ExplorerState } from "../../domain/bcs/types.ts";
import { TruthLayerStrip } from "../Truth/TruthLayerStrip.tsx";

export function StatusPanel({ state }: { state: ExplorerState }) {
  const statusMessage = getStatusMessage(state);
  const validityGuidance = buildValidityGuidance(state);
  const trustSummary = buildTrustStatusSummary(state);
  const inspection = state.inspectedSession;
  const importError = state.importedSessionError;

  return (
    <section className="panel">
      <header className="panel-header">
        <h2>Validity</h2>
        <span className={`pill pill-${state.validity.status}`}>{state.validity.status}</span>
      </header>
      <TruthLayerStrip
        ariaLabel="Validity truth layers"
        compact
        items={[
          { label: "computed envelope context", tone: "computed" },
          { label: "interpretive validity guidance", tone: "interpretive" },
        ]}
      />
      <p className={`status-copy status-${state.updateStatus}`}>{statusMessage}</p>
      <section
        className={`trust-summary trust-summary-${trustSummary.tone}`}
        aria-label="Trust status summary"
        tabIndex={0}
      >
        <p className="trust-summary-label">{trustSummary.label}</p>
        <p className="trust-summary-state">State: {trustSummary.stateText}</p>
        <p className="trust-summary-reason">Reason: {trustSummary.reasonText}</p>
        <p className="trust-summary-action">{trustSummary.actionText}</p>
      </section>
      <div className={`validity-guidance validity-guidance-${guidanceToneClass(validityGuidance.tone)}`} aria-label="Validity guidance">
        <p className="validity-guidance-label">{validityGuidance.label}</p>
        <p className="validity-guidance-copy">{validityGuidance.summary}</p>
        <p className="validity-guidance-action">{validityGuidance.recommendation}</p>
      </div>
      <dl className="data-grid">
        <div>
          <dt>Debye energy ħω_D (meV)</dt>
          <dd>{formatMeV(state.effectiveParameters.omega_D, 3)}</dd>
        </div>
        <div>
          <dt>ω_D / E_F</dt>
          <dd>{state.effectiveParameters.omega_D_over_E_F.toFixed(4)}</dd>
        </div>
      </dl>
      <ul className="issue-list">
        {state.validity.issues.length > 0 ? state.validity.issues.map((issue) => <li key={`${issue.status}-${issue.message}`}>{issue.message}</li>) : <li>Within the default shell envelope.</li>}
      </ul>
      {inspection ? (
        <section className="comparison-panel" aria-label="Imported session diagnostics">
          <div className="comparison-header">
            <p className="comparison-title">Imported session diagnostics</p>
            <span className="truth-label truth-label-interpretive">interpretive review</span>
          </div>
          <p className="comparison-copy">
            Imported app version {inspection.package.app.version} · current app version {APP_VERSION}
          </p>
          <dl className="comparison-grid">
            <div>
              <dt>Reported trust status</dt>
              <dd>{inspection.package.sessionTrustStatus}</dd>
              <dd className="comparison-delta comparison-flat">exported state version {inspection.package.stateVersion}</dd>
            </div>
            <div>
              <dt>Primary issue category</dt>
              <dd>{inspection.issueCategory}</dd>
              <dd className="comparison-delta comparison-flat">review path stays local to this SPA session</dd>
            </div>
          </dl>
          <ul className="issue-list">
            {inspection.cues.map((cue) => (
              <li key={cue}>{cue}</li>
            ))}
          </ul>
        </section>
      ) : importError ? (
        <section className="comparison-panel" aria-label="Imported session diagnostics">
          <div className="comparison-header">
            <p className="comparison-title">Imported session diagnostics</p>
            <span className="truth-label truth-label-interpretive">interpretive review</span>
          </div>
          <p className="comparison-copy">{importError}</p>
          <p className="comparison-copy">Review path stays local. Clear the imported session and retry with a valid exported package.</p>
        </section>
      ) : null}
    </section>
  );
}

function getStatusMessage(state: ExplorerState): string {
  if (state.updateStatus === "pending") {
    return "Updating: previous computed values are shown as stale until recomputation completes.";
  }
  if (state.updateStatus === "failed") {
    return `Solver failure: ${state.computed.plotView?.message ?? "validated recomputation failed."}`;
  }
  if (state.updateStatus === "invalid") {
    return `Invalid input: ${state.validity.issues[0]?.message ?? "current inputs are outside the supported envelope."}`;
  }
  if (state.validity.status === "constrained") {
    return `Unsupported regime warning: ${state.validity.issues[0]?.message ?? "current state is constrained."}`;
  }
  if (state.computed.plotView?.message) {
    return `Partial failure note: ${state.computed.plotView.message}`;
  }
  return "Current computed surfaces match the validated parameter state.";
}
