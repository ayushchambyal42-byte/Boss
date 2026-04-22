# Story 5.2: Implement Guided Transition Story

Status: done

## Story

As a first-time user, I want a staged introduction that teaches the core intuition before I free-explore.

FR Traceability: FR18, FR22, FR23

## Acceptance Criteria

1. Guided entry introduces the default state, gap plot, threshold interaction, and trust labels.
2. The guided path teaches the gap as a governing constraint, not only as a plotted output.
3. The flow remains short enough to support exploration-first use.
4. Users can exit to free exploration without losing current state.

## Tasks / Subtasks

- [x] Build staged guided entry for default state, gap plot, threshold interaction, and trust labels. (AC: 1)
- [x] Add concise explanatory copy around gap-as-constraint intuition. (AC: 2)
- [x] Keep flow short and skippable. (AC: 3, 4)
- [x] Preserve current state when exiting to free exploration. (AC: 4)

## Dev Notes

- This is not a full tutorial system.
- Guidance should be state-tied and exploration-first.

### References

- [UX](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/ux-design.md)
- [PRD](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/prd.md)

## Dev Agent Record

### Agent Model Used

gpt-5

### Debug Log References

### Completion Notes List

- Replaced the guided-entry stub with a short four-step transition story covering the default state, main gap plot, threshold interaction, and truth labels.
- Kept the flow exploration-first: each step is concise, the sequence is short, and users can skip directly into the explorer without losing current session context.
- Added regression coverage for the staged guided flow and its gap-as-constraint teaching cues.
- Validation passed: `npm run test:web`, `npm test`, `npm run test:validation`, `npm run build`, `python3 -m py_compile bcs_solver.py streamlit_app.py`.

### File List

- src/components/Shell/GuidedEntry.tsx
- src/components/Shell/ExplorerShell.test.tsx
- src/styles/app.css
