# Story 4.2: Add Truth-Layer Labels

Status: done

## Story

As a user, I want computed, interpretive, and phenomenological content clearly distinguished across all relevant views.

FR Traceability: FR30, FR31, FR33, FR34

## Acceptance Criteria

1. Computed, interpretive, and phenomenological surfaces use persistent labels.
2. Trust status is communicated through text and structure, not color or motion alone.
3. Labels remain visible across plots, metric cards, threshold view, guidance, and export-adjacent UI.
4. Labels are not removed during presentation-safe or guided modes.

## Tasks / Subtasks

- [x] Define shared truth-layer label components or patterns. (AC: 1)
- [x] Apply labels to computed, interpretive, and phenomenological surfaces. (AC: 1, 3)
- [x] Ensure trust status does not rely only on color or motion. (AC: 2)
- [x] Verify labels persist in guided and presentation-safe use. (AC: 4)

## Dev Notes

- This story protects the product from truth confusion.
- Labeling must be persistent, not tooltip-only or hidden behind hover.

### References

- [PRD](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/prd.md)
- [UX](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/ux-design.md)

## Dev Agent Record

### Agent Model Used

gpt-5

### Debug Log References

### Completion Notes List

- Added a shared `TruthLayerStrip` component so truth-layer labels are persistent and structurally consistent instead of being one-off pills.
- Extended truth-layer labeling into metric, validity, and guided-entry surfaces without changing solver or reducer behavior.
- Kept trust-state communication textual through explicit labels and existing state/guidance copy, not color alone.
- Validation passed: `npm run test:web`, `npm test`, `npm run test:validation`, `npm run build`, `python3 -m py_compile bcs_solver.py streamlit_app.py`.

### File List

- src/components/Truth/TruthLayerStrip.tsx
- src/components/Metrics/MetricsPanel.tsx
- src/components/Status/StatusPanel.tsx
- src/components/Shell/GuidedEntry.tsx
- src/components/Plots/PlotPanel.tsx
- src/components/Shell/ExplorerShell.test.tsx
- src/components/Plots/PlotAndMetrics.test.tsx
- src/styles/app.css
