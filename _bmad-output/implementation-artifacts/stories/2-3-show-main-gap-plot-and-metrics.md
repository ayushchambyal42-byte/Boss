# Story 2.3: Show Main Gap Plot and Metrics

Status: done

## Story

As a user, I want the primary plot and metric cards to stay synchronized with the current parameter state.

FR Traceability: FR13, FR19

## Acceptance Criteria

1. The main gap plot and metric cards are visible in the explorer surface.
2. The plot and metrics read from the same validated state.
3. The plot remains legible in the desktop-first layout used for live exploration.
4. Metric and plot labels are explicit enough to distinguish values, units, and state.

## Tasks / Subtasks

- [x] Place primary gap plot and metric cards in the explorer layout. (AC: 1, 3)
- [x] Bind plot and metrics to the same validated state source. (AC: 2)
- [x] Add explicit labels for values, units, and state. (AC: 4)
- [x] Verify legibility in desktop and presentation-like widths. (AC: 3)

## Dev Notes

- This view is the center of the MVP experience.
- Keep visual hierarchy focused on one clean scientific lens, not a dashboard.

### References

- [UX](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/ux-design.md)
- [PRD](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/prd.md)

## Dev Agent Record

### Agent Model Used

### Debug Log References

- `npm run test:web`
- `npm test`
- `npm run test:validation`
- `npm run build`
- `python3 -m py_compile bcs_solver.py streamlit_app.py`

### Completion Notes List

- Replaced the plot shell placeholder with a real SVG main gap plot driven directly by the validated `computeGapCurveModel` output for the current parameter state and state version.
- Replaced the computed-placeholder metric panel with labeled core metric cards derived from the validated `computeCoreMetrics` and `buildMetricCardModel` path, limited to the primary MVP metrics.
- Kept plot and metric surfaces synchronized by binding both to the same live `state.parameters` source rather than duplicating or caching independent UI-side calculations.
- Added explicit labels for plot axes, selected-point readout, metric units, and state labels so the main exploration surface remains legible for desktop and presentation-like use.
- Added Story 2.3 component tests that verify plot visibility, metric-card visibility, synchronization to the same parameter state, and explicit labeling.

### File List

- `src/domain/bcs/metrics.ts`
- `src/domain/bcs/gapSolver.ts`
- `src/components/Plots/PlotPanel.tsx`
- `src/components/Metrics/MetricsPanel.tsx`
- `src/components/Plots/PlotAndMetrics.test.tsx`
- `src/styles/app.css`

## Change Log

- 2026-04-22: Completed Story 2.3 implementation and validation; pending review.
- 2026-04-22: Review requested changes; plot and metric surfaces recompute final outputs during render instead of reading from shared computed/update state, which breaks the pending/stale-result contract.
- 2026-04-22: Fixed shared-state binding for plot and metric surfaces; review passed and Story 2.3 accepted.
