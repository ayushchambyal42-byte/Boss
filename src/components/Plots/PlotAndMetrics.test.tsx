import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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

    await waitFor(() => expect(screen.queryByText(/updating: stale plot held until validated recomputation completes/i)).not.toBeInTheDocument());
    expect(screen.getByLabelText(/core metric cards/i)).toHaveTextContent("0.9307338226");
    expect(screen.getByLabelText(/gap plot readout/i)).toHaveTextContent("0.101124");
    expect(screen.getByLabelText(/gap plot readout/i)).toHaveTextContent("1.64170");
  });

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
    await waitFor(() => expect(screen.queryByText(/updating: stale plot held until validated recomputation completes/i)).not.toBeInTheDocument());

    expect(screen.getByLabelText(/baseline comparison/i)).toBeInTheDocument();
    expect(screen.getByText(/current state is compared against one captured baseline/i)).toBeInTheDocument();
    expect(screen.getAllByText(/up vs baseline/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/reduced Δ\(t\) \/ Δ\(0\)/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /reset/i }));
    expect(screen.queryByLabelText(/baseline comparison/i)).not.toBeInTheDocument();
    expect(screen.getByText(/no baseline captured yet/i)).toBeInTheDocument();
  });

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

  it("shows forbidden response below threshold and disruptive response above threshold", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /open explorer/i }));

    expect(screen.getByLabelText(/threshold response view/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/threshold truth layers/i)).toHaveTextContent(/computed context/i);
    expect(screen.getByLabelText(/threshold truth layers/i)).toHaveTextContent(/phenomenological response/i);
    expect(screen.getByLabelText(/threshold truth layers/i)).toHaveTextContent(/interpretive guidance/i);
    expect(screen.getByText(/forbidden response/i)).toBeInTheDocument();
    expect(screen.getByText(/no disruptive response is allowed/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/threshold guidance/i)).toHaveTextContent(/probe remains below the current gap threshold/i);
    expect(screen.getByText(/capture a baseline, then change one parameter to test your prediction/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/probe strength/i), { target: { value: "1.10" } });

    expect(screen.getByText(/allowed disruptive response/i)).toBeInTheDocument();
    expect(screen.getByText(/disruptive response is allowed in the phenomenological teaching view/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/threshold guidance/i)).toHaveTextContent(/meets or exceeds the current gap threshold/i);
  });

  it("uses captured baseline context in threshold guidance without turning into a tutorial system", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /open explorer/i }));
    await user.click(screen.getByRole("button", { name: /set baseline/i }));
    fireEvent.change(screen.getByLabelText(/coupling strength \(λ\)/i), { target: { value: "0.40" } });
    await waitFor(() => expect(screen.queryByText(/updating: stale plot held until validated recomputation completes/i)).not.toBeInTheDocument());

    expect(screen.getByLabelText(/threshold guidance/i)).toHaveTextContent(/captured baseline/i);
    expect(screen.getByText(/use the captured baseline to isolate one parameter change at a time/i)).toBeInTheDocument();
  });

  it("holds threshold claims in updating and constrained states instead of overclaiming authority", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /open explorer/i }));
    fireEvent.change(screen.getByLabelText(/coupling strength \(λ\)/i), { target: { value: "0.40" } });

    expect(screen.getByText(/^updating$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/threshold truth layers/i)).toHaveTextContent(/computed context/i);
    expect(screen.getByLabelText(/threshold truth layers/i)).toHaveTextContent(/phenomenological response/i);
    expect(screen.getByLabelText(/threshold truth layers/i)).toHaveTextContent(/interpretive guidance/i);
    expect(screen.getByText(/stale values hidden during recomputation/i)).toBeInTheDocument();
    expect(screen.getAllByText(/^unavailable$/i).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/threshold guidance/i)).toHaveTextContent(/guidance is paused until the validated computed state finishes updating/i);

    await waitFor(() => expect(screen.queryByText(/^updating$/i)).not.toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/fermi energy \(E_F\)/i), { target: { value: "60" } });
    await waitFor(() => expect(screen.queryByText(/updating: stale plot held until validated recomputation completes/i)).not.toBeInTheDocument());

    expect(within(screen.getByLabelText(/threshold response view/i)).getByText(/constrained interpretation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/threshold truth layers/i)).toHaveTextContent(/computed context/i);
    expect(screen.getByText(/threshold view remains visible only as constrained phenomenological guidance/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/threshold guidance/i)).toHaveTextContent(/strains the supported weak-coupling envelope/i);
  });

  it("keeps the threshold view visible in unavailable mode for invalid computed states", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /open explorer/i }));
    fireEvent.change(screen.getByLabelText(/fermi energy \(E_F\)/i), { target: { value: "20" } });
    fireEvent.change(screen.getByLabelText(/reference debye cutoff \(ω_D,ref\)/i), { target: { value: "50" } });

    await waitFor(() => expect(screen.getByText(/invalid input: plot suppressed for the current state/i)).toBeInTheDocument());
    const thresholdView = screen.getByLabelText(/threshold response view/i);
    expect(thresholdView).toBeInTheDocument();
    expect(screen.getByLabelText(/threshold truth layers/i)).toHaveTextContent(/computed context/i);
    expect(screen.getByLabelText(/threshold truth layers/i)).toHaveTextContent(/phenomenological response/i);
    expect(screen.getByLabelText(/threshold truth layers/i)).toHaveTextContent(/interpretive guidance/i);
    expect(within(thresholdView).getAllByText(/^unavailable$/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/invalid or failed computed states disable the threshold interaction instead of fabricating continuity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/threshold guidance/i)).toHaveTextContent(/computed gap context is unavailable/i);
  });
});
