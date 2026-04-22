# Story 4.4: Restore and Diagnose Reported Sessions

Status: done

## Story

As a maintainer or domain reviewer, I want to inspect exported states so I can distinguish numerical defects from unsupported regimes or labeling issues.

FR Traceability: FR40, FR41, FR42

## Acceptance Criteria

1. A saved/exported state can be inspected or restored enough to reproduce what the user saw.
2. Restored sessions show the application version associated with the exported state.
3. Reviewers can identify whether the reported issue is numerical, unsupported-regime, or truth-layer communication related.
4. Restored invalid or failed states preserve their failure or warning context.

## Tasks / Subtasks

- [x] Add restore or inspect path for exported session state. (AC: 1)
- [x] Surface exported application version on restore/inspection. (AC: 2)
- [x] Preserve validity and failure context on restore. (AC: 4)
- [x] Add diagnostic cues for numerical, unsupported-regime, and labeling issues. (AC: 3)

## Dev Notes

- Full backend persistence is out of scope.
- This can be implemented as local restore/import or internal inspection path, as long as reproducibility is supported.

### References

- [Architecture](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/architecture.md)
- [UX](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/ux-design.md)

## Dev Agent Record

### Agent Model Used

gpt-5

### Debug Log References

### Completion Notes List

- Added a local session inspection path that parses exported JSON, stores the imported report in centralized explorer state, and keeps review entirely local to the SPA.
- Added restore-from-imported-session support by replaying imported parameters back through the validated reducer flow rather than bypassing the solver/state pipeline.
- Added imported-session diagnostics showing exported app version, issue category, and preserved warning or failure cues for numerical, unsupported-regime, and truth-layer review.
- Validation passed: `npm run test:web`, `npm test`, `npm run test:validation`, `npm run build`, `python3 -m py_compile bcs_solver.py streamlit_app.py`.

### File List

- src/domain/bcs/types.ts
- src/domain/bcs/exportSession.ts
- src/domain/bcs/exportSession.test.ts
- src/state/explorerState.ts
- src/components/Controls/ControlsPanel.tsx
- src/components/Controls/ControlsPanel.test.tsx
- src/components/Shell/ExplorerShell.tsx
- src/components/Shell/ExplorerShell.test.tsx
- src/components/Status/StatusPanel.tsx
- src/components/Status/UpdatingAndErrorStates.test.tsx
- src/styles/app.css
- src/App.tsx
