# Task: `wave-3-spatial-filtering`

- **Status:** done
- **Wave:** 3 — Spatial filtering
- **Owner / role:** cv-implementer → cv-test-engineer → cv-reviewer
- **Operation IDs:** spatial box, Gaussian, median, bilateral, sharpen, Laplacian
- **Depends on:** `wave-2-color-processing`, ADR-004

## Goal

Add six registry-backed RGB spatial filters with documented odd-kernel and sigma
constraints, reusing the existing client operation panel and timing display.

## Acceptance criteria

- [x] Box, Gaussian, median, bilateral, sharpening, and Laplacian filters.
- [x] Registry parameter validation including odd kernel sizes.
- [x] Synthetic invariant/noise/edge tests and timing evidence.
- [x] Documentation and Wave 3 completion record.

## Non-goals

Edge-detector module controls, frequency filters, compare mode, or GPU paths.

## Evidence / handoff

- `.venv/bin/ruff check backend` — passed.
- `.venv/bin/pytest backend` — 22 passed.
- `cd frontend && npm run lint && npm run test && npm run build` — passed.

Reviewer check: all filters retain RGB `uint8` boundaries, explicit edge modes,
and registry validation. No Wave 4 detector was added.
