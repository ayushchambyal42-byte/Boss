import { computeGapCurveModel } from "./gap-curve.mjs";

export const GAP_REFERENCE_CONTRACT = Object.freeze({
  mode: "normalized-benchmark",
  supportedTrustStatuses: Object.freeze(["valid"]),
  benchmarkBands: Object.freeze([
    Object.freeze({ reducedTemperature: 0, kind: "point", expected: 1 }),
    Object.freeze({ reducedTemperature: 0.5, kind: "band", min: 0.93, max: 0.98 }),
    Object.freeze({ reducedTemperature: 0.9, kind: "band", min: 0.45, max: 0.6 }),
    Object.freeze({ reducedTemperature: 1.0, kind: "point", expected: 0 }),
  ]),
  labels: Object.freeze({
    numerical: Object.freeze({
      key: "numerical-gap",
      label: "Numerical Δ(T)",
      truthLayer: "computed",
    }),
    normalized: Object.freeze({
      key: "normalized-reference",
      label: "Normalized weak-coupling reference",
      truthLayer: "interpretive",
    }),
  }),
});

export function computeGapReferencePlotModel(parameters, options = {}) {
  const gapModel = computeGapCurveModel(parameters, options);
  return attachReferenceComparison(gapModel);
}

export function attachReferenceComparison(gapModel) {
  const comparison = buildReferenceComparison(gapModel);
  return {
    ...gapModel,
    comparison,
  };
}

export function buildReferenceComparison(gapModel) {
  if (gapModel.viewState === "pending") {
    return disabledComparison("updating", "Reference comparison is hidden while the numerical curve is updating.");
  }

  if (gapModel.viewState === "invalid" || gapModel.viewState === "failed") {
    return disabledComparison(gapModel.viewState, "Reference comparison is unavailable because the computed state is not trustworthy.");
  }

  if (!gapModel.metricSnapshot || !gapModel.plot) {
    return disabledComparison("unavailable", "Reference comparison requires a stable computed plot.");
  }

  if (!GAP_REFERENCE_CONTRACT.supportedTrustStatuses.includes(gapModel.trustStatus)) {
    return constrainedComparison(
      `Reference comparison is disabled for ${gapModel.trustStatus} states to avoid overstating the model scope.`,
    );
  }

  const tc = gapModel.metricSnapshot.T_c;
  const delta0 = gapModel.metricSnapshot.Delta_0;
  if (!Number.isFinite(tc) || tc <= 0 || !Number.isFinite(delta0) || delta0 <= 0) {
    return disabledComparison("unavailable", "Reference comparison requires positive Tc and Delta(0).");
  }

  return {
    availability: "supported",
    mode: GAP_REFERENCE_CONTRACT.mode,
    message: "Normalized comparison is shown against the supported weak-coupling benchmark behavior.",
    axes: Object.freeze({
      x: "T / T_c",
      y: "Δ(T) / Δ(0)",
    }),
    labels: GAP_REFERENCE_CONTRACT.labels,
    numericalSeries: Object.freeze(
      gapModel.plot.samples.map((point) =>
        Object.freeze({
          reducedTemperature: point.T / tc,
          reducedGap: point.Delta / delta0,
        }),
      ),
    ),
    selectedPoint: Object.freeze({
      reducedTemperature: gapModel.plot.selectedPoint.T / tc,
      reducedGap: gapModel.plot.selectedPoint.Delta / delta0,
      truthLayer: GAP_REFERENCE_CONTRACT.labels.numerical.truthLayer,
    }),
    referenceBenchmarks: GAP_REFERENCE_CONTRACT.benchmarkBands,
  };
}

function disabledComparison(reason, message) {
  return {
    availability: "disabled",
    reason,
    message,
    labels: GAP_REFERENCE_CONTRACT.labels,
    numericalSeries: null,
    selectedPoint: null,
    referenceBenchmarks: null,
  };
}

function constrainedComparison(message) {
  return {
    availability: "constrained",
    reason: "trust-status",
    message,
    labels: GAP_REFERENCE_CONTRACT.labels,
    numericalSeries: null,
    selectedPoint: null,
    referenceBenchmarks: null,
  };
}
