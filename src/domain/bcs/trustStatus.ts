import type { ExplorerState } from "./types.ts";

export type TrustStatusSummary = {
  label: string;
  stateText: string;
  reasonText: string;
  actionText: string;
  tone: "valid" | "near-edge" | "constrained" | "invalid" | "failed";
};

export function buildTrustStatusSummary(state: ExplorerState): TrustStatusSummary {
  if (state.updateStatus === "failed") {
    return {
      label: "Trust status",
      stateText: "Failed computation",
      reasonText: state.computed.plotView?.message ?? "Validated recomputation failed for the current state.",
      actionText: "Recommended action: return to the last supported range or reset before trusting new interpretation.",
      tone: "failed",
    };
  }

  if (state.updateStatus === "invalid" || state.validity.status === "invalid") {
    return {
      label: "Trust status",
      stateText: "Invalid state",
      reasonText: state.validity.issues[0]?.message ?? "Current inputs are outside the supported envelope.",
      actionText: "Recommended action: adjust parameters until the state returns inside the supported weak-coupling envelope.",
      tone: "invalid",
    };
  }

  if (state.validity.status === "constrained") {
    return {
      label: "Trust status",
      stateText: "Constrained interpretation",
      reasonText: state.validity.issues[0]?.message ?? "Current inputs strain the supported envelope.",
      actionText: "Recommended action: treat outputs as constrained guidance or move back toward the supported range before drawing conclusions.",
      tone: "constrained",
    };
  }

  if (state.validity.status === "near-edge") {
    return {
      label: "Trust status",
      stateText: "Near-edge state",
      reasonText: state.validity.issues[0]?.message ?? "Current inputs sit near the envelope edge.",
      actionText: "Recommended action: compare against a nearby baseline or step back toward the interior of the supported range before over-interpreting changes.",
      tone: "near-edge",
    };
  }

  return {
    label: "Trust status",
    stateText: "Within supported envelope",
    reasonText: "Current state remains within the intended weak-coupling support range.",
    actionText: "Recommended action: capture a baseline and change one parameter at a time to test predictions.",
    tone: "valid",
  };
}
