---
sourceDocuments:
  - /home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/prd.md
  - /home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/architecture.md
  - /home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/ux-design.md
documentType: epics-and-stories
project_name: bmad-test
date: 2026-04-21
---

# Epics and Stories

## Epic 1: Trusted Computation Core

Goal: deliver deterministic weak-coupling BCS outputs that remain trustworthy within the supported envelope.

### Story 1.1: Define Supported Model Envelope

- As a user, I want the product to state the supported weak-coupling input envelope so I know when results are intended to be reliable.

### Story 1.2: Compute Core BCS Outputs

- As a user, I want `T_c`, `Δ(0)`, BCS ratio, and isotope-related outputs to update from the current parameter state without a separate calculation workflow.

### Story 1.3: Solve and Render `Δ(T)`

- As a user, I want the explorer to compute and render `Δ(T)` across the supported temperature range so I can inspect thermal evolution directly.

### Story 1.4: Validate Against Known Limits

- As a domain reviewer, I want the solver checked against analytic limits and benchmark states so we can trust the MVP computation path.

## Epic 2: Stateful Explorer Experience

Goal: deliver the desktop-first SPA shell and core interaction loop.

### Story 2.1: Build Explorer Shell

- As a user, I want a continuous SPA experience so I can explore without losing session context.

### Story 2.2: Implement Parameter Controls and Defaults

- As a user, I want labeled inputs, units, and reset-to-default behavior so I can explore and recover predictably.

### Story 2.3: Show Main Gap Plot and Metrics

- As a user, I want the primary plot and metric cards to stay synchronized with the current parameter state.

### Story 2.4: Support Updating and Error States

- As a user, I want the app to show updating, constrained, invalid, and failed states explicitly so I do not misread stale or unsupported outputs.

## Epic 3: Proof-of-Intuition Threshold Interaction

Goal: turn the BCS gap into an interactive allowed-versus-forbidden constraint.

### Story 3.1: Define Threshold Interaction Contract

- As a product team, we want one explicit threshold interaction model so the MVP teaches one clear intuition loop instead of many vague interactions.

### Story 3.2: Implement Threshold Response View

- As a user, I want to probe sub-threshold versus disruptive response so the gap feels like a governing constraint rather than just a plotted quantity.

### Story 3.3: Tie Threshold View to Current State

- As a user, I want the threshold behavior to update from the current parameter state so the interaction remains physically interpretable.

### Story 3.4: Preserve Truth-Layer Separation

- As a user, I want the threshold interaction clearly labeled if it is phenomenological so I do not confuse it with direct solver output.

## Epic 4: Trust, Guidance, and Reproducibility

Goal: preserve scientific trust through validity messaging, export, and reproducibility.

### Story 4.1: Add Validity Guidance

- As a user, I want visible support-envelope and validity guidance so I know when interpretation becomes constrained.

### Story 4.2: Add Truth-Layer Labels

- As a user, I want computed, interpretive, and phenomenological content clearly distinguished across all relevant views.

### Story 4.3: Export Reproducible Session State

- As a user or instructor, I want to export parameter values, outputs, validity state, and app version so results can be reused and reproduced.

### Story 4.4: Restore and Diagnose Reported Sessions

- As a maintainer or domain reviewer, I want to inspect exported states so I can distinguish numerical defects from unsupported regimes or labeling issues.

## Epic 5: Guided Entry and Teaching Reuse

Goal: make the explorer immediately useful to first-time users and instructors.

### Story 5.1: Build Lightweight Landing Surface

- As a first-time user, I want a short introduction that tells me what the product is for and routes me into the explorer.

### Story 5.2: Implement Guided Transition Story

- As a first-time user, I want a staged introduction that teaches the core intuition before I free-explore.

### Story 5.3: Support Presentation-Safe Use

- As an instructor, I want the explorer to remain legible and stable during live demonstration.

### Story 5.4: Export Plot for Teaching Reuse

- As an instructor, I want to export plot artifacts and session state for lecture and demo reuse.

## Deferred Post-MVP Epics

- Pairing-window visualization around `E_F`.
- Mode-gated interface depth for education, demo, and exploration contexts.
- Split amplitude-phase conceptual view.
- Twin-isotope coherence comparison.
- Broader phenomenological sandbox and richer lesson workflows.

## Readiness Revision Addendum

This addendum closes the implementation-readiness gaps found in `implementation-readiness-report-2026-04-21.md`. It is binding for story execution and should be treated as part of the MVP story contract.

### MVP Execution Boundary

The MVP proves one trustworthy intuition loop: a user can inspect weak-coupling BCS outputs, see the gap evolve, probe one threshold interaction, understand the validity/trust state, and export the result reproducibly.

### MVP Non-Goals

- No account system, backend persistence, collaboration, notebooks, or saved workspace history.
- No broad phenomenological sandbox beyond the single threshold interaction.
- No multi-model superconductivity simulator or generalized theory-variant explorer.
- No analytics suite, parameter-sweep workspace, or multi-plot dashboard beyond the MVP comparison views required by the PRD.
- No post-MVP conceptual views in the first release, including pairing-window visualization, split amplitude-phase view, or twin-isotope coherence comparison.

## Added Stories Required for Readiness

### Story 1.5: Compare Numerical Gap With Analytic Reference

As a user, I want the numerical `Delta(T)` behavior compared with the supported analytic reference behavior so I can judge whether the plotted result is physically credible.

FR Traceability: FR11, FR20

Acceptance Criteria:
- The main gap plot can show a supported analytic reference or normalized comparison where applicable.
- The UI labels which curve or value is numerical and which is reference or normalized.
- The comparison is hidden, disabled, or clearly constrained when the current state does not support a meaningful reference comparison.
- The comparison does not introduce additional model claims beyond the documented weak-coupling envelope.

### Story 2.5: Provide Baseline and Normalized Comparison

As a user, I want to compare the current state against a prior or baseline state so I can understand what changed.

FR Traceability: FR20, FR27

Acceptance Criteria:
- The explorer can preserve one baseline or prior state for comparison with the current state.
- The comparison shows the direction of relevant changes without requiring a separate workflow.
- Normalized comparison is available where it helps interpret the gap behavior across states.
- Comparison views remain visually subordinate to the main gap plot and do not create a multi-dashboard experience.
- Baseline comparison is cleared or updated predictably when the user resets.

### Story 2.6: Meet Explorer Accessibility and Browser-Degradation Requirements

As a user, I want the core explorer to remain operable and understandable with keyboard controls, reduced motion, clear labels, and supported-browser feedback.

FR Traceability: FR45, FR46, FR47, FR48

Acceptance Criteria:
- Primary controls are operable by keyboard.
- Metrics, warnings, and scientific views include labels that do not rely solely on color, motion, or position.
- Reduced-motion behavior is available for non-essential animation.
- Unsupported or degraded browser capability is communicated to the user when it affects exploration, plotting, export, or reduced-motion behavior.
- Latest Chrome, Chromium Edge, and recent Firefox receive the full MVP support path; Safari-specific issues are communicated when non-critical degradation occurs.

### Story 3.5: Add State-Tied Interpretive Guidance

As a user, I want concise scientific explanation tied to the current state so I understand why the behavior changed.

FR Traceability: FR17, FR18, FR23

Acceptance Criteria:
- Guidance explains parameter effects in terms of pairing strength, coherence fragility, transition behavior, or model limits.
- Guidance references the current or compared state rather than giving generic textbook prose.
- Guidance distinguishes computed output from interpretation.
- The guidance supports the staged exploration flow without becoming a broad tutorial system.

### Story 4.5: Present Actionable Trust Status Without Visual-Only Cues

As a user, I want trust status and recommended action communicated clearly so I know what to do when a state is constrained or unsupported.

FR Traceability: FR33, FR35, FR46

Acceptance Criteria:
- Trust status is expressed in text, labels, or structure, not only color, animation, or iconography.
- Constrained, unsupported, ambiguous, and failed states include recommended user action.
- Recommended actions are specific enough to guide recovery without implying certainty outside the model envelope.
- Trust messages remain available to keyboard and screen-reader-adjacent navigation patterns used by the app.

### Story 5.5: Verify Accessibility and Compatibility for Teaching Reuse

As an instructor or first-time user, I want teaching and guided flows to respect keyboard, contrast, labels, reduced motion, and degraded-browser expectations.

FR Traceability: FR45, FR46, FR47, FR48

Acceptance Criteria:
- Guided and teaching flows preserve keyboard access to primary controls.
- Warnings, labels, and trust status remain readable with WCAG AA contrast expectations.
- Reduced-motion preference or toggle affects non-essential guided and explanatory motion.
- Partially supported browser behavior is communicated when it affects guided entry, plotting, export, or presentation-safe use.

## Acceptance Criteria for Existing Stories

### Story 1.1 Acceptance Criteria

- The supported input envelope is visible from the explorer without leaving the app.
- The envelope includes supported bounds for exposed model inputs and units.
- A selected state is classified as within, near-edge, outside, or invalid.
- Outside-envelope and invalid states do not appear visually equivalent to supported states.

### Story 1.2 Acceptance Criteria

- `T_c`, `Delta(0)`, BCS ratio, and isotope-related outputs are derived from the current parameter state.
- Computed outputs are visible without requiring a separate calculate button.
- Output cards update from the same state vector used by plots and validity guidance.
- Isotope-related output changes are shown in the computed-output area, not only in explanatory copy.
- Invalid or unsupported inputs prevent misleading output refresh.

### Story 1.3 Acceptance Criteria

- The app computes `Delta(T)` for supported states and renders the primary gap plot.
- Plot and metric state remain synchronized during normal interaction.
- If recomputation is pending, the view shows an updating state and does not present stale values as final.
- Solver failure, non-convergence, or invalid input produces an explicit failed or invalid state instead of a fake plot.
- Loading, recomputation, invalid-input, and partial-failure states preserve a coherent application shell.

### Story 1.4 Acceptance Criteria

- Reference validation includes expected `T -> 0` and `T -> T_c` behavior.
- Reference validation covers the expected relation among `Delta(0)`, `T_c`, and the BCS ratio.
- Benchmark parameter snapshots are documented for regression use.
- Solver failure modes are recorded as explicit invalid or failed states, not fallback values.

### Story 2.1 Acceptance Criteria

- The core explorer runs as a desktop-first single-page application.
- Parameter state, computed state, validity state, and selected view stay available during exploration.
- Moving between landing, guided entry, and explorer surfaces does not discard the active explorer context unless the user resets.

### Story 2.2 Acceptance Criteria

- Supported input controls include the MVP parameter set exposed by the PRD.
- Each control shows a label and unit where applicable.
- The current parameter state is visible during interaction.
- Reset returns the explorer to the defined default state.
- Repeated parameter changes preserve the current session context.

### Story 2.3 Acceptance Criteria

- The main gap plot and metric cards are visible in the explorer surface.
- The plot and metrics read from the same validated state.
- The plot remains legible in the desktop-first layout used for live exploration.
- Metric and plot labels are explicit enough to distinguish values, units, and state.

### Story 2.4 Acceptance Criteria

- Updating state appears when asynchronous recomputation is pending.
- Constrained, invalid, and failed states use distinct visible treatments.
- Invalid and failed states suppress misleading plot or output updates.
- Stale computed values are never presented as final after input state changes.
- Error-state copy identifies whether the problem is invalid input, unsupported regime, solver failure, or partial failure.

### Story 3.1 Acceptance Criteria

- The threshold interaction defines the user control, response states, and user-facing meaning before implementation.
- The interaction has exactly one MVP purpose: distinguish sub-threshold probing from allowed or disruptive response relative to the gap.
- The interaction contract states whether the view is computed, interpretive, or phenomenological.
- The interaction contract rejects additional threshold modes unless they are formally moved to post-MVP scope.

### Story 3.2 Acceptance Criteria

- The view lets the user apply one supported probe or disturbance control.
- The view clearly distinguishes sub-threshold "nothing meaningful happens" response from allowed or disruptive response.
- Response state is visually and textually tied to the current gap context.
- The interaction does not imply full non-equilibrium simulation fidelity.

### Story 3.3 Acceptance Criteria

- Threshold response state updates from the current validated parameter state.
- Explanatory guidance states why the parameter change affected stability, fragility, or transition behavior.
- When state is unsupported or invalid, the threshold view enters a constrained or unavailable state rather than continuing as if authoritative.
- The threshold view uses the same update-state rules as computed outputs.

### Story 3.4 Acceptance Criteria

- Threshold content is persistently labeled as computed, interpretive, or phenomenological.
- Phenomenological threshold visuals are visually separated from authoritative computed outputs.
- The label remains visible during valid, updating, constrained, invalid, and failed states.
- The threshold view never shares ambiguous styling with the main computed plot.

### Story 4.1 Acceptance Criteria

- The explorer shows whether the current state is within, near-edge, outside, invalid, or failed.
- Validity guidance appears near the affected outputs and in the trust/status area.
- Unsupported or ambiguous states include a recommended next action, such as adjust parameter, return to supported range, or treat output as constrained.
- Guidance is shown before users can draw false confidence from invalid or strained states.

### Story 4.2 Acceptance Criteria

- Computed, interpretive, and phenomenological surfaces use persistent labels.
- Trust status is communicated through text and structure, not color or motion alone.
- Labels remain visible across plots, metric cards, threshold view, guidance, and export-adjacent UI.
- Labels are not removed during presentation-safe or guided modes.

### Story 4.3 Acceptance Criteria

- Export includes parameter values, units, computed outputs, warning or validity state, and application version.
- Export identifies whether the session was valid, constrained, invalid, failed, or partially unavailable.
- Export is local and initiated by explicit user action.
- Exported data is sufficient to reproduce the result on the same application version.
- Application version is visible in the exported session package.

### Story 4.4 Acceptance Criteria

- A saved/exported state can be inspected or restored enough to reproduce what the user saw.
- Restored sessions show the application version associated with the exported state.
- Reviewers can identify whether the reported issue is numerical, unsupported-regime, or truth-layer communication related.
- Restored invalid or failed states preserve their failure or warning context.

### Story 5.1 Acceptance Criteria

- Landing surface states that the product is a weak-coupling BCS explorer, not a general superconductivity simulator.
- Landing surface routes users into guided entry or the explorer.
- Landing content is lightweight and does not reshape the SPA around SEO needs.

### Story 5.2 Acceptance Criteria

- Guided entry introduces the default state, gap plot, threshold interaction, and trust labels.
- The guided path teaches the gap as a governing constraint, not only as a plotted output.
- The flow remains short enough to support exploration-first use.
- Users can exit to free exploration without losing current state.

### Story 5.3 Acceptance Criteria

- Core plot, metrics, threshold state, and trust labels remain legible in a desktop presentation context.
- Reset-to-default and stable guided flow are available for repeatable demos.
- Presentation use does not hide validity or truth-layer labels.
- Live parameter changes do not produce ambiguous mixed-state displays.

### Story 5.4 Acceptance Criteria

- Users can export the current scientific plot for teaching, sharing, or review.
- Plot export preserves enough context to identify the originating state or session package.
- Teaching export does not omit warning or validity context when the state is constrained, invalid, or failed.
- Export behavior is initiated by explicit user action.

## Functional Requirement Traceability Matrix

| FR | Primary Story Coverage |
| --- | --- |
| FR1 | Story 2.2 |
| FR2 | Story 2.2 |
| FR3 | Story 2.2 |
| FR4 | Story 2.1 |
| FR5 | Story 1.1, Story 1.4 |
| FR6 | Story 1.1, Story 2.4 |
| FR7 | Story 1.2, Story 1.4 |
| FR8 | Story 1.2, Story 1.4 |
| FR9 | Story 1.2, Story 1.4 |
| FR10 | Story 1.3, Story 1.4 |
| FR11 | Story 1.5 |
| FR12 | Story 1.2 |
| FR13 | Story 1.2, Story 2.3 |
| FR14 | Story 1.3, Story 2.4 |
| FR15 | Story 3.1, Story 3.2 |
| FR16 | Story 3.1, Story 3.3 |
| FR17 | Story 3.3, Story 3.5 |
| FR18 | Story 3.5, Story 5.2 |
| FR19 | Story 1.3, Story 2.3 |
| FR20 | Story 1.5, Story 2.5 |
| FR21 | Story 1.3, Story 2.4 |
| FR22 | Story 5.2 |
| FR23 | Story 3.5, Story 5.2 |
| FR24 | Story 5.3 |
| FR25 | Story 5.4 |
| FR26 | Story 5.1 |
| FR27 | Story 2.5 |
| FR28 | Story 1.1, Story 4.1 |
| FR29 | Story 4.1 |
| FR30 | Story 3.4, Story 4.2 |
| FR31 | Story 3.1, Story 3.4, Story 4.2 |
| FR32 | Story 2.4, Story 4.1 |
| FR33 | Story 4.2, Story 4.5 |
| FR34 | Story 3.4, Story 4.2 |
| FR35 | Story 4.1, Story 4.5 |
| FR36 | Story 4.3 |
| FR37 | Story 4.3 |
| FR38 | Story 5.4 |
| FR39 | Story 4.3 |
| FR40 | Story 4.4 |
| FR41 | Story 4.4 |
| FR42 | Story 4.3, Story 4.4 |
| FR43 | Story 2.1 |
| FR44 | Story 2.1 |
| FR45 | Story 2.6, Story 5.5 |
| FR46 | Story 2.6, Story 4.5, Story 5.5 |
| FR47 | Story 2.6, Story 5.5 |
| FR48 | Story 2.6, Story 5.5 |
| FR49 | Story 1.3, Story 2.4 |
