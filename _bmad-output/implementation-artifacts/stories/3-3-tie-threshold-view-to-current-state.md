# Story 3.3: Tie Threshold View to Current State

Status: done

## Story

As a user, I want the threshold behavior to update from the current parameter state so the interaction remains physically interpretable.

FR Traceability: FR16, FR17

## Acceptance Criteria

1. Threshold response state updates from the current validated parameter state.
2. Explanatory guidance states why the parameter change affected stability, fragility, or transition behavior.
3. When state is unsupported or invalid, the threshold view enters a constrained or unavailable state rather than continuing as if authoritative.
4. The threshold view uses the same update-state rules as computed outputs.

## Tasks / Subtasks

- [x] Bind threshold response state to validated parameter state. (AC: 1)
- [x] Add explanatory guidance for threshold changes. (AC: 2)
- [x] Add constrained/unavailable threshold states. (AC: 3)
- [x] Reuse global updating-state behavior for threshold view. (AC: 4)

## Dev Notes

- The threshold state must not drift from the solver/validity state.
- Unsupported regimes should constrain or disable interpretation instead of producing theatrical visuals.

### References

- [Architecture](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/architecture.md)
- [PRD](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/prd.md)

## Dev Agent Record

### Agent Model Used

- GPT-5 Codex

### Debug Log References

- `npm run test:web`
- `npm test`
- `npm run test:validation`
- `npm run build`
- `python3 -m py_compile bcs_solver.py streamlit_app.py`

### Completion Notes List

- Added a pure threshold-guidance helper that derives state-tied interpretive guidance from the current validated parameter vector, effective weak-coupling ratio, validity status, and threshold assessment state.
- Wired the threshold view to render an explicitly labeled `interpretive` guidance block alongside the existing `phenomenological` threshold result without introducing UI-side solver recomputation.
- Reused the shared update-state rules so `updating`, `constrained`, and `unavailable` threshold states now carry matching guidance behavior instead of generic or stale explanation.
- Added direct tests for valid, disruptive, updating, constrained, and invalid threshold-guidance behavior in both domain and UI layers.

### File List

- `src/domain/bcs/thresholdGuidance.ts`
- `src/domain/bcs/thresholdGuidance.test.ts`
- `src/components/Plots/PlotPanel.tsx`
- `src/components/Plots/PlotAndMetrics.test.tsx`
- `src/styles/app.css`

## Change Log

- 2026-04-22: Completed Story 3.3 implementation and validation; pending review.
- 2026-04-22: Review passed; Story 3.3 accepted.
