# Story 2.4: Support Updating and Error States

Status: done

## Story

As a user, I want the app to show updating, constrained, invalid, and failed states explicitly so I do not misread stale or unsupported outputs.

FR Traceability: FR6, FR14, FR21, FR32, FR49

## Acceptance Criteria

1. Updating state appears when asynchronous recomputation is pending.
2. Constrained, invalid, and failed states use distinct visible treatments.
3. Invalid and failed states suppress misleading plot or output updates.
4. Stale computed values are never presented as final after input state changes.
5. Error-state copy identifies whether the problem is invalid input, unsupported regime, solver failure, or partial failure.

## Tasks / Subtasks

- [x] Implement update-state model for async recomputation. (AC: 1, 4)
- [x] Implement constrained, invalid, and failed state rendering. (AC: 2, 5)
- [x] Suppress misleading plot/output refresh in invalid and failed states. (AC: 3)
- [x] Add tests for rapid input changes and partial failure. (AC: 1-5)

## Dev Notes

- This is release-critical. Silent fallback and stale-final display are forbidden.
- Error states must remain coherent across controls, metrics, plots, threshold view, and export.

### References

- [Architecture](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/architecture.md)
- [UX](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/ux-design.md)
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

- Added an explicit pending-state flow to the shared explorer reducer so parameter changes preserve the last validated plot and metric surfaces as stale views until asynchronous recomputation commits the new state version.
- Kept stale-result suppression on the shared state path instead of inside render-time recomputation, so plot and metric panels no longer bypass the shell update contract.
- Added distinct visible treatments for pending, constrained, invalid, and failed states across the validity panel, plot panel, and metric panel, including copy that distinguishes stale recomputation, invalid input, unsupported regime warnings, and solver failure.
- Suppressed misleading final outputs for invalid and failed states while preserving coherent stale views during pending recomputation and keeping the newest state version authoritative under rapid changes.
- Added Story 2.4 component tests covering pending-to-stable transition, invalid-state suppression, rapid-change stale-result rejection, and constrained-state visual treatment, then aligned older shell/plot/control tests to the same pending-state contract.

### File List

- `src/domain/bcs/types.ts`
- `src/domain/bcs/metrics.ts`
- `src/domain/bcs/gapSolver.ts`
- `src/state/explorerState.ts`
- `src/App.tsx`
- `src/components/Status/StatusPanel.tsx`
- `src/components/Plots/PlotPanel.tsx`
- `src/components/Metrics/MetricsPanel.tsx`
- `src/components/Status/UpdatingAndErrorStates.test.tsx`
- `src/components/Controls/ControlsPanel.test.tsx`
- `src/components/Plots/PlotAndMetrics.test.tsx`
- `src/components/Shell/ExplorerShell.test.tsx`
- `src/styles/app.css`

## Change Log

- 2026-04-22: Completed Story 2.4 implementation and validation; pending review.
- 2026-04-22: Review requested changes; async commit path marks invalid or failed recomputations as `metricsReady: true` and `gapReady: true`, which breaks shared-state truthfulness for downstream consumers.
- 2026-04-22: Fixed shared-state readiness derivation so committed invalid or failed views cannot advertise ready surfaces; added reducer regression coverage and reran the full gate.
- 2026-04-22: Review passed after readiness derivation fix; Story 2.4 accepted.
