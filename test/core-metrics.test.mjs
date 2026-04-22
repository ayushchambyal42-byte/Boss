import test from "node:test";
import assert from "node:assert/strict";

import {
  ANALYTIC_CONSTANTS,
  BENCHMARK_CASES,
  buildMetricCardModel,
  computeCoreMetrics,
  getLegacyPrototypeAdapter,
  roundMetricForDisplay,
} from "../src/domain/bcs/metrics.mjs";
import { DEFAULT_PARAMETERS, classifyParameterState } from "../src/domain/bcs/parameters.mjs";

test("analytic constants match locked story contract", () => {
  assert.equal(ANALYTIC_CONSTANTS.gamma_E, 0.5772156649015329);
  assert.equal(ANALYTIC_CONSTANTS.C_Tc, 1.1338659173110976);
  assert.equal(ANALYTIC_CONSTANTS.Delta0OverKbTc, 1.7638769888620456);
  assert.equal(ANALYTIC_CONSTANTS.BCSRatio, 3.527753977724091);
});

test("computeCoreMetrics matches story benchmark cases within pure-function tolerance", () => {
  for (const benchmark of BENCHMARK_CASES) {
    const result = computeCoreMetrics(benchmark.parameters);
    assert.equal(result.status, "valid");
    assert.ok(Math.abs(result.effective.omega_D - benchmark.expected.omega_D) <= 1e-12 * benchmark.expected.omega_D + 1e-12);
    assert.ok(Math.abs(result.metrics.T_c - benchmark.expected.T_c) <= 1e-12 * benchmark.expected.T_c + 1e-15);
    assert.ok(Math.abs(result.metrics.Delta_0 - benchmark.expected.Delta_0) <= 1e-12 * benchmark.expected.Delta_0 + 1e-15);
    assert.ok(Math.abs(result.metrics.BCS_ratio - benchmark.expected.BCS_ratio) <= 1e-12 * benchmark.expected.BCS_ratio + 1e-15);
  }
});

test("isotope outputs are computed and visible in metric results", () => {
  const result = computeCoreMetrics({ ...DEFAULT_PARAMETERS, M: 2 });
  assert.equal(result.metrics.isotope_alpha_display, 0.5);
  assert.ok(result.metrics.isotope_Tc_shift < 0);
  assert.ok(result.metrics.isotope_Delta0_shift < 0);
});

test("invalid input state suppresses final metrics and constrained states retain trust status", () => {
  const invalid = computeCoreMetrics({ ...DEFAULT_PARAMETERS, lambda: 0 });
  assert.equal(invalid.status, "invalid");
  assert.equal(invalid.metrics, null);
  assert.equal(invalid.display.canDisplayFinalMetrics, false);

  const constrainedState = { ...DEFAULT_PARAMETERS, lambda: 0.55 };
  const constrainedClassification = classifyParameterState(constrainedState);
  assert.equal(constrainedClassification.status, "constrained");
  const constrained = computeCoreMetrics(constrainedState);
  assert.equal(constrained.status, "constrained");
  assert.equal(constrained.display.canDisplayFinalMetrics, true);
  assert.equal(constrained.display.requiresTrustStatus, true);
});

test("legacy adapter is one-way and maps lambda to prototype V without leaking V to domain outputs", () => {
  const adapter = getLegacyPrototypeAdapter();
  const mapped = adapter.toPrototypeInput({ ...DEFAULT_PARAMETERS, T: 0.1 });
  assert.deepEqual(mapped, { V: 0.3, omega_D: 10, T: 0.1 });
  assert.equal("fromPrototypeInput" in adapter, false);
});

test("metric card model and rounded display preserve the same state vector and 10 significant digits", () => {
  const result = computeCoreMetrics(DEFAULT_PARAMETERS);
  const cardModel = buildMetricCardModel(result);

  assert.equal(cardModel.status, "valid");
  assert.equal(cardModel.stateVector.lambda, DEFAULT_PARAMETERS.lambda);
  assert.equal(cardModel.stateVector.omega_D_ref, DEFAULT_PARAMETERS.omega_D_ref);
  assert.equal(cardModel.stateVector.E_F, DEFAULT_PARAMETERS.E_F);
  assert.equal(cardModel.stateVector.M, DEFAULT_PARAMETERS.M);
  assert.equal(cardModel.cards.length, 6);

  const rounded = roundMetricForDisplay(result.metrics.T_c);
  assert.match(rounded, /^0\.40449525/);
  assert.ok(rounded.length >= 10);
});
