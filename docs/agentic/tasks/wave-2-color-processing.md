# Task: `wave-2-color-processing`

- **Status:** done
- **Wave:** 2 — Color space processing
- **Owner / role:** cv-planner → cv-implementer → cv-test-engineer → cv-reviewer
- **Operation IDs:** color grayscale, HSV/LAB, channels, brightness, contrast, gamma
- **Depends on:** `wave-1-image-input`, ADR-004, ADR-006
- **Allowed files:** `backend/`, `frontend/`, `docs/`, this task card, and workboard.

## Goal

Add registry-driven color operations and histograms to the existing image lab.

## Contract and conventions

All processors receive RGB `uint8`. HSV and Lab remain native OpenCV component
arrays in the processing result; their PNG previews are explicitly labelled as
component encodings, while the chart and channel operations retain native values.
Parameters are form-encoded JSON and validated from the registry.

## Acceptance criteria

- [x] RGB → grayscale, HSV, LAB, all RGB/HSV/LAB channel views, brightness, contrast, and gamma.
- [x] Registry-backed parameter controls and server-side range/enum validation.
- [x] Plotly histogram with labelled intensity or native channel series.
- [x] Synthetic pixel, monotonicity, histogram-sum, and invalid-parameter tests.
- [x] Architecture/API documentation and verification evidence.

## Non-goals

Spatial filters, edges, masks, compare mode, persistence, and user-configurable
histogram bin counts.

## Evidence / handoff

Local verification completed on 2026-10-13:

- `.venv/bin/ruff check backend` — passed.
- `.venv/bin/pytest backend` — 18 passed.
- `cd frontend && npm run lint && npm run test && npm run build` — passed;
  frontend suite: 2 files, 3 tests passed.

Reviewer check: operations retain ADR-004 image boundaries and ADR-006 preview
labelling. The generic parameter path is validated through multipart integration
tests. No Wave 3 filter or edge functionality was introduced.
