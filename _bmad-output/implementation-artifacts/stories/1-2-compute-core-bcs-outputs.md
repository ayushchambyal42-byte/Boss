# Story 1.2: Compute Core BCS Outputs

Status: done

## Story

As a user, I want `T_c`, `Delta(0)`, BCS ratio, and isotope-related outputs to update from the current parameter state without a separate calculation workflow.

FR Traceability: FR7, FR8, FR9, FR12, FR13

## Acceptance Criteria

1. `T_c`, `Delta(0)`, BCS ratio, and isotope-related outputs are derived from the exact state contract in Story 1.1.
2. Computed outputs are visible without requiring a separate calculate button.
3. Output cards update from the same state vector used by plots and validity guidance.
4. Isotope-related output changes are shown in the computed-output area, not only in explanatory copy.
5. Invalid or unsupported inputs prevent misleading output refresh.
6. Benchmark outputs listed below pass within the specified tolerances.

## Locked Numerical Contract

Use weak-coupling analytic values for core metric cards. `lambda` maps directly to the existing prototype's `V` only inside the solver adapter. UI, export, and domain language must use `lambda`.

Constants:

```text
gamma_E = 0.5772156649015329
C_Tc = 2 * exp(gamma_E) / pi = 1.1338659173110976
omega_D = omega_D_ref / sqrt(M)
T_c = C_Tc * omega_D * exp(-1 / lambda)
Delta_0 = 2 * omega_D * exp(-1 / lambda)
Delta_0_over_kBTc = Delta_0 / T_c = pi / exp(gamma_E) = 1.7638769888620456
BCS_ratio = 2 * Delta_0 / T_c = 3.527753977724091
```

Isotope outputs:

```text
T_c(M) = C_Tc * (omega_D_ref / sqrt(M)) * exp(-1 / lambda)
Delta_0(M) = 2 * (omega_D_ref / sqrt(M)) * exp(-1 / lambda)
isotope_Tc_shift = T_c(M) - T_c(M = 1)
isotope_Delta0_shift = Delta_0(M) - Delta_0(M = 1)
isotope_alpha_display = 0.5
```

Failure rules:

- If state status is `invalid`, no computed metric is shown as final.
- If any computed value is non-finite, negative where physically impossible, or violates `abs(BCS_ratio - 3.527753977724091) > 1e-9` in the analytic path, emit `failed`.
- If state status is `near-edge` or `constrained`, metrics may display only with visible trust status from the validity layer.

Tolerances:

- Analytic metric calculations: relative tolerance `1e-12` for pure function tests.
- Rendered/display rounded values: relative tolerance `1e-6`.
- Exported numeric values: preserve at least `10` significant digits.

Benchmark cases:

| Case | `lambda` | `omega_D_ref` | `M` | Effective `omega_D` | Expected `T_c` | Expected `Delta_0` | Expected `BCS_ratio` |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Default | `0.30` | `10.0` | `1.0` | `10.0` | `0.4044952519083233` | `0.713479866945048` | `3.527753977724091` |
| Weak edge | `0.15` | `10.0` | `1.0` | `10.0` | `0.014429960925572704` | `0.025452676026796156` | `3.527753977724091` |
| Strong valid edge | `0.40` | `10.0` | `1.0` | `10.0` | `0.9307338226216719` | `1.641699972477976` | `3.527753977724091` |
| Heavier isotope | `0.30` | `10.0` | `2.0` | `7.071067811865475` | `0.28602133558213616` | `0.504506452156919` | `3.527753977724091` |

## Tasks / Subtasks

- [x] Implement pure functions for `T_c`, `Delta_0`, BCS ratio, and isotope outputs from the locked numerical contract. (AC: 1, 6)
- [x] Implement a solver adapter that maps UI/export `lambda` to internal prototype `V` only if existing `bcs_solver.py` is reused. (AC: 1)
- [x] Render output cards for `T_c`, `Delta(0)`, BCS ratio, and isotope-related outputs. (AC: 2, 4)
- [x] Connect invalid, near-edge, and constrained state handling to output display rules. (AC: 3, 5)
- [x] Add regression tests for all benchmark cases and failure rules. (AC: 5, 6)

## Dev Notes

- Computed outputs are authoritative `computed` truth-layer content.
- Use one state vector across cards, plots, validity guidance, and export.
- Do not add a separate "calculate" workflow; updates are reactive to state.
- Existing `bcs_solver.py` may be reused only behind a one-way domain adapter that maps UI/export `lambda` into prototype-facing `V`. Do not expose `V` in the MVP app, and do not implement reverse reconstruction of `omega_D_ref` / `M` from effective `omega_D`.
- `E_F` affects validity classification through `omega_D / E_F`; it does not enter the core weak-coupling metric formulas in MVP.

### References

- [PRD](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/prd.md)
- [Architecture](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/architecture.md)
- [UX](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/ux-design.md)

## Dev Agent Record

### Agent Model Used

### Debug Log References

- `npm test`
- `python3 -m py_compile bcs_solver.py streamlit_app.py`
- benchmark spot-check via `node` for all locked Story 1.2 cases

### Completion Notes List

- Implemented `src/domain/bcs/metrics.mjs` for analytic core metrics, isotope outputs, trust-display rules, and legacy `lambda -> V` adapter behavior.
- Added `test/core-metrics.test.mjs` covering exact constants, all benchmark cases, isotope shifts, invalid/constrained edge cases, card-model synchronization, display rounding, and one-way adapter behavior.
- Corrected the weak-coupling `C_Tc` constant in implementation/tests to the exact value `2 * exp(gamma_E) / pi = 1.1338659173110976`; the benchmark `T_c` values remain the same and now match the exact formula.
- Kept `V` out of domain outputs and card models; only the legacy adapter exposes prototype-facing `V`, and the adapter intentionally does not attempt a lossy reverse mapping.

### File List

- `src/domain/bcs/metrics.mjs`
- `test/core-metrics.test.mjs`

## Change Log

- 2026-04-22: Completed Story 1.2 implementation and validation.
- 2026-04-22: Resolved review follow-up by making the legacy adapter one-way and aligning the story constant contract.

## Senior Developer Review (AI)

### Review Outcome

Approved after follow-up fix.

### Findings

- High: Fixed. The legacy adapter is now explicitly one-way only. It maps `lambda` to prototype-facing `V` but no longer claims to reconstruct `omega_D_ref` / `M` from effective `omega_D`.
- Medium: Fixed. The story contract now uses the exact weak-coupling `C_Tc` value `1.1338659173110976` used by the implementation and tests.

### Required Follow-up

- None.
