export const KB_EV_PER_K = 8.617e-5;
export const REFERENCE_TC_K = 10;
export const REFERENCE_DELTA0_MEV = 1.76 * KB_EV_PER_K * REFERENCE_TC_K * 1000;

export function internalTemperatureToKelvin(value: number): number {
  return Number.isFinite(value) ? value * REFERENCE_TC_K : Number.NaN;
}

export function internalEnergyToMeV(value: number): number {
  return Number.isFinite(value) ? value * REFERENCE_DELTA0_MEV : Number.NaN;
}

export function formatKelvin(value: number, digits = 3): string {
  return Number.isFinite(value) ? internalTemperatureToKelvin(value).toFixed(digits) : "unavailable";
}

export function formatMeV(value: number, digits = 3): string {
  return Number.isFinite(value) ? internalEnergyToMeV(value).toFixed(digits) : "unavailable";
}
