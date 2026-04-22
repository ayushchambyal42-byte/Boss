import { computeEffectiveParameters, classifyParameterState } from "./parameters.mjs";

export const ANALYTIC_CONSTANTS = Object.freeze({
  gamma_E: 0.5772156649015329,
  C_Tc: 1.1338659173110976,
  Delta0OverKbTc: 1.7638769888620456,
  BCSRatio: 3.527753977724091,
});

export const BENCHMARK_CASES = Object.freeze([
  benchmarkCase("Default", { lambda: 0.3, omega_D_ref: 10, E_F: 100, M: 1 }, {
    omega_D: 10,
    T_c: 0.4044952519083233,
    Delta_0: 0.713479866945048,
    BCS_ratio: ANALYTIC_CONSTANTS.BCSRatio,
  }),
  benchmarkCase("Weak edge", { lambda: 0.15, omega_D_ref: 10, E_F: 100, M: 1 }, {
    omega_D: 10,
    T_c: 0.014429960925572704,
    Delta_0: 0.025452676026796156,
    BCS_ratio: ANALYTIC_CONSTANTS.BCSRatio,
  }),
  benchmarkCase("Strong valid edge", { lambda: 0.4, omega_D_ref: 10, E_F: 100, M: 1 }, {
    omega_D: 10,
    T_c: 0.9307338226216719,
    Delta_0: 1.641699972477976,
    BCS_ratio: ANALYTIC_CONSTANTS.BCSRatio,
  }),
  benchmarkCase("Heavier isotope", { lambda: 0.3, omega_D_ref: 10, E_F: 100, M: 2 }, {
    omega_D: 7.071067811865475,
    T_c: 0.28602133558213616,
    Delta_0: 0.504506452156919,
    BCS_ratio: ANALYTIC_CONSTANTS.BCSRatio,
  }),
]);

export function computeCoreMetrics(parameters) {
  const classification = classifyParameterState(parameters);
  const effective = computeEffectiveParameters(parameters);

  if (classification.status === "invalid") {
    return {
      status: "invalid",
      sourceParameters: normalizeSourceParameters(parameters),
      effective,
      metrics: null,
      issues: classification.issues,
      display: {
        canDisplayFinalMetrics: false,
        requiresTrustStatus: true,
      },
    };
  }

  const lambda = Number(parameters.lambda);
  const omegaD = effective.omega_D;
  const baseline = analyticMetrics({
    lambda,
    omega_D: Number(parameters.omega_D_ref),
  });
  const metrics = analyticMetrics({
    lambda,
    omega_D: omegaD,
  });

  const extendedMetrics = {
    ...metrics,
    isotope_Tc_shift: metrics.T_c - baseline.T_c,
    isotope_Delta0_shift: metrics.Delta_0 - baseline.Delta_0,
    isotope_alpha_display: 0.5,
  };

  const failureReason = validateMetricOutputs(extendedMetrics);
  if (failureReason) {
    return {
      status: "failed",
      sourceParameters: normalizeSourceParameters(parameters),
      effective,
      metrics: null,
      issues: [...classification.issues, { status: "failed", message: failureReason }],
      display: {
        canDisplayFinalMetrics: false,
        requiresTrustStatus: true,
      },
    };
  }

  return {
    status: classification.status,
    sourceParameters: normalizeSourceParameters(parameters),
    effective,
    metrics: extendedMetrics,
    issues: classification.issues,
    display: {
      canDisplayFinalMetrics: true,
      requiresTrustStatus: classification.status !== "valid",
    },
  };
}

export function buildMetricCardModel(result) {
  return {
    status: result.status,
    stateVector: result.sourceParameters,
    cards: metricCards(result),
  };
}

export function roundMetricForDisplay(value) {
  return Number(value).toPrecision(10);
}

export function getLegacyPrototypeAdapter() {
  return {
    toPrototypeInput(parameters) {
      const effective = computeEffectiveParameters(parameters);
      return {
        V: Number(parameters.lambda),
        omega_D: effective.omega_D,
        T: Number(parameters.T),
      };
    },
  };
}

function analyticMetrics({ lambda, omega_D }) {
  const expTerm = Math.exp(-1 / lambda);
  const T_c = ANALYTIC_CONSTANTS.C_Tc * omega_D * expTerm;
  const Delta_0 = 2 * omega_D * expTerm;
  const Delta_0_over_kBTc = Delta_0 / T_c;
  const BCS_ratio = 2 * Delta_0 / T_c;

  return {
    T_c,
    Delta_0,
    Delta_0_over_kBTc,
    BCS_ratio,
  };
}

function validateMetricOutputs(metrics) {
  const numericValues = Object.values(metrics).filter((value) => typeof value === "number");
  if (numericValues.some((value) => !Number.isFinite(value))) {
    return "non-finite metric output";
  }

  if (metrics.T_c < 0 || metrics.Delta_0 < 0) {
    return "negative metric output";
  }

  if (Math.abs(metrics.BCS_ratio - ANALYTIC_CONSTANTS.BCSRatio) > 1e-9) {
    return "BCS ratio contract violation";
  }

  return null;
}

function metricCards(result) {
  if (!result.metrics) {
    return [];
  }

  return [
    card("T_c", result.metrics.T_c, result),
    card("Delta_0", result.metrics.Delta_0, result),
    card("Delta_0_over_kBTc", result.metrics.Delta_0_over_kBTc, result),
    card("BCS_ratio", result.metrics.BCS_ratio, result),
    card("isotope_Tc_shift", result.metrics.isotope_Tc_shift, result),
    card("isotope_Delta0_shift", result.metrics.isotope_Delta0_shift, result),
  ];
}

function card(key, value, result) {
  return {
    key,
    value,
    rounded: roundMetricForDisplay(value),
    status: result.status,
  };
}

function benchmarkCase(name, parameters, expected) {
  return Object.freeze({ name, parameters: Object.freeze(parameters), expected: Object.freeze(expected) });
}

function normalizeSourceParameters(parameters) {
  return {
    lambda: Number(parameters.lambda),
    omega_D_ref: Number(parameters.omega_D_ref),
    E_F: Number(parameters.E_F),
    M: Number(parameters.M),
    ...(parameters.T === undefined ? {} : { T: Number(parameters.T) }),
  };
}
