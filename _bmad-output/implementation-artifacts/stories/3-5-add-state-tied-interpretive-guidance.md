# Story 3.5: Add State-Tied Interpretive Guidance

Status: done

## Story

As a user, I want concise scientific explanation tied to the current state so I understand why the behavior changed.

FR Traceability: FR17, FR18, FR23

## Acceptance Criteria

1. Guidance explains parameter effects in terms of pairing strength, coherence fragility, transition behavior, or model limits.
2. Guidance references the current or compared state rather than giving generic textbook prose.
3. Guidance distinguishes computed output from interpretation.
4. The guidance supports the staged exploration flow without becoming a broad tutorial system.

## Tasks / Subtasks

- [x] Implement concise state-tied explanation patterns. (AC: 1, 2)
- [x] Label guidance as interpretive rather than computed. (AC: 3)
- [x] Integrate guidance into staged exploration without branching tutorial scope. (AC: 4)
- [x] Add tests or review cases for parameter-change explanations. (AC: 1-3)

## Dev Notes

- Guidance should help users predict behavior, not recite formulas.
- Keep copy short, state-specific, and scientifically cautious.

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

- Extended threshold guidance so it references current validated state values directly and becomes baseline-aware when the user has captured a comparison state.
- Added concise stage cues that support exploration flow without introducing a branching tutorial system.
- Kept the guidance explicitly interpretive and separate from both computed plot output and phenomenological threshold response.
- Added domain and UI tests that lock parameter-change explanations and baseline-aware guidance behavior.

### File List

- `src/domain/bcs/thresholdGuidance.ts`
- `src/domain/bcs/thresholdGuidance.test.ts`
- `src/components/Plots/PlotPanel.tsx`
- `src/components/Plots/PlotAndMetrics.test.tsx`
- `src/styles/app.css`

## Change Log

- 2026-04-22: Completed Story 3.5 implementation and validation; pending review.
