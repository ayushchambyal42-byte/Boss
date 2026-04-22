# Story 2.1: Build Explorer Shell

Status: done

## Story

As a user, I want a continuous SPA experience so I can explore without losing session context.

FR Traceability: FR4, FR43, FR44

## Acceptance Criteria

1. The core explorer runs as a desktop-first single-page application.
2. Parameter state, computed state, validity state, and selected view stay available during exploration.
3. Moving between landing, guided entry, and explorer surfaces does not discard the active explorer context unless the user resets.
4. The implementation uses the locked SPA stack and project structure below.
5. Existing Streamlit files are not used as the MVP UI runtime.

## Locked Technology and Migration Contract

Target runtime:

- Frontend: `Vite + React + TypeScript`.
- Rendering model: client-only SPA.
- Backend: none for MVP.
- Persistence: in-memory only, except explicit local export actions in later stories.
- Routing: in-app view state is sufficient for MVP; do not add a routing framework unless later requirements demand it.
- Plotting: use local React/SVG or Canvas components for MVP plot surfaces unless a later architecture decision explicitly adds a plotting library.
- Test target: TypeScript unit/component tests for state behavior and shell transitions.

Existing repository stance:

- `bcs_solver.py` is a numerical reference/prototype and may inform the TypeScript solver implementation or be used for cross-checking, but it is not the production runtime for the SPA.
- `streamlit_app.py` is a legacy prototype. Do not extend it for MVP stories.
- `requirements.txt` belongs to the legacy prototype unless later retained for validation tooling.
- Do not delete legacy prototype files in this story; isolate new SPA files so review can compare prototype versus MVP implementation.

Required project structure:

```text
package.json
index.html
src/
  main.tsx
  App.tsx
  domain/
    bcs/
      constants.ts
      parameters.ts
      validation.ts
      metrics.ts
      gapSolver.ts
      types.ts
  state/
    explorerState.ts
  components/
    Shell/
      ExplorerShell.tsx
      LandingSurface.tsx
      GuidedEntry.tsx
    Controls/
    Metrics/
    Plots/
    Status/
  styles/
    tokens.css
    app.css
  test/
    setup.ts
```

Initial app views:

- `landing`: lightweight intro and entry actions.
- `guided`: guided transition entry surface.
- `explorer`: main continuous exploration surface.

Shared state must include:

- user-entered parameters,
- derived effective parameters,
- computed outputs placeholder,
- validity status,
- update status,
- selected app view.

State versioning rule:

- Every parameter change increments a state version.
- Async derived results must include the state version they were computed from.
- Results for older versions must not overwrite newer visible state.

Desktop-first rule:

- Primary layout targets `>= 1024px` width.
- Below `900px`, show a clear desktop-first/degraded-layout notice while keeping core content readable where practical.
- Do not implement a mobile-first redesign in MVP.

## Tasks / Subtasks

- [x] Scaffold `Vite + React + TypeScript` SPA using the required project structure. (AC: 1, 4)
- [x] Create `landing`, `guided`, and `explorer` app views using in-app view state. (AC: 1, 3)
- [x] Establish shared in-memory state for parameters, effective parameters, computed placeholders, validity, update status, and selected view. (AC: 2)
- [x] Implement state versioning so stale async results cannot overwrite newer state. (AC: 2)
- [x] Add desktop-first shell behavior and degraded-width notice. (AC: 1)
- [x] Leave Streamlit prototype files untouched and unused by the SPA runtime. (AC: 5)
- [x] Add shell/state tests for view transitions, context preservation, reset behavior, and stale-version rejection. (AC: 2-4)

## Dev Notes

- Architecture requires a stateful reactive exploration shell.
- No backend persistence or accounts in MVP.
- Keep landing and explorer concerns separate so SEO does not reshape the app shell.
- This story chooses the previously deferred app stack decision: `Vite + React + TypeScript`.
- Do not use Streamlit as the MVP UI. The Streamlit app is legacy reference only.
- Do not add post-MVP visual concepts or threshold interaction implementation in this shell story.

### References

- [Architecture](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/architecture.md)
- [UX](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/ux-design.md)

## Dev Agent Record

### Agent Model Used

### Debug Log References

- `npm run test:web`
- `npm run build`
- `npm run test:domain`
- `npm run test:validation`
- `npm test`
- `python3 -m py_compile bcs_solver.py streamlit_app.py`

### Completion Notes List

- Scaffolded the locked `Vite + React + TypeScript` SPA runtime with `index.html`, `src/main.tsx`, `src/App.tsx`, Vite config, and TypeScript config while leaving the legacy Streamlit files untouched.
- Added the required `landing`, `guided`, and `explorer` surfaces with in-app view state and no routing framework.
- Added a reducer-based `src/state/explorerState.ts` that preserves shared in-memory parameter, effective, validity, computed placeholder, update-status, and selected-view state.
- Implemented state versioning and stale-result rejection in the reducer so older async results cannot overwrite newer state.
- Added desktop-first shell behavior with a degraded-width notice below `900px`.
- Added TypeScript wrapper files under `src/domain/bcs/` to establish the locked SPA project structure without moving the validated JS scientific core.
- Added shell/state tests in `src/components/Shell/ExplorerShell.test.tsx` for view transitions, context preservation, reset behavior, degraded-width notice, and stale-version rejection.
- Resolved real frontend gate issues during validation: Vitest initially picked up the Node-domain suites, TypeScript import resolution collided with existing `.mjs` files, and the shell test had an ambiguous guided-entry query.

### File List

- `package.json`
- `index.html`
- `tsconfig.json`
- `tsconfig.node.json`
- `vite.config.ts`
- `src/main.tsx`
- `src/App.tsx`
- `src/domain/bcs/types.ts`
- `src/domain/bcs/constants.ts`
- `src/domain/bcs/parameters.ts`
- `src/domain/bcs/validation.ts`
- `src/domain/bcs/metrics.ts`
- `src/domain/bcs/gapSolver.ts`
- `src/state/explorerState.ts`
- `src/components/Shell/LandingSurface.tsx`
- `src/components/Shell/GuidedEntry.tsx`
- `src/components/Shell/ExplorerShell.tsx`
- `src/components/Shell/ExplorerShell.test.tsx`
- `src/components/Controls/ControlsPanel.tsx`
- `src/components/Metrics/MetricsPanel.tsx`
- `src/components/Plots/PlotPanel.tsx`
- `src/components/Status/StatusPanel.tsx`
- `src/styles/tokens.css`
- `src/styles/app.css`
- `src/test/setup.ts`
- `src/types/modules.d.ts`

## Change Log

- 2026-04-22: Completed Story 2.1 implementation and validation; pending review.
