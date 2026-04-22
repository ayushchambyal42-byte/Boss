from __future__ import annotations

import matplotlib.pyplot as plt
import streamlit as st

from bcs_solver import compute_critical_temperature, compute_gap, compute_gap_curve

st.set_page_config(page_title="BCS Superconductivity Simulator", layout="wide")


@st.cache_data(show_spinner=False)
def cached_gap(V: float, omega_D: float, temperature: float) -> float:
    return compute_gap(V, omega_D, temperature)


@st.cache_data(show_spinner=False)
def cached_critical_temperature(V: float, omega_D: float) -> float:
    return compute_critical_temperature(V, omega_D)


@st.cache_data(show_spinner=False)
def cached_curve(V: float, omega_D: float, max_temperature: float):
    return compute_gap_curve(V, omega_D, max_temperature=max_temperature)


st.title("BCS Superconductivity Simulator")
st.caption("Interactive gap-equation solver with a simple Streamlit front end.")

st.markdown(
    """
This app solves the weak-coupling BCS gap equation numerically using:

- energy integration up to a Debye cutoff `omega_D`
- a constant pairing interaction `V`
- root-finding for the superconducting gap `Delta`

Units are dimensionless and use `k_B = 1`.
"""
)

with st.sidebar:
    st.header("Model Parameters")
    interaction_strength = st.slider("Interaction strength V", 0.10, 1.00, 0.30, 0.01)
    cutoff_energy = st.slider("Debye cutoff omega_D", 1.0, 50.0, 10.0, 0.5)

    estimated_tc = cached_critical_temperature(interaction_strength, cutoff_energy)
    default_temperature = min(max(0.25 * cutoff_energy, 0.0), cutoff_energy)
    temperature = st.slider("Temperature T", 0.0, cutoff_energy, default_temperature, 0.05)

temperature_window = max(temperature, 1.25 * estimated_tc, 0.10 * cutoff_energy)
gap_value = cached_gap(interaction_strength, cutoff_energy, temperature)
temperatures, gaps, critical_temperature = cached_curve(
    interaction_strength,
    cutoff_energy,
    temperature_window,
)

metric_col, info_col = st.columns([1, 1])

with metric_col:
    st.metric("Computed gap Delta", f"{gap_value:.6f}")
    st.metric("Estimated critical temperature Tc", f"{critical_temperature:.6f}")

with info_col:
    phase_label = "Superconducting" if gap_value > 1e-8 else "Normal state"
    st.metric("Current phase", phase_label)
    st.write(
        "Below Tc the solver finds a non-zero gap. Above Tc the only self-consistent solution is Delta = 0."
    )

figure, axis = plt.subplots(figsize=(8, 5))
axis.plot(temperatures, gaps, linewidth=2.0, label="Delta(T)")
axis.scatter([temperature], [gap_value], color="tab:red", zorder=3, label="Selected T")
axis.axvline(
    critical_temperature,
    color="tab:green",
    linestyle="--",
    linewidth=1.5,
    label="Tc",
)
axis.set_xlabel("Temperature T")
axis.set_ylabel("Gap Delta")
axis.set_title("BCS Gap vs Temperature")
axis.grid(alpha=0.3)
axis.legend()

st.pyplot(figure, clear_figure=True)

st.markdown(
    """
**Model note:** This is the standard constant-coupling BCS gap equation with a sharp cutoff.
It is a real numerical solver, but it is still a simplified mean-field model rather than a
material-specific superconductivity package.
"""
)
