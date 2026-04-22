import test from "node:test";
import assert from "node:assert/strict";

import { DEFAULT_PARAMETERS } from "../src/domain/bcs/parameters.mjs";
import { computeCoreMetrics } from "../src/domain/bcs/metrics.mjs";
import {
  GAP_REFERENCE_CONTRACT,
  attachReferenceComparison,
  buildReferenceComparison,
  computeGapReferencePlotModel,
} from "../src/domain/bcs/gap-reference.mjs";
import { computeGapCurveModel, createPendingGapPlotView } from "../src/domain/bcs/gap-curve.mjs";

test("valid stable states expose labeled normalized comparison data subordinate to the numerical curve", () => {
  const metricResult = computeCoreMetrics(DEFAULT_PARAMETERS);
  const model = computeGapReferencePlotModel({ ...DEFAULT_PARAMETERS, T: 0.5 * metricResult.metrics.T_c }, { stateVersion: 7 });

  assert.equal(model.viewState, "stable");
  assert.equal(model.comparison.availability, "supported");
  assert.equal(model.comparison.mode, GAP_REFERENCE_CONTRACT.mode);
  assert.equal(model.comparison.labels.numerical.truthLayer, "computed");
  assert.equal(model.comparison.labels.normalized.truthLayer, "interpretive");
  assert.equal(model.comparison.numericalSeries.length, model.plot.samples.length);
  assert.equal(model.comparison.referenceBenchmarks.length, 4);
  assert.ok(model.comparison.selectedPoint.reducedTemperature > 0);
  assert.ok(model.comparison.selectedPoint.reducedGap <= 1 + 1e-9);
});

test("comparison is constrained for non-valid trust states to preserve truth-layer discipline", () => {
  const metricResult = computeCoreMetrics(DEFAULT_PARAMETERS);
  const baseModel = computeGapCurveModel({ ...DEFAULT_PARAMETERS, T: 1.1 * metricResult.metrics.T_c }, { stateVersion: 8 });
  const comparison = buildReferenceComparison(baseModel);

  assert.equal(baseModel.trustStatus, "near-edge");
  assert.equal(baseModel.viewState, "normal-state");
  assert.equal(comparison.availability, "constrained");
  assert.equal(comparison.numericalSeries, null);
  assert.match(comparison.message, /disabled/);
});

test("comparison is disabled for pending, invalid, and failed states", () => {
  const metricResult = computeCoreMetrics(DEFAULT_PARAMETERS);
  const stable = computeGapCurveModel({ ...DEFAULT_PARAMETERS, T: 0.25 * metricResult.metrics.T_c }, { stateVersion: 1 });
  const pending = createPendingGapPlotView({ requestedStateVersion: 2, previousStableView: stable });
  assert.equal(buildReferenceComparison(pending).availability, "disabled");

  const invalid = computeGapReferencePlotModel({ ...DEFAULT_PARAMETERS, lambda: 0, T: 0.1 });
  assert.equal(invalid.comparison.availability, "disabled");

  const failed = computeGapReferencePlotModel(
    { ...DEFAULT_PARAMETERS, T: 0.1 },
    { integrationPoints: 511 },
  );
  assert.equal(failed.comparison.availability, "disabled");
});

test("reference attachment preserves the authoritative numerical plot untouched", () => {
  const metricResult = computeCoreMetrics(DEFAULT_PARAMETERS);
  const baseModel = computeGapCurveModel({ ...DEFAULT_PARAMETERS, T: 0.9 * metricResult.metrics.T_c }, { stateVersion: 9 });
  const attached = attachReferenceComparison(baseModel);

  assert.equal(attached.plot, baseModel.plot);
  assert.equal(attached.plot.selectedPoint.Delta, baseModel.plot.selectedPoint.Delta);
  assert.equal(attached.comparison.labels.numerical.label, "Numerical Δ(T)");
});
