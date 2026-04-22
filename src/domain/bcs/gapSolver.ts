import { computeGapCurveModel, createPendingGapPlotView, resolveGapPlotView } from "./gap-curve.mjs";
import type { GapPlotView, ParameterVector } from "./types.ts";

export function computeGapPlaceholder(parameters: ParameterVector) {
  const result = computeGapCurveModel(parameters, { stateVersion: 0 });
  return {
    stateVersion: 0,
    metricsReady: result.viewState !== "invalid" && result.viewState !== "failed",
    gapReady: result.viewState === "stable" || result.viewState === "normal-state",
  };
}

export function buildGapPlotView(parameters: ParameterVector, stateVersion: number): GapPlotView {
  const result = computeGapCurveModel(parameters, { stateVersion });
  return toGapPlotView(result);
}

export function createPendingPlotView(requestedStateVersion: number, previousView: GapPlotView | null): GapPlotView {
  const pending = createPendingGapPlotView({
    requestedStateVersion,
    previousStableView: previousView
      ? {
          ...previousView,
          metricSnapshot: previousView.metricSnapshot,
          plot: previousView.plot,
        }
      : null,
  });
  return toGapPlotView(pending);
}

export function resolveCommittedPlotView({
  requestedStateVersion,
  computationView,
  previousView,
}: {
  requestedStateVersion: number;
  computationView: GapPlotView | null;
  previousView: GapPlotView | null;
}): GapPlotView {
  const resolved = resolveGapPlotView({
    requestedStateVersion,
    computationView,
    previousStableView: previousView
      ? {
          ...previousView,
          metricSnapshot: previousView.metricSnapshot,
          plot: previousView.plot,
        }
      : null,
  });
  return toGapPlotView(resolved);
}

function toGapPlotView(result: any): GapPlotView {
  return {
    viewState: result.viewState,
    stateVersion: result.stateVersion,
    renderedStateVersion: result.renderedStateVersion ?? result.stateVersion,
    issues: result.issues ?? [],
    isUpdating: Boolean(result.isUpdating),
    metricSnapshot: result.metricSnapshot
      ? {
          Delta_0: result.metricSnapshot.Delta_0,
        }
      : null,
    message: result.message ?? null,
    plot: result.plot
      ? {
          domain: result.plot.domain,
          samples: result.plot.samples,
          selectedPoint: result.plot.selectedPoint,
          sampleCount: result.plot.sampleCount,
        }
      : null,
  };
}
