# Story 3.2: Implement Threshold Response View

Status: done

## Story

As a user, I want to probe sub-threshold versus disruptive response so the gap feels like a governing constraint rather than just a plotted quantity.

FR Traceability: FR15

## Acceptance Criteria

1. The view lets the user apply one supported probe or disturbance control.
2. The view clearly distinguishes sub-threshold "nothing meaningful happens" response from allowed or disruptive response.
3. Response state is visually and textually tied to the current gap context.
4. The interaction does not imply full non-equilibrium simulation fidelity.

## Tasks / Subtasks

- [x] Implement the single probe/disturbance control. (AC: 1)
- [x] Render sub-threshold and disruptive response states. (AC: 2)
- [x] Tie response copy and visuals to current gap context. (AC: 3)
- [x] Add labeling/copy that avoids overclaiming physical fidelity. (AC: 4)

## Dev Notes

- Keep this minimal and legible.
- Do not add multiple disturbance types, sandbox modes, or dynamic simulation claims.

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

- Added a subordinate threshold response panel beneath the main computed gap plot, driven by the locked Story 3.1 threshold contract and shared SPA state.
- Introduced one MVP threshold control, `probeStrength`, as centralized explorer state with reset-safe defaults and reducer-level normalization against the domain contract.
- Rendered explicit `sub-threshold`, `disruptive`, `updating`, `constrained`, and `unavailable` threshold states using the shared validated plot context rather than UI-side solver recomputation.
- Tied the threshold response directly to the selected `Δ(T)` point by showing the current selected gap, probe-energy equivalent, and a phenomenological truth-layer label.
- Added copy that explicitly rejects non-equilibrium simulation authority while keeping the threshold interaction visually subordinate to the main computed plot.
- Extended UI tests to cover the threshold control, sub-threshold and disruptive labeling, and constrained/updating behavior without relaxing the shared-state contract.

### File List

- `src/domain/bcs/types.ts`
- `src/state/explorerState.ts`
- `src/components/Shell/ExplorerShell.tsx`
- `src/components/Plots/PlotPanel.tsx`
- `src/components/Plots/PlotAndMetrics.test.tsx`
- `src/components/Status/UpdatingAndErrorStates.test.tsx`
- `src/App.tsx`
- `src/styles/app.css`

## Change Log

- 2026-04-22: Completed Story 3.2 implementation and validation; pending review.
- 2026-04-22: Fixed review blockers so invalid/failed states render an explicit unavailable threshold view and pending states no longer present stale gap context as current.
- 2026-04-22: Review passed; Story 3.2 accepted.
