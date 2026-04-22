import test from "node:test";
import assert from "node:assert/strict";

import { DEFAULT_PARAMETERS } from "../src/domain/bcs/parameters.mjs";
import { computeCoreMetrics } from "../src/domain/bcs/metrics.mjs";
import {
  GAP_SOLVER_CONTRACT,
  computeGapCurveModel,
  createPendingGapPlotView,
  resolveGapPlotView,
  solveGapAtTemperature,
} from "../src/domain/bcs/gap-curve.mjs";

test("Delta(T) matches the locked low-temperature, transition, and above-Tc benchmarks", () => {
  const metricResult = computeCoreMetrics(DEFAULT_PARAMETERS);
  const Tc = metricResult.metrics.T_c;
  const Delta0 = metricResult.metrics.Delta_0;

  const atZero = solveGapAtTemperature({ ...DEFAULT_PARAMETERS, T: 0 });
  assert.equal(atZero.viewState, "stable");
  assert.ok(Math.abs(atZero.selectedPoint.Delta - Delta0) <= 1e-6 * Delta0 + 1e-12);

  const atTc = solveGapAtTemperature({ ...DEFAULT_PARAMETERS, T: Tc });
  assert.equal(atTc.viewState, "normal-state");
  assert.ok(Math.abs(atTc.selectedPoint.Delta) <= 1e-8);

  const aboveTc = solveGapAtTemperature({ ...DEFAULT_PARAMETERS, T: 1.1 * Tc });
  assert.equal(aboveTc.viewState, "normal-state");
  assert.ok(Math.abs(aboveTc.selectedPoint.Delta) <= 1e-12);
});

test("returned low-temperature gap itself satisfies the solver residual tolerance", () => {
  const metricResult = computeCoreMetrics(DEFAULT_PARAMETERS);
  const sampleTemperature = (1 / (GAP_SOLVER_CONTRACT.curveSampleCount - 1)) * (GAP_SOLVER_CONTRACT.curveDomainMultiplier * metricResult.metrics.T_c);
  const result = solveGapAtTemperature({ ...DEFAULT_PARAMETERS, T: sampleTemperature });

  assert.equal(result.viewState, "stable");
  assert.ok(Math.abs(result.solver.residual) <= GAP_SOLVER_CONTRACT.residualTolerance);
  assert.ok(result.selectedPoint.Delta <= metricResult.metrics.Delta_0 + 1e-9);
});

test("Delta(T) matches the locked ratio windows at 0.50 Tc and 0.90 Tc", () => {
  const metricResult = computeCoreMetrics(DEFAULT_PARAMETERS);
  const Tc = metricResult.metrics.T_c;
  const Delta0 = metricResult.metrics.Delta_0;

  const halfTc = solveGapAtTemperature({ ...DEFAULT_PARAMETERS, T: 0.5 * Tc });
  const halfRatio = halfTc.selectedPoint.Delta / Delta0;
  assert.ok(halfRatio >= 0.93 && halfRatio <= 0.98);

  const nearTc = solveGapAtTemperature({ ...DEFAULT_PARAMETERS, T: 0.9 * Tc });
  const nearRatio = nearTc.selectedPoint.Delta / Delta0;
  assert.ok(nearRatio >= 0.45 && nearRatio <= 0.6);
});

test("gap curve model produces a finite, non-negative, monotonically non-increasing default curve", () => {
  const metricResult = computeCoreMetrics(DEFAULT_PARAMETERS);
  const model = computeGapCurveModel({ ...DEFAULT_PARAMETERS, T: 0.25 * metricResult.metrics.T_c }, { stateVersion: 3 });

  assert.equal(model.viewState, "stable");
  assert.equal(model.stateVersion, 3);
  assert.equal(model.plot.sampleCount, GAP_SOLVER_CONTRACT.curveSampleCount);
  assert.equal(model.plot.domain.maxT, GAP_SOLVER_CONTRACT.curveDomainMultiplier * metricResult.metrics.T_c);

  for (let index = 0; index < model.plot.samples.length; index += 1) {
    const point = model.plot.samples[index];
    assert.ok(Number.isFinite(point.T));
    assert.ok(Number.isFinite(point.Delta));
    assert.ok(point.Delta >= -1e-12);
    if (index > 0) {
      const previous = model.plot.samples[index - 1];
      const tolerance = GAP_SOLVER_CONTRACT.monotonicToleranceScale * Math.max(metricResult.metrics.Delta_0, 1);
      assert.ok(point.T >= previous.T);
      assert.ok(point.Delta - previous.Delta <= tolerance);
    }
  }
});

test("selected point and metric snapshot stay synchronized within a stable plot model", () => {
  const metricResult = computeCoreMetrics(DEFAULT_PARAMETERS);
  const selectedTemperature = 0.5 * metricResult.metrics.T_c;
  const selectedGap = solveGapAtTemperature({ ...DEFAULT_PARAMETERS, T: selectedTemperature });
  const model = computeGapCurveModel({ ...DEFAULT_PARAMETERS, T: selectedTemperature }, { stateVersion: 5 });

  assert.equal(model.viewState, "stable");
  assert.equal(model.stateVector.T, selectedTemperature);
  assert.equal(model.metricSnapshot.T_c, metricResult.metrics.T_c);
  assert.equal(model.plot.selectedPoint.T, selectedTemperature);
  assert.ok(Math.abs(model.plot.selectedPoint.Delta - selectedGap.selectedPoint.Delta) <= 1e-12);
  assert.equal(model.plot.selectedPoint.stateVersion, 5);
});

test("pending and stale-result resolution never present stale results as final", () => {
  const metricResult = computeCoreMetrics(DEFAULT_PARAMETERS);
  const stableV1 = computeGapCurveModel({ ...DEFAULT_PARAMETERS, T: 0.25 * metricResult.metrics.T_c }, { stateVersion: 1 });

  const pending = createPendingGapPlotView({ requestedStateVersion: 2, previousStableView: stableV1 });
  assert.equal(pending.viewState, "pending");
  assert.equal(pending.stateVersion, 2);
  assert.equal(pending.renderedStateVersion, 1);
  assert.equal(pending.isUpdating, true);

  const staleResolved = resolveGapPlotView({
    requestedStateVersion: 2,
    computationView: stableV1,
    previousStableView: stableV1,
  });
  assert.equal(staleResolved.viewState, "pending");
  assert.equal(staleResolved.staleResultSuppressed, true);
  assert.equal(staleResolved.renderedStateVersion, 1);

  const stableV2 = computeGapCurveModel({ ...DEFAULT_PARAMETERS, T: 0.5 * metricResult.metrics.T_c }, { stateVersion: 2 });
  const currentResolved = resolveGapPlotView({
    requestedStateVersion: 2,
    computationView: stableV2,
    previousStableView: stableV1,
  });
  assert.equal(currentResolved.viewState, "stable");
  assert.equal(currentResolved.stateVersion, 2);
  assert.equal(currentResolved.isUpdating, false);
});

test("invalid input and solver-config failures produce explicit invalid or failed plot states", () => {
  const invalid = computeGapCurveModel({ ...DEFAULT_PARAMETERS, lambda: 0, T: 0.1 });
  assert.equal(invalid.viewState, "invalid");
  assert.equal(invalid.plot, null);

  const failed = computeGapCurveModel({ ...DEFAULT_PARAMETERS, T: 0.1 }, { integrationPoints: 511 });
  assert.equal(failed.viewState, "failed");
  assert.equal(failed.plot, null);
  assert.match(failed.message, />= 512/);
});
