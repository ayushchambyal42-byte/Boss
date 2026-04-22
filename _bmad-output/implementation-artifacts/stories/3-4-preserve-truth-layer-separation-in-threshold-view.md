# Story 3.4: Preserve Truth-Layer Separation in Threshold View

Status: done

## Story

As a user, I want the threshold interaction clearly labeled if it is phenomenological so I do not confuse it with direct solver output.

FR Traceability: FR30, FR31, FR34

## Acceptance Criteria

1. Threshold content is persistently labeled as computed, interpretive, or phenomenological.
2. Phenomenological threshold visuals are visually separated from authoritative computed outputs.
3. The label remains visible during valid, updating, constrained, invalid, and failed states.
4. The threshold view never shares ambiguous styling with the main computed plot.

## Tasks / Subtasks

- [x] Add persistent truth-layer label to threshold content. (AC: 1, 3)
- [x] Separate threshold visual styling from computed plot styling. (AC: 2, 4)
- [x] Verify labels persist across state transitions. (AC: 3)

## Dev Notes

- Truth-layer separation is a product principle, not decoration.
- Computed plot and phenomenological threshold view must remain visually distinct.

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
- `python3 -m py_compile bcs_solver.py streamlit_app.py`

### Completion Notes List

- Added a persistent truth-layer strip to the threshold view so computed context, phenomenological response, and interpretive guidance remain labeled across all state transitions.
- Strengthened visual separation between the threshold panel and the authoritative computed plot by giving the threshold block its own warm-toned frame, pills, and control styling instead of reusing the computed plot treatment.
- Added UI regressions that verify the truth-layer labels persist through valid, updating, constrained, and invalid threshold states.

### File List

- `src/components/Plots/PlotPanel.tsx`
- `src/components/Plots/PlotAndMetrics.test.tsx`
- `src/styles/app.css`

## Change Log

- 2026-04-22: Completed Story 3.4 implementation and validation; pending review.
- 2026-04-22: Review passed; Story 3.4 accepted.
