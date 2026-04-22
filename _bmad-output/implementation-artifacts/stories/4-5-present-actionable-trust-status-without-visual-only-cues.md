# Story 4.5: Present Actionable Trust Status Without Visual-Only Cues

Status: done

## Story

As a user, I want trust status and recommended action communicated clearly so I know what to do when a state is constrained or unsupported.

FR Traceability: FR33, FR35, FR46

## Acceptance Criteria

1. Trust status is expressed in text, labels, or structure, not only color, animation, or iconography.
2. Constrained, unsupported, ambiguous, and failed states include recommended user action.
3. Recommended actions are specific enough to guide recovery without implying certainty outside the model envelope.
4. Trust messages remain available to keyboard and screen-reader-adjacent navigation patterns used by the app.

## Tasks / Subtasks

- [x] Add non-visual-only trust-status messaging. (AC: 1)
- [x] Define recommended actions for constrained, unsupported, ambiguous, and failed states. (AC: 2, 3)
- [x] Ensure trust messages are reachable through keyboard-oriented navigation. (AC: 4)
- [x] Test messaging for ambiguity and overclaiming. (AC: 1-4)

## Dev Notes

- This story connects accessibility to scientific trust.
- Warnings without recommended action are insufficient.

### References

- [PRD](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/prd.md)
- [UX](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/ux-design.md)

## Dev Agent Record

### Agent Model Used

gpt-5.2

### Debug Log References

### Completion Notes List

- Added a structured trust-status summary surface with explicit state, reason, and recommended action text instead of relying on color or banner tone alone.
- Kept the trust summary keyboard reachable with a focusable, labeled section in the validity panel.
- Mirrored concise trust-action messaging into the metrics surface for constrained, invalid, and failed states.
- Added regression coverage for actionable constrained-state messaging and keyboard-adjacent reachability.
- Validation passed: `npm run test:web`, `npm test`, `npm run test:validation`, `npm run build`, `python3 -m py_compile bcs_solver.py streamlit_app.py`.

### File List

- [trustStatus.ts](/home/ayushchambyal/projects/bmad-test/src/domain/bcs/trustStatus.ts)
- [StatusPanel.tsx](/home/ayushchambyal/projects/bmad-test/src/components/Status/StatusPanel.tsx)
- [MetricsPanel.tsx](/home/ayushchambyal/projects/bmad-test/src/components/Metrics/MetricsPanel.tsx)
- [app.css](/home/ayushchambyal/projects/bmad-test/src/styles/app.css)
- [ExplorerShell.test.tsx](/home/ayushchambyal/projects/bmad-test/src/components/Shell/ExplorerShell.test.tsx)
