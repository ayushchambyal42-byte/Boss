import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MetricsPanel } from "../Metrics/MetricsPanel.tsx";
import { PlotPanel } from "../Plots/PlotPanel.tsx";
import { StatusPanel } from "./StatusPanel.tsx";
import App from "../../App.tsx";
import type { ExplorerState } from "../../domain/bcs/types.ts";

describe("Story 2.4 updating and error states", () => {
  it("shows a visible updating state during recomputation and then resolves to final values", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /open explorer/i }));
    fireEvent.change(screen.getByLabelText(/coupling strength \(λ\)/i), { target: { value: "0.40" } });

    expect(screen.getByText(/updating: previous computed values are shown as stale/i)).toBeInTheDocument();
    expect(screen.getByText(/updating: stale plot held until validated recomputation completes/i)).toBeInTheDocument();

    await waitFor(() => expect(screen.queryByText(/updating: stale plot held/i)).not.toBeInTheDocument());
    expect(screen.getByLabelText(/core metric cards/i)).toHaveTextContent("0.9307338226");
  });

  it("suppresses misleading final output for invalid input states", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /open explorer/i }));
    fireEvent.change(screen.getByLabelText(/fermi energy \(E_F\)/i), { target: { value: "20" } });
    fireEvent.change(screen.getByLabelText(/reference debye cutoff \(ω_D,ref\)/i), { target: { value: "50" } });

    await waitFor(() => expect(screen.getByText(/invalid input: plot suppressed for the current state/i)).toBeInTheDocument());
    expect(screen.getByText(/invalid parameter state suppresses the gap plot/i)).toBeInTheDocument();
    expect(screen.getByText(/metrics unavailable for the current validated state/i)).toBeInTheDocument();
    expect(screen.getAllByText(/recommended action: adjust parameters until the state returns inside the supported weak-coupling envelope/i).length).toBeGreaterThan(0);
  });

  it("rejects stale rapid-change results and keeps the newest state visible", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /open explorer/i }));
    fireEvent.change(screen.getByLabelText(/coupling strength \(λ\)/i), { target: { value: "0.35" } });
    fireEvent.change(screen.getByLabelText(/coupling strength \(λ\)/i), { target: { value: "0.40" } });

    await waitFor(() => expect(screen.getByLabelText(/core metric cards/i)).toHaveTextContent("0.9307338226"), { timeout: 5000 });
    await waitFor(() => expect(screen.getByLabelText(/gap plot readout/i)).toBeInTheDocument(), { timeout: 5000 });
    expect(screen.getByLabelText(/gap plot readout/i)).toHaveTextContent("1.64170");
  }, 15000);

  it("uses distinct visible treatment for constrained states", () => {
    const constrainedState: ExplorerState = {
      view: "explorer",
      viewportMode: "desktop",
      browserFamily: "chromium",
      browserSupportLevel: "full",
      browserNotice: null,
      reducedMotion: false,
      reducedMotionSupported: true,
      thresholdProbeStrength: 0.25,
      parameters: { lambda: 0.55, omega_D_ref: 10, E_F: 100, T: 0.1 },
      effectiveParameters: { omega_D: 10, omega_D_over_E_F: 0.1 },
      baseline: null,
      inspectedSession: null,
      importedSessionError: null,
      validity: { status: "constrained", issues: [{ status: "constrained", message: "lambda is import-only constrained" }] },
      updateStatus: "stable",
      stateVersion: 5,
      computed: {
        stateVersion: 5,
        metricsReady: true,
        gapReady: false,
        metricView: {
          status: "constrained",
          stateVersionLabel: "current validated state",
          issues: [{ status: "constrained", message: "lambda is import-only constrained" }],
          message: "Unsupported regime warning: lambda is import-only constrained",
          isUpdating: false,
          cards: [],
        },
        plotView: {
          viewState: "stable",
          stateVersion: 5,
          renderedStateVersion: 5,
          issues: [{ status: "constrained", message: "lambda is import-only constrained" }],
          isUpdating: false,
          metricSnapshot: { Delta_0: 1 },
          message: null,
          plot: {
            domain: { minT: 0, maxT: 1 },
            samples: [{ T: 0, Delta: 1 }],
            selectedPoint: { T: 0.1, Delta: 0.9, stateVersion: 5 },
            sampleCount: 1,
          },
        },
      },
    };

    render(
      <>
        <StatusPanel state={constrainedState} />
        <MetricsPanel state={constrainedState} />
        <PlotPanel state={constrainedState} />
      </>,
    );

    expect(screen.getAllByText(/unsupported regime warning:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/recommended action: treat outputs as constrained guidance or move back toward the supported range before drawing conclusions/i).length).toBeGreaterThan(0);
  });

  it("surfaces near-edge guidance before the user over-interprets strained states", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /open explorer/i }));
    fireEvent.change(screen.getByLabelText(/^temperature \(T\)$/i), { target: { value: "0.43" } });

    await waitFor(() => expect(screen.queryByText(/updating: stale plot held until validated recomputation completes/i)).not.toBeInTheDocument());
    expect(screen.getAllByText(/near-edge state/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/recommended action: compare against a nearby baseline or step back toward the interior of the supported range before over-interpreting changes/i).length).toBeGreaterThan(0);
  });
});
