const STATUS_PRIORITY = {
  valid: 0,
  "near-edge": 1,
  constrained: 2,
  invalid: 3,
  failed: 4,
};

export const DEFAULT_PARAMETERS = Object.freeze({
  lambda: 0.3,
  omega_D_ref: 10,
  E_F: 100,
  M: 1,
});

export const PARAMETER_CONTRACT = Object.freeze({
  lambda: Object.freeze({
    label: "Coupling strength",
    exportKey: "lambda",
    unit: "dimensionless",
    default: 0.3,
    uiRange: Object.freeze({ min: 0.1, max: 0.5 }),
    step: 0.01,
    valid: "0.15 <= lambda <= 0.40",
    nearEdge: "0.10 <= lambda < 0.15 or 0.40 < lambda <= 0.50",
    constrained: "import-only 0.05 <= lambda < 0.10 or 0.50 < lambda <= 0.60",
    invalid: "lambda <= 0 or lambda > 0.60",
  }),
  omega_D_ref: Object.freeze({
    label: "Reference Debye cutoff",
    exportKey: "omega_D_ref",
    unit: "energy",
    default: 10,
    uiRange: Object.freeze({ min: 1, max: 50 }),
    step: 0.5,
    valid: "effective omega_D / E_F <= 0.10",
    nearEdge: "0.10 < omega_D / E_F <= 0.15",
    constrained: "0.15 < omega_D / E_F <= 0.20",
    invalid: "omega_D_ref <= 0 or effective omega_D / E_F > 0.20",
  }),
  E_F: Object.freeze({
    label: "Fermi energy",
    exportKey: "E_F",
    unit: "energy",
    default: 100,
    uiRange: Object.freeze({ min: 20, max: 1000 }),
    step: 10,
    valid: "effective omega_D / E_F <= 0.10",
    nearEdge: "0.10 < omega_D / E_F <= 0.15",
    constrained: "0.15 < omega_D / E_F <= 0.20",
    invalid: "E_F <= 0 or effective omega_D / E_F > 0.20",
  }),
  M: Object.freeze({
    label: "Isotope mass",
    exportKey: "M",
    unit: "relative mass",
    default: 1,
    uiRange: Object.freeze({ min: 0.5, max: 4 }),
    step: 0.05,
    valid: "0.50 <= M <= 4.00",
    nearEdge: "none",
    constrained: "none",
    invalid: "M <= 0",
  }),
  T: Object.freeze({
    label: "Temperature",
    exportKey: "T",
    unit: "energy",
    default: "0.25 * T_c after T_c is computed",
    uiRange: Object.freeze({ min: 0, max: "1.25 * T_c" }),
    step: "max(0.001, 0.01 * T_c)",
    valid: "0 <= T <= 1.05 * T_c",
    nearEdge: "1.05 * T_c < T <= 1.25 * T_c",
    constrained: "import-only 1.25 * T_c < T <= 2.00 * T_c",
    invalid: "T < 0",
  }),
});

export function computeEffectiveParameters(parameters) {
  const omegaDRef = Number(parameters.omega_D_ref);
  const fermiEnergy = Number(parameters.E_F);
  const isotopeMass = Number(parameters.M);
  const omega_D = omegaDRef / Math.sqrt(isotopeMass);

  return {
    omega_D,
    omega_D_over_E_F: omega_D / fermiEnergy,
  };
}

export function getDefaultParameters(options = {}) {
  const defaults = { ...DEFAULT_PARAMETERS };
  if (Number.isFinite(options.criticalTemperature)) {
    defaults.T = 0.25 * Number(options.criticalTemperature);
  }
  return defaults;
}

export function getTemperatureControl(criticalTemperature) {
  const tc = Number(criticalTemperature);
  if (!Number.isFinite(tc) || tc < 0) {
    return {
      ...PARAMETER_CONTRACT.T,
      uiRange: { min: 0, max: 0 },
      step: 0.001,
    };
  }

  return {
    ...PARAMETER_CONTRACT.T,
    uiRange: { min: 0, max: 1.25 * tc },
    step: Math.max(0.001, 0.01 * tc),
  };
}

export function clampSliderParameters(parameters, options = {}) {
  const clamped = {
    lambda: clamp(Number(parameters.lambda), PARAMETER_CONTRACT.lambda.uiRange),
    omega_D_ref: clamp(Number(parameters.omega_D_ref), PARAMETER_CONTRACT.omega_D_ref.uiRange),
    E_F: clamp(Number(parameters.E_F), PARAMETER_CONTRACT.E_F.uiRange),
    M: clamp(Number(parameters.M), PARAMETER_CONTRACT.M.uiRange),
  };

  if ("T" in parameters) {
    clamped.T = clamp(Number(parameters.T), getTemperatureControl(options.criticalTemperature).uiRange);
  }

  return clamped;
}

export function classifyParameterState(parameters, options = {}) {
  const issues = [];
  const lambda = Number(parameters.lambda);
  const omegaDRef = Number(parameters.omega_D_ref);
  const fermiEnergy = Number(parameters.E_F);
  const isotopeMass = Number(parameters.M);

  if (!Number.isFinite(lambda) || lambda <= 0 || lambda > 0.6) {
    issues.push(issue("invalid", "lambda outside hard-valid bounds"));
  } else if (lambda < 0.1 || lambda > 0.5) {
    issues.push(issue("constrained", "lambda is import-only constrained"));
  } else if (lambda < 0.15 || lambda > 0.4) {
    issues.push(issue("near-edge", "lambda is near the weak-coupling envelope edge"));
  }

  if (!Number.isFinite(omegaDRef) || omegaDRef <= 0) {
    issues.push(issue("invalid", "omega_D_ref must be positive"));
  }

  if (!Number.isFinite(fermiEnergy) || fermiEnergy <= 0) {
    issues.push(issue("invalid", "E_F must be positive"));
  }

  if (!Number.isFinite(isotopeMass) || isotopeMass <= 0) {
    issues.push(issue("invalid", "M must be positive"));
  }

  if (!issues.some((entry) => entry.status === "invalid")) {
    const { omega_D_over_E_F } = computeEffectiveParameters(parameters);
    if (!Number.isFinite(omega_D_over_E_F) || omega_D_over_E_F > 0.2) {
      issues.push(issue("invalid", "effective omega_D / E_F exceeds 0.20"));
    } else if (omega_D_over_E_F > 0.15) {
      issues.push(issue("constrained", "effective omega_D / E_F is constrained"));
    } else if (omega_D_over_E_F > 0.1) {
      issues.push(issue("near-edge", "effective omega_D / E_F is near edge"));
    }
  }

  if ("T" in parameters) {
    const temperature = Number(parameters.T);
    const criticalTemperature = Number(options.criticalTemperature);
    if (!Number.isFinite(temperature) || temperature < 0) {
      issues.push(issue("invalid", "T cannot be negative"));
    } else if (Number.isFinite(criticalTemperature) && criticalTemperature >= 0) {
      if (temperature > 2 * criticalTemperature) {
        issues.push(issue("invalid", "T exceeds importable temperature envelope"));
      } else if (temperature > 1.25 * criticalTemperature) {
        issues.push(issue("constrained", "T is import-only constrained"));
      } else if (temperature > 1.05 * criticalTemperature) {
        issues.push(issue("near-edge", "T is near the transition envelope edge"));
      }
    }
  }

  const status = issues.reduce(
    (current, entry) =>
      STATUS_PRIORITY[entry.status] > STATUS_PRIORITY[current] ? entry.status : current,
    "valid",
  );

  return {
    status,
    issues,
    effective: safeEffectiveParameters(parameters),
  };
}

export function withComputationFailure(parameters, reason, options = {}) {
  const classified = classifyParameterState(parameters, options);
  if (classified.status === "invalid") {
    return classified;
  }

  return {
    ...classified,
    status: "failed",
    issues: [...classified.issues, issue("failed", reason || "computation failed")],
  };
}

export function getEnvelopeRows() {
  return Object.values(PARAMETER_CONTRACT).map((entry) => ({
    input: entry.label,
    exportKey: entry.exportKey,
    unit: entry.unit,
    default: entry.default,
    uiRange: entry.uiRange,
    step: entry.step,
    valid: entry.valid,
    nearEdge: entry.nearEdge,
    constrained: entry.constrained,
    invalid: entry.invalid,
  }));
}

export function renderEnvelopeDetails(parameters) {
  const classification = classifyParameterState(parameters);
  const effective = safeEffectiveParameters(parameters);

  return {
    status: classification.status,
    summaryText: `Model envelope status: ${classification.status}`,
    effectiveOmegaText: `Effective omega_D: ${formatNumber(effective.omega_D)}`,
    omegaRatioText: `omega_D / E_F: ${formatNumber(effective.omega_D_over_E_F)}`,
    rows: getEnvelopeRows(),
    issues: classification.issues,
  };
}

export function renderEnvelopePanel(parameters, options = {}) {
  const details = options.computationFailure
    ? {
        ...renderEnvelopeDetails(parameters),
        ...withComputationFailure(parameters, options.computationFailure),
      }
    : renderEnvelopeDetails(parameters);
  const statusClass = statusClassFor(details.status);
  const rows = getEnvelopeRows()
    .map(
      (row) =>
        `<li><strong>${escapeHtml(row.exportKey)}</strong>: ${escapeHtml(row.unit)}; UI ${escapeHtml(
          formatRange(row.uiRange),
        )}; step ${escapeHtml(String(row.step))}</li>`,
    )
    .join("");

  return {
    status: details.status,
    statusClass,
    html: `<section class="model-envelope ${statusClass}" aria-label="Supported model envelope">
  <h2>Supported model envelope</h2>
  <p>Model envelope status: ${escapeHtml(details.status)}</p>
  <p>${escapeHtml(details.effectiveOmegaText)}</p>
  <p>${escapeHtml(details.omegaRatioText)}</p>
  <ul>${rows}</ul>
</section>`,
  };
}

function clamp(value, range) {
  if (!Number.isFinite(value)) {
    return range.min;
  }
  return Math.min(Math.max(value, range.min), range.max);
}

function issue(status, message) {
  return { status, message };
}

function safeEffectiveParameters(parameters) {
  const effective = computeEffectiveParameters(parameters);
  return {
    omega_D: Number.isFinite(effective.omega_D) ? effective.omega_D : Number.NaN,
    omega_D_over_E_F: Number.isFinite(effective.omega_D_over_E_F)
      ? effective.omega_D_over_E_F
      : Number.NaN,
  };
}

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "not available";
  }
  return value.toFixed(10).replace(/0+$/, "").replace(/\.$/, "");
}

function formatRange(range) {
  if (!range) {
    return "computed";
  }
  return `${range.min} to ${range.max}`;
}

function statusClassFor(status) {
  return `model-envelope--${status}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
