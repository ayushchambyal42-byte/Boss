---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
inputDocuments:
  - /home/ayushchambyal/projects/bmad-test/_bmad-output/brainstorming/brainstorming-session-20260421-153019.md
workflowType: 'prd'
documentCounts:
  productBriefs: 0
  research: 0
  brainstorming: 1
  projectDocs: 0
classification:
  projectType: web_app
  productArchetype: scientific visualization tool
  domain: scientific
  secondaryCharacteristic: educational layer
  complexity: medium
  projectContext: greenfield
  primaryAudience: advanced students and exploratory users
---

# Product Requirements Document - bmad-test

**Author:** Boss
**Date:** 2026-04-21

## Executive Summary

This product is a browser-based scientific visualization tool for weak-coupling BCS exploration, aimed at advanced students and exploratory users who need intuition as much as calculation. It computes canonical BCS quantities in real time, including critical temperature, zero-temperature gap, the BCS ratio, isotope comparison, and the temperature-dependent gap curve, then connects those outputs to visual explanations of stability, transition behavior, and model limits. Its purpose is to help users anticipate how parameter changes alter superconducting behavior within the weak-coupling regime, rather than treating BCS as a static set of equations or plots.

### What Makes This Special

Most existing BCS resources either explain the theory statically or compute results without helping users interpret them. This product differentiates by making parameter changes legible as physical consequences: users can see when a regime remains stable, when it becomes fragile, and when the chosen parameters strain the model’s assumptions. The core insight is that BCS intuition comes from seeing constrained relationships among inputs, outputs, and validity boundaries, not from reading isolated numbers. To preserve scientific clarity, the interface must explicitly distinguish between computed outputs, interpretive guidance, and any illustrative conceptual views.

## Interaction Principles

- The product uses one scientific engine and must not imply different physics across learning, demo, or exploration contexts.
- The product explains superconductivity through coherence, stability, fragility, and allowed-versus-forbidden behavior rather than generic simulation theater.
- The interface must preserve explicit separation between `computed`, `interpretive`, and `phenomenological` content at all times.
- The product prioritizes scientific trust over visual flourish; any interaction that increases confusion or overstates physical fidelity must be reduced, relabeled, or removed.
- The MVP is a proof-of-intuition release: core interactions must reinforce the BCS gap as a governing constraint.

## Project Classification

- Project Type: `web_app`
- Product Archetype: `scientific visualization tool`
- Domain: `scientific`
- Secondary Characteristic: `educational layer`
- Complexity: `medium`
- Project Context: `greenfield`
- Primary Audience: `advanced students and exploratory users`

## Success Criteria

### User Success

- After one guided session, target users can correctly predict the direction of change for at least `3 of 4` parameter-change scenarios involving `λ`, `ω_D`, `M`, or `T`.
- After one guided session, at least `80%` of target users can explain the dominant qualitative mechanism in at least `2 of 4` scenarios using concepts the product explicitly teaches, such as stronger pairing, lower phonon scale, isotope-driven transition shift, or earlier coherence fragility near `T_c`.
- Users can distinguish between `pairing strength`, `coherence fragility`, and `model-limit warnings` rather than treating all output changes as generic curve movement.

### Business Success

- By `3 months`, the product is voluntarily reused and adopted in at least `1` course, lecture, lab, or live demo.
- By `12 months`, the product is reused in at least `3` teaching artifacts, course modules, or research presentations as an intuition-building BCS tool.
- A stronger niche-fit signal than raw MAU: at least `2` repeat uses per adopting instructor, presenter, or course context within the first academic cycle.

### Technical Success

- Core metric cards and validity guidance update in under `100 ms` during normal slider interaction on supported desktop browsers.
- Full plot refresh for `Δ(T)` and normalized views completes in under `200 ms` for supported parameter ranges during normal interaction.
- `T_c` and numerical `Δ(T)` remain stable across supported ranges, with no silent failures, `NaN` outputs, or unlabeled fallback behavior.
- Every non-equilibrium or conceptual view is visibly labeled as `illustrative` or `phenomenological` at all times.
- Any parameter regime that strains weak-coupling BCS assumptions triggers explicit heuristic guidance rather than implied model confidence.

### Measurable Outcomes

- `80%` of tested target users correctly predict direction in `3/4` scenarios after onboarding.
- `80%` of tested target users correctly identify the taught mechanism category in `2/4` scenarios after onboarding.
- `1` course/demo integration by `3 months`.
- `3` teaching or presentation adoptions by `12 months`.
- Core metric updates `<100 ms`; plot refresh `<200 ms`; zero unlabeled illustrative views in release QA.

These criteria define whether the product delivers the intended intuition gain strongly enough to justify expansion beyond the first release.

## Product Scope

### MVP - Minimum Viable Product

- Real-time weak-coupling BCS calculations for `T_c`, `Δ(0)`, BCS ratio, isotope comparison, and `Δ(T)`.
- Live gap plots that directly support the core learning goal.
- A minimal guided transition story that reinforces `coherence vs breakdown` and model limits.
- Heuristic validity guidance.
- No feature ships in MVP unless it directly reinforces coherence, breakdown, or validity interpretation.

### Growth Features (Post-MVP)

- Mode-gated interface depth.
- Pairing-window and inactive-state visualizations.
- Export and comparison workflows.
- Additional explanatory overlays that preserve the product’s truth model.

### Vision (Future)

- Clearly labeled phenomenological sandbox.
- Split amplitude/phase and twin-isotope conceptual scenes.
- Richer conceptual narratives, still separated from computed equilibrium outputs.

## User Journeys

### Journey 1: Mira, the Advanced Student Building Intuition

**Opening Scene:**  
Mira is studying superconductivity and can manipulate the BCS formulas, but she still cannot predict what will happen before doing the math. She opens the tool because she wants to understand why coherence survives, weakens, or fails as parameters change.

**Rising Action:**  
She begins with the guided transition story, sees the system cool through `T_c`, and then changes one parameter at a time: `λ`, `ω_D`, `M`, and `T`. The tool responds immediately with updated metric cards, gap plots, isotope comparison, and validity guidance.

**Climax:**  
Mira starts predicting outcomes before moving the controls: increasing `λ` should strengthen pairing, increasing isotope mass should reduce `T_c`, and moving closer to `T_c` should make coherence more fragile even before superconductivity disappears. The product either confirms her prediction or corrects it with explicit explanation.

**Resolution:**  
She leaves with transferable intuition: superconductivity is not just “a gap curve,” but constrained coherence with identifiable stability and fragility mechanisms.

**Capabilities Revealed:**  
guided onboarding, one-parameter-at-a-time interaction, real-time computed outputs, gap plots, isotope comparison, validity guidance, explanation tied directly to parameter changes.

### Journey 2: Mira Misreads the Model and Gets Corrected

**Opening Scene:**  
On a later visit, Mira pushes parameters into a regime where weak-coupling BCS becomes strained. She also opens a conceptual visual and starts reading it as if it were direct solver output.

**Rising Action:**  
The tool does not silently allow the mistake. It surfaces a validity warning, keeps computed outputs visually separated from interpretive and illustrative layers, and labels the conceptual view persistently as `illustrative` or `phenomenological`.

**Climax:**  
Mira realizes the product is not claiming that every visual is an authoritative physical result. Instead, it tells her what remains trustworthy, what is heuristic, and what is conceptual.

**Resolution:**  
The failure path becomes part of the learning outcome. Mira learns to distinguish:
- computed outputs,
- interpretive guidance,
- illustrative conceptual views.

**Capabilities Revealed:**  
persistent truth-status labeling, regime warnings, recoverable misuse path, no silent solver ambiguity, explicit explanation of trust boundaries.

### Journey 3: Dr. Rao, the Instructor Giving a Live Demo

**Opening Scene:**  
Dr. Rao has 8 minutes in a lecture to make BCS transition behavior feel intuitive. Slides can show equations, but they cannot make students feel when a regime becomes stable or fragile.

**Rising Action:**  
He opens the tool in a presentation-safe teaching view, runs the guided transition story, and then makes a few deliberate parameter changes. He uses isotope comparison and gap-curve evolution to show that the equations are not isolated facts but constrained relationships.

**Climax:**  
A live change produces an immediate, legible shift in transition behavior. Students can see the consequence and hear the explanation in one motion instead of piecing it together across several slides.

**Resolution:**  
Dr. Rao exports the plot and parameter state for reuse in lecture notes or future demos. The tool becomes something he can repeatedly trust in front of a class.

**Capabilities Revealed:**  
presentation-safe guided flow, stable resettable demos, simplified teaching view, export of plots and parameter states, trust-preserving labels, consistent real-time behavior.

### Journey 4: The Research Owner Diagnoses “This Looks Wrong”

**Opening Scene:**  
A user reports that a result or visual feels inconsistent. The research owner needs to determine whether the issue is numerical instability, a regime-validity problem, or a misleading conceptual overlay.

**Rising Action:**  
They reopen the same parameter state, reproduce the session, inspect the numerical `Δ(T)` output, compare against expected BCS trends, and verify whether the user was looking at computed or illustrative content.

**Climax:**  
Because the session is reproducible and the truth layers are separated, the owner can classify the issue cleanly:
- numerical defect,
- unsupported regime,
- communication/labelling problem,
- or user misunderstanding.

**Resolution:**  
The product remains scientifically credible because investigation is evidence-based. Problems can be debugged, explained, and fixed without ambiguity.

**Capabilities Revealed:**  
parameter-state reproduction, exportable session context, solver sanity checks, clear truth-layer separation, debug-friendly recovery paths.

### Journey Requirements Summary

These journeys imply the following required capabilities:

- **Core exploration:** guided onboarding, real-time response, canonical BCS outputs, gap plots, isotope comparison.
- **Interpretation:** explanation that connects parameter changes to stability, fragility, and model limits.
- **Trust management:** persistent distinction between computed, interpretive, and illustrative content.
- **Misuse recovery:** explicit warnings and correction paths when users overinterpret strained regimes or conceptual visuals.
- **Teaching reuse:** presentation-safe flow, resettable demos, export of plots and parameter states.
- **Maintenance:** reproducible sessions, sanity checks, and clear diagnosis paths for solver or labeling issues.

**MVP-critical implication:** every journey above depends on the product reinforcing `coherence vs breakdown` or `model validity`. Anything outside that is secondary.

## Domain-Specific Requirements

### Scientific Validity & Trust

- The product must define and document an explicit supported weak-coupling parameter envelope for which the numerical solver and interpretive guidance are intended to be reliable.
- Within that supported envelope, core BCS relationships must hold, including expected `T -> 0` and `T -> T_c` behavior and the correct relationship among `Δ(0)`, `T_c`, and the BCS ratio.
- Scientific correctness must be backed by reference validation, such as analytic limits, benchmark parameter snapshots, and regression tests against known BCS behavior.
- Any content that is not a direct equilibrium BCS output must be explicitly identified as `interpretive` or `phenomenological`, with persistent labeling and visual separation from computed results.

### Reproducibility & Provenance

- The product must export a reproducible session package containing full parameter state, computed outputs, warning or validity state, and application version.
- Reproducibility must assume fixed numerical tolerances and deterministic solver behavior for identical inputs on the same application version.
- Exported plots used in teaching or presentations should remain traceable to the originating parameter state and warning context.

### Technical Constraints

- The product is desktop-first.
- MVP requires no account system and no backend persistence.
- Identical inputs on the same version must produce deterministic outputs.
- Lightweight UI feedback, such as slider motion, card-state preview, and warning-state updates, must feel immediate.
- Full numerical recomputation may complete asynchronously, but the interface must keep perceived interaction under `200 ms` and never present stale results as final.

### Integration Requirements

- Full API or external system integration is out of scope for MVP.
- Basic export of plots and reproducible parameter/session state is required for teaching reuse, sharing, and troubleshooting.
- The export format must be stable enough to support exact replay of supported sessions across the same released version.

### Risk Mitigations

- If users enter regimes that strain weak-coupling BCS assumptions, the product must shift from silent computation to explicit heuristic guidance and constrained interpretation.
- If users open conceptual or non-equilibrium views, the UI must prevent truth confusion through persistent labels, visual separation, and placement that makes the difference obvious.
- If edge-case inputs produce fragile or ambiguous numerical behavior, the product must prefer warnings, disabled claims, or narrowed interpretation over silent fallback or false precision.
- The product must be designed to reduce false scientific confidence, not just numerical defects.

## Innovation & Novel Patterns

### Detected Innovation Areas

- The product’s central innovation is re-framing the BCS gap as an interactive constraint on allowed behavior, rather than as a static number or curve to be observed after calculation.
- It combines authoritative weak-coupling BCS computation with a coherence-first explanatory layer that helps users test what the model permits, suppresses, or destabilizes.
- A second innovation is architectural: the product enforces a visible separation between `computed`, `interpretive`, and `phenomenological` layers, reducing the truth-confusion common in scientific teaching tools.
- The novelty is therefore not a broader physical solver, but a different interaction model for building scientific intuition from established theory.

### Market Context & Competitive Landscape

- Traditional BCS teaching tools usually emphasize derivations, reference curves, or static lecture figures.
- Lightweight computational tools often stop at returning values and plots, leaving users to infer physical meaning on their own.
- This product operates differently: it makes parameter changes legible as constraints on stability, fragility, and model validity, and it does so while explicitly marking what is calculated versus what is explanatory.
- Its differentiated position is best understood as an interactive scientific intuition tool for weak-coupling BCS.

### Validation Approach

- The innovation should be validated against a baseline equation-and-plot workflow, not just by subjective preference.
- Success means target users can more accurately predict qualitative system response, coherence fragility, and isotope-driven transition shifts after using the tool than after reviewing conventional static material alone.
- Instructor adoption is a second validation path: the product should be chosen because it explains “why” better, not just because it looks more dynamic.
- A failed innovation outcome is not “users dislike it,” but “the interactive constraint framing does not measurably improve intuition, prediction accuracy, or teaching reuse.”

### Risk Mitigation

- The product architecture should be resilient to innovation underperformance: the rigorous BCS explorer and validity-guidance layer must stand on their own even if the phenomenological layer is reduced or removed.
- The phenomenological interaction layer should remain optional, clearly secondary, or explicitly post-MVP until it proves that it improves understanding without harming trust.
- All innovative layers must preserve the truth-model boundary between computed, interpretive, and phenomenological outputs.
- The PRD should explicitly reject novelty theater: innovation is only valuable here if it improves scientific understanding without overstating physical fidelity.

These innovation constraints carry directly into the web application requirements, where the interaction model has to remain stateful, legible, and trustworthy in use.

## Web App Specific Requirements

### Project-Type Overview

This product is a desktop-first single-page web application built for continuous scientific exploration, not document-style navigation. Its primary requirement is to preserve a single, stateful interaction surface where parameter changes, computed outputs, warnings, and visual explanations remain synchronized during rapid use.

### Technical Architecture Considerations

- The application must be implemented as an `SPA` so users can explore continuously without losing parameter state or interaction context.
- The product architecture must separate fast interface-state updates from heavier numerical recomputation so interaction remains fluid while full solver-driven updates complete asynchronously.
- Identical inputs on the same released version must produce deterministic outputs.
- The SPA must preserve visible truth-layer separation among `computed`, `interpretive`, and `phenomenological` views even while the state updates dynamically.

### Browser Support

- Official MVP support is required for latest `Chrome`, latest Chromium-based `Edge`, and recent `Firefox`.
- `Safari` support is best-effort only for MVP; unresolved Safari-specific issues must not block release unless they break core exploration, plotting, or export workflows.
- Browser verification must explicitly cover sliders, metric cards, warning states, plot rendering, reduced-motion behavior, and export actions.

### Responsive Scientific Interaction

- User input must produce immediate perceived response within `100-200 ms`, including control feedback, visible state acknowledgement, and warning-state updates.
- Full numerical recomputation, especially `Δ(T)` updates and related plots, may complete asynchronously if the interface remains interactive.
- The UI must never present stale computed results as final. If recomputation is pending, the interface must visibly indicate updating state.
- Rapid successive parameter changes must not freeze the interface or create ambiguous mixed-state displays.

### SEO Strategy

- SEO requirements apply only to a lightweight landing or introduction surface.
- The interactive SPA itself is not an SEO target and must not be reshaped around crawlability requirements.
- Basic discoverability metadata for the landing page is sufficient for MVP.

### Accessibility Requirements

- All primary controls must be keyboard operable.
- Metric cards, warnings, and plot-adjacent explanations must use explicit labels rather than relying on color, motion, or position alone.
- MVP must meet basic `WCAG AA` contrast expectations for text, controls, and status messaging.
- The product must support reduced motion for non-essential animations and explanatory transitions.
- Accessibility review must include the scientific visualization layer, not just form controls and landing content.

### Implementation Considerations

- The UI is desktop-first and optimized for focused scientific interaction rather than mobile-first use.
- Export of current parameter state and outputs must fit naturally into the SPA model, since reproducibility and teaching reuse depend on preserved interactive state.
- The application should keep the landing surface and the exploration surface cleanly separated so the needs of discoverability do not compromise the stateful app experience.

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** proof-of-intuition MVP. The first release exists to demonstrate that a user can understand the BCS gap as a governing constraint, not just a computed quantity.

**Resource Requirements:** one engineer with sufficient numerical and frontend competence, plus one domain reviewer who can validate the scientific truth model and catch misleading interaction design.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- a user explores `Δ(T)` and `T_c` with confidence in the numerical output,
- a user encounters one interactive threshold where sub-threshold probing does nothing and supra-threshold probing produces a clearly different response,
- an instructor can reuse a trusted view or state in a demo,
- a maintainer can reproduce the same state and verify what the user saw.

**Must-Have Capabilities:**
- trusted computation of `Δ(T)` and `T_c` within an explicit supported weak-coupling envelope,
- one clean gap plot that makes thermal evolution legible,
- one minimal interactive constraint view that clearly distinguishes forbidden response from allowed/disruptive response,
- explicit truth-layer labeling and validity guidance,
- reproducible export of parameter state and outputs.

### Post-MVP Features

**Phase 2 (Post-MVP):**
- mode-gated interface depth,
- isotope comparison enhancements,
- Fermi-surface pairing window visualization showing the pairing-active shell around `E_F` and distinguishing active from inactive electronic states,
- improved export and comparison workflows,
- more refined teaching/presentation flows.

**Phase 3 (Expansion):**
- richer phenomenological sandbox,
- split amplitude-phase view for separating gap magnitude behavior from coherence behavior in conceptual explorations,
- twin-isotope coherence comparison for showing differentiated stability and recovery behavior under matched conditions,
- broader lesson-driven and exploratory workflows.

### Risk Mitigation Strategy

**Technical Risks:**  
The hardest problem is stable, responsive `Δ(T)` computation across the supported range. The MVP should reduce risk by narrowing the support envelope, validating against known limits early, and keeping the interaction model minimal.

**Market Risks:**  
The product fails if it looks impressive but does not improve understanding. The MVP should therefore prove one thing: users grasp the “forbidden vs allowed” consequence of the gap faster than they would from static plots.

**Resource Risks:**  
A small team cannot support both a rigorous explorer and a broad conceptual sandbox in the first release. The MVP must keep the phenomenological interaction minimal and only as elaborate as needed to prove the core intuition.

## Functional Requirements

### Scientific Exploration & Parameter Control

- FR1: Users can adjust the supported weak-coupling BCS input parameters exposed by the explorer, including `lambda`, `omega_D`, temperature, isotope mass, and other explicitly supported model inputs.
- FR2: Users can view the current parameter state, including units, at all times during interaction.
- FR3: Users can reset the explorer to a defined default parameter state.
- FR4: Users can continue exploring through repeated parameter changes within one continuous session without losing current context.
- FR5: Users can view the explicitly supported parameter envelope for which the explorer is intended to be reliable.
- FR6: Users can see when an entered or selected parameter state is invalid, unsupported, or outside the intended model envelope.

### Computed Scientific Outputs

- FR7: Users can view the computed critical temperature `T_c` for the current parameter state.
- FR8: Users can view the computed zero-temperature gap `Delta(0)` for the current parameter state.
- FR9: Users can view the computed BCS ratio for the current parameter state.
- FR10: Users can view the computed temperature-dependent gap `Delta(T)` across the supported range.
- FR11: Users can compare numerical gap behavior with the analytic reference behavior the product supports.
- FR12: Users can view isotope-related changes in the relevant computed superconducting outputs.
- FR13: Users can inspect computed outputs without a separate calculation workflow.
- FR14: Users can see when computed outputs are unavailable, incomplete, or invalid rather than being shown silent fallback results.

### Threshold Interaction & Scientific Interpretation

- FR15: Users can use one interactive threshold view that distinguishes sub-threshold probing from allowed or disruptive response relative to the gap.
- FR16: Users can see the current threshold interaction state update in response to the current parameter state.
- FR17: Users can access interpretive scientific guidance that explains why a parameter change affects stability, fragility, or transition behavior.
- FR18: Users can view explanatory scientific content that connects computed quantities to physical meaning.
- FR19: Users can view the thermal evolution of the superconducting gap in a clean graphical form.
- FR20: Users can view normalized scientific comparisons that help interpret superconducting behavior across parameter regimes.
- FR21: Users can see when displayed scientific content is updating versus stable while asynchronous recomputation is in progress.

### Guided Exploration & Teaching Use

- FR22: First-time users can enter the product through a guided transition experience that introduces the core physical intuition of the explorer.
- FR23: Users can progress through a staged exploration flow that helps them understand the gap as a governing constraint rather than only a plotted output.
- FR24: Instructors can use the product in a presentation-safe manner for live explanation or demonstration.
- FR25: Instructors can reuse a chosen scientific view or exported session state in teaching or presentation contexts.
- FR26: Users can access a lightweight landing or introduction surface that explains the product purpose and routes them into the explorer.
- FR27: Users can compare the current state against a prior or baseline state when interpreting the effect of a parameter change.

### Trust, Validity & Truth-Layer Management

- FR28: Users can see whether the current parameter state is within, near the edge of, or outside the intended weak-coupling support envelope.
- FR29: Users can view heuristic validity guidance when the selected regime strains the model’s intended scope.
- FR30: Users can distinguish computed outputs from interpretive guidance within the product.
- FR31: Users can distinguish phenomenological or illustrative content from authoritative computed outputs.
- FR32: Users can access warnings or constrained-interpretation states instead of silent failure when the model becomes unreliable or ambiguous.
- FR33: Users can understand the trust status of the current result without relying on color or motion alone.
- FR34: Users can encounter persistent truth-status labeling across all relevant computed, interpretive, and phenomenological views.
- FR35: Users can see what action the product recommends when a state is unsupported, ambiguous, or outside the intended model envelope.

### Reproducibility, Export & Investigation

- FR36: Users can export the current reproducible session state of the explorer.
- FR37: Users can export the current scientific outputs associated with a session state.
- FR38: Users can export scientific plots for teaching, sharing, or review.
- FR39: Exported session data can preserve parameter values, units, warning or validity context, and the application version associated with the result.
- FR40: Maintainers or domain reviewers can restore or inspect a session state to reproduce what a user saw.
- FR41: Maintainers or domain reviewers can differentiate between a numerical issue, an unsupported regime, and a truth-layer communication issue when reviewing a reported problem.
- FR42: Users and maintainers can identify the application version associated with an exported or restored session state.

### Web Application Experience

- FR43: Users can access the core explorer through a desktop-first single-page web application.
- FR44: Users can interact with the explorer in a continuous stateful session without disruptive page transitions.
- FR45: Users can use the core controls of the application through keyboard interaction.
- FR46: Users can access labeled metrics, warnings, and scientific views in a way that does not depend solely on visual styling cues.
- FR47: Users can use the product with reduced-motion behavior for non-essential animated transitions where supported by the application.
- FR48: Users on partially supported browsers can still receive clear feedback when a capability is unavailable or degraded.
- FR49: Users can see the current application state remain coherent during loading, recomputation, invalid-input handling, and partial-failure conditions.

## Non-Functional Requirements

### Performance

- The application must acknowledge direct user interaction within `<100 ms` under normal supported use, including control response, visible state acknowledgment, and warning-state feedback.
- Core computed-output refresh and plot updates must complete within `<200 ms` for supported parameter states during normal interaction.
- If a full numerical recomputation exceeds the target window, the interface must remain interactive and must enter a visible updating state until refreshed results are ready.
- The product must never present stale computed results as final while updated results are pending.
- Failure to meet interactive responsiveness targets is release-blocking for MVP because the product’s educational value depends on fluid exploration.

### Reliability & Scientific Integrity

- The application must not silently degrade, fabricate continuity, or display misleading computed states when the solver cannot confidently produce a result.
- If the solver fails, does not converge, or enters an unsupported regime, the product must suppress misleading output updates and enter an explicit warning or invalid-result state instead.
- The application must distinguish successful computation, constrained interpretation, and failed computation as separate visible states.
- Exported session data must preserve failure, warning, and validity state so results remain interpretable in review, reproduction, and teaching reuse.
- Silent failure, silent fallback, or ambiguous trust-state presentation are release-blocking defects for MVP.

### Scalability

- MVP must support single-user exploratory sessions and moderate concurrent classroom or demo use without specialized scaling infrastructure.
- Scalability beyond moderate concurrent classroom or demo use is out of scope for MVP.
- The initial release should prioritize deterministic behavior, scientific trust, and interaction quality over premature scale optimization.

### Security & Data Handling

- MVP must require no account system and no backend persistence of user session data.
- The product must not silently transmit parameter states, outputs, exports, or behavioral telemetry to external services.
- Exported files must remain local and user-controlled unless the user explicitly initiates an export action.
- The MVP security stance is satisfied only if session data remains local by default and any outward data movement requires deliberate user action.

### Accessibility

- All primary controls must be keyboard operable.
- Text, controls, warnings, and status indicators must meet basic `WCAG AA` contrast expectations.
- The application must support reduced motion for non-essential animated transitions.
- Scientific visuals, metrics, and warnings must be clearly labeled so meaning is not conveyed by color, animation, or layout alone.
- Accessibility requirements apply to the explorer itself, not only to the landing or introduction surface.

### Scope Discipline

- Non-functional requirements for MVP must be limited to qualities that directly affect scientific trust, exploratory usability, and teaching reliability.
- The product must not take on non-essential infrastructure or platform-quality obligations that do not materially improve the proof-of-intuition release.
- Any future expansion of scale, persistence, or account-related quality requirements must be treated as post-MVP scope.
