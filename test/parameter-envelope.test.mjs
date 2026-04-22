import test from "node:test";
import assert from "node:assert/strict";

import {
  DEFAULT_PARAMETERS,
  PARAMETER_CONTRACT,
  clampSliderParameters,
  classifyParameterState,
  getDefaultParameters,
  getTemperatureControl,
  computeEffectiveParameters,
  getEnvelopeRows,
  renderEnvelopeDetails,
  renderEnvelopePanel,
  withComputationFailure,
} from "../src/domain/bcs/parameters.mjs";

test("parameter contract exposes exact MVP defaults, UI ranges, units, steps, and export keys", () => {
  assert.deepEqual(DEFAULT_PARAMETERS, {
    lambda: 0.3,
    omega_D_ref: 10,
    E_F: 100,
    M: 1,
  });
  assert.deepEqual(getDefaultParameters({ criticalTemperature: 0.4 }), {
    lambda: 0.3,
    omega_D_ref: 10,
    E_F: 100,
    M: 1,
    T: 0.1,
  });

  assert.equal(PARAMETER_CONTRACT.lambda.unit, "dimensionless");
  assert.equal(PARAMETER_CONTRACT.lambda.default, 0.3);
  assert.deepEqual(PARAMETER_CONTRACT.lambda.uiRange, { min: 0.1, max: 0.5 });
  assert.equal(PARAMETER_CONTRACT.lambda.step, 0.01);

  assert.equal(PARAMETER_CONTRACT.omega_D_ref.unit, "energy");
  assert.equal(PARAMETER_CONTRACT.omega_D_ref.default, 10);
  assert.deepEqual(PARAMETER_CONTRACT.omega_D_ref.uiRange, { min: 1, max: 50 });
  assert.equal(PARAMETER_CONTRACT.omega_D_ref.step, 0.5);

  assert.equal(PARAMETER_CONTRACT.E_F.unit, "energy");
  assert.equal(PARAMETER_CONTRACT.E_F.default, 100);
  assert.deepEqual(PARAMETER_CONTRACT.E_F.uiRange, { min: 20, max: 1000 });
  assert.equal(PARAMETER_CONTRACT.E_F.step, 10);

  assert.equal(PARAMETER_CONTRACT.M.unit, "relative mass");
  assert.equal(PARAMETER_CONTRACT.M.default, 1);
  assert.deepEqual(PARAMETER_CONTRACT.M.uiRange, { min: 0.5, max: 4 });
  assert.equal(PARAMETER_CONTRACT.M.step, 0.05);

  assert.equal(PARAMETER_CONTRACT.T.unit, "energy");
  assert.equal(PARAMETER_CONTRACT.T.default, "0.25 * T_c after T_c is computed");
  assert.deepEqual(getTemperatureControl(0.4).uiRange, { min: 0, max: 0.5 });
  assert.equal(getTemperatureControl(0.4).step, 0.004);
});

test("effective omega_D and omega_D/E_F ratio are derived from isotope mass", () => {
  const effective = computeEffectiveParameters({
    lambda: 0.3,
    omega_D_ref: 10,
    E_F: 100,
    M: 4,
  });

  assert.equal(effective.omega_D, 5);
  assert.equal(effective.omega_D_over_E_F, 0.05);
});

test("validity classification covers valid, near-edge, constrained, invalid, failed, and temperature states", () => {
  assert.equal(classifyParameterState(DEFAULT_PARAMETERS).status, "valid");
  assert.equal(classifyParameterState({ ...DEFAULT_PARAMETERS, lambda: 0.1 }).status, "near-edge");
  assert.equal(classifyParameterState({ ...DEFAULT_PARAMETERS, lambda: 0.55 }).status, "constrained");
  assert.equal(classifyParameterState({ ...DEFAULT_PARAMETERS, lambda: 0 }).status, "invalid");
  assert.equal(classifyParameterState({ ...DEFAULT_PARAMETERS, omega_D_ref: 20, E_F: 100 }).status, "constrained");
  assert.equal(classifyParameterState({ ...DEFAULT_PARAMETERS, omega_D_ref: 21, E_F: 100 }).status, "invalid");
  assert.equal(classifyParameterState({ ...DEFAULT_PARAMETERS, T: 1.1 }, { criticalTemperature: 1 }).status, "near-edge");
  assert.equal(classifyParameterState({ ...DEFAULT_PARAMETERS, T: 1.5 }, { criticalTemperature: 1 }).status, "constrained");
  assert.equal(classifyParameterState({ ...DEFAULT_PARAMETERS, T: -0.1 }, { criticalTemperature: 1 }).status, "invalid");
  assert.equal(withComputationFailure(DEFAULT_PARAMETERS, "solver did not converge").status, "failed");
  assert.equal(withComputationFailure({ ...DEFAULT_PARAMETERS, lambda: 0 }, "solver did not converge").status, "invalid");
});

test("slider input is clamped to UI ranges but imported/restored invalid state is classified without coercion", () => {
  const clamped = clampSliderParameters({
    lambda: 0.01,
    omega_D_ref: 500,
    E_F: 1,
    M: -5,
    T: 99,
  }, { criticalTemperature: 0.4 });

  assert.deepEqual(clamped, {
    lambda: 0.1,
    omega_D_ref: 50,
    E_F: 20,
    M: 0.5,
    T: 0.5,
  });

  const imported = {
    lambda: 0.01,
    omega_D_ref: 500,
    E_F: 1,
    M: -5,
  };

  assert.deepEqual(imported, {
    lambda: 0.01,
    omega_D_ref: 500,
    E_F: 1,
    M: -5,
  });
  assert.equal(classifyParameterState(imported).status, "invalid");
});

test("envelope detail output exposes status, effective omega_D, ratio, and all parameter rows", () => {
  const rows = getEnvelopeRows();
  assert.equal(rows.length, 5);
  assert.deepEqual(
    rows.map((row) => row.exportKey),
    ["lambda", "omega_D_ref", "E_F", "M", "T"],
  );

  const detail = renderEnvelopeDetails({
    ...DEFAULT_PARAMETERS,
    M: 2,
  });

  assert.equal(detail.status, "valid");
  assert.match(detail.summaryText, /valid/i);
  assert.match(detail.effectiveOmegaText, /7\.0710678119/);
  assert.match(detail.omegaRatioText, /0\.0707106781/);
  assert.ok(detail.rows.every((row) => row.exportKey && row.uiRange && row.unit));
});

test("envelope panel assigns distinct presentation treatments for non-valid states", () => {
  const panels = [
    renderEnvelopePanel(DEFAULT_PARAMETERS),
    renderEnvelopePanel({ ...DEFAULT_PARAMETERS, lambda: 0.1 }),
    renderEnvelopePanel({ ...DEFAULT_PARAMETERS, lambda: 0.55 }),
    renderEnvelopePanel({ ...DEFAULT_PARAMETERS, lambda: 0 }),
    renderEnvelopePanel(DEFAULT_PARAMETERS, { computationFailure: "benchmark sanity check failed" }),
  ];

  assert.deepEqual(
    panels.map((panel) => panel.status),
    ["valid", "near-edge", "constrained", "invalid", "failed"],
  );
  assert.equal(new Set(panels.map((panel) => panel.statusClass)).size, panels.length);
  assert.ok(panels.every((panel) => panel.html.includes("Model envelope status")));
  assert.ok(panels.every((panel) => panel.html.includes("omega_D / E_F")));
});
