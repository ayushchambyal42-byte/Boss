const THERMAL_EPSILON = 1e-6;
const QUASIPARTICLE_SAMPLE_COUNT = 241;

export type QuasiparticlePoint = {
  xi: number;
  E: number;
  population: number;
};

export function computeFermiDiracPopulation(energy: number, temperature: number): number {
  if (!Number.isFinite(energy) || energy < 0) {
    return Number.NaN;
  }
  if (!Number.isFinite(temperature) || temperature <= THERMAL_EPSILON) {
    return 0;
  }

  const exponent = energy / temperature;
  if (exponent > 700) {
    return 0;
  }

  return 1 / (Math.exp(exponent) + 1);
}

export function buildQuasiparticlePopulationCurve(
  temperature: number,
  delta: number,
  sampleCount = QUASIPARTICLE_SAMPLE_COUNT,
): { points: QuasiparticlePoint[]; eMax: number } {
  const safeTemperature = Number.isFinite(temperature) && temperature >= 0 ? temperature : 0;
  const safeDelta = Number.isFinite(delta) && delta >= 0 ? delta : 0;
  const xiMax = Math.max(3 * safeDelta, 6 * safeTemperature, 1);
  const points: QuasiparticlePoint[] = [];

  for (let index = 0; index < sampleCount; index += 1) {
    const fraction = sampleCount === 1 ? 0 : index / (sampleCount - 1);
    const xi = xiMax * fraction;
    const energy = Math.sqrt(xi * xi + safeDelta * safeDelta);
    points.push({
      xi,
      E: energy,
      population: computeFermiDiracPopulation(energy, safeTemperature),
    });
  }

  return { points, eMax: Math.max(...points.map((point) => point.E), safeDelta, 1) };
}
