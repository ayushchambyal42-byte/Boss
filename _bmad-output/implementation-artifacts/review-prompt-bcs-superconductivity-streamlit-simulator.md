# Review Prompt: BCS Superconductivity Streamlit Simulator

Use the `bmad-review-adversarial-general` skill in a separate session to review this change.

## Review Goal

Review the new superconductivity simulator implementation for:

- numerical correctness risks in the BCS gap solver
- UI/solver wiring mistakes
- missing edge-case handling at slider bounds
- misleading scientific claims or outputs

## Changed Files

- `bcs_solver.py`
- `streamlit_app.py`
- `requirements.txt`

## Requested Review Style

Focus on bugs, behavioral regressions, physics-model mistakes, weak assumptions, and missing verification.

## Local Checks Already Run

- `python -m py_compile bcs_solver.py streamlit_app.py`
- numerical sanity checks for `compute_gap`, `compute_critical_temperature`, and `compute_gap_curve`
- dependency import check for `streamlit`, `matplotlib`, and `numpy`

## Notes for Reviewer

- The model intentionally uses dimensionless units with `k_B = 1`.
- The solver uses direct energy integration and bisection instead of closed-form BCS expressions.
- This session did not auto-run a delegated review agent, so findings should be produced manually in the separate review session.
