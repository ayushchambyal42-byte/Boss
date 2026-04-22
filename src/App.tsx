import { useEffect, useReducer } from "react";
import { ExplorerShell } from "./components/Shell/ExplorerShell.tsx";
import { GuidedEntry } from "./components/Shell/GuidedEntry.tsx";
import { LandingSurface } from "./components/Shell/LandingSurface.tsx";
import { downloadPlotExport } from "./domain/bcs/exportPlot.ts";
import { buildSessionInspection, downloadSessionExport, parseSessionExportPackage } from "./domain/bcs/exportSession.ts";
import { buildGapPlotView } from "./domain/bcs/gapSolver.ts";
import { buildMetricCardViews } from "./domain/bcs/metrics.ts";
import { createInitialExplorerState, explorerReducer } from "./state/explorerState.ts";

export default function App() {
  const [state, dispatch] = useReducer(explorerReducer, undefined, () => createInitialStateFromWindow());

  useEffect(() => {
    const mediaQuery = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    const syncEnvironment = () =>
      dispatch({
        type: "environment/updated",
        width: window.innerWidth,
        userAgent: window.navigator.userAgent,
        reducedMotion: Boolean(mediaQuery?.matches),
        reducedMotionSupported: Boolean(mediaQuery),
      });

    const onResize = () => syncEnvironment();
    window.addEventListener("resize", onResize);
    syncEnvironment();

    if (mediaQuery?.addEventListener) {
      mediaQuery.addEventListener("change", syncEnvironment);
    }

    return () => {
      window.removeEventListener("resize", onResize);
      if (mediaQuery?.removeEventListener) {
        mediaQuery.removeEventListener("change", syncEnvironment);
      }
    };
  }, []);

  useEffect(() => {
    if (state.updateStatus !== "pending") {
      return;
    }

    const timer = window.setTimeout(() => {
      dispatch({
        type: "results/committed",
        stateVersion: state.stateVersion,
        computed: {
          stateVersion: state.stateVersion,
          metricsReady: true,
          gapReady: true,
          metricView: buildMetricCardViews(state.parameters),
          plotView: buildGapPlotView(state.parameters, state.stateVersion),
        },
      });
    }, 30);

    return () => window.clearTimeout(timer);
  }, [state.parameters, state.stateVersion, state.updateStatus]);

  return (
    <main className="app-shell" data-view={state.view}>
      {state.view === "landing" ? (
        <LandingSurface
          onEnterExplorer={() => dispatch({ type: "view/selected", view: "explorer" })}
          onEnterGuided={() => dispatch({ type: "view/selected", view: "guided" })}
        />
      ) : null}
      {state.view === "guided" ? (
        <GuidedEntry
          onBack={() => dispatch({ type: "view/selected", view: "landing" })}
          onContinue={() => dispatch({ type: "view/selected", view: "explorer" })}
          browserNotice={state.browserNotice}
          reducedMotion={state.reducedMotion}
          reducedMotionSupported={state.reducedMotionSupported}
        />
      ) : null}
      {state.view === "explorer" ? (
        <ExplorerShell
          state={state}
          onNavigate={(view) => dispatch({ type: "view/selected", view })}
          onParameterChange={(parameters) => dispatch({ type: "parameters/changed", parameters })}
          onThresholdChange={(probeStrength) => dispatch({ type: "threshold/changed", probeStrength })}
          onCaptureBaseline={() => dispatch({ type: "baseline/captured" })}
          onImportSession={async (file) => {
            try {
              const payload = await file.text();
              const sessionPackage = parseSessionExportPackage(payload);
              const inspection = buildSessionInspection(sessionPackage);
              dispatch({ type: "session/inspected", inspection });
            } catch (error) {
              dispatch({
                type: "session/import-failed",
                message: error instanceof Error ? error.message : "Imported file is not a valid session package.",
              });
            }
          }}
          onRestoreImportedSession={() => dispatch({ type: "session/restored" })}
          onClearImportedSession={() => dispatch({ type: "session/cleared" })}
          onExportPlot={() => downloadPlotExport(state)}
          onExportSession={() => downloadSessionExport(state)}
          onReset={() => dispatch({ type: "explorer/reset" })}
        />
      ) : null}
    </main>
  );
}

function createInitialStateFromWindow() {
  const reducedMotionQuery = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  return createInitialExplorerState(window.innerWidth, {
    userAgent: window.navigator.userAgent,
    reducedMotion: Boolean(reducedMotionQuery?.matches),
    reducedMotionSupported: Boolean(reducedMotionQuery),
  });
}
