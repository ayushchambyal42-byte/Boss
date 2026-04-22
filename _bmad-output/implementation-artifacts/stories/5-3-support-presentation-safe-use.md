# Story 5.3: Support Presentation-Safe Use

Status: done

## Story

As an instructor, I want the explorer to remain legible and stable during live demonstration.

FR Traceability: FR24

## Acceptance Criteria

1. Core plot, metrics, threshold state, and trust labels remain legible in a desktop presentation context.
2. Reset-to-default and stable guided flow are available for repeatable demos.
3. Presentation use does not hide validity or truth-layer labels.
4. Live parameter changes do not produce ambiguous mixed-state displays.

## Tasks / Subtasks

- [x] Verify presentation-safe layout and text scale for core surfaces. (AC: 1)
- [x] Ensure reset/default and guided flow support repeatable demos. (AC: 2)
- [x] Keep validity and truth labels visible during presentation use. (AC: 3)
- [x] Test live parameter changes for mixed-state ambiguity. (AC: 4)

## Dev Notes

- Do not create a separate physics mode for demo use.
- Presentation-safe use should preserve the same scientific engine and trust labels.

### References

- [PRD](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/prd.md)
- [UX](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/ux-design.md)

## Dev Agent Record

### Agent Model Used

gpt-5.2

### Debug Log References

### Completion Notes List

- Added a presentation-safe layout toggle on the explorer shell without creating a separate physics mode.
- Kept reset, guided re-entry, validity guidance, and truth-layer labels visible during presentation use.
- Increased legibility for core plot, metrics, and trust surfaces in presentation-safe layout.
- Added regression coverage for presentation-safe visibility and live-update coherence.
- Validation passed: `npm run test:web`, `npm test`, `npm run test:validation`, `npm run build`, `python3 -m py_compile bcs_solver.py streamlit_app.py`.

### File List

- [ExplorerShell.tsx](/home/ayushchambyal/projects/bmad-test/src/components/Shell/ExplorerShell.tsx)
- [app.css](/home/ayushchambyal/projects/bmad-test/src/styles/app.css)
- [ExplorerShell.test.tsx](/home/ayushchambyal/projects/bmad-test/src/components/Shell/ExplorerShell.test.tsx)
