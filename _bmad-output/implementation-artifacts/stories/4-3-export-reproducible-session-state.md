# Story 4.3: Export Reproducible Session State

Status: done

## Story

As a user or instructor, I want to export parameter values, outputs, validity state, and app version so results can be reused and reproduced.

FR Traceability: FR36, FR37, FR39, FR42

## Acceptance Criteria

1. Export includes parameter values, units, computed outputs, warning or validity state, and application version.
2. Export identifies whether the session was valid, constrained, invalid, failed, or partially unavailable.
3. Export is local and initiated by explicit user action.
4. Exported data is sufficient to reproduce the result on the same application version.
5. Application version is visible in the exported session package.

## Tasks / Subtasks

- [x] Define export session schema. (AC: 1, 2, 5)
- [x] Implement local user-initiated session export. (AC: 3)
- [x] Include parameter values, units, outputs, validity/warning state, and app version. (AC: 1, 5)
- [x] Add export tests for valid, constrained, invalid, and failed states. (AC: 2, 4)

## Dev Notes

- No silent transmission or backend persistence.
- Export is the MVP provenance mechanism; include enough context for exact same-version reproduction.

### References

- [Architecture](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/architecture.md)
- [PRD](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/prd.md)

## Dev Agent Record

### Agent Model Used

gpt-5

### Debug Log References

### Completion Notes List

- Added a pure export-session builder and serializer so session export is derived entirely from the centralized explorer state.
- Added an explicit local `Export session` action in the controls area with visible app version and current trust status.
- Export packages now include parameter values with units, computed outputs, validity/update state, threshold probe state, optional baseline metadata, and application version.
- Added tests covering valid, constrained, invalid, and failed export packages plus an explicit user-initiated SPA download path.
- Validation passed: `npm run test:web`, `npm test`, `npm run test:validation`, `npm run build`, `python3 -m py_compile bcs_solver.py streamlit_app.py`.

### File List

- src/appMetadata.ts
- src/domain/bcs/types.ts
- src/domain/bcs/exportSession.ts
- src/domain/bcs/exportSession.test.ts
- src/components/Controls/ControlsPanel.tsx
- src/components/Controls/ControlsPanel.test.tsx
- src/components/Shell/ExplorerShell.tsx
- src/components/Shell/ExplorerShell.test.tsx
- src/App.tsx
