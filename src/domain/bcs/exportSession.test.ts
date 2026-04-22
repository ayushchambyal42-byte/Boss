import { describe, expect, it } from "vitest";
import { APP_VERSION } from "../../appMetadata.ts";
import { buildGapPlotView } from "./gapSolver.ts";
import { buildMetricCardViews } from "./metrics.ts";
import { createDefaultParameterVector, deriveEffectiveParameters } from "./parameters.ts";
import { buildSessionExportPackage, buildSessionInspection, parseSessionExportPackage, serializeSessionExportPackage } from "./exportSession.ts";
import type { ExplorerState } from "./types.ts";

function buildBaseState(): ExplorerState {
  const parameters = createDefaultParameterVector();
  return {
    view: "explorer",
    viewportMode: "desktop",
    browserFamily: "chromium",
    browserSupportLevel: "full",
    browserNotice: null,
    reducedMotion: false,
    reducedMotionSupported: true,
    thresholdProbeStrength: 0.25,
    parameters,
    effectiveParameters: deriveEffectiveParameters(parameters),
    computed: {
      stateVersion: 0,
      metricsReady: true,
      gapReady: true,
      metricView: buildMetricCardViews(parameters),
      plotView: buildGapPlotView(parameters, 0),
    },
    baseline: null,
    inspectedSession: null,
    importedSessionError: null,
    validity: { status: "valid", issues: [] },
    updateStatus: "stable",
    stateVersion: 0,
  };
}

describe("Story 4.3 export session package", () => {
  it("exports valid sessions with parameter units, computed outputs, and app version", () => {
    const state = buildBaseState();
    const sessionPackage = buildSessionExportPackage(state, "2026-04-22T10:00:00.000Z");

    expect(sessionPackage.app.version).toBe(APP_VERSION);
    expect(sessionPackage.exportedAt).toBe("2026-04-22T10:00:00.000Z");
    expect(sessionPackage.sessionTrustStatus).toBe("valid");
    expect(sessionPackage.parameters.find((entry) => entry.key === "lambda")).toMatchObject({
      key: "lambda",
      unit: "dimensionless",
      value: 0.3,
    });
    expect(sessionPackage.computed.outputs.metrics.find((entry) => entry.key === "T_c")?.value).toBe("0.4044952519");
    expect(sessionPackage.computed.outputs.plotState).toBe("stable");
    expect(sessionPackage.computed.outputs.selectedPoint).toMatchObject({
      T: state.parameters.T,
    });
  });

  it("exports constrained sessions with constrained trust status", () => {
    const state = buildBaseState();
    const constrainedState: ExplorerState = {
      ...state,
      validity: { status: "constrained", issues: [{ status: "constrained", message: "omega_D / E_F is outside the supported ratio." }] },
      computed: {
        ...state.computed,
        metricView: {
          ...state.computed.metricView!,
          status: "constrained",
          message: "Unsupported regime warning: omega_D / E_F is outside the supported ratio.",
          issues: [{ status: "constrained", message: "omega_D / E_F is outside the supported ratio." }],
        },
      },
    };

    const sessionPackage = buildSessionExportPackage(constrainedState, "2026-04-22T10:05:00.000Z");

    expect(sessionPackage.sessionTrustStatus).toBe("constrained");
    expect(sessionPackage.validity.status).toBe("constrained");
    expect(sessionPackage.computed.metricView?.status).toBe("constrained");
  });

  it("exports invalid sessions with invalid trust status and suppressed outputs", () => {
    const state = buildBaseState();
    const invalidState: ExplorerState = {
      ...state,
      updateStatus: "invalid",
      validity: { status: "invalid", issues: [{ status: "invalid", message: "invalid parameter state suppresses the gap plot." }] },
      computed: {
        ...state.computed,
        metricsReady: false,
        gapReady: false,
        metricView: {
          status: "invalid",
          stateVersionLabel: "suppressed",
          issues: [{ status: "invalid", message: "invalid parameter state suppresses the gap plot." }],
          message: "Invalid input: invalid parameter state suppresses the gap plot.",
          isUpdating: false,
          cards: [],
        },
        plotView: {
          ...state.computed.plotView!,
          viewState: "invalid",
          plot: null,
          metricSnapshot: null,
          message: "Invalid input: plot suppressed for the current state.",
        },
      },
    };

    const sessionPackage = buildSessionExportPackage(invalidState, "2026-04-22T10:10:00.000Z");

    expect(sessionPackage.sessionTrustStatus).toBe("invalid");
    expect(sessionPackage.computed.outputs.metrics).toHaveLength(0);
    expect(sessionPackage.computed.outputs.plotState).toBe("invalid");
    expect(sessionPackage.computed.outputs.selectedPoint).toBeNull();
  });

  it("exports failed sessions with failed trust status and failure message", () => {
    const state = buildBaseState();
    const failedState: ExplorerState = {
      ...state,
      updateStatus: "failed",
      validity: { status: "failed", issues: [{ status: "failed", message: "solver residual became non-finite." }] },
      computed: {
        ...state.computed,
        metricsReady: false,
        gapReady: false,
        plotView: {
          ...state.computed.plotView!,
          viewState: "failed",
          plot: null,
          metricSnapshot: null,
          message: "Solver failure: solver residual became non-finite.",
        },
      },
    };

    const sessionPackage = buildSessionExportPackage(failedState, "2026-04-22T10:15:00.000Z");

    expect(sessionPackage.sessionTrustStatus).toBe("failed");
    expect(sessionPackage.validity.status).toBe("failed");
    expect(sessionPackage.computed.outputs.message).toMatch(/solver residual became non-finite/i);
  });

  it("parses exported packages and diagnoses unsupported-regime sessions", () => {
    const state = buildBaseState();
    const constrainedState: ExplorerState = {
      ...state,
      validity: { status: "constrained", issues: [{ status: "constrained", message: "omega_D / E_F is outside the supported ratio." }] },
      computed: {
        ...state.computed,
        metricView: {
          ...state.computed.metricView!,
          status: "constrained",
          message: "Unsupported regime warning: omega_D / E_F is outside the supported ratio.",
          issues: [{ status: "constrained", message: "omega_D / E_F is outside the supported ratio." }],
        },
      },
    };

    const payload = serializeSessionExportPackage(buildSessionExportPackage(constrainedState, "2026-04-22T10:20:00.000Z"));
    const parsed = parseSessionExportPackage(payload);
    const inspection = buildSessionInspection(parsed);

    expect(inspection.issueCategory).toBe("unsupported-regime");
    expect(inspection.importedVersionMatchesCurrent).toBe(true);
    expect(inspection.cues.some((cue) => cue.includes("unsupported-range"))).toBe(true);
    expect(inspection.importedParameters.lambda).toBe(0.3);
  });

  it("diagnoses numerical failure sessions from exported failure state", () => {
    const state = buildBaseState();
    const failedState: ExplorerState = {
      ...state,
      updateStatus: "failed",
      validity: { status: "failed", issues: [{ status: "failed", message: "solver residual became non-finite." }] },
      computed: {
        ...state.computed,
        metricsReady: false,
        gapReady: false,
        plotView: {
          ...state.computed.plotView!,
          viewState: "failed",
          plot: null,
          metricSnapshot: null,
          message: "Solver failure: solver residual became non-finite.",
        },
      },
    };

    const inspection = buildSessionInspection(buildSessionExportPackage(failedState, "2026-04-22T10:25:00.000Z"));

    expect(inspection.issueCategory).toBe("numerical");
    expect(inspection.cues.some((cue) => cue.includes("solver failure")) || inspection.cues.some((cue) => cue.includes("residual"))).toBe(true);
  });

  it("rejects malformed imported packages instead of coercing missing parameters", () => {
    const malformedPayload = JSON.stringify({
      app: { name: "bmad-test", version: "0.1.0" },
      parameters: [{ key: "lambda", symbol: "λ", label: "Coupling strength", unit: "dimensionless", value: 0.4 }],
      validity: { status: "valid", issues: [] },
      computed: { metricView: null, plotView: null, outputs: { metrics: [], plotState: null, selectedPoint: null, renderedStateVersion: null, message: null } },
    });

    expect(() => parseSessionExportPackage(malformedPayload)).toThrow(/missing finite parameter omega_D_ref/i);
  });
});
