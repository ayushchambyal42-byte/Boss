import { buildMetricCardModel, computeCoreMetrics } from "./metrics.mjs";
import { computeEffectiveParameters } from "./parameters.mjs";
import { ANALYTIC_CONSTANTS } from "./metrics.mjs";
import type { MetricView, ParameterVector } from "./types.ts";

export function computeMetricPlaceholder(parameters: ParameterVector) {
  const result = computeCoreMetrics(parameters);
  return {
    stateVersion: null,
    metricsReady: result.status !== "invalid" && result.status !== "failed",
    gapReady: false,
  };
}

export function deriveCriticalTemperature(parameters: ParameterVector): number {
  const effective = computeEffectiveParameters(parameters);
  return ANALYTIC_CONSTANTS.C_Tc * effective.omega_D * Math.exp(-1 / parameters.lambda);
}

export function buildMetricCardViews(parameters: ParameterVector): MetricView {
  const result = computeCoreMetrics(parameters);
  const cardModel = buildMetricCardModel(result);

  return {
    status: result.status,
    stateVersionLabel: result.display.canDisplayFinalMetrics ? "current validated state" : "suppressed",
    issues: result.issues,
    message: buildMetricMessage(result.status, result.issues),
    isUpdating: false,
    cards: cardModel.cards
      .filter((card: { key: string }) =>
        ["T_c", "Delta_0", "Delta_0_over_kBTc", "BCS_ratio"].includes(card.key),
      )
      .map((card: { key: string; rounded: string; status: string }) => ({
        key: card.key,
        label: METRIC_LABELS[card.key] ?? card.key,
        unit: METRIC_UNITS[card.key] ?? "dimensionless",
        roundedValue: card.rounded,
        stateLabel: card.status,
      })),
  };
}

export function createPendingMetricView(previousView: MetricView | null): MetricView {
  return {
    status: "pending",
    stateVersionLabel: previousView ? "updating from previous validated state" : "updating",
    issues: previousView?.issues ?? [],
    message: "Updating: current inputs changed and validated recomputation is still in progress.",
    isUpdating: true,
    cards: previousView?.cards.map((card) => ({
      ...card,
      stateLabel: "updating",
    })) ?? [],
  };
}

const METRIC_LABELS: Record<string, string> = {
  T_c: "Critical temperature T_c",
  Delta_0: "Zero-temperature gap Δ(0)",
  Delta_0_over_kBTc: "Gap ratio Δ(0) / k_B T_c",
  BCS_ratio: "BCS ratio 2Δ(0) / k_B T_c",
};

const METRIC_UNITS: Record<string, string> = {
  T_c: "energy",
  Delta_0: "energy",
  Delta_0_over_kBTc: "dimensionless",
  BCS_ratio: "dimensionless",
};

function buildMetricMessage(status: string, issues: Array<{ status: string; message: string }>): string | null {
  if (status === "invalid") {
    return `Invalid input: ${issues[0]?.message ?? "current input is outside the supported envelope."}`;
  }
  if (status === "failed") {
    return `Partial failure: ${issues[issues.length - 1]?.message ?? "metric computation failed."}`;
  }
  if (status === "constrained") {
    return `Unsupported regime warning: ${issues[0]?.message ?? "current inputs are constrained."}`;
  }
  return null;
}
