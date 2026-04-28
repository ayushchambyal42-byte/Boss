import { useState } from "react";
import { ControlsPanel } from "../Controls/ControlsPanel.tsx";
import { MetricsPanel } from "../Metrics/MetricsPanel.tsx";
import { PlotPanel } from "../Plots/PlotPanel.tsx";
import { StatusPanel } from "../Status/StatusPanel.tsx";
import { APP_VERSION } from "../../appMetadata.ts";
import { buildSessionExportPackage } from "../../domain/bcs/exportSession.ts";
import type { AppView, ExplorerState, ParameterVector } from "../../domain/bcs/types.ts";

type ExplorerShellProps = {
  state: ExplorerState;
  playing: boolean;
  onNavigate: (view: AppView) => void;
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

export function ExplorerShell({
  state,
  playing,
  onNavigate,
  onParameterChange,
  onTogglePlaying,
  onCaptureBaseline,
  onImportSession,
  onRestoreImportedSession,
  onClearImportedSession,
  onExportPlot,
  onExportSession,
  onReset,
}: ExplorerShellProps) {
  const [presentationSafe, setPresentationSafe] = useState(false);
  const hasSupportNotices = state.viewportMode === "degraded" || Boolean(state.browserNotice) || state.reducedMotion || !state.reducedMotionSupported;
  const exportSessionPackage = buildSessionExportPackage(state);

  return (
    <section
      className="surface explorer-surface"
      data-reduced-motion={state.reducedMotion ? "reduce" : "no-preference"}
      data-presentation-safe={presentationSafe ? "on" : "off"}
    >
      <header className="shell-header">
        <div>
          <p className="eyebrow">Explorer shell</p>
          <h1>Stateful SPA exploration</h1>
        </div>
        <nav className="shell-nav" aria-label="Explorer views">
          <button type="button" className={state.view === "landing" ? "secondary" : ""} onClick={() => onNavigate("landing")}>
            Landing
          </button>
          <button type="button" className={state.view === "guided" ? "secondary" : ""} onClick={() => onNavigate("guided")}>
            Guided
          </button>
          <button type="button" className={state.view === "explorer" ? "secondary" : ""} onClick={() => onNavigate("explorer")}>
            Explorer
          </button>
          <button type="button" className={presentationSafe ? "" : "secondary"} onClick={() => setPresentationSafe((value) => !value)}>
            {presentationSafe ? "Exit Presentation Safe" : "Presentation Safe"}
          </button>
        </nav>
      </header>
      {presentationSafe ? (
        <section className="support-notices" aria-label="Presentation-safe notices">
          <aside className="desktop-notice browser-notice" role="status">
            Presentation-safe layout is active. Truth labels, validity guidance, reset, and guided re-entry remain visible for repeatable live demos.
          </aside>
        </section>
      ) : null}
      {hasSupportNotices ? (
        <section className="support-notices" aria-label="Support notices">
          {state.viewportMode === "degraded" ? (
            <aside className="desktop-notice" role="status">
              Desktop-first layout: core content remains visible, but this shell is optimized for widths at or above 1024px.
            </aside>
          ) : null}
          {state.browserNotice ? (
            <aside className="desktop-notice browser-notice" role="status">
              Browser support: {state.browserNotice}
            </aside>
          ) : null}
          {state.reducedMotion ? (
            <aside className="desktop-notice motion-notice" role="status">
              Reduced motion is active. Non-essential animation and motion emphasis are minimized for the explorer.
            </aside>
          ) : null}
          {!state.reducedMotionSupported ? (
            <aside className="desktop-notice browser-notice" role="status">
              Reduced-motion preference detection is unavailable in this browser, so motion accommodations may be limited.
            </aside>
          ) : null}
        </section>
      ) : null}
      <div className="explorer-grid">
        <div className="left-rail">
          <ControlsPanel
            parameters={state.parameters}
            playing={playing}
            baseline={state.baseline}
            inspectedSession={state.inspectedSession}
            importedSessionError={state.importedSessionError}
            canCaptureBaseline={state.updateStatus === "stable" && Boolean(state.computed.metricView && state.computed.plotView)}
            exportVersion={APP_VERSION}
            exportTrustStatus={exportSessionPackage.sessionTrustStatus}
            onParameterChange={onParameterChange}
            onTogglePlaying={onTogglePlaying}
            onCaptureBaseline={onCaptureBaseline}
            onImportSession={onImportSession}
            onRestoreImportedSession={onRestoreImportedSession}
            onClearImportedSession={onClearImportedSession}
            onExportPlot={onExportPlot}
            onExportSession={onExportSession}
            onReset={onReset}
          />
        </div>
        <div className="center-rail">
          <PlotPanel state={state} playing={playing} />
        </div>
        <div className="right-rail">
          <MetricsPanel state={state} />
          <StatusPanel state={state} />
        </div>
      </div>
    </section>
  );
}
