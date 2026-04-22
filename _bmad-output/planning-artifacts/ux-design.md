---
sourceDocuments:
  - /home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/prd.md
  - /home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/architecture.md
documentType: ux-design
project_name: bmad-test
date: 2026-04-21
---

# UX Design Specification

## UX Intent

The product should feel like a scientific lens, not a dashboard. The user must be able to see one state, perturb one constraint, and understand why the behavior stays forbidden or becomes disruptive. The interface should prioritize interpretation and trust over feature density.

## Interaction Principles

- One engine, one source of truth.
- Computed, interpretive, and phenomenological content remain visibly distinct.
- Exploration first, explanation attached directly to state.
- The gap is presented as a governing constraint, not only a metric.
- Unsupported or ambiguous states must educate rather than confuse.

## Primary User Flows

### First-Run Exploration

1. User lands on a lightweight intro page.
2. User enters the guided transition story.
3. User sees default parameter state, core metrics, and the main gap plot.
4. User changes one parameter and sees plot, metrics, and validity state update.
5. User tests the threshold interaction and observes sub-threshold versus disruptive behavior.
6. User exports the current state or continues free exploration.

### Instructor Demo Flow

1. Instructor opens a stable default state.
2. Instructor runs the guided transition sequence or a prepared state.
3. Instructor changes one or two parameters live.
4. Instructor exports the plot and reproducible state for teaching reuse.

### Error and Unsupported-State Flow

1. User enters or approaches an unsupported regime.
2. UI changes status from valid to constrained or invalid.
3. Plot/output area avoids fake continuity.
4. Warning explains what changed and what trust level remains.

## Information Architecture

## Landing Surface

- Product purpose and scope.
- Short explanation of weak-coupling BCS focus.
- Entry point into the explorer.

## Explorer Surface

- Parameter controls.
- Metric summary.
- Main gap plot.
- Threshold interaction panel.
- Validity/trust panel.
- Equations/explanation panel.
- Export actions.

## Default Explorer Layout

### Left Rail

- Model inputs.
- Reset to default.
- Validity status.

### Center

- Main gap plot and analytic comparison.
- Threshold interaction view below or adjacent to plot.

### Right Rail

- Metric cards.
- Explanation and truth-layer labels.
- Export actions.

## Content Rules

### Computed Content

- Primary visual emphasis.
- Persistent computed label.

### Interpretive Content

- Secondary explanatory emphasis.
- Must reference the current computed state.

### Phenomenological Content

- Persistent phenomenological label.
- Never styled as if it were the same truth level as the solver output.

## States

### Valid State

- Metrics and plots shown normally.
- Validity guidance confirms supported use.

### Updating State

- Existing content remains visible but clearly marked as updating.
- No new value is presented as final until computation completes.

### Constrained Interpretation State

- Results may still be shown, but guidance warns that model trust is reduced.

### Invalid or Failed State

- Misleading updates suppressed.
- Explicit warning shown.
- Export includes failure/validity state.

## Controls

- Keyboard-operable parameter inputs.
- Defined default parameter set.
- Clear units and labels.
- Reset action always available.

## Visualization Requirements

- One clean primary gap plot in MVP.
- Analytic comparison visible only where it helps interpretation.
- Threshold interaction visual must show forbidden versus disruptive response clearly.
- Post-MVP visual additions include pairing-window and richer conceptual views.

## Accessibility

- Keyboard navigation for all primary controls.
- WCAG AA contrast for text, controls, warnings, and labels.
- Reduced-motion option for non-essential animations.
- Plot-adjacent labels and warnings must not rely on color alone.

## Copy Guidance

- Use direct scientific language.
- Avoid theatrical claims about physical fidelity.
- Explain trust level explicitly when state becomes constrained or invalid.
- Distinguish “computed,” “interpretive,” and “phenomenological” in visible UI copy.

## UX Risks

- Too many simultaneous controls bury the intuition loop.
- Ambiguous labeling collapses trust layers.
- Visual richness without interpretive clarity turns the product into a demo instead of a scientific tool.

## Deferred UX Elements

- Mode-gated UI depth beyond MVP.
- Fermi-surface pairing window.
- Split amplitude-phase view.
- Twin-isotope coherence comparison.
