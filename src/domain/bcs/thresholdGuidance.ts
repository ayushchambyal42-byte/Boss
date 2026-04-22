import { deriveCriticalTemperature } from "./metrics.ts";
import type { BaselineSnapshot, EffectiveParameters, ParameterVector, ValidityState } from "./types.ts";
import type { ThresholdAssessment } from "./thresholdContract.ts";

export type ThresholdGuidance = {
  truthLayer: "interpretive";
  title: string;
  summary: string;
  details: string[];
  stageCue: string;
};

export function buildThresholdGuidance({
  assessment,
  parameters,
  effectiveParameters,
  validity,
  baseline,
}: {
  assessment: ThresholdAssessment;
  parameters: ParameterVector;
  effectiveParameters: EffectiveParameters;
  validity: ValidityState;
  baseline?: BaselineSnapshot | null;
}): ThresholdGuidance {
  const criticalTemperature = deriveCriticalTemperature(parameters);
  const reducedTemperature = criticalTemperature > 0 ? parameters.T / criticalTemperature : Number.NaN;
  const reducedTemperatureLabel = Number.isFinite(reducedTemperature) ? reducedTemperature.toPrecision(4) : "unavailable";
  const couplingLabel = parameters.lambda.toFixed(2);
  const ratioLabel = effectiveParameters.omega_D_over_E_F.toPrecision(4);
  const baselineComparison = baseline ? describeBaselineShift(parameters, baseline) : null;

  if (assessment.state === "updating") {
    return {
      truthLayer: "interpretive",
      title: "Why this changes",
      summary: "Guidance is paused until the validated computed state finishes updating.",
      details: [
        "Current inputs changed, so no new stability or fragility claim is presented as final yet.",
        "The threshold view resumes only after the shared computed state is committed.",
      ],
      stageCue: baseline ? "Stage cue: wait for the recomputation to settle, then compare the new state against the captured baseline." : "Stage cue: wait for the recomputation to settle before drawing a new conclusion.",
    };
  }

  if (assessment.state === "unavailable") {
    return {
      truthLayer: "interpretive",
      title: "Why this is unavailable",
      summary: "The current computed gap context is unavailable, so the threshold view cannot make a trustworthy interpretive claim.",
      details: [
        `Current validity status: ${validity.status}.`,
        "The interaction stays visible only to show that unsupported or failed states disable interpretation rather than fabricating continuity.",
      ],
      stageCue: "Stage cue: return to a supported state before using this view to reason about stability or fragility.",
    };
  }

  if (assessment.state === "constrained") {
    return {
      truthLayer: "interpretive",
      title: "Why this is constrained",
      summary: "The current parameter state strains the supported weak-coupling envelope, so threshold guidance is constrained rather than authoritative.",
      details: [
        validity.issues[0]?.message ?? "The current state is outside the comfortable weak-coupling region.",
        `Current reduced temperature T/T_c = ${reducedTemperatureLabel}; current effective ω_D / E_F = ${ratioLabel}.`,
        ...(baselineComparison ? [baselineComparison] : []),
      ],
      stageCue: baseline ? "Stage cue: compare only the broad direction of change against the baseline, not exact threshold authority." : "Stage cue: move back toward the supported envelope before treating this guidance as predictive.",
    };
  }

  const thermalInterpretation =
    Number.isFinite(reducedTemperature) && reducedTemperature >= 0.9
      ? `The system sits close to T_c (T/T_c = ${reducedTemperatureLabel}), so the gap is thermally fragile and easier to overwhelm.`
      : `The system remains below the transition scale (T/T_c = ${reducedTemperatureLabel}), so the current gap stays comparatively robust.`;

  const couplingInterpretation =
    parameters.lambda >= 0.35
      ? `Stronger coupling (λ = ${couplingLabel}) supports a larger gap scale and raises the disturbance threshold.`
      : `Weaker coupling (λ = ${couplingLabel}) lowers the gap scale and makes disruptive response easier to reach.`;

  const assessmentInterpretation =
    assessment.state === "disruptive"
      ? "Because the probe now meets or exceeds the current gap threshold, disruptive response becomes allowed in this teaching view."
      : "Because the probe remains below the current gap threshold, the interaction still teaches that disruptive response is blocked.";

  return {
    truthLayer: "interpretive",
    title: "Why this changes",
    summary: baselineComparison ? `${assessmentInterpretation} ${baselineComparison}` : assessmentInterpretation,
    details: [
      thermalInterpretation,
      couplingInterpretation,
      `Current effective ω_D / E_F = ${ratioLabel}.`,
    ],
    stageCue: baseline
      ? "Stage cue: use the captured baseline to isolate one parameter change at a time."
      : "Stage cue: capture a baseline, then change one parameter to test your prediction.",
  };
}

function describeBaselineShift(parameters: ParameterVector, baseline: BaselineSnapshot): string {
  const baselineTc = deriveCriticalTemperature(baseline.parameters);
  const currentTc = deriveCriticalTemperature(parameters);
  const deltaLambda = parameters.lambda - baseline.parameters.lambda;
  const deltaTemperature = parameters.T - baseline.parameters.T;
  const tcTrend = currentTc > baselineTc ? "higher" : currentTc < baselineTc ? "lower" : "unchanged";

  const shiftParts: string[] = [];
  if (Math.abs(deltaLambda) >= 1e-9) {
    shiftParts.push(`λ moved ${deltaLambda > 0 ? "up" : "down"} from ${baseline.parameters.lambda.toFixed(2)} to ${parameters.lambda.toFixed(2)}`);
  }
  if (Math.abs(deltaTemperature) >= 1e-9) {
    shiftParts.push(`T moved ${deltaTemperature > 0 ? "up" : "down"} from ${baseline.parameters.T.toPrecision(4)} to ${parameters.T.toPrecision(4)}`);
  }
  shiftParts.push(`the implied T_c is ${tcTrend} than the captured baseline`);

  return `Compared with the captured baseline, ${shiftParts.join(", ")}.`;
}
