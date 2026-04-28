const DOS_EPSILON = 1e-8;
const DOS_SAMPLE_COUNT = 801;

export type DosPoint = {
  E: number;
  N: number | null;
};

type Complex = {
  re: number;
  im: number;
};

export function computeDynesDensityOfStates(energy: number, delta: number, gamma: number): number | null {
  if (!Number.isFinite(energy) || !Number.isFinite(delta) || !Number.isFinite(gamma) || delta < 0 || gamma < 0) {
    return null;
  }

  const complexEnergy = complex(energy, -gamma);
  const radicand = subtract(multiply(complexEnergy, complexEnergy), complex(delta * delta, 0));
  const denominator = sqrtComplex(radicand);
  if (magnitudeSquared(denominator) <= DOS_EPSILON) {
    return null;
  }

  const ratio = divide(complexEnergy, denominator);
  return Math.abs(ratio.re);
}

export function buildDosCurve(delta: number, sampleCount = DOS_SAMPLE_COUNT): { points: DosPoint[]; eMax: number } {
  return buildDosCurveWithDomain(delta, 0, undefined, sampleCount);
}

export function buildDosCurveWithDomain(delta: number, gamma: number, domainMaxEnergy?: number, sampleCount = DOS_SAMPLE_COUNT): { points: DosPoint[]; eMax: number } {
  const safeDelta = Number.isFinite(delta) && delta >= 0 ? delta : 0;
  const safeGamma = Number.isFinite(gamma) && gamma >= 0 ? gamma : 0;
  const normalizedDomainMaxEnergy = typeof domainMaxEnergy === "number" && Number.isFinite(domainMaxEnergy) ? Math.abs(domainMaxEnergy) : 0;
  const eMax = Math.max(normalizedDomainMaxEnergy, 3 * Math.max(safeDelta, DOS_EPSILON));
  const points = buildEnergyGrid(safeDelta, eMax, sampleCount).map((energy) => ({
    E: energy,
    N: computeDynesDensityOfStates(energy, safeDelta, safeGamma),
  }));

  return { points, eMax };
}

export function deriveDynesGamma(delta0: number): number {
  const safeDelta0 = Number.isFinite(delta0) && delta0 >= 0 ? delta0 : 0;
  return 0.01 * safeDelta0;
}

export function isNormalMetal(delta: number, epsilon = DOS_EPSILON): boolean {
  return Number.isFinite(delta) && Math.abs(delta) <= epsilon;
}

function buildEnergyGrid(delta: number, eMax: number, sampleCount: number): number[] {
  if (sampleCount <= 1) {
    return [0];
  }

  return Array.from({ length: sampleCount }, (_, index) => {
    const fraction = index / (sampleCount - 1);
    return -eMax + 2 * eMax * fraction;
  });
}

function complex(re: number, im: number): Complex {
  return { re, im };
}

function subtract(left: Complex, right: Complex): Complex {
  return { re: left.re - right.re, im: left.im - right.im };
}

function multiply(left: Complex, right: Complex): Complex {
  return {
    re: left.re * right.re - left.im * right.im,
    im: left.re * right.im + left.im * right.re,
  };
}

function divide(left: Complex, right: Complex): Complex {
  const denominator = magnitudeSquared(right);
  return {
    re: (left.re * right.re + left.im * right.im) / denominator,
    im: (left.im * right.re - left.re * right.im) / denominator,
  };
}

function sqrtComplex(value: Complex): Complex {
  const modulus = Math.hypot(value.re, value.im);
  const realPart = Math.sqrt(Math.max((modulus + value.re) / 2, 0));
  const imaginaryMagnitude = Math.sqrt(Math.max((modulus - value.re) / 2, 0));
  return {
    re: realPart,
    im: value.im < 0 ? -imaginaryMagnitude : imaginaryMagnitude,
  };
}

function magnitudeSquared(value: Complex): number {
  return value.re * value.re + value.im * value.im;
}
