import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../../App.tsx";
import { buildGapPlotView } from "../../domain/bcs/gapSolver.ts";
import { buildMetricCardViews } from "../../domain/bcs/metrics.ts";
import { createInitialExplorerState, explorerReducer } from "../../state/explorerState.ts";

const ORIGINAL_MATCH_MEDIA = window.matchMedia;
const ORIGINAL_USER_AGENT = window.navigator.userAgent;

function mockMatchMedia({ matches = false, supported = true }: { matches?: boolean; supported?: boolean }) {
  if (!supported) {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: undefined,
    });
    return;
  }

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: () => ({
      matches,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }),
  });
}

function mockUserAgent(userAgent: string) {
  Object.defineProperty(window.navigator, "userAgent", {
    configurable: true,
    value: userAgent,
  });
}

afterEach(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: ORIGINAL_MATCH_MEDIA,
  });
  Object.defineProperty(window.navigator, "userAgent", {
    configurable: true,
    value: ORIGINAL_USER_AGENT,
  });
});

describe("Story 2.1 explorer shell", () => {
  it("keeps the landing surface lightweight and scoped to the weak-coupling BCS explorer", () => {
    render(<App />);

    expect(screen.getByText(/^weak-coupling bcs explorer$/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /explore the weak-coupling bcs gap/i })).toBeInTheDocument();
    expect(screen.getByText(/it is not a general superconductivity simulator/i)).toBeInTheDocument();
    expect(screen.getByText(/routes directly into guided entry or the live explorer/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /start guided entry/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /open explorer/i })).toBeInTheDocument();
  });

  it("preserves explorer context when moving between landing, guided, and explorer views", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /open explorer/i }));
    expect(screen.getByText(/stateful spa exploration/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/current parameter state/i)).toHaveTextContent("0.30");

    await user.click(screen.getByRole("button", { name: /^guided$/i }));
    expect(screen.getByRole("heading", { name: /enter through the transition story/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/guided transition story/i)).toHaveTextContent(/step 1 of 4: start from the default state/i);
    expect(screen.getByLabelText(/guided entry truth layers/i)).toHaveTextContent(/interpretive transition guidance/i);
    expect(screen.getByLabelText(/guided entry truth layers/i)).toHaveTextContent(/computed session continuity/i);

    await user.click(screen.getByRole("button", { name: /skip to explorer/i }));
    expect(screen.getByLabelText(/current parameter state/i)).toHaveTextContent("0.30");
    expect(screen.getByLabelText(/metric truth layers/i)).toHaveTextContent(/computed cards/i);
    expect(screen.getByLabelText(/validity truth layers/i)).toHaveTextContent(/computed envelope context/i);
  });

  it("keeps the guided transition short, staged, and focused on gap-as-constraint intuition", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /start guided entry/i }));

    expect(screen.getByLabelText(/guided transition story/i)).toHaveTextContent(/step 1 of 4: start from the default state/i);
    expect(screen.getByText(/one validated baseline before you vary anything/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /next step/i }));
    expect(screen.getByLabelText(/guided transition story/i)).toHaveTextContent(/step 2 of 4: read the main gap plot/i);
    expect(screen.getByText(/treat Δ\(T\) as the boundary for allowed versus forbidden behavior/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /next step/i }));
    expect(screen.getByLabelText(/guided transition story/i)).toHaveTextContent(/step 3 of 4: test the threshold interaction/i);
    expect(screen.getByText(/below the gap nothing disruptive happens; crossing the gap changes what the model permits/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /next step/i }));
    expect(screen.getByLabelText(/guided transition story/i)).toHaveTextContent(/step 4 of 4: keep the truth labels visible/i);
    expect(screen.getByText(/what is solved, what is guidance, and what is a teaching model/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /continue to explorer/i }));
    expect(screen.getByText(/stateful spa exploration/i)).toBeInTheDocument();
  });

  it("keeps guided primary actions reachable by keyboard", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /start guided entry/i }));

    await user.tab();
    expect(screen.getByRole("button", { name: /next step/i })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("button", { name: /skip to explorer/i })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("button", { name: /back to landing/i })).toHaveFocus();
  });

  it("shows the desktop-first degraded notice below 900px", async () => {
    const originalWidth = window.innerWidth;
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 880 });
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: /open explorer/i }));
    expect(screen.getByText(/desktop-first layout/i)).toBeInTheDocument();
    Object.defineProperty(window, "innerWidth", { configurable: true, value: originalWidth });
  });

  it("keeps primary explorer controls reachable by keyboard", async () => {
    mockMatchMedia({ supported: true, matches: false });
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /open explorer/i }));

    await user.tab();
    expect(screen.getByRole("button", { name: /^landing$/i })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("button", { name: /^guided$/i })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("button", { name: /^explorer$/i })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("button", { name: /presentation safe/i })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("button", { name: /set baseline/i })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("button", { name: /inspect session/i })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("button", { name: /export session/i })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("button", { name: /export plot/i })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("button", { name: /^reset$/i })).toHaveFocus();

    await user.tab();
    expect(screen.getByLabelText(/coupling strength \(λ\)/i)).toHaveFocus();
  });

  it("shows reduced-motion notice when the user preference requests it", async () => {
    mockMatchMedia({ supported: true, matches: true });
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /open explorer/i }));
    expect(screen.getByText(/reduced motion is active/i)).toBeInTheDocument();
  });

  it("shows reduced-motion guidance inside the guided flow when the user preference requests it", async () => {
    mockMatchMedia({ supported: true, matches: true });
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /start guided entry/i }));
    expect(screen.getByLabelText(/guided support notices/i)).toHaveTextContent(/guided emphasis and explanatory transitions are minimized/i);
  });

  it("shows Safari best-effort browser support messaging when applicable", async () => {
    mockMatchMedia({ supported: true, matches: false });
    mockUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15");
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /open explorer/i }));
    expect(screen.getByText(/safari support is best-effort for mvp/i)).toBeInTheDocument();
  });

  it("communicates degraded-browser expectations for guided entry, plotting, export, and presentation-safe use", async () => {
    mockMatchMedia({ supported: true, matches: false });
    mockUserAgent("CustomBrowser/1.0");
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /start guided entry/i }));
    expect(screen.getByLabelText(/guided support notices/i)).toHaveTextContent(/guided entry, plotting, export, and presentation-safe behavior may degrade/i);

    await user.click(screen.getByRole("button", { name: /skip to explorer/i }));
    expect(screen.getByLabelText(/support notices/i)).toHaveTextContent(/guided entry, plotting, export, and presentation-safe behavior may degrade/i);
  });

  it("supports a presentation-safe layout without hiding truth labels, reset, or guided re-entry", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /open explorer/i }));
    await user.click(screen.getByRole("button", { name: /presentation safe/i }));

    expect(screen.getByLabelText(/presentation-safe notices/i)).toHaveTextContent(/truth labels, validity guidance, reset, and guided re-entry remain visible/i);
    expect(screen.getByRole("button", { name: /exit presentation safe/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^guided$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^reset$/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/threshold truth layers/i)).toHaveTextContent(/computed context/i);
    expect(screen.getByLabelText(/metric truth layers/i)).toHaveTextContent(/computed cards/i);
    expect(screen.getByLabelText(/validity truth layers/i)).toHaveTextContent(/computed envelope context/i);
  });

  it("keeps presentation mode coherent during live parameter changes", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /open explorer/i }));
    await user.click(screen.getByRole("button", { name: /presentation safe/i }));

    fireEvent.change(screen.getByLabelText(/coupling strength \(λ\)/i), { target: { value: "0.40" } });

    expect(screen.getByText(/updating: previous computed values are shown as stale/i)).toBeInTheDocument();
    expect(screen.getByText(/updating: stale plot held until validated recomputation completes/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/threshold truth layers/i)).toHaveTextContent(/phenomenological response/i);
    expect(screen.getByLabelText(/validity truth layers/i)).toHaveTextContent(/interpretive validity guidance/i);

    await waitFor(() => expect(screen.queryByText(/updating: stale plot held until validated recomputation completes/i)).not.toBeInTheDocument());
    expect(screen.getByLabelText(/core metric cards/i)).toHaveTextContent("0.9307338226");
  });

  it("presents trust status and recommended action in text that stays keyboard reachable", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /open explorer/i }));
    fireEvent.change(screen.getByLabelText(/fermi energy \(E_F\)/i), { target: { value: "100" } });
    fireEvent.change(screen.getByLabelText(/reference debye cutoff \(ω_D,ref\)/i), { target: { value: "20" } });

    await waitFor(() => expect(screen.queryByText(/updating: previous computed values are shown as stale/i)).not.toBeInTheDocument());

    const trustSummary = screen.getByLabelText(/trust status summary/i);
    expect(trustSummary).toHaveAttribute("tabindex", "0");
    expect(trustSummary).toHaveTextContent(/state: constrained interpretation/i);
    expect(trustSummary).toHaveTextContent(/recommended action:/i);
    expect(trustSummary).toHaveTextContent(/move back toward the supported range/i);
    expect(screen.getByText(/trust status: constrained interpretation\./i)).toBeInTheDocument();
  });
});

describe("Story 2.1 explorer state reducer", () => {
  it("rejects stale async results and keeps the newer state version visible", () => {
    let state = createInitialExplorerState(1280);
    state = explorerReducer(state, { type: "view/selected", view: "explorer" });
    state = explorerReducer(state, { type: "parameters/changed", parameters: { lambda: 0.35 } });
    const versionAfterChange = state.stateVersion;
    state = explorerReducer(state, { type: "parameters/changed", parameters: { M: 1.5 } });
    const currentVersion = state.stateVersion;

    const stale = explorerReducer(state, {
      type: "results/committed",
      stateVersion: versionAfterChange,
      computed: { stateVersion: versionAfterChange, metricsReady: true, gapReady: true, metricView: null, plotView: null },
    });
    expect(stale.stateVersion).toBe(currentVersion);
    expect(stale.computed.stateVersion).toBeNull();
    expect(stale.updateStatus).toBe("pending");

    const current = explorerReducer(state, {
      type: "results/committed",
      stateVersion: currentVersion,
      computed: {
        stateVersion: currentVersion,
        metricsReady: true,
        gapReady: true,
        metricView: buildMetricCardViews(state.parameters),
        plotView: buildGapPlotView(state.parameters, currentVersion),
      },
    });
    expect(current.computed.stateVersion).toBe(currentVersion);
    expect(current.updateStatus).toBe("stable");
  });

  it("derives committed readiness from the resolved shared views instead of trusting optimistic flags", () => {
    let state = createInitialExplorerState(1280);
    state = explorerReducer(state, { type: "view/selected", view: "explorer" });
    state = explorerReducer(state, { type: "parameters/changed", parameters: { E_F: 20, omega_D_ref: 50 } });

    const currentVersion = state.stateVersion;
    const invalidMetricView = buildMetricCardViews(state.parameters);
    const invalidPlotView = buildGapPlotView(state.parameters, currentVersion);

    const committed = explorerReducer(state, {
      type: "results/committed",
      stateVersion: currentVersion,
      computed: {
        stateVersion: currentVersion,
        metricsReady: true,
        gapReady: true,
        metricView: invalidMetricView,
        plotView: invalidPlotView,
      },
    });

    expect(committed.computed.metricsReady).toBe(false);
    expect(committed.computed.gapReady).toBe(false);
    expect(committed.updateStatus).toBe("invalid");
  });

  it("reset restores defaults without discarding the active explorer view", () => {
    let state = createInitialExplorerState(1280);
    state = explorerReducer(state, { type: "view/selected", view: "explorer" });
    state = explorerReducer(state, { type: "parameters/changed", parameters: { lambda: 0.38, T: 0.2 } });

    const reset = explorerReducer(state, { type: "explorer/reset" });
    expect(reset.view).toBe("explorer");
    expect(reset.parameters.lambda).toBe(0.3);
    expect(reset.parameters.T).toBeCloseTo(0.10112381297708082);
    expect(reset.stateVersion).toBeGreaterThan(state.stateVersion);
  });

  it("captures one baseline snapshot and clears it on reset", () => {
    let state = createInitialExplorerState(1280);
    state = explorerReducer(state, { type: "view/selected", view: "explorer" });

    const captured = explorerReducer(state, { type: "baseline/captured" });
    expect(captured.baseline?.capturedAtStateVersion).toBe(captured.stateVersion);
    expect(captured.baseline?.parameters.lambda).toBe(0.3);

    const changed = explorerReducer(captured, { type: "parameters/changed", parameters: { lambda: 0.4 } });
    expect(changed.baseline?.parameters.lambda).toBe(0.3);

    const reset = explorerReducer(changed, { type: "explorer/reset" });
    expect(reset.baseline).toBeNull();
  });

  it("refuses to capture a baseline while the current explorer state is pending or not validated", () => {
    let state = createInitialExplorerState(1280);
    state = explorerReducer(state, { type: "view/selected", view: "explorer" });
    state = explorerReducer(state, { type: "baseline/captured" });
    expect(state.baseline?.capturedAtStateVersion).toBe(0);

    const pending = explorerReducer(state, { type: "parameters/changed", parameters: { lambda: 0.4 } });
    const blocked = explorerReducer(pending, { type: "baseline/captured" });

    expect(blocked.baseline?.capturedAtStateVersion).toBe(0);
    expect(blocked.baseline?.parameters.lambda).toBe(0.3);
  });
});

describe("Story 5.4 plot export", () => {
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;
  const originalAnchorClick = HTMLAnchorElement.prototype.click;
  let capturedBlob: Blob | null = null;

  beforeEach(() => {
    capturedBlob = null;
    URL.createObjectURL = vi.fn((blob: Blob) => {
      capturedBlob = blob;
      return "blob:plot-export";
    }) as typeof URL.createObjectURL;
    URL.revokeObjectURL = vi.fn() as typeof URL.revokeObjectURL;
    HTMLAnchorElement.prototype.click = vi.fn();
  });

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    HTMLAnchorElement.prototype.click = originalAnchorClick;
  });

  it("exports the current plot only after explicit user action and keeps local trust context attached", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /open explorer/i }));

    expect(screen.getByLabelText(/export plot note/i)).toHaveTextContent(/stays local/i);
    expect(URL.createObjectURL).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /export plot/i }));

    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:plot-export");
    expect(capturedBlob).not.toBeNull();

    const payload = await capturedBlob!.text();
    expect(payload).toContain("Weak-coupling BCS gap plot");
    expect(payload).toContain("Matching session package: bcs-session-v0.1.0-state-0.json");
    expect(payload).toContain("trust valid");
  });
});
