import type { ExplorerState, ValidityStatus } from "./types.ts";

export type ValidityGuidance = {
  label: string;
  summary: string;
  recommendation: string;
  tone: "valid" | "near-edge" | "constrained" | "invalid" | "failed";
};

export function buildValidityGuidance(state: ExplorerState): ValidityGuidance {
  if (state.updateStatus === "failed") {
    return {
      label: "Failed computation",
      summary: state.computed.plotView?.message ?? "Validated recomputation failed for the current state.",
      recommendation: "Recommended action: return to the last supported parameter range or reset before trusting any new interpretation.",
      tone: "failed",
    };
  }

  if (state.updateStatus === "invalid" || state.validity.status === "invalid") {
    return {
      label: "Invalid state",
      summary: state.validity.issues[0]?.message ?? "Current inputs are outside the supported envelope.",
      recommendation: "Recommended action: adjust parameters until the state returns inside the supported weak-coupling envelope.",
      tone: "invalid",
    };
  }

  if (state.validity.status === "constrained") {
    return {
      label: "Constrained interpretation",
      summary: state.validity.issues[0]?.message ?? "Current inputs strain the supported envelope.",
      recommendation: "Recommended action: treat outputs as constrained guidance or move back toward the supported range before drawing conclusions.",
      tone: "constrained",
    };
  }

  if (state.validity.status === "near-edge") {
    return {
      label: "Near-edge state",
      summary: state.validity.issues[0]?.message ?? "Current inputs sit near the envelope edge.",
      recommendation: "Recommended action: compare against a nearby baseline or step back toward the interior of the supported range before over-interpreting changes.",
      tone: "near-edge",
    };
  }

  return {
    label: "Within supported envelope",
    summary: "Current state remains within the intended weak-coupling support range.",
    recommendation: "Recommended action: capture a baseline and change one parameter at a time to test predictions.",
    tone: "valid",
  };
}

export function guidanceToneClass(status: ValidityStatus | "failed"): string {
  if (status === "failed") {
    return "failed";
  }
  return status;
}
