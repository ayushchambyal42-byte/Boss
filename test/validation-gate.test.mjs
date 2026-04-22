import test from "node:test";
import assert from "node:assert/strict";

import { ANALYTIC_CONSTANTS, BENCHMARK_CASES, computeCoreMetrics } from "../src/domain/bcs/metrics.mjs";
import { DEFAULT_PARAMETERS, classifyParameterState } from "../src/domain/bcs/parameters.mjs";
import {
  GAP_SOLVER_CONTRACT,
  __testOnlyComputeGapCurveModel,
  computeGapCurveModel,
  solveGapAtTemperature,
} from "../src/domain/bcs/gap-curve.mjs";

test("Story 1.4 metric benchmarks match the locked regression snapshots", () => {
  for (const benchmark of BENCHMARK_CASES) {
    const result = computeCoreMetrics(benchmark.parameters);
    assert.equal(result.status, "valid");
    assert.ok(relativeClose(result.metrics.T_c, benchmark.expected.T_c, 1e-12));
    assert.ok(relativeClose(result.metrics.Delta_0, benchmark.expected.Delta_0, 1e-12));
    assert.ok(relativeClose(result.metrics.BCS_ratio, benchmark.expected.BCS_ratio, 1e-12));
    assert.ok(relativeClose(Number(result.metrics.T_c.toPrecision(10)), Number(benchmark.expected.T_c.toPrecision(10)), 1e-6));
    assert.ok(relativeClose(Number(result.metrics.Delta_0.toPrecision(10)), Number(benchmark.expected.Delta_0.toPrecision(10)), 1e-6));
  }
});

test("Story 1.4 validates the analytic relation among Delta(0), Tc, and the BCS ratio", () => {
  const result = computeCoreMetrics(DEFAULT_PARAMETERS);

  assert.ok(relativeClose(result.metrics.Delta_0_over_kBTc, ANALYTIC_CONSTANTS.Delta0OverKbTc, 1e-12));
  assert.ok(relativeClose(result.metrics.BCS_ratio, ANALYTIC_CONSTANTS.BCSRatio, 1e-12));
  assert.ok(relativeClose(result.metrics.BCS_ratio, 2 * result.metrics.Delta_0_over_kBTc, 1e-12));
});

test("Story 1.4 gap benchmarks satisfy low-temperature, transition, above-Tc, and monotonicity limits", () => {
  const metricResult = computeCoreMetrics(DEFAULT_PARAMETERS);
  const Tc = metricResult.metrics.T_c;
  const Delta0 = metricResult.metrics.Delta_0;

  const atZero = solveGapAtTemperature({ ...DEFAULT_PARAMETERS, T: 0 });
  assert.ok(relativeClose(atZero.selectedPoint.Delta, Delta0, 1e-6));

  const atTc = solveGapAtTemperature({ ...DEFAULT_PARAMETERS, T: Tc });
  assert.equal(atTc.viewState, "normal-state");
  assert.ok(Math.abs(atTc.selectedPoint.Delta) <= 1e-8);

  const aboveTc = solveGapAtTemperature({ ...DEFAULT_PARAMETERS, T: 1.1 * Tc });
  assert.equal(aboveTc.viewState, "normal-state");
  assert.ok(Math.abs(aboveTc.selectedPoint.Delta) <= 1e-12);

  const halfTc = solveGapAtTemperature({ ...DEFAULT_PARAMETERS, T: 0.5 * Tc });
  const halfRatio = halfTc.selectedPoint.Delta / Delta0;
  assert.ok(halfRatio >= 0.93 && halfRatio <= 0.98);

  const nearTc = solveGapAtTemperature({ ...DEFAULT_PARAMETERS, T: 0.9 * Tc });
  const nearRatio = nearTc.selectedPoint.Delta / Delta0;
  assert.ok(nearRatio >= 0.45 && nearRatio <= 0.60);

  const curve = computeGapCurveModel({ ...DEFAULT_PARAMETERS, T: 0.25 * Tc }, { stateVersion: 4 });
  assert.equal(curve.viewState, "stable");
  const tolerance = GAP_SOLVER_CONTRACT.monotonicToleranceScale * Math.max(Delta0, 1);
  for (let index = 1; index < curve.plot.samples.length; index += 1) {
    const previous = curve.plot.samples[index - 1];
    const current = curve.plot.samples[index];
    assert.ok(Number.isFinite(current.Delta));
    assert.ok(current.Delta >= -tolerance);
    assert.ok(current.Delta - previous.Delta <= tolerance);
  }
});

test("Story 1.4 failure-mode benchmarks record explicit invalid and failed states", () => {
  assert.equal(computeCoreMetrics({ ...DEFAULT_PARAMETERS, lambda: 0 }).status, "invalid");
  assert.equal(computeGapCurveModel({ ...DEFAULT_PARAMETERS, lambda: 0, T: 0.1 }).viewState, "invalid");

  assert.equal(computeCoreMetrics({ ...DEFAULT_PARAMETERS, omega_D_ref: 0 }).status, "invalid");
  assert.equal(computeGapCurveModel({ ...DEFAULT_PARAMETERS, omega_D_ref: 0, T: 0.1 }).viewState, "invalid");

  assert.equal(computeCoreMetrics({ ...DEFAULT_PARAMETERS, E_F: 0 }).status, "invalid");
  assert.equal(computeGapCurveModel({ ...DEFAULT_PARAMETERS, E_F: 0, T: 0.1 }).viewState, "invalid");

  assert.equal(computeCoreMetrics({ ...DEFAULT_PARAMETERS, M: 0 }).status, "invalid");
  assert.equal(computeGapCurveModel({ ...DEFAULT_PARAMETERS, M: 0, T: 0.1 }).viewState, "invalid");

  const invalidRatioState = { ...DEFAULT_PARAMETERS, omega_D_ref: 25, E_F: 100, T: 0.1 };
  assert.equal(classifyParameterState(invalidRatioState).status, "invalid");
  assert.equal(computeGapCurveModel(invalidRatioState).viewState, "invalid");

  const forcedBracketFailure = __testOnlyComputeGapCurveModel(
    { ...DEFAULT_PARAMETERS, T: 0.1 },
    { testOverrides: { forceBracketFailure: true } },
  );
  assert.equal(forcedBracketFailure.viewState, "failed");
  assert.match(forcedBracketFailure.message, /bracket failure/);

  const forcedNonFinite = __testOnlyComputeGapCurveModel(
    { ...DEFAULT_PARAMETERS, T: 0.1 },
    { testOverrides: { forceNonFiniteResidual: true } },
  );
  assert.equal(forcedNonFinite.viewState, "failed");
  assert.match(forcedNonFinite.message, /non-finite residual/);
});

function relativeClose(actual, expected, tolerance) {
  return Math.abs(actual - expected) <= tolerance * Math.abs(expected) + 1e-15;
}
