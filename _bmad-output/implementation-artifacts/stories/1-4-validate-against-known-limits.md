# Story 1.4: Validate Against Known Limits

Status: done

## Story

As a domain reviewer, I want the solver checked against analytic limits and benchmark states so we can trust the MVP computation path.

FR Traceability: FR5, FR7, FR8, FR9, FR10, FR14

## Acceptance Criteria

1. Reference validation includes expected `T -> 0` and `T -> T_c` behavior.
2. Reference validation covers the expected relation among `Delta(0)`, `T_c`, and the BCS ratio.
3. Benchmark parameter snapshots are documented for regression use.
4. Solver failure modes are recorded as explicit invalid or failed states, not fallback values.
5. Validation tests fail CI/local test execution if any benchmark exceeds the tolerances below.

## Locked Validation Contract

This story is the release gate for Stories 1.1 through 1.3. The MVP numerical core is not implementation-ready unless these benchmarks pass.

### Metric Benchmarks

Use the analytic contract from Story 1.2.

| Case | Inputs | Expected |
| --- | --- | --- |
| Default metrics | `lambda=0.30`, `omega_D_ref=10.0`, `E_F=100.0`, `M=1.0` | `T_c=0.4044952519083233`, `Delta_0=0.713479866945048`, `BCS_ratio=3.527753977724091` |
| Weak edge metrics | `lambda=0.15`, `omega_D_ref=10.0`, `E_F=100.0`, `M=1.0` | `T_c=0.014429960925572704`, `Delta_0=0.025452676026796156`, `BCS_ratio=3.527753977724091` |
| Strong valid edge metrics | `lambda=0.40`, `omega_D_ref=10.0`, `E_F=100.0`, `M=1.0` | `T_c=0.9307338226216719`, `Delta_0=1.641699972477976`, `BCS_ratio=3.527753977724091` |
| Heavier isotope metrics | `lambda=0.30`, `omega_D_ref=10.0`, `E_F=100.0`, `M=2.0` | `T_c=0.28602133558213616`, `Delta_0=0.504506452156919`, `BCS_ratio=3.527753977724091` |

Metric tolerance:

- Pure calculations: relative tolerance `1e-12`.
- Display/export regression snapshots: relative tolerance `1e-6`.

### Gap-Curve Benchmarks

Use the numerical contract from Story 1.3.

| Case | Requirement |
| --- | --- |
| `T -> 0` | `Delta(T)` equals analytic `Delta_0` within relative tolerance `1e-6`. |
| `T -> T_c` | `Delta(T)` approaches zero and is `<= 1e-8`. |
| `T > T_c` | `Delta(T) = 0` and status is valid `normal-state`, not failed. |
| `T = 0.50 * T_c` default state | `0.93 <= Delta(T) / Delta_0 <= 0.98`. |
| `T = 0.90 * T_c` default state | `0.45 <= Delta(T) / Delta_0 <= 0.60`. |
| Full default curve | finite, non-negative, monotonic non-increasing within tolerance. |

### Failure-Mode Benchmarks

| Scenario | Expected Classification |
| --- | --- |
| `lambda <= 0` | `invalid`, no final metrics or plot |
| `omega_D_ref <= 0` | `invalid`, no final metrics or plot |
| `E_F <= 0` | `invalid`, no final metrics or plot |
| `M <= 0` | `invalid`, no final metrics or plot |
| effective `omega_D / E_F > 0.20` | `invalid`, no final metrics or plot |
| solver bracket failure | `failed`, explicit failure state, no fallback values |
| non-finite output | `failed`, explicit failure state, no fallback values |

## Tasks / Subtasks

- [x] Implement metric benchmark tests from the locked validation contract. (AC: 1-3, 5)
- [x] Implement gap-curve benchmark tests from the locked validation contract. (AC: 1, 5)
- [x] Implement failure-mode classification tests. (AC: 4, 5)
- [x] Add a single validation test entry point documented for future dev agents. (AC: 3, 5)
- [x] Verify tests run without requiring Streamlit. (AC: 5)

## Dev Notes

- This story protects scientific trust; do not rely on visual inspection alone.
- Validation should run independently of UI rendering where possible.
- Preserve deterministic behavior for identical inputs on the same app version.
- Validation must target the solver/domain module, not the Streamlit prototype UI.
- If any tolerance in this story cannot be met, stop implementation and revise the numerical contract before continuing.

### References

- [PRD](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/prd.md)
- [Architecture](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/architecture.md)

## Dev Agent Record

### Agent Model Used

### Debug Log References

- `npm run test:validation`
- `npm test`
- `python3 -m py_compile bcs_solver.py streamlit_app.py`

### Completion Notes List

- Added `test/validation-gate.test.mjs` as the dedicated Story 1.4 validation gate for metric benchmarks, analytic relations, gap-curve limits, and explicit invalid/failed failure modes.
- Added `npm run test:validation` in `package.json` so future dev agents can rerun the locked numerical gate without relying on the full suite.
- Added an internal-only test seam in `src/domain/bcs/gap-curve.mjs` to force bracket-failure and non-finite-residual paths during validation, without threading synthetic failure injection through the public runtime solver API.
- Fixed a real solver bug uncovered by the validation gate: final-step `NaN` residuals were previously accepted because `Math.abs(NaN) > tolerance` is false. The solver now emits an explicit failed state for non-finite residuals.
- Verified the full validation stack runs without requiring Streamlit execution; only the legacy Python syntax check is preserved as a compatibility gate.

### File List

- `src/domain/bcs/gap-curve.mjs`
- `test/validation-gate.test.mjs`
- `package.json`

## Change Log

- 2026-04-22: Completed Story 1.4 validation gate implementation and verification; pending review.
- 2026-04-22: Resolved review follow-up by removing synthetic failure injection from the public solver path.

## Senior Developer Review (AI)

### Review Outcome

Approved after follow-up fix.

### Findings

- Medium: Fixed. Synthetic failure injection no longer travels through the public runtime solver path; validation now uses an internal-only test seam instead.

### Required Follow-up

- None.
