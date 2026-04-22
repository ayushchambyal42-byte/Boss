---
title: 'BCS Superconductivity Streamlit Simulator'
type: 'feature'
created: '2026-04-21'
status: 'done'
route: 'one-shot'
context: []
---

# BCS Superconductivity Streamlit Simulator

## Intent

**Problem:** The project did not yet have a runnable superconductivity tool that computes a BCS gap from the underlying equation rather than faking a visual simulation.

**Approach:** Add a standalone numerical solver for the constant-coupling BCS gap equation and a minimal Streamlit interface that exposes `V`, `omega_D`, and `T`, then displays the computed gap and a `Delta(T)` curve.

## Suggested Review Order

**Numerical Physics Core**

- The main solver module defines the model assumptions and exposes the public API.
  [`bcs_solver.py:1`](../../bcs_solver.py#L1)

- The transformed integral clusters points near zero energy for better stability.
  [`bcs_solver.py:47`](../../bcs_solver.py#L47)

- Gap bracketing and bisection keep the root solve explicit and deterministic.
  [`bcs_solver.py:95`](../../bcs_solver.py#L95)

- `compute_gap` is the required entry point for UI-triggered physics evaluation.
  [`bcs_solver.py:123`](../../bcs_solver.py#L123)

- The temperature sweep and `Tc` solve support the full `Delta(T)` plot.
  [`bcs_solver.py:160`](../../bcs_solver.py#L160)

**Interactive UI**

- Cached wrappers keep the expensive numerical solves responsive under slider changes.
  [`streamlit_app.py:11`](../../streamlit_app.py#L11)

- Sidebar controls bind directly to the physical model parameters.
  [`streamlit_app.py:41`](../../streamlit_app.py#L41)

- The app computes the operating point and full curve from the same solver.
  [`streamlit_app.py:50`](../../streamlit_app.py#L50)

- The plot shows `Delta(T)`, the selected temperature, and the estimated `Tc`.
  [`streamlit_app.py:71`](../../streamlit_app.py#L71)

**Runtime Setup**

- Minimal dependencies needed to run the simulator locally.
  [`requirements.txt:1`](../../requirements.txt#L1)
