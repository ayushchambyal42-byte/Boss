import { classifyParameterState, computeEffectiveParameters } from "./parameters.mjs";
import { computeCoreMetrics } from "./metrics.mjs";

export const GAP_SOLVER_CONTRACT = Object.freeze({
  temperatureEpsilon: 1e-12,
  defaultIntegrationPoints: 2048,
  minimumIntegrationPoints: 512,
  maxRootIterations: 96,
  gapToleranceScale: 1e-8,
  residualTolerance: 1e-7,
  curveSampleCount: 201,
  curveDomainMultiplier: 1.2,
  monotonicToleranceScale: 1e-7,
});

export function solveGapAtTemperature(parameters, options = {}) {
  const context = prepareGapContext(parameters, options);
  if (context.terminalResult) {
    return context.terminalResult;
  }

  const selectedTemperature = Number(parameters.T ?? 0);
  const gapResult = solveSelectedGap(context, selectedTemperature);
  if (gapResult.failed) {
    return failureResult(context, gapResult.failed);
  }

  return {
    viewState: gapResult.viewState,
    stateVersion: context.stateVersion,
    stateVector: context.stateVector,
    renderedStateVersion: context.stateVersion,
    trustStatus: context.classification.status,
    effective: context.effective,
    metricSnapshot: context.metricSnapshot,
    issues: context.classification.issues,
    isUpdating: false,
    selectedPoint: Object.freeze({
      T: selectedTemperature,
      Delta: gapResult.gap,
      stateVersion: context.stateVersion,
    }),
    solver: Object.freeze({
      integrationPoints: context.integrationPoints,
      iterations: gapResult.iterations,
      residual: gapResult.residual,
      bracket: gapResult.bracket,
    }),
  };
}

export function computeGapCurveModel(parameters, options = {}) {
  const context = prepareGapContext(parameters, options);
  if (context.terminalResult) {
    return context.terminalResult;
  }

  const selectedTemperature = Number(parameters.T ?? 0);
  const selectedResult = solveSelectedGap(context, selectedTemperature);
  if (selectedResult.failed) {
    return failureResult(context, selectedResult.failed);
  }

  let curvePoints;
  try {
    curvePoints = buildCurvePoints(context, selectedTemperature);
  } catch (error) {
    return failureResult(context, error.message);
  }
  const monotonicFailure = validateCurveMonotonicity(curvePoints, context.metricSnapshot.Delta_0);
  if (monotonicFailure) {
    return failureResult(context, monotonicFailure);
  }

  const selectedPoint = Object.freeze({
    T: selectedTemperature,
    Delta: selectedResult.gap,
    stateVersion: context.stateVersion,
    insideDefaultDomain: selectedTemperature <= context.defaultCurveMaxT,
  });

  return {
    viewState: selectedResult.viewState,
    stateVersion: context.stateVersion,
    renderedStateVersion: context.stateVersion,
    stateVector: context.stateVector,
    trustStatus: context.classification.status,
    effective: context.effective,
    metricSnapshot: context.metricSnapshot,
    issues: context.classification.issues,
    isUpdating: false,
    message: selectedResult.viewState === "normal-state" ? "Selected temperature is in the valid normal-state regime." : null,
    plot: Object.freeze({
      domain: Object.freeze({ minT: 0, maxT: context.defaultCurveMaxT }),
      samples: curvePoints,
      selectedPoint,
      sampleCount: curvePoints.length,
    }),
    solver: Object.freeze({
      integrationPoints: context.integrationPoints,
      selectedIterations: selectedResult.iterations,
      selectedResidual: selectedResult.residual,
    }),
  };
}

export function createPendingGapPlotView({ requestedStateVersion, previousStableView = null }) {
  return {
    viewState: "pending",
    stateVersion: requestedStateVersion,
    renderedStateVersion: previousStableView?.renderedStateVersion ?? previousStableView?.stateVersion ?? null,
    stateVector: previousStableView?.stateVector ?? null,
    trustStatus: previousStableView?.trustStatus ?? null,
    effective: previousStableView?.effective ?? null,
    metricSnapshot: previousStableView?.metricSnapshot ?? null,
    issues: previousStableView?.issues ?? [],
    isUpdating: true,
    message: "Updating",
    plot: previousStableView?.plot ?? null,
    solver: previousStableView?.solver ?? null,
  };
}

export function resolveGapPlotView({ requestedStateVersion, computationView = null, previousStableView = null }) {
  if (!computationView) {
    return createPendingGapPlotView({ requestedStateVersion, previousStableView });
  }

  if (computationView.stateVersion !== requestedStateVersion) {
    const pending = createPendingGapPlotView({ requestedStateVersion, previousStableView });
    return {
      ...pending,
      staleResultSuppressed: true,
    };
  }

  return computationView;
}

function prepareGapContext(parameters, options) {
  return prepareGapContextInternal(parameters, options, null);
}

function prepareGapContextInternal(parameters, options, testOverrides) {
  const stateVersion = options.stateVersion ?? 0;
  const integrationPoints = normalizeIntegrationPoints(options.integrationPoints);
  if (!Number.isInteger(integrationPoints) || integrationPoints < GAP_SOLVER_CONTRACT.minimumIntegrationPoints) {
    return {
      terminalResult: configFailureResult(parameters, stateVersion, `integration points must be >= ${GAP_SOLVER_CONTRACT.minimumIntegrationPoints}`),
    };
  }

  const maxIterations = normalizeMaxIterations(options.maxIterations);
  if (!Number.isInteger(maxIterations) || maxIterations <= 0) {
    return {
      terminalResult: configFailureResult(parameters, stateVersion, "max root iterations must be positive"),
    };
  }

  const metricResult = computeCoreMetrics(parameters);
  if (metricResult.status === "invalid") {
    return {
      terminalResult: invalidResult(metricResult, stateVersion, "Invalid parameter state suppresses the gap plot."),
    };
  }

  if (metricResult.status === "failed") {
    return {
      terminalResult: failedResult(metricResult, stateVersion, "Core metric computation failed before gap solving."),
    };
  }

  const metricSnapshot = metricResult.metrics;
  const classification = classifyParameterState(parameters, { criticalTemperature: metricSnapshot.T_c });
  if (classification.status === "invalid") {
    return {
      terminalResult: invalidResult(
        {
          ...metricResult,
          status: "invalid",
          issues: classification.issues,
        },
        stateVersion,
        "Invalid parameter state suppresses the gap plot.",
      ),
    };
  }

  return {
    stateVersion,
    stateVector: normalizeStateVector(parameters),
    effective: computeEffectiveParameters(parameters),
    metricSnapshot,
    classification,
    integrationPoints,
    maxIterations,
    defaultCurveMaxT: GAP_SOLVER_CONTRACT.curveDomainMultiplier * metricSnapshot.T_c,
    referenceIntegral: gapIntegral(metricSnapshot.Delta_0, computeEffectiveParameters(parameters).omega_D, 0, integrationPoints),
    testOverrides,
  };
}

function solveSelectedGap(context, temperature) {
  if (!Number.isFinite(temperature) || temperature < 0) {
    return { failed: "selected temperature is invalid" };
  }

  const delta0 = context.metricSnapshot.Delta_0;
  const criticalTemperature = context.metricSnapshot.T_c;
  if (temperature <= GAP_SOLVER_CONTRACT.temperatureEpsilon) {
    return {
      viewState: "stable",
      gap: delta0,
      iterations: 0,
      residual: 0,
      bracket: null,
    };
  }

  if (temperature >= criticalTemperature) {
    return {
      viewState: "normal-state",
      gap: 0,
      iterations: 0,
      residual: 0,
      bracket: null,
    };
  }

  return solvePositiveGap({
    lambda: context.stateVector.lambda,
    omega_D: context.effective.omega_D,
    temperature,
    delta0,
    integrationPoints: context.integrationPoints,
    maxIterations: context.maxIterations,
    referenceIntegral: context.referenceIntegral,
    testOverrides: context.testOverrides,
  });
}

function solvePositiveGap({ lambda, omega_D, temperature, delta0, integrationPoints, maxIterations, referenceIntegral, testOverrides }) {
  if (testOverrides?.forceBracketFailure) {
    return { failed: "gap bracket failure at upper bound" };
  }

  const lowResidual = normalizedGapResidual(0, lambda, omega_D, temperature, integrationPoints, referenceIntegral);
  if (!Number.isFinite(lowResidual) || lowResidual <= 0) {
    return { failed: "gap bracket failure at lower bound" };
  }

  let high = Math.max(delta0, omega_D * 0.5, 1e-8 * Math.max(omega_D, 1));
  let highResidual = normalizedGapResidual(high, lambda, omega_D, temperature, integrationPoints, referenceIntegral);
  let attempts = 0;
  while (Number.isFinite(highResidual) && highResidual > 0 && attempts < 24) {
    high *= 2;
    highResidual = normalizedGapResidual(high, lambda, omega_D, temperature, integrationPoints, referenceIntegral);
    attempts += 1;
  }

  if (!Number.isFinite(highResidual) || highResidual > 0) {
    return { failed: "gap bracket failure at upper bound" };
  }

  let low = 0;
  let lastMid = 0;
  let lastResidual = lowResidual;
  const tolerance = GAP_SOLVER_CONTRACT.gapToleranceScale * Math.max(omega_D, 1);

  for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
    lastMid = 0.5 * (low + high);
    lastResidual = normalizedGapResidual(lastMid, lambda, omega_D, temperature, integrationPoints, referenceIntegral);
    if (!Number.isFinite(lastResidual)) {
      return { failed: "non-finite residual during gap solve" };
    }

    if (lastResidual > 0) {
      low = lastMid;
    } else {
      high = lastMid;
    }

    if (Math.abs(high - low) <= tolerance) {
      const gap = 0.5 * (low + high);
      const residual = testOverrides?.forceNonFiniteResidual
        ? Number.NaN
        : normalizedGapResidual(gap, lambda, omega_D, temperature, integrationPoints, referenceIntegral);
      if (!Number.isFinite(gap) || gap < 0) {
        return { failed: "negative or non-finite gap result" };
      }
      if (!Number.isFinite(residual)) {
        return { failed: "non-finite residual during gap solve" };
      }
      if (Math.abs(residual) > GAP_SOLVER_CONTRACT.residualTolerance) {
        return { failed: "gap residual tolerance violation" };
      }
      return {
        viewState: "stable",
        gap,
        iterations: iteration,
        residual,
        bracket: Object.freeze({ low, high }),
      };
    }
  }

  return { failed: "gap solver did not converge" };
}

function buildCurvePoints(context, selectedTemperature) {
  const sampleCount = normalizeSampleCount();
  const points = [];
  const maxT = context.defaultCurveMaxT;
  for (let index = 0; index < sampleCount; index += 1) {
    const fraction = sampleCount === 1 ? 0 : index / (sampleCount - 1);
    const temperature = fraction * maxT;
    const pointResult = solveSelectedGap(context, temperature);
    if (pointResult.failed) {
      throw new Error(pointResult.failed);
    }
    points.push(
      Object.freeze({
        T: temperature,
        Delta: pointResult.gap,
      }),
    );
  }

  if (selectedTemperature > maxT && context.classification.status === "constrained") {
    points.push(
      Object.freeze({
        T: selectedTemperature,
        Delta: 0,
      }),
    );
  }

  return Object.freeze(points);
}

function gapResidual(delta, lambda, omega_D, temperature, integrationPoints) {
  return lambda * gapIntegral(delta, omega_D, temperature, integrationPoints) - 1;
}

function normalizedGapResidual(delta, lambda, omega_D, temperature, integrationPoints, referenceIntegral) {
  return lambda * (gapIntegral(delta, omega_D, temperature, integrationPoints) - referenceIntegral);
}

function gapIntegral(delta, omega_D, temperature, integrationPoints) {
  const pointCount = normalizeIntegrationPoints(integrationPoints);
  const step = 1 / (pointCount - 1);
  const transformedIntegrand = new Array(pointCount);

  for (let index = 0; index < pointCount; index += 1) {
    const u = index * step;
    const xi = omega_D * u * u;
    const quasiparticleEnergy = Math.sqrt(xi * xi + delta * delta);
    let kernel;

    if (temperature <= GAP_SOLVER_CONTRACT.temperatureEpsilon) {
      kernel = 1 / quasiparticleEnergy;
    } else if (quasiparticleEnergy <= GAP_SOLVER_CONTRACT.temperatureEpsilon) {
      kernel = 1 / (2 * temperature);
    } else {
      kernel = Math.tanh(quasiparticleEnergy / (2 * temperature)) / quasiparticleEnergy;
    }

    transformedIntegrand[index] = kernel * (2 * omega_D * u);
  }

  return integrateCompositeSimpson(transformedIntegrand, step);
}

function validateCurveMonotonicity(points, delta0) {
  const tolerance = GAP_SOLVER_CONTRACT.monotonicToleranceScale * Math.max(delta0, 1);

  for (let index = 0; index < points.length; index += 1) {
    const point = points[index];
    if (!Number.isFinite(point.T) || !Number.isFinite(point.Delta) || point.Delta < -tolerance) {
      return "curve contains invalid gap values";
    }

    if (index > 0) {
      const previous = points[index - 1];
      if (point.T < previous.T) {
        return "curve temperatures are not ordered";
      }
      if (point.Delta - previous.Delta > tolerance) {
        return "curve is not monotonically non-increasing";
      }
    }
  }

  return null;
}

function normalizeIntegrationPoints(value) {
  return value === undefined ? GAP_SOLVER_CONTRACT.defaultIntegrationPoints : Number(value);
}

function normalizeMaxIterations(value) {
  return value === undefined ? GAP_SOLVER_CONTRACT.maxRootIterations : Number(value);
}

function normalizeSampleCount() {
  return GAP_SOLVER_CONTRACT.curveSampleCount;
}

function normalizeStateVector(parameters) {
  return {
    lambda: Number(parameters.lambda),
    omega_D_ref: Number(parameters.omega_D_ref),
    E_F: Number(parameters.E_F),
    T: Number(parameters.T ?? 0),
  };
}

function integrateCompositeSimpson(values, step) {
  const intervals = values.length - 1;
  if (intervals <= 0) {
    return 0;
  }

  if (intervals === 1) {
    return 0.5 * step * (values[0] + values[1]);
  }

  if (intervals % 2 === 0) {
    return simpsonOneThird(values, step, 0, intervals);
  }

  const oneThirdEnd = intervals - 3;
  return simpsonOneThird(values, step, 0, oneThirdEnd) + simpsonThreeEighths(values, step, oneThirdEnd);
}

function simpsonOneThird(values, step, startIndex, endIndex) {
  if (endIndex <= startIndex) {
    return 0;
  }

  let total = values[startIndex] + values[endIndex];
  for (let index = startIndex + 1; index < endIndex; index += 1) {
    total += (index - startIndex) % 2 === 0 ? 2 * values[index] : 4 * values[index];
  }

  return (step / 3) * total;
}

function simpsonThreeEighths(values, step, startIndex) {
  return (
    (3 * step) /
    8 *
    (values[startIndex] + 3 * values[startIndex + 1] + 3 * values[startIndex + 2] + values[startIndex + 3])
  );
}

function invalidResult(metricResult, stateVersion, message) {
  return {
    viewState: "invalid",
    stateVersion,
    renderedStateVersion: stateVersion,
    stateVector: normalizeStateVector(metricResult.sourceParameters),
    trustStatus: "invalid",
    effective: metricResult.effective,
    metricSnapshot: metricResult.metrics,
    issues: metricResult.issues,
    isUpdating: false,
    message,
    plot: null,
    solver: null,
  };
}

function failedResult(metricResult, stateVersion, message) {
  return {
    viewState: "failed",
    stateVersion,
    renderedStateVersion: stateVersion,
    stateVector: normalizeStateVector(metricResult.sourceParameters),
    trustStatus: metricResult.status === "invalid" ? "invalid" : metricResult.status,
    effective: metricResult.effective,
    metricSnapshot: metricResult.metrics,
    issues: metricResult.issues,
    isUpdating: false,
    message,
    plot: null,
    solver: null,
  };
}

function configFailureResult(parameters, stateVersion, reason) {
  const sourceParameters = normalizeStateVector(parameters);
  return {
    viewState: "failed",
    stateVersion,
    renderedStateVersion: stateVersion,
    stateVector: sourceParameters,
    trustStatus: "failed",
    effective: computeEffectiveParameters(parameters),
    metricSnapshot: null,
    issues: [{ status: "failed", message: reason }],
    isUpdating: false,
    message: reason,
    plot: null,
    solver: null,
  };
}

function failureResult(context, reason) {
  return {
    viewState: "failed",
    stateVersion: context.stateVersion,
    renderedStateVersion: context.stateVersion,
    stateVector: context.stateVector,
    trustStatus: context.classification.status,
    effective: context.effective,
    metricSnapshot: context.metricSnapshot,
    issues: [...context.classification.issues, { status: "failed", message: reason }],
    isUpdating: false,
    message: reason,
    plot: null,
    solver: null,
  };
}

export function __testOnlyComputeGapCurveModel(parameters, options = {}) {
  const context = prepareGapContextInternal(parameters, options, options.testOverrides ?? null);
  if (context.terminalResult) {
    return context.terminalResult;
  }

  const selectedTemperature = Number(parameters.T ?? 0);
  const selectedResult = solveSelectedGap(context, selectedTemperature);
  if (selectedResult.failed) {
    return failureResult(context, selectedResult.failed);
  }

  let curvePoints;
  try {
    curvePoints = buildCurvePoints(context, selectedTemperature);
  } catch (error) {
    return failureResult(context, error.message);
  }
  const monotonicFailure = validateCurveMonotonicity(curvePoints, context.metricSnapshot.Delta_0);
  if (monotonicFailure) {
    return failureResult(context, monotonicFailure);
  }

  const selectedPoint = Object.freeze({
    T: selectedTemperature,
    Delta: selectedResult.gap,
    stateVersion: context.stateVersion,
    insideDefaultDomain: selectedTemperature <= context.defaultCurveMaxT,
  });

  return {
    viewState: selectedResult.viewState,
    stateVersion: context.stateVersion,
    renderedStateVersion: context.stateVersion,
    stateVector: context.stateVector,
    trustStatus: context.classification.status,
    effective: context.effective,
    metricSnapshot: context.metricSnapshot,
    issues: context.classification.issues,
    isUpdating: false,
    message: selectedResult.viewState === "normal-state" ? "Selected temperature is in the valid normal-state regime." : null,
    plot: Object.freeze({
      domain: Object.freeze({ minT: 0, maxT: context.defaultCurveMaxT }),
      samples: curvePoints,
      selectedPoint,
      sampleCount: curvePoints.length,
    }),
    solver: Object.freeze({
      integrationPoints: context.integrationPoints,
      selectedIterations: selectedResult.iterations,
      selectedResidual: selectedResult.residual,
    }),
  };
}
