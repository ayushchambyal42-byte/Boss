# Story 2.6: Meet Explorer Accessibility and Browser-Degradation Requirements

Status: done

## Story

As a user, I want the core explorer to remain operable and understandable with keyboard controls, reduced motion, clear labels, and supported-browser feedback.

FR Traceability: FR45, FR46, FR47, FR48

## Acceptance Criteria

1. Primary controls are operable by keyboard.
2. Metrics, warnings, and scientific views include labels that do not rely solely on color, motion, or position.
3. Reduced-motion behavior is available for non-essential animation.
4. Unsupported or degraded browser capability is communicated to the user when it affects exploration, plotting, export, or reduced-motion behavior.
5. Latest Chrome, Chromium Edge, and recent Firefox receive the full MVP support path; Safari-specific issues are communicated when non-critical degradation occurs.

## Tasks / Subtasks

- [x] Add keyboard operability for primary controls. (AC: 1)
- [x] Add non-color labels for metrics, warnings, and scientific views. (AC: 2)
- [x] Implement reduced-motion support for non-essential animation. (AC: 3)
- [x] Add degraded-browser capability messaging. (AC: 4, 5)
- [x] Verify supported-browser behavior. (AC: 5)

## Dev Notes

- Accessibility applies to the explorer itself, not only landing content.
- Safari is best-effort, but core exploration, plotting, and export failures must be communicated.

### References

- [PRD](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/prd.md)
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

- Added centralized environment assessment for browser support level and reduced-motion preference so the SPA keeps accessibility and degradation handling in shared state instead of ad hoc UI checks.
- Added explorer-shell support notices for degraded viewport, Safari best-effort browser support, and reduced-motion state or unsupported reduced-motion detection.
- Added focus-visible treatment and reduced-motion CSS handling so keyboard focus remains explicit and non-essential motion is suppressed when the user preference requests it.
- Preserved existing explicit labels for metrics, warnings, plots, and comparison surfaces while adding support messaging that does not rely on color alone.
- Added Story 2.6 coverage for keyboard reachability of primary controls, reduced-motion messaging, and Safari-specific capability messaging.

### File List

- `src/domain/bcs/types.ts`
- `src/domain/bcs/environment.ts`
- `src/state/explorerState.ts`
- `src/App.tsx`
- `src/components/Shell/ExplorerShell.tsx`
- `src/components/Shell/ExplorerShell.test.tsx`
- `src/components/Status/UpdatingAndErrorStates.test.tsx`
- `src/styles/app.css`

## Change Log

- 2026-04-22: Completed Story 2.6 implementation and validation; pending review.
- 2026-04-22: Review passed; Story 2.6 accepted.
