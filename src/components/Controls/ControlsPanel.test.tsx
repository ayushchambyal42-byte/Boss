import { fireEvent, render, screen, within } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import App from "../../App.tsx";

describe("Story 2.2 parameter controls and defaults", () => {
  it("renders the MVP parameter controls with labels, units, and current state", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /open explorer/i }));

    expect(screen.getByLabelText(/coupling strength \(λ\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/reference debye cutoff \(ω_D,ref\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fermi energy \(E_F\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^temperature \(T\)$/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/current parameter state/i)).toHaveTextContent("0.30");
    expect(screen.getByLabelText(/current parameter state/i)).toHaveTextContent("10.0");
    expect(screen.getByLabelText(/current parameter state/i)).toHaveTextContent("100");
  });

  it("preserves the explorer session context across repeated parameter changes", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /open explorer/i }));

    fireEvent.change(screen.getByLabelText(/coupling strength \(λ\)/i), { target: { value: "0.37" } });
    fireEvent.change(screen.getByLabelText(/^temperature \(T\)$/i), { target: { value: "0.200" } });

    expect(screen.getByText(/stateful spa exploration/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/current parameter state/i)).toHaveTextContent("0.37");
    expect(screen.getByLabelText(/current parameter state/i)).toHaveTextContent("0.200");
    expect(screen.getByText(/updating: previous computed values are shown as stale/i)).toBeInTheDocument();

    await waitFor(() => expect(screen.queryByText(/updating: previous computed values are shown as stale/i)).not.toBeInTheDocument());
    expect(screen.getByText(/current computed surfaces match the validated parameter state/i)).toBeInTheDocument();
  });

  it("resets the explorer back to the locked default parameter state", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /open explorer/i }));

    fireEvent.change(screen.getByLabelText(/coupling strength \(λ\)/i), { target: { value: "0.40" } });
    fireEvent.change(screen.getByLabelText(/reference debye cutoff \(ω_D,ref\)/i), { target: { value: "18.0" } });
    await user.click(screen.getByRole("button", { name: /reset/i }));

    expect(screen.getByLabelText(/current parameter state/i)).toHaveTextContent("0.30");
    expect(screen.getByLabelText(/current parameter state/i)).toHaveTextContent("10.0");
    expect(screen.getByLabelText(/current parameter state/i)).toHaveTextContent("100");
    expect(screen.getByLabelText(/current parameter state/i)).toHaveTextContent("0.101");
  });

  it("updates the temperature control against the live current Tc instead of a frozen shell reference", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /open explorer/i }));

    const temperatureControl = screen.getByLabelText(/^temperature \(T\)$/i);
    expect(Number(temperatureControl.getAttribute("max"))).toBeCloseTo(0.5056190648854041, 12);

    fireEvent.change(screen.getByLabelText(/temperature \(T\)/i), { target: { value: "0.500" } });
    expect(Number(screen.getByLabelText(/^temperature \(T\)$/i).getAttribute("max"))).toBeCloseTo(0.5056190648854041, 12);
  });

  it("animates temperature through the existing state pipeline and pauses in place", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /open explorer/i }));

    const temperatureControl = screen.getByLabelText(/^temperature \(T\)$/i) as HTMLInputElement;
    const initialTemperature = Number(temperatureControl.value);

    await user.click(screen.getByRole("button", { name: /^play$/i }));
    expect(screen.getByRole("button", { name: /^pause$/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/transition narrative/i)).toHaveTextContent(/strong pairing regime|pair breaking begins|gap collapse imminent|normal metal/i);

    await waitFor(() => expect(Number((screen.getByLabelText(/^temperature \(T\)$/i) as HTMLInputElement).value)).toBeGreaterThan(initialTemperature));
    await waitFor(() => expect(screen.getByLabelText(/gap plot readout/i)).not.toHaveTextContent("1.64170"));

    await user.click(screen.getByRole("button", { name: /^pause$/i }));
    const pausedTemperature = Number((screen.getByLabelText(/^temperature \(T\)$/i) as HTMLInputElement).value);

    await new Promise((resolve) => window.setTimeout(resolve, 240));
    expect(Number((screen.getByLabelText(/^temperature \(T\)$/i) as HTMLInputElement).value)).toBeCloseTo(pausedTemperature, 6);
  });
});

describe("Story 4.3 session export", () => {
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;
  const originalAnchorClick = HTMLAnchorElement.prototype.click;
  let capturedBlob: Blob | null = null;

  beforeEach(() => {
    capturedBlob = null;
    URL.createObjectURL = vi.fn((blob: Blob) => {
      capturedBlob = blob;
      return "blob:session-export";
    }) as typeof URL.createObjectURL;
    URL.revokeObjectURL = vi.fn() as typeof URL.revokeObjectURL;
    HTMLAnchorElement.prototype.click = vi.fn();
  });

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    HTMLAnchorElement.prototype.click = originalAnchorClick;
  });

  it("exports the current session only after explicit user action and includes version plus trust status", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /open explorer/i }));

    expect(screen.getByLabelText(/export session note/i)).toHaveTextContent(/app version 0.1.0/i);
    expect(screen.getByLabelText(/export session note/i)).toHaveTextContent(/current trust status valid/i);
    expect(URL.createObjectURL).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /export session/i }));

    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:session-export");
    expect(capturedBlob).not.toBeNull();

    const payload = JSON.parse(await capturedBlob!.text());
    expect(payload.app.version).toBe("0.1.0");
    expect(payload.sessionTrustStatus).toBe("valid");
    expect(payload.parameters.some((entry: { key: string }) => entry.key === "lambda")).toBe(true);
    expect(payload.computed.outputs.plotState).toBe("stable");
  });

  it("imports a local session package for inspection and can restore its parameters", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /open explorer/i }));

    const importedPayload = JSON.stringify({
      app: { name: "bmad-test", version: "0.1.0" },
      exportedAt: "2026-04-22T10:30:00.000Z",
      stateVersion: 12,
      updateStatus: "invalid",
      sessionTrustStatus: "invalid",
      validity: {
        status: "invalid",
        issues: [{ status: "invalid", message: "invalid parameter state suppresses the gap plot." }],
      },
      parameters: [
        { key: "lambda", symbol: "λ", label: "Coupling strength", unit: "dimensionless", value: 0.4 },
        { key: "omega_D_ref", symbol: "ω_D,ref", label: "Reference Debye cutoff", unit: "energy", value: 10 },
        { key: "E_F", symbol: "E_F", label: "Fermi energy", unit: "energy", value: 20 },
        { key: "T", symbol: "T", label: "Temperature", unit: "energy", value: 0.1 },
      ],
      effectiveParameters: { omega_D: 10, omega_D_over_E_F: 0.5 },
      thresholdProbeStrength: 0.25,
      computed: {
        metricView: null,
        plotView: null,
        outputs: {
          metrics: [],
          plotState: "invalid",
          selectedPoint: null,
          renderedStateVersion: 12,
          message: "Invalid input: plot suppressed for the current state.",
        },
      },
      baseline: null,
    });

    const fileInput = screen.getByLabelText(/inspect session file/i) as HTMLInputElement;
    const file = new File([importedPayload], "reported-session.json", { type: "application/json" });
    await user.upload(fileInput, file);

    expect(screen.getByLabelText(/imported session diagnostics/i)).toHaveTextContent(/imported app version 0.1.0/i);
    expect(screen.getByLabelText(/imported session diagnostics/i)).toHaveTextContent(/primary issue category/i);
    expect(screen.getByLabelText(/imported session diagnostics/i)).toHaveTextContent(/unsupported-regime/i);
    expect(screen.getByText(/invalid parameter state suppresses the gap plot/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /restore imported parameters/i }));
    await waitFor(() => expect(screen.queryByText(/updating: previous computed values are shown as stale/i)).not.toBeInTheDocument());

    expect(screen.getByLabelText(/current parameter state/i)).toHaveTextContent("0.40");
    expect(screen.getByLabelText(/current parameter state/i)).toHaveTextContent("20");
  });

  it("shows an explicit local diagnostic error for malformed imported session files", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /open explorer/i }));

    const malformedPayload = JSON.stringify({
      app: { name: "bmad-test", version: "0.1.0" },
      parameters: [{ key: "lambda", symbol: "λ", label: "Coupling strength", unit: "dimensionless", value: 0.4 }],
      validity: { status: "valid", issues: [] },
      computed: { metricView: null, plotView: null, outputs: { metrics: [], plotState: null, selectedPoint: null, renderedStateVersion: null, message: null } },
    });

    const fileInput = screen.getByLabelText(/inspect session file/i) as HTMLInputElement;
    const file = new File([malformedPayload], "bad-session.json", { type: "application/json" });
    await user.upload(fileInput, file);

    expect(screen.getByLabelText(/imported session diagnostics/i)).toHaveTextContent(/invalid session export package/i);
    expect(screen.getByText(/clear imported session/i)).toBeInTheDocument();
    expect(screen.queryByText(/restore imported parameters/i)).not.toBeInTheDocument();
  });
});
