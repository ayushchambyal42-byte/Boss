import { classifyParameterState, computeEffectiveParameters as computeEffectiveParametersJs } from "./parameters.mjs";
import { deriveCriticalTemperature } from "./metrics.ts";
import type { EffectiveParameters, ParameterVector, ValidityState } from "./types.ts";

export function computeEffectiveParameters(parameters: ParameterVector): EffectiveParameters {
  const effective = computeEffectiveParametersJs(parameters);
  return {
    omega_D: effective.omega_D,
    omega_D_over_E_F: effective.omega_D_over_E_F,
  };
}

export function deriveValidityState(parameters: ParameterVector): ValidityState {
  const classification = classifyParameterState(parameters, { criticalTemperature: deriveCriticalTemperature(parameters) });
  return {
    status: classification.status,
    issues: classification.issues.map((issue: { status: ValidityState["status"]; message: string }) => ({
      status: issue.status,
      message: issue.message,
    })),
  };
}
