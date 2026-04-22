# Story 5.1: Build Lightweight Landing Surface

Status: done

## Story

As a first-time user, I want a short introduction that tells me what the product is for and routes me into the explorer.

FR Traceability: FR26

## Acceptance Criteria

1. Landing surface states that the product is a weak-coupling BCS explorer, not a general superconductivity simulator.
2. Landing surface routes users into guided entry or the explorer.
3. Landing content is lightweight and does not reshape the SPA around SEO needs.

## Tasks / Subtasks

- [x] Build lightweight landing/intro surface. (AC: 1, 2)
- [x] Add concise product scope and weak-coupling positioning copy. (AC: 1)
- [x] Route users into guided entry or explorer. (AC: 2)
- [x] Keep SEO/discovery concerns isolated from core SPA shell. (AC: 3)

## Dev Notes

- SEO is minimal and applies only to landing/introduction.
- Do not imply this is a general superconductivity simulator.

### References

- [PRD](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/prd.md)
- [UX](/home/ayushchambyal/projects/bmad-test/_bmad-output/planning-artifacts/ux-design.md)

## Dev Agent Record

### Agent Model Used

gpt-5

### Debug Log References

### Completion Notes List

- Reworked the landing surface copy so it explicitly frames the product as a weak-coupling BCS explorer and explicitly rejects the broader “general superconductivity simulator” framing.
- Kept the landing surface lightweight and route-oriented: it introduces scope, then hands off directly to guided entry or the explorer without adding platform or SEO-heavy structure.
- Added a landing-surface regression test covering scope copy and the two route actions.
- Validation passed: `npm run test:web`, `npm test`, `npm run test:validation`, `npm run build`, `python3 -m py_compile bcs_solver.py streamlit_app.py`.

### File List

- src/components/Shell/LandingSurface.tsx
- src/components/Shell/ExplorerShell.test.tsx
