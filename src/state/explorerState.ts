import { SHELL_VIEWPORT_BREAKPOINTS } from "../domain/bcs/constants.ts";
import { assessEnvironment } from "../domain/bcs/environment.ts";
import { buildGapPlotView, createPendingPlotView, resolveCommittedPlotView } from "../domain/bcs/gapSolver.ts";
import { buildMetricCardViews, createPendingMetricView } from "../domain/bcs/metrics.ts";
import { createDefaultParameterVector, deriveEffectiveParameters, normalizeParameterVector } from "../domain/bcs/parameters.ts";
import { THRESHOLD_INTERACTION_CONTRACT } from "../domain/bcs/thresholdContract.ts";
import { deriveValidityState } from "../domain/bcs/validation.ts";
import type { AppView, BaselineSnapshot, ComputedPlaceholder, ExplorerState, ParameterVector, SessionInspection, ViewportMode } from "../domain/bcs/types.ts";

export type ExplorerAction =
  | { type: "view/selected"; view: AppView }
  | { type: "parameters/changed"; parameters: Partial<ParameterVector> }
  | { type: "threshold/changed"; probeStrength: number }
  | { type: "results/committed"; stateVersion: number; computed: ComputedPlaceholder }
  | { type: "baseline/captured" }
  | { type: "session/inspected"; inspection: SessionInspection }
  | { type: "session/import-failed"; message: string }
  | { type: "session/cleared" }
  | { type: "session/restored" }
  | { type: "explorer/reset" }
  | { type: "environment/updated"; width: number; userAgent: string; reducedMotion: boolean; reducedMotionSupported: boolean }
  | { type: "viewport/updated"; width: number };

export function createInitialExplorerState(
  width = 1280,
  environment: { userAgent?: string; reducedMotion?: boolean; reducedMotionSupported?: boolean } = {},
): ExplorerState {
  const parameters = createDefaultParameterVector();
  const assessedEnvironment = assessEnvironment({
    userAgent: environment.userAgent ?? "",
    reducedMotion: environment.reducedMotion ?? false,
    reducedMotionSupported: environment.reducedMotionSupported ?? false,
  });
  return buildState({
    view: "landing",
    viewportMode: getViewportMode(width),
    browserFamily: assessedEnvironment.browserFamily,
    browserSupportLevel: assessedEnvironment.browserSupportLevel,
    browserNotice: assessedEnvironment.browserNotice,
    reducedMotion: assessedEnvironment.reducedMotion,
    reducedMotionSupported: assessedEnvironment.reducedMotionSupported,
    thresholdProbeStrength: THRESHOLD_INTERACTION_CONTRACT.control.defaultValue,
    parameters,
    stateVersion: 0,
    computed: {
      stateVersion: null,
      metricsReady: false,
      gapReady: false,
      metricView: null,
      plotView: null,
    },
    baseline: null,
    inspectedSession: null,
    importedSessionError: null,
    updateStatus: "stable",
  });
}

export function explorerReducer(state: ExplorerState, action: ExplorerAction): ExplorerState {
  switch (action.type) {
    case "view/selected":
      return { ...state, view: action.view };
    case "parameters/changed": {
      const parameters = normalizeParameterVector({ ...state.parameters, ...action.parameters });
      const nextVersion = state.stateVersion + 1;
      return {
        ...buildState({
          ...state,
          parameters,
          stateVersion: nextVersion,
          computed: {
            stateVersion: null,
            metricsReady: Boolean(state.computed.metricView?.cards.length),
            gapReady: Boolean(state.computed.plotView?.plot),
            metricView: createPendingMetricView(state.computed.metricView),
            plotView: createPendingPlotView(nextVersion, state.computed.plotView),
          },
          updateStatus: "pending",
        }),
        parameters,
      };
    }
    case "results/committed":
      if (action.stateVersion !== state.stateVersion) {
        return state;
      }
      const resolvedPlotView = resolveCommittedPlotView({
        requestedStateVersion: action.stateVersion,
        computationView: action.computed.plotView,
        previousView: state.computed.plotView,
      });
      const metricView = action.computed.metricView;
      return {
        ...state,
        computed: {
          ...state.computed,
          ...action.computed,
          metricsReady: deriveMetricsReady(metricView),
          gapReady: deriveGapReady(resolvedPlotView),
          plotView: resolvedPlotView,
          metricView,
          stateVersion: action.stateVersion,
        },
        updateStatus: deriveUpdateStatus(state.validity.status, resolvedPlotView.viewState),
      };
    case "threshold/changed":
      return {
        ...state,
        thresholdProbeStrength: normalizeThresholdProbeStrength(action.probeStrength),
      };
    case "baseline/captured":
      if (!canCaptureBaseline(state)) {
        return state;
      }
      return {
        ...state,
        baseline: captureBaselineSnapshot(state),
      };
    case "session/inspected":
      return {
        ...state,
        inspectedSession: action.inspection,
        importedSessionError: null,
        view: "explorer",
      };
    case "session/import-failed":
      return {
        ...state,
        inspectedSession: null,
        importedSessionError: action.message,
        view: "explorer",
      };
    case "session/cleared":
      return {
        ...state,
        inspectedSession: null,
        importedSessionError: null,
      };
    case "session/restored": {
      if (!state.inspectedSession) {
        return state;
      }
      const parameters = normalizeParameterVector(state.inspectedSession.importedParameters);
      const nextVersion = state.stateVersion + 1;
      return {
        ...buildState({
          ...state,
          view: "explorer",
          parameters,
          stateVersion: nextVersion,
          computed: {
            stateVersion: null,
            metricsReady: Boolean(state.computed.metricView?.cards.length),
            gapReady: Boolean(state.computed.plotView?.plot),
            metricView: createPendingMetricView(state.computed.metricView),
            plotView: createPendingPlotView(nextVersion, state.computed.plotView),
          },
          updateStatus: "pending",
        }),
        parameters,
      };
    }
    case "explorer/reset":
      return {
        ...buildState({
          ...state,
          thresholdProbeStrength: THRESHOLD_INTERACTION_CONTRACT.control.defaultValue,
          parameters: createDefaultParameterVector(),
          stateVersion: state.stateVersion + 1,
          computed: {
            stateVersion: null,
            metricsReady: false,
            gapReady: false,
            metricView: null,
          plotView: null,
          },
          baseline: null,
          inspectedSession: null,
          importedSessionError: null,
          updateStatus: "stable",
        }),
        view: state.view,
        viewportMode: state.viewportMode,
      };
    case "environment/updated": {
      const assessedEnvironment = assessEnvironment({
        userAgent: action.userAgent,
        reducedMotion: action.reducedMotion,
        reducedMotionSupported: action.reducedMotionSupported,
      });
      return {
        ...state,
        viewportMode: getViewportMode(action.width),
        browserFamily: assessedEnvironment.browserFamily,
        browserSupportLevel: assessedEnvironment.browserSupportLevel,
        browserNotice: assessedEnvironment.browserNotice,
        reducedMotion: assessedEnvironment.reducedMotion,
        reducedMotionSupported: assessedEnvironment.reducedMotionSupported,
      };
    }
    case "viewport/updated":
      return {
        ...state,
        viewportMode: getViewportMode(action.width),
      };
    default:
      return state;
  }
}

function buildState(base: {
  view: AppView;
  viewportMode: ViewportMode;
  browserFamily: ExplorerState["browserFamily"];
  browserSupportLevel: ExplorerState["browserSupportLevel"];
  browserNotice: ExplorerState["browserNotice"];
  reducedMotion: boolean;
  reducedMotionSupported: boolean;
  thresholdProbeStrength: number;
  parameters: ParameterVector;
  stateVersion: number;
  computed: ComputedPlaceholder;
  baseline: BaselineSnapshot | null;
  inspectedSession: SessionInspection | null;
  importedSessionError: string | null;
  updateStatus: ExplorerState["updateStatus"];
}): ExplorerState {
  const effectiveParameters = deriveEffectiveParameters(base.parameters);
  const validity = deriveValidityState(base.parameters);
  const hasPrecomputedViews = Boolean(base.computed.metricView || base.computed.plotView);
  const computed =
    base.computed.stateVersion === null && !hasPrecomputedViews
      ? createComputedState(base.parameters, base.stateVersion)
      : base.computed;

  return {
    ...base,
    effectiveParameters,
    validity,
    computed,
    baseline: base.baseline,
    inspectedSession: base.inspectedSession,
    importedSessionError: base.importedSessionError,
    updateStatus: base.updateStatus === "pending" ? "pending" : deriveUpdateStatus(validity.status, computed.plotView?.viewState),
  };
}

function getViewportMode(width: number): ViewportMode {
  return width < SHELL_VIEWPORT_BREAKPOINTS.degradedNotice ? "degraded" : "desktop";
}

function normalizeThresholdProbeStrength(value: number): number {
  if (!Number.isFinite(value)) {
    return THRESHOLD_INTERACTION_CONTRACT.control.defaultValue;
  }
  return Math.min(THRESHOLD_INTERACTION_CONTRACT.control.max, Math.max(THRESHOLD_INTERACTION_CONTRACT.control.min, value));
}

function createComputedState(parameters: ParameterVector, stateVersion: number): ComputedPlaceholder {
  const metricView = buildMetricCardViews(parameters);
  const plotView = buildGapPlotView(parameters, stateVersion);

  return {
    stateVersion,
    metricsReady: deriveMetricsReady(metricView),
    gapReady: deriveGapReady(plotView),
    metricView,
    plotView,
  };
}

function deriveMetricsReady(metricView: ComputedPlaceholder["metricView"]): boolean {
  return Boolean(metricView && metricView.cards.length > 0 && metricView.status !== "invalid" && metricView.status !== "failed");
}

function deriveGapReady(plotView: ComputedPlaceholder["plotView"]): boolean {
  return Boolean(plotView && (plotView.viewState === "stable" || plotView.viewState === "normal-state"));
}

function captureBaselineSnapshot(state: ExplorerState): BaselineSnapshot | null {
  if (!canCaptureBaseline(state)) {
    return null;
  }

  return {
    capturedAtStateVersion: state.stateVersion,
    parameters: { ...state.parameters },
    metricView: state.computed.metricView,
    plotView: state.computed.plotView,
  };
}

function canCaptureBaseline(state: ExplorerState): boolean {
  const metricView = state.computed.metricView;
  const plotView = state.computed.plotView;
  if (!metricView || !plotView) {
    return false;
  }
  if (state.updateStatus !== "stable") {
    return false;
  }
  if (state.computed.stateVersion !== state.stateVersion) {
    return false;
  }
  if (metricView.status !== "valid") {
    return false;
  }
  if (plotView.viewState !== "stable" && plotView.viewState !== "normal-state") {
    return false;
  }
  return true;
}

function deriveUpdateStatus(validityStatus: ExplorerState["validity"]["status"], plotViewState?: string): ExplorerState["updateStatus"] {
  if (plotViewState === "pending") {
    return "pending";
  }
  if (plotViewState === "failed") {
    return "failed";
  }
  if (validityStatus === "invalid" || plotViewState === "invalid") {
    return "invalid";
  }
  return "stable";
}
