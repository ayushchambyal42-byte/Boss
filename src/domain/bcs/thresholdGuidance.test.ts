import { describe, expect, it } from "vitest";
import { buildThresholdGuidance } from "./thresholdGuidance.ts";

const baseParameters = { lambda: 0.3, omega_D_ref: 10, E_F: 100, T: 0.10112381297708083 };
const baseEffectiveParameters = { omega_D: 10, omega_D_over_E_F: 0.1 };

describe("Story 3.3 threshold guidance", () => {
  it("explains valid sub-threshold and disruptive states from the current validated parameter state", () => {
    const subThreshold = buildThresholdGuidance({
      assessment: {
        state: "sub-threshold",
        truthLayer: "phenomenological",
        label: "Forbidden response",
        meaning: "Probe remains below the current gap threshold.",
      },
      parameters: baseParameters,
      effectiveParameters: baseEffectiveParameters,
      validity: { status: "valid", issues: [] },
    });
    const disruptive = buildThresholdGuidance({
      assessment: {
        state: "disruptive",
        truthLayer: "phenomenological",
        label: "Allowed disruptive response",
        meaning: "Probe meets or exceeds the current gap threshold.",
      },
      parameters: { ...baseParameters, lambda: 0.4 },
      effectiveParameters: baseEffectiveParameters,
      validity: { status: "valid", issues: [] },
    });

    expect(subThreshold.truthLayer).toBe("interpretive");
    expect(subThreshold.summary).toMatch(/probe remains below/i);
    expect(subThreshold.details.join(" ")).toMatch(/T\/T_c/);
    expect(subThreshold.stageCue).toMatch(/capture a baseline, then change one parameter/i);
    expect(disruptive.summary).toMatch(/meets or exceeds/i);
    expect(disruptive.details.join(" ")).toMatch(/λ = 0.40/);
  });

  it("uses updating, constrained, and unavailable guidance instead of overclaiming stability", () => {
    const updating = buildThresholdGuidance({
      assessment: { state: "updating", truthLayer: "phenomenological", label: "Updating", meaning: "Updating." },
      parameters: baseParameters,
      effectiveParameters: baseEffectiveParameters,
      validity: { status: "valid", issues: [] },
    });
    const constrained = buildThresholdGuidance({
      assessment: { state: "constrained", truthLayer: "phenomenological", label: "Constrained interpretation", meaning: "Constrained." },
      parameters: { ...baseParameters, E_F: 60 },
      effectiveParameters: { omega_D: 10, omega_D_over_E_F: 0.1666666667 },
      validity: { status: "constrained", issues: [{ status: "constrained", message: "effective omega_D / E_F is constrained" }] },
    });
    const unavailable = buildThresholdGuidance({
      assessment: { state: "unavailable", truthLayer: "phenomenological", label: "Unavailable", meaning: "Unavailable." },
      parameters: baseParameters,
      effectiveParameters: baseEffectiveParameters,
      validity: { status: "invalid", issues: [{ status: "invalid", message: "state is invalid" }] },
    });

    expect(updating.summary).toMatch(/paused until the validated computed state finishes updating/i);
    expect(constrained.summary).toMatch(/strains the supported weak-coupling envelope/i);
    expect(constrained.details.join(" ")).toMatch(/effective omega_D \/ E_F is constrained/i);
    expect(constrained.stageCue).toMatch(/move back toward the supported envelope|compare only the broad direction/i);
    expect(unavailable.summary).toMatch(/computed gap context is unavailable/i);
    expect(unavailable.stageCue).toMatch(/return to a supported state/i);
  });

  it("references the captured baseline when one exists instead of falling back to generic prose", () => {
    const guidance = buildThresholdGuidance({
      assessment: {
        state: "disruptive",
        truthLayer: "phenomenological",
        label: "Allowed disruptive response",
        meaning: "Probe meets or exceeds the current gap threshold.",
      },
      parameters: { ...baseParameters, lambda: 0.4, T: 0.2 },
      effectiveParameters: baseEffectiveParameters,
      validity: { status: "valid", issues: [] },
      baseline: {
        capturedAtStateVersion: 3,
        parameters: baseParameters,
        metricView: null,
        plotView: null,
      },
    });

    expect(guidance.summary).toMatch(/captured baseline/i);
    expect(guidance.stageCue).toMatch(/use the captured baseline to isolate one parameter change at a time/i);
  });
});
