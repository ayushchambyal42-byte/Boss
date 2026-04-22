import { describe, expect, it } from "vitest";
import { buildGapPlotView } from "./gapSolver.ts";
import { buildMetricCardViews } from "./metrics.ts";
import { createDefaultParameterVector, deriveEffectiveParameters } from "./parameters.ts";
import { buildPlotExportSvg } from "./exportPlot.ts";
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

describe("Story 5.4 plot export", () => {
  it("exports a valid plot artifact with session context and rendered plot data", () => {
    const svg = buildPlotExportSvg(buildBaseState(), "2026-04-22T12:00:00.000Z");

    expect(svg).toContain("Weak-coupling BCS gap plot");
    expect(svg).toContain("bcs-session-v0.1.0-state-0.json");
    expect(svg).toContain('class="line"');
    expect(svg).toContain("Valid state: plot export is tied to the validated computed session state.");
    expect(svg).toContain("&quot;sessionTrustStatus&quot;:&quot;valid&quot;");
  });

  it("exports constrained plots without dropping warning context", () => {
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

    const svg = buildPlotExportSvg(constrainedState, "2026-04-22T12:05:00.000Z");

    expect(svg).toContain("Constrained state: use this plot with the attached warning context.");
    expect(svg).toContain("Warning/validity context: constrained.");
    expect(svg).toContain("omega_D / E_F is outside the supported ratio.");
    expect(svg).toContain('class="line"');
  });

  it("exports invalid states as explicit suppressed-plot artifacts instead of pretending a plot exists", () => {
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

    const svg = buildPlotExportSvg(invalidState, "2026-04-22T12:10:00.000Z");

    expect(svg).not.toContain('class="line"');
    expect(svg).toContain("Invalid state: export preserves the invalidity context and plot suppression.");
    expect(svg).toContain("Plot unavailable for this exported state.");
    expect(svg).toContain("Invalid input: plot suppressed for the current state.");
  });

  it("exports failed states with solver-failure context intact", () => {
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

    const svg = buildPlotExportSvg(failedState, "2026-04-22T12:15:00.000Z");

    expect(svg).not.toContain('class="line"');
    expect(svg).toContain("Failed state: export preserves the solver failure context instead of fabricating a plot.");
    expect(svg).toContain("solver residual became non-finite");
    expect(svg).toContain("&quot;sessionTrustStatus&quot;:&quot;failed&quot;");
  });
});
