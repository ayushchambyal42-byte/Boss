import { getDefaultParameters } from "./parameters.mjs";
import type { ParameterVector } from "./types.ts";

export const SHELL_VIEWPORT_BREAKPOINTS = Object.freeze({
  desktop: 1024,
  degradedNotice: 900,
});

export const SHELL_REFERENCE_CRITICAL_TEMPERATURE = 0.4044952519083233;

export function getShellDefaultParameters(): ParameterVector {
  const defaults = getDefaultParameters({ criticalTemperature: SHELL_REFERENCE_CRITICAL_TEMPERATURE });
  return {
    lambda: defaults.lambda,
    omega_D_ref: defaults.omega_D_ref,
    E_F: defaults.E_F,
    M: defaults.M,
    T: defaults.T ?? 0.10112381297708082,
  };
}
