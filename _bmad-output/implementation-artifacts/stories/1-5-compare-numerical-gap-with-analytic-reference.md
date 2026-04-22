# Story 1.5: Compare Numerical Gap With Analytic Reference

Status: done

## Story

As a user, I want the numerical `Delta(T)` behavior compared with the supported analytic reference behavior so I can judge whether the plotted result is physically credible.

FR Traceability: FR11, FR20

## Acceptance Criteria

1. The main gap plot can show a supported analytic reference or normalized comparison where applicable.
2. The UI labels which curve or value is numerical and which is reference or normalized.
3. The comparison is hidden, disabled, or clearly constrained when the current state does not support a meaningful reference comparison.
4. The comparison does not introduce additional model claims beyond the documented weak-coupling envelope.

## Tasks / Subtasks

- [x] Define supported analytic/reference comparison behavior. (AC: 1, 4)
- [x] Add labeled numerical versus reference/normalized display in the plot area. (AC: 1, 2)
- [x] Add constrained/disabled behavior for unsupported comparison states. (AC: 3)
- [x] Add tests for supported and unsupported comparison states. (AC: 1-4)

## Dev Notes

- Keep comparison subordinate to the main gap plot.
- Do not expand this into a multi-plot analytics suite.
- Reference comparison must preserve truth-layer clarity.

### References

- [PRD](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/prd.md)
- [Architecture](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/architecture.md)
- [UX](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/ux-design.md)

## Dev Agent Record

### Agent Model Used

### Debug Log References

- `npm test`
- `npm run test:validation`
- `python3 -m py_compile bcs_solver.py streamlit_app.py`

### Completion Notes List

- Added `src/domain/bcs/gap-reference.mjs` to attach a subordinate normalized comparison layer to the validated gap plot without changing the authoritative numerical solver output.
- Defined the supported Story 1.5 reference behavior as a normalized weak-coupling benchmark comparison using the locked Story 1.4 reference windows, rather than introducing a new closed-form physics claim.
- Added explicit computed vs interpretive labels to the comparison model so numerical `Delta(T)` remains the primary truth layer and normalized reference content stays secondary.
- Gated the comparison strictly by trusted solver state: valid stable and normal-state outputs can show the normalized comparison; pending, invalid, failed, and non-valid trust states disable or constrain it.
- Added `test/gap-reference.test.mjs` covering supported comparison, constrained/disabled behavior, and preservation of the authoritative numerical plot model.

### File List

- `src/domain/bcs/gap-reference.mjs`
- `test/gap-reference.test.mjs`

## Change Log

- 2026-04-22: Completed Story 1.5 implementation and validation; pending review.
- 2026-04-22: Review passed with no findings; Story 1.5 accepted.
