import { PARAMETER_CONTRACT, clampSliderParameters, getTemperatureControl } from "./parameters.mjs";
import { SHELL_REFERENCE_CRITICAL_TEMPERATURE, getShellDefaultParameters } from "./constants.ts";
import { deriveCriticalTemperature } from "./metrics.ts";
import { computeEffectiveParameters } from "./validation.ts";
import type { EffectiveParameters, ParameterKey, ParameterVector } from "./types.ts";

export type ParameterControlDefinition = {
  key: ParameterKey;
  symbol: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
};

export function createDefaultParameterVector(): ParameterVector {
  return getShellDefaultParameters();
}

export function normalizeParameterVector(parameters: Partial<ParameterVector>): ParameterVector {
  const defaults = createDefaultParameterVector();
  const merged = { ...defaults, ...parameters };
  const criticalTemperature = deriveCriticalTemperature(merged);
  const clamped = clampSliderParameters(merged, { criticalTemperature });

  return {
    lambda: clamped.lambda,
    omega_D_ref: clamped.omega_D_ref,
    E_F: clamped.E_F,
    M: clamped.M,
    T: clamped.T ?? defaults.T,
  };
}

export function deriveEffectiveParameters(parameters: ParameterVector): EffectiveParameters {
  return computeEffectiveParameters(parameters);
}

export function getParameterControlDefinitions(
  parameters: ParameterVector = createDefaultParameterVector(),
): ParameterControlDefinition[] {
  const criticalTemperature = deriveCriticalTemperature(parameters);
  const temperatureControl = getTemperatureControl(criticalTemperature);

  return [
    buildControl("lambda", "λ", PARAMETER_CONTRACT.lambda),
    buildControl("omega_D_ref", "ω_D,ref", PARAMETER_CONTRACT.omega_D_ref),
    buildControl("E_F", "E_F", PARAMETER_CONTRACT.E_F),
    buildControl("M", "M", PARAMETER_CONTRACT.M),
    buildControl("T", "T", {
      ...PARAMETER_CONTRACT.T,
      uiRange: temperatureControl.uiRange,
      step: temperatureControl.step,
      default: 0.25 * criticalTemperature,
    }),
  ];
}

function buildControl(
  key: ParameterKey,
  symbol: string,
  config: {
    label: string;
    unit: string;
    uiRange: { min: number; max: number };
    step: number;
  },
): ParameterControlDefinition {
  return {
    key,
    symbol,
    label: config.label,
    unit: config.unit,
    min: config.uiRange.min,
    max: config.uiRange.max,
    step: config.step,
  };
}
