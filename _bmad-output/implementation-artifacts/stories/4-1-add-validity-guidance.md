# Story 4.1: Add Validity Guidance

Status: done

## Story

As a user, I want visible support-envelope and validity guidance so I know when interpretation becomes constrained.

FR Traceability: FR28, FR29, FR32, FR35

## Acceptance Criteria

1. The explorer shows whether the current state is within, near-edge, outside, invalid, or failed.
2. Validity guidance appears near the affected outputs and in the trust/status area.
3. Unsupported or ambiguous states include a recommended next action, such as adjust parameter, return to supported range, or treat output as constrained.
4. Guidance is shown before users can draw false confidence from invalid or strained states.

## Tasks / Subtasks

- [x] Render validity status for all supported trust states. (AC: 1)
- [x] Place guidance near affected outputs and trust/status panel. (AC: 2)
- [x] Add recommended next actions for unsupported or ambiguous states. (AC: 3)
- [x] Ensure guidance appears before misleading interpretation is possible. (AC: 4)

## Dev Notes

- Validity guidance must coordinate with solver state, plot state, threshold state, and export.
- Prefer constrained interpretation over false precision.

### References

- [PRD](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/prd.md)
- [Architecture](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/architecture.md)
- [UX](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/ux-design.md)

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

- Added a shared validity-guidance helper that derives support-envelope label, summary, and recommended next action from the current trust state.
- Placed mirrored validity guidance in the status area, metric panel, and plot panel so warning context appears near affected outputs before misleading interpretation is possible.
- Added explicit next-action language for near-edge, constrained, invalid, and failed states while preserving concise guidance for valid states.
- Extended UI tests to lock invalid, constrained, and near-edge guidance behavior.

### File List

- `src/domain/bcs/validityGuidance.ts`
- `src/components/Status/StatusPanel.tsx`
- `src/components/Metrics/MetricsPanel.tsx`
- `src/components/Plots/PlotPanel.tsx`
- `src/components/Status/UpdatingAndErrorStates.test.tsx`
- `src/components/Controls/ControlsPanel.test.tsx`
- `src/components/Plots/PlotAndMetrics.test.tsx`

## Change Log

- 2026-04-22: Completed Story 4.1 implementation and validation; pending review.
- 2026-04-22: Review passed; Story 4.1 accepted.
