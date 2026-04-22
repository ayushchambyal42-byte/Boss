import type { UpdateStatus, ValidityStatus } from "./types.ts";

export type ThresholdTruthLayer = "phenomenological";
export type ThresholdProbeState = "sub-threshold" | "disruptive" | "updating" | "constrained" | "unavailable";

export type ThresholdAssessment = {
  state: ThresholdProbeState;
  truthLayer: ThresholdTruthLayer;
  label: string;
  meaning: string;
};

export const THRESHOLD_INTERACTION_CONTRACT = Object.freeze({
  id: "single-gap-threshold-probe",
  title: "Single Threshold Probe",
  purpose:
    "Teach one MVP intuition loop: probe below the gap and nothing meaningful happens; probe above it and disruptive response becomes allowed.",
  truthLayer: "phenomenological" as ThresholdTruthLayer,
  computedDependencies: Object.freeze([
    "validated current Delta(T)",
    "current validity status",
    "current update status",
  ]),
  control: Object.freeze({
    key: "probeStrength",
    label: "Probe strength",
    unit: "relative to current Delta(T)",
    defaultValue: 0.25,
    min: 0,
    max: 1.5,
    step: 0.01,
    thresholdRatio: 1,
  }),
  states: Object.freeze([
    Object.freeze({
      key: "sub-threshold",
      label: "Forbidden response",
      meaning: "Probe remains below the current gap threshold, so the interaction teaches that no disruptive response is allowed.",
    }),
    Object.freeze({
      key: "disruptive",
      label: "Allowed disruptive response",
      meaning: "Probe meets or exceeds the current gap threshold, so disruptive response is allowed in the phenomenological teaching view.",
    }),
    Object.freeze({
      key: "updating",
      label: "Updating",
      meaning: "The threshold view holds until the validated computed state finishes updating; no new threshold claim is shown as final.",
    }),
    Object.freeze({
      key: "constrained",
      label: "Constrained interpretation",
      meaning: "The current state strains the supported envelope, so the threshold view remains visible only as constrained phenomenological guidance.",
    }),
    Object.freeze({
      key: "unavailable",
      label: "Unavailable",
      meaning: "Invalid or failed computed states disable the threshold interaction instead of fabricating continuity.",
    }),
  ]),
  nonGoals: Object.freeze([
    "No second threshold mode in MVP.",
    "No amplitude-phase split threshold view in MVP.",
    "No twin-isotope threshold comparison in MVP.",
    "No claim of non-equilibrium simulation fidelity.",
  ]),
});

export function assessThresholdProbe({
  probeStrength,
  selectedGap,
  updateStatus,
  validityStatus,
}: {
  probeStrength: number;
  selectedGap: number | null;
  updateStatus: UpdateStatus;
  validityStatus: ValidityStatus;
}): ThresholdAssessment {
  if (updateStatus === "pending") {
    return createAssessment("updating");
  }

  if (updateStatus === "invalid" || updateStatus === "failed" || validityStatus === "invalid" || validityStatus === "failed") {
    return createAssessment("unavailable");
  }

  if (!Number.isFinite(probeStrength) || probeStrength < THRESHOLD_INTERACTION_CONTRACT.control.min) {
    return createAssessment("unavailable");
  }

  if (!Number.isFinite(selectedGap) || selectedGap === null || selectedGap <= 0) {
    return createAssessment("unavailable");
  }

  if (validityStatus === "constrained" || validityStatus === "near-edge") {
    return createAssessment("constrained");
  }

  if (probeStrength < THRESHOLD_INTERACTION_CONTRACT.control.thresholdRatio) {
    return createAssessment("sub-threshold");
  }

  return createAssessment("disruptive");
}

function createAssessment(state: ThresholdProbeState): ThresholdAssessment {
  const definition = THRESHOLD_INTERACTION_CONTRACT.states.find((entry) => entry.key === state);
  if (!definition) {
    throw new Error(`Unknown threshold state: ${state}`);
  }

  return {
    state,
    truthLayer: THRESHOLD_INTERACTION_CONTRACT.truthLayer,
    label: definition.label,
    meaning: definition.meaning,
  };
}
