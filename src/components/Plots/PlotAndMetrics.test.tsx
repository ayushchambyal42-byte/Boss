import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../../App.tsx";

describe("Story 2.3 main gap plot and metrics", () => {
  it("shows the primary plot and core metric cards in the explorer surface", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /open explorer/i }));

    expect(screen.getByRole("img", { name: /main superconducting gap plot/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/core metric cards/i)).toHaveTextContent(/critical temperature t_c/i);
    expect(screen.getByLabelText(/core metric cards/i)).toHaveTextContent(/zero-temperature gap/i);
    expect(screen.getByLabelText(/metric truth layers/i)).toHaveTextContent(/computed cards/i);
    expect(screen.getByLabelText(/metric truth layers/i)).toHaveTextContent(/interpretive validity guidance/i);
    expect(screen.getByLabelText(/validity truth layers/i)).toHaveTextContent(/computed envelope context/i);
    expect(screen.getByLabelText(/validity truth layers/i)).toHaveTextContent(/interpretive validity guidance/i);
  });

  it("keeps plot and metric surfaces synchronized to the same current parameter state", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /open explorer/i }));

    fireEvent.change(screen.getByLabelText(/coupling strength \(λ\)/i), { target: { value: "0.40" } });

    expect(screen.getByText(/updating: previous computed values are shown as stale/i)).toBeInTheDocument();
    expect(screen.getByText(/updating: stale plot held until validated recomputation completes/i)).toBeInTheDocument();

    await waitFor(() => expect(screen.queryByText(/updating: stale plot held until validated recomputation completes/i)).not.toBeInTheDocument(), { timeout: 5000 });
    expect(screen.getByLabelText(/core metric cards/i)).toHaveTextContent("0.9307338226");
    await waitFor(() => expect(screen.getByLabelText(/gap plot readout/i)).toBeInTheDocument(), { timeout: 5000 });
    expect(screen.getByLabelText(/gap plot readout/i)).toHaveTextContent("0.101124");
    expect(screen.getByLabelText(/gap plot readout/i)).toHaveTextContent("1.64170");
  }, 15000);

  it("keeps the plot labels explicit enough for live desktop exploration", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /open explorer/i }));

    expect(screen.getByText(/temperature t \(energy\)/i)).toBeInTheDocument();
    expect(screen.getByText(/gap Δ\(t\) \(energy\)/i)).toBeInTheDocument();
    expect(screen.getByText(/metric state:/i)).toBeInTheDocument();
    expect(screen.getByText(/units:/i)).toBeInTheDocument();
  });

  it("shows a compact baseline comparison and clears it predictably on reset", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /open explorer/i }));
    await user.click(screen.getByRole("button", { name: /set baseline/i }));

    fireEvent.change(screen.getByLabelText(/coupling strength \(λ\)/i), { target: { value: "0.40" } });
    await waitFor(() => expect(screen.queryByText(/updating: stale plot held until validated recomputation completes/i)).not.toBeInTheDocument(), { timeout: 5000 });

    await waitFor(() => expect(screen.getByLabelText(/baseline comparison/i)).toBeInTheDocument(), { timeout: 5000 });
    expect(screen.getByLabelText(/baseline comparison/i)).toBeInTheDocument();
    expect(screen.getByText(/current state is compared against one captured baseline/i)).toBeInTheDocument();
    expect(screen.getAllByText(/up vs baseline/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/reduced Δ\(t\) \/ Δ\(0\)/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /reset/i }));
    expect(screen.queryByLabelText(/baseline comparison/i)).not.toBeInTheDocument();
    expect(screen.getByText(/no baseline captured yet/i)).toBeInTheDocument();
  }, 15000);

  it("suppresses normalized baseline comparison when the current state is outside the valid trust envelope", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /open explorer/i }));
    await user.click(screen.getByRole("button", { name: /set baseline/i }));

    fireEvent.change(screen.getByLabelText(/^temperature \(T\)$/i), { target: { value: "0.53" } });
    await waitFor(() => expect(screen.queryByText(/updating: stale plot held until validated recomputation completes/i)).not.toBeInTheDocument());

    expect(screen.getByLabelText(/baseline comparison/i)).toBeInTheDocument();
    expect(screen.queryByText(/reduced Δ\(t\) \/ Δ\(0\)/i)).not.toBeInTheDocument();
    expect(screen.getByText(/normalized comparison is hidden unless both current and baseline states remain within the valid trust envelope/i)).toBeInTheDocument();
  });

  it("renders a DOS panel from the current computed gap state", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /open explorer/i }));

    expect(screen.getByLabelText(/density of states panel/i)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /bcs density of states plot/i })).toBeInTheDocument();
    expect(screen.getByText(/energy gap Δ/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/density of states readout/i)).toHaveTextContent(/current Δ\(t\)/i);
    expect(screen.getByLabelText(/pair-breaking energy indicator/i)).toHaveTextContent(/energy required to break a cooper pair = Δ/i);
  });

  it("updates the DOS when the solver recomputes a new selected gap", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /open explorer/i }));
    const initialGapReadout = screen.getByLabelText(/gap plot readout/i).textContent;

    fireEvent.change(screen.getByLabelText(/^temperature \(T\)$/i), { target: { value: "0.500" } });
    await waitFor(() => expect(screen.queryByText(/updating: stale plot held until validated recomputation completes/i)).not.toBeInTheDocument());

    expect(screen.getByLabelText(/gap plot readout/i).textContent).not.toBe(initialGapReadout);
  });

  it("shows a flat normal-metal DOS with no gap marker when Δ goes to zero", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /open explorer/i }));
    fireEvent.change(screen.getByLabelText(/^temperature \(T\)$/i), { target: { value: "0.506" } });
    await waitFor(() => expect(screen.queryByText(/updating: stale plot held until validated recomputation completes/i)).not.toBeInTheDocument());

    await waitFor(() => expect(screen.getByLabelText(/density of states readout/i)).toBeInTheDocument());
    expect(screen.getByLabelText(/density of states readout/i)).toHaveTextContent(/flat normal-metal dos/i);
    expect(screen.queryByText(/^energy gap Δ$/i)).not.toBeInTheDocument();
  });

  it("renders a quasiparticle population panel from the current T and Δ(T)", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /open explorer/i }));

    expect(screen.getByLabelText(/quasiparticle population panel/i)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /quasiparticle population plot/i })).toBeInTheDocument();
    expect(screen.getByText(/thermal excitations increase with temperature/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/quasiparticle population readout/i)).toHaveTextContent(/current t/i);
    expect(screen.getByLabelText(/quasiparticle population readout/i)).toHaveTextContent(/current Δ\(t\)/i);
  });

  it("highlights the transition as the temperature approaches Tc", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /open explorer/i }));
    fireEvent.change(screen.getByLabelText(/^temperature \(T\)$/i), { target: { value: "0.500" } });
    await waitFor(() => expect(screen.queryByText(/updating: stale plot held until validated recomputation completes/i)).not.toBeInTheDocument());

    expect(screen.getByLabelText(/transition narrative/i)).toHaveTextContent(/gap collapse imminent|normal metal \(no gap\)/i);
    expect(screen.getByText(/gap collapses → no energy barrier → normal metal/i)).toBeInTheDocument();
    expect(screen.getAllByText(/at tc: Δ → 0 → superconductivity destroyed/i).length).toBe(1);
  });
});
