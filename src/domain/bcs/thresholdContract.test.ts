import { describe, expect, it } from "vitest";
import { THRESHOLD_INTERACTION_CONTRACT, assessThresholdProbe } from "./thresholdContract.ts";

describe("Story 3.1 threshold interaction contract", () => {
  it("locks exactly one MVP threshold control with one allowed-versus-forbidden purpose", () => {
    expect(THRESHOLD_INTERACTION_CONTRACT.id).toBe("single-gap-threshold-probe");
    expect(THRESHOLD_INTERACTION_CONTRACT.purpose).toMatch(/one mvp intuition loop/i);
    expect(THRESHOLD_INTERACTION_CONTRACT.control.key).toBe("probeStrength");
    expect(THRESHOLD_INTERACTION_CONTRACT.control.thresholdRatio).toBe(1);
  });

  it("classifies the threshold view as phenomenological and rejects extra MVP modes", () => {
    expect(THRESHOLD_INTERACTION_CONTRACT.truthLayer).toBe("phenomenological");
    expect(THRESHOLD_INTERACTION_CONTRACT.nonGoals).toContain("No second threshold mode in MVP.");
    expect(THRESHOLD_INTERACTION_CONTRACT.nonGoals).toContain("No claim of non-equilibrium simulation fidelity.");
  });

  it("distinguishes sub-threshold from disruptive response only when the validated state is usable", () => {
    expect(
      assessThresholdProbe({
        probeStrength: 0.75,
        selectedGap: 0.8,
        updateStatus: "stable",
        validityStatus: "valid",
      }),
    ).toMatchObject({ state: "sub-threshold", truthLayer: "phenomenological" });

    expect(
      assessThresholdProbe({
        probeStrength: 1.05,
        selectedGap: 0.8,
        updateStatus: "stable",
        validityStatus: "valid",
      }),
    ).toMatchObject({ state: "disruptive", truthLayer: "phenomenological" });
  });

  it("enters updating, constrained, or unavailable states instead of overclaiming authority", () => {
    expect(
      assessThresholdProbe({
        probeStrength: 0.5,
        selectedGap: 0.8,
        updateStatus: "pending",
        validityStatus: "valid",
      }).state,
    ).toBe("updating");

    expect(
      assessThresholdProbe({
        probeStrength: 1.1,
        selectedGap: 0.8,
        updateStatus: "stable",
        validityStatus: "constrained",
      }).state,
    ).toBe("constrained");

    expect(
      assessThresholdProbe({
        probeStrength: 1.1,
        selectedGap: null,
        updateStatus: "invalid",
        validityStatus: "invalid",
      }).state,
    ).toBe("unavailable");
  });
});
