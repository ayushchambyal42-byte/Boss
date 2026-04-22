import { APP_NAME, APP_VERSION } from "../../appMetadata.ts";
import { getParameterControlDefinitions } from "./parameters.ts";
import type {
  ExportSessionTrustStatus,
  ExportedParameterEntry,
  ExplorerState,
  ParameterVector,
  SessionInspection,
  SessionIssueCategory,
  SessionExportPackage,
} from "./types.ts";

export function buildSessionExportPackage(state: ExplorerState, exportedAt = new Date().toISOString()): SessionExportPackage {
  const parameters = toExportedParameters(state.parameters);
  const baselineParameters = state.baseline ? toExportedParameters(state.baseline.parameters) : null;

  return {
    app: {
      name: APP_NAME,
      version: APP_VERSION,
    },
    exportedAt,
    stateVersion: state.stateVersion,
    updateStatus: state.updateStatus,
    sessionTrustStatus: deriveSessionTrustStatus(state),
    validity: state.validity,
    parameters,
    effectiveParameters: state.effectiveParameters,
    thresholdProbeStrength: state.thresholdProbeStrength,
    computed: {
      metricView: state.computed.metricView,
      plotView: state.computed.plotView,
      outputs: {
        metrics:
          state.computed.metricView?.cards.map((card) => ({
            key: card.key,
            label: card.label,
            unit: card.unit,
            value: card.roundedValue,
            stateLabel: card.stateLabel,
          })) ?? [],
        plotState: state.computed.plotView?.viewState ?? null,
        selectedPoint: state.computed.plotView?.plot?.selectedPoint ?? null,
        renderedStateVersion: state.computed.plotView?.renderedStateVersion ?? null,
        message: state.computed.plotView?.message ?? state.computed.metricView?.message ?? null,
      },
    },
    baseline: state.baseline
      ? {
          capturedAtStateVersion: state.baseline.capturedAtStateVersion,
          parameters: baselineParameters ?? [],
        }
      : null,
  };
}

export function serializeSessionExportPackage(sessionPackage: SessionExportPackage): string {
  return JSON.stringify(sessionPackage, null, 2);
}

export function downloadSessionExport(state: ExplorerState): string {
  const sessionPackage = buildSessionExportPackage(state);
  const payload = serializeSessionExportPackage(sessionPackage);
  const blob = new Blob([payload], { type: "application/json" });
  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const filename = buildSessionExportFilename(sessionPackage);

  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(objectUrl);

  return filename;
}

export function parseSessionExportPackage(payload: string): SessionExportPackage {
  const parsed = JSON.parse(payload) as Partial<SessionExportPackage>;
  if (!parsed.app?.version || !Array.isArray(parsed.parameters) || !parsed.validity || !parsed.computed) {
    throw new Error("Invalid session export package.");
  }
  validateImportedParameters(parsed.parameters as ExportedParameterEntry[]);
  return parsed as SessionExportPackage;
}

export function buildSessionInspection(sessionPackage: SessionExportPackage): SessionInspection {
  return {
    package: sessionPackage,
    importedVersionMatchesCurrent: sessionPackage.app.version === APP_VERSION,
    issueCategory: deriveIssueCategory(sessionPackage),
    cues: buildInspectionCues(sessionPackage),
    importedParameters: toImportedParameters(sessionPackage.parameters),
  };
}

function buildSessionExportFilename(sessionPackage: SessionExportPackage): string {
  return `bcs-session-v${sessionPackage.app.version}-state-${sessionPackage.stateVersion}.json`;
}

function toExportedParameters(parameters: ParameterVector): ExportedParameterEntry[] {
  return getParameterControlDefinitions(parameters).map((control) => ({
    key: control.key,
    symbol: control.symbol,
    label: control.label,
    unit: control.unit,
    value: parameters[control.key],
  }));
}

function deriveSessionTrustStatus(state: ExplorerState): ExportSessionTrustStatus {
  if (state.updateStatus === "failed" || state.validity.status === "failed" || state.computed.plotView?.viewState === "failed") {
    return "failed";
  }
  if (state.updateStatus === "invalid" || state.validity.status === "invalid" || state.computed.plotView?.viewState === "invalid") {
    return "invalid";
  }
  if (state.validity.status === "constrained") {
    return "constrained";
  }
  if (
    state.updateStatus === "pending" ||
    !state.computed.metricView ||
    !state.computed.plotView ||
    state.computed.metricView.status === "pending" ||
    state.computed.plotView.viewState === "pending" ||
    state.computed.metricView.status === "invalid" ||
    state.computed.metricView.status === "failed"
  ) {
    return "partially-unavailable";
  }
  return "valid";
}

function toImportedParameters(entries: ExportedParameterEntry[]): ParameterVector {
  const read = (key: ParameterVector extends infer _ ? keyof ParameterVector : never): number =>
    Number(entries.find((entry) => entry.key === key)?.value ?? Number.NaN);

  return {
    lambda: read("lambda"),
    omega_D_ref: read("omega_D_ref"),
    E_F: read("E_F"),
    M: read("M"),
    T: read("T"),
  };
}

function validateImportedParameters(entries: ExportedParameterEntry[]): void {
  const requiredKeys: Array<ExportedParameterEntry["key"]> = ["lambda", "omega_D_ref", "E_F", "M", "T"];

  for (const key of requiredKeys) {
    const entry = entries.find((candidate) => candidate.key === key);
    if (!entry || !Number.isFinite(Number(entry.value))) {
      throw new Error(`Invalid session export package: missing finite parameter ${key}.`);
    }
  }
}

function deriveIssueCategory(sessionPackage: SessionExportPackage): SessionIssueCategory {
  if (
    sessionPackage.sessionTrustStatus === "failed" ||
    sessionPackage.updateStatus === "failed" ||
    sessionPackage.computed.outputs.message?.match(/solver|residual|non-finite|failed/i)
  ) {
    return "numerical";
  }
  if (
    sessionPackage.sessionTrustStatus === "constrained" ||
    sessionPackage.sessionTrustStatus === "invalid" ||
    sessionPackage.validity.status === "constrained" ||
    sessionPackage.validity.status === "invalid"
  ) {
    return "unsupported-regime";
  }
  return "truth-layer";
}

function buildInspectionCues(sessionPackage: SessionExportPackage): string[] {
  const cues: string[] = [];
  if (sessionPackage.app.version !== APP_VERSION) {
    cues.push(`Exported on app version ${sessionPackage.app.version}; current app version is ${APP_VERSION}.`);
  }
  if (deriveIssueCategory(sessionPackage) === "numerical") {
    cues.push("Primary diagnostic cue: inspect solver failure, residual handling, or computation stability.");
  }
  if (deriveIssueCategory(sessionPackage) === "unsupported-regime") {
    cues.push("Primary diagnostic cue: inspect weak-coupling validity limits and reported unsupported-range warnings.");
  }
  if (deriveIssueCategory(sessionPackage) === "truth-layer") {
    cues.push("Primary diagnostic cue: inspect labeling, stale-state communication, and truth-layer separation.");
  }
  if (sessionPackage.validity.issues.length > 0) {
    cues.push(...sessionPackage.validity.issues.map((issue) => issue.message));
  }
  if (sessionPackage.computed.outputs.message) {
    cues.push(sessionPackage.computed.outputs.message);
  }
  return cues;
}
