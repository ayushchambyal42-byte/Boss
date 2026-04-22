# Story 5.4: Export Plot for Teaching Reuse

Status: done

## Story

As an instructor, I want to export plot artifacts and session state for lecture and demo reuse.

FR Traceability: FR25, FR38

## Acceptance Criteria

1. Users can export the current scientific plot for teaching, sharing, or review.
2. Plot export preserves enough context to identify the originating state or session package.
3. Teaching export does not omit warning or validity context when the state is constrained, invalid, or failed.
4. Export behavior is initiated by explicit user action.

## Tasks / Subtasks

- [x] Implement explicit user-initiated plot export. (AC: 1, 4)
- [x] Include state/session context with plot export. (AC: 2)
- [x] Preserve warning and validity context in teaching export. (AC: 3)
- [x] Test export for valid, constrained, invalid, and failed states. (AC: 1-4)

## Dev Notes

- Plot export complements session export; neither should silently transmit data.
- Exported teaching artifacts must not strip scientific trust context.

### References

- [Architecture](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/architecture.md)
- [UX](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/ux-design.md)

## Dev Agent Record

### Agent Model Used

gpt-5.2

### Debug Log References

### Completion Notes List

- Added a pure state-backed plot export helper that serializes the validated plot view and trust context into a local SVG artifact.
- Added an explicit `Export plot` control alongside session export; no plot export occurs without direct user action.
- Preserved matching session-package context, state version, validity status, and warning/failure messaging in valid, constrained, invalid, and failed exports.
- Added domain coverage for valid, constrained, invalid, and failed plot exports and UI coverage for explicit export initiation.
- Validation passed: `npm run test:web`, `npm test`, `npm run test:validation`, `npm run build`, `python3 -m py_compile bcs_solver.py streamlit_app.py`.

### File List

- [exportPlot.ts](/home/ayushchambyal/projects/bmad-test/src/domain/bcs/exportPlot.ts)
- [exportPlot.test.ts](/home/ayushchambyal/projects/bmad-test/src/domain/bcs/exportPlot.test.ts)
- [ControlsPanel.tsx](/home/ayushchambyal/projects/bmad-test/src/components/Controls/ControlsPanel.tsx)
- [ExplorerShell.tsx](/home/ayushchambyal/projects/bmad-test/src/components/Shell/ExplorerShell.tsx)
- [App.tsx](/home/ayushchambyal/projects/bmad-test/src/App.tsx)
- [ExplorerShell.test.tsx](/home/ayushchambyal/projects/bmad-test/src/components/Shell/ExplorerShell.test.tsx)
