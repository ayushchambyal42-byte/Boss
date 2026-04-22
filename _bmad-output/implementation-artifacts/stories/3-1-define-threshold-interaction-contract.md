# Story 3.1: Define Threshold Interaction Contract

Status: done

## Story

As a product team, we want one explicit threshold interaction model so the MVP teaches one clear intuition loop instead of many vague interactions.

FR Traceability: FR15, FR16, FR31

## Acceptance Criteria

1. The threshold interaction defines the user control, response states, and user-facing meaning before implementation.
2. The interaction has exactly one MVP purpose: distinguish sub-threshold probing from allowed or disruptive response relative to the gap.
3. The interaction contract states whether the view is computed, interpretive, or phenomenological.
4. The interaction contract rejects additional threshold modes unless they are formally moved to post-MVP scope.

## Tasks / Subtasks

- [x] Specify the threshold control and response states. (AC: 1, 2)
- [x] Define the truth-layer classification for the threshold view. (AC: 3)
- [x] Document non-goals and rejected extra threshold modes. (AC: 4)
- [x] Review the contract against PRD interaction principles. (AC: 1-4)

## Dev Notes

- This story should produce the precise interaction contract before UI build-out.
- The threshold view is the MVP's proof-of-intuition interaction, not a non-equilibrium simulator.

### References

- [PRD](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/prd.md)
- [UX](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/ux-design.md)
- [Architecture](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/architecture.md)

## Dev Agent Record

### Agent Model Used

- GPT-5 Codex

### Debug Log References

- `npm run test:web`
- `npm test`
- `npm run test:validation`
- `npm run build`

### Completion Notes List

- Added a single domain-level threshold contract that locks one MVP control, one purpose, one truth-layer classification, and explicit non-goals for rejected extra modes.
- Defined the threshold control as `probeStrength`, measured relative to the current `Δ(T)`, with one decisive threshold ratio separating sub-threshold from disruptive response.
- Classified the threshold interaction as `phenomenological` while explicitly listing its dependency on validated computed `Δ(T)` and current trust/update state.
- Added a pure assessment helper that maps update status, validity status, current selected gap, and probe strength into the allowed contract states: `sub-threshold`, `disruptive`, `updating`, `constrained`, and `unavailable`.
- Added Story 3.1 tests to lock the control definition, truth-layer classification, non-goals, and contract-state transitions.

### File List

- `src/domain/bcs/thresholdContract.ts`
- `src/domain/bcs/thresholdContract.test.ts`

## Change Log

- 2026-04-22: Completed Story 3.1 implementation and validation; pending review.
- 2026-04-22: Review passed; Story 3.1 accepted.
