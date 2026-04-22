---
sourceDocuments:
  - /home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/prd.md
documentType: architecture
project_name: bmad-test
date: 2026-04-21
---

# Architecture Decision Document

## Architecture Summary

This product is a desktop-first SPA for weak-coupling BCS exploration. The architecture must preserve three properties above all else: trusted equilibrium computation, explicit truth-layer separation, and fluid stateful interaction. The MVP architecture therefore centers on a deterministic scientific computation core, a reactive exploration shell, and a minimal phenomenological threshold interaction that is visibly secondary to the computed model.

## Decision Drivers

- Trustworthy computation of `T_c`, `Δ(0)`, BCS ratio, and `Δ(T)` within an explicit weak-coupling support envelope.
- Responsive interaction with visible updating state and no silent stale-result presentation.
- Strict separation of `computed`, `interpretive`, and `phenomenological` outputs.
- Local-only session handling and export in MVP.
- Reproducible parameter-state export including validity state and application version.

## Proposed System Shape

### Client Application

- Single-page web application.
- Desktop-first layout optimized for continuous scientific exploration.
- Reactive state model coordinating controls, computed outputs, validity state, threshold interaction state, and exports.

### Scientific Computation Core

- Deterministic computation module for supported weak-coupling BCS formulas and numerical gap solving.
- Explicit support-envelope validator applied before and after computation.
- Result classification layer returning one of: valid, constrained-interpretation, invalid/failed.
- Reference-validation harness using analytic limits and benchmark snapshots.

### Visualization Layer

- Gap plot view for `Δ(T)` and supported analytic comparison.
- Metric card layer for `T_c`, `Δ(0)`, BCS ratio, and isotope-related outputs.
- Minimal threshold interaction view expressing sub-threshold versus allowed/disruptive response.
- Labeling system for computed, interpretive, and phenomenological content.

### Session and Export Layer

- In-memory session state for active exploration.
- Local export of parameter state, computed outputs, validity state, version, and plot artifacts.
- No backend persistence and no silent network transmission in MVP.

## Architectural Components

### Exploration Shell

- Routes users from a lightweight landing surface into the explorer.
- Preserves current session context without disruptive navigation.
- Owns loading, updating, invalid, and error states.

### Parameter Controller

- Normalizes model inputs, units, defaults, and supported bounds.
- Rejects invalid states or marks unsupported states before misleading computation can be shown.

### Solver Service

- Computes `T_c`, `Δ(0)`, BCS ratio, and `Δ(T)`.
- Emits deterministic outputs for identical inputs on the same application version.
- Emits explicit failure and non-convergence states rather than fallback values.

### Validity and Truth-Layer Service

- Applies support-envelope checks.
- Produces warning guidance and recommended interpretation actions.
- Tags all surfaces as computed, interpretive, or phenomenological.

### Visualization Coordinator

- Synchronizes plots, cards, labels, and threshold interaction state.
- Ensures stale outputs are not presented as final while recomputation is in progress.

### Export Service

- Serializes reproducible session packages with parameter values, units, outputs, validity state, and app version.
- Exports plot artifacts for teaching and review.

## State Model

### User-Entered State

- Input parameters, selected views, and current interaction mode.

### Derived State

- Computed outputs, gap curves, validity status, update status, and threshold interaction response.

### Exported State

- Parameter vector, units, output snapshot, warning/failure status, and application version.

## Key Architectural Rules

- Computed outputs and phenomenological views must never share ambiguous labeling.
- Unsupported or failed computation must suppress misleading visual continuity.
- Async recomputation is allowed; stale-final presentation is not.
- MVP architecture must optimize for one trustworthy computation path and one threshold interaction, not a broad simulation platform.

## Cross-Cutting Concerns

### Performance

- UI acknowledgment under `100 ms`.
- Plot/output refresh under `200 ms` for supported states.
- Visible updating state for longer recomputations.

### Accessibility

- Keyboard-operable controls.
- WCAG AA contrast targets.
- Reduced-motion support.
- Labeled visuals and warnings not dependent on color alone.

### Reliability

- Deterministic outputs for identical inputs.
- No silent fallback behavior.
- Reproducible export of warning and failure states.

### Security and Data Handling

- No account system.
- No backend persistence.
- No silent external transmission.

## Architecture Risks and Mitigations

- Solver instability across edge states:
  Narrow the support envelope first and validate against known limits before expanding.

- Truth confusion between computed and phenomenological layers:
  Enforce a single labeling system and separate rendering rules.

- UI lag during recomputation:
  Decouple immediate control feedback from heavier solver refreshes.

- MVP drift into a broad simulator:
  Treat all non-essential conceptual views as post-MVP unless they directly reinforce the proof-of-intuition path.

## Decisions Deferred

- Exact library and framework choices.
- Whether `T_c` and `Δ(T)` share a single compute pipeline or separate analytic/numerical entry points internally.
- Whether future phenomenological expansions live behind a dedicated exploration mode.
