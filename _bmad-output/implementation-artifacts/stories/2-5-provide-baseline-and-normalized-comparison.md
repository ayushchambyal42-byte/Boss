# Story 2.5: Provide Baseline and Normalized Comparison

Status: done

## Story

As a user, I want to compare the current state against a prior or baseline state so I can understand what changed.

FR Traceability: FR20, FR27

## Acceptance Criteria

1. The explorer can preserve one baseline or prior state for comparison with the current state.
2. The comparison shows the direction of relevant changes without requiring a separate workflow.
3. Normalized comparison is available where it helps interpret the gap behavior across states.
4. Comparison views remain visually subordinate to the main gap plot and do not create a multi-dashboard experience.
5. Baseline comparison is cleared or updated predictably when the user resets.

## Tasks / Subtasks

- [x] Add one baseline/prior-state capture mechanism. (AC: 1)
- [x] Display compact before/after or normalized comparison. (AC: 2, 3)
- [x] Keep comparison subordinate to the primary plot. (AC: 4)
- [x] Define reset behavior for baseline state. (AC: 5)

## Dev Notes

- This closes the learning-by-comparison gap from readiness.
- Do not expand into parameter sweeps or multi-scenario workspaces.

### References

- [UX](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/ux-design.md)
- [Epics](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/epics-and-stories.md)

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

- Added one shared-state baseline snapshot that captures the current validated parameter vector plus its metric and plot views, without introducing a multi-scenario workspace.
- Added a single baseline capture/update control in the controls panel and explicit copy that reset clears the comparison.
- Rendered a compact comparison block beneath the main plot showing directional before/after deltas for `T_c`, `Δ(0)`, selected `Δ(T)`, and normalized reduced quantities, keeping it clearly subordinate to the primary computed plot.
- Kept the comparison tied to the same validated state path as the main explorer rather than spinning up a separate compute workflow.
- Added reducer and UI tests covering baseline capture, baseline persistence across parameter changes, normalized comparison rendering, and predictable clearing on reset.

### File List

- `src/domain/bcs/types.ts`
- `src/state/explorerState.ts`
- `src/App.tsx`
- `src/components/Shell/ExplorerShell.tsx`
- `src/components/Controls/ControlsPanel.tsx`
- `src/components/Plots/PlotPanel.tsx`
- `src/components/Plots/PlotAndMetrics.test.tsx`
- `src/components/Shell/ExplorerShell.test.tsx`
- `src/components/Status/UpdatingAndErrorStates.test.tsx`
- `src/styles/app.css`

## Change Log

- 2026-04-22: Completed Story 2.5 implementation and validation; pending review.
- 2026-04-22: Review requested changes; baseline capture currently trusts UI disabling instead of enforcing a validated snapshot in the reducer, and the normalized comparison bypasses the constrained-state truth-discipline used elsewhere.
- 2026-04-22: Fixed reducer-level baseline capture guard and constrained normalized comparison to valid-trust states only; full gate rerun passed.
- 2026-04-22: Review passed after baseline-capture and normalized-truth-discipline fixes; Story 2.5 accepted.
