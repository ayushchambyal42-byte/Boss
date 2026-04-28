import { useEffect, useReducer, useRef, useState } from "react";
import { ExplorerShell } from "./components/Shell/ExplorerShell.tsx";
import { GuidedEntry } from "./components/Shell/GuidedEntry.tsx";
import { LandingSurface } from "./components/Shell/LandingSurface.tsx";
import { downloadPlotExport } from "./domain/bcs/exportPlot.ts";
import { buildSessionInspection, downloadSessionExport, parseSessionExportPackage } from "./domain/bcs/exportSession.ts";
import { buildGapPlotView } from "./domain/bcs/gapSolver.ts";
import { deriveCriticalTemperature } from "./domain/bcs/metrics.ts";
import { buildMetricCardViews } from "./domain/bcs/metrics.ts";
import { createInitialExplorerState, explorerReducer } from "./state/explorerState.ts";

export default function App() {
  const [state, dispatch] = useReducer(explorerReducer, undefined, () => createInitialStateFromWindow());
  const [playing, setPlaying] = useState(false);
  const currentTc = deriveCriticalTemperature(state.parameters);
  const currentTemperatureRef = useRef(state.parameters.T);

  useEffect(() => {
    currentTemperatureRef.current = state.parameters.T;
  }, [state.parameters.T]);

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

  useEffect(() => {
    if (!playing || state.view !== "explorer") {
      return;
    }
    if (!Number.isFinite(currentTc) || currentTc <= 0) {
      setPlaying(false);
      return;
    }

    const baseStep = currentTc / 180;
    if (!Number.isFinite(baseStep) || baseStep <= 0) {
      setPlaying(false);
      return;
    }

    const timer = window.setInterval(() => {
      const currentTemperature = Math.min(Math.max(currentTemperatureRef.current, 0), currentTc);
      const reducedTemperature = currentTc > 0 ? currentTemperature / currentTc : 0;
      const adaptiveStep = baseStep * (1 - reducedTemperature + 0.1);
      const nextTemperature = Math.min(currentTc, currentTemperature + adaptiveStep);
      currentTemperatureRef.current = nextTemperature;

      dispatch({
        type: "parameters/changed",
        parameters: { T: nextTemperature },
      });

      if (nextTemperature >= currentTc - 1e-9) {
        setPlaying(false);
      }
    }, 40);

    return () => window.clearInterval(timer);
  }, [currentTc, playing, state.view]);

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
          playing={playing}
          onNavigate={(view) => {
            setPlaying(false);
            dispatch({ type: "view/selected", view });
          }}
          onParameterChange={(parameters) => {
            setPlaying(false);
            dispatch({ type: "parameters/changed", parameters });
          }}
          onTogglePlaying={() => setPlaying((value) => !value)}
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
          onRestoreImportedSession={() => {
            setPlaying(false);
            dispatch({ type: "session/restored" });
          }}
          onClearImportedSession={() => dispatch({ type: "session/cleared" })}
          onExportPlot={() => downloadPlotExport(state)}
          onExportSession={() => downloadSessionExport(state)}
          onReset={() => {
            setPlaying(false);
            dispatch({ type: "explorer/reset" });
          }}
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
