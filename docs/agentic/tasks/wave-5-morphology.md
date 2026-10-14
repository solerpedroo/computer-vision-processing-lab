# Task: `wave-5-morphology`

- **Status:** done
- **Wave:** 5 — Thresholding & morphology
- **Owner / role:** cv-implementer → cv-test-engineer → cv-reviewer
- **Operation IDs:** `morph_binary_threshold`, `morph_adaptive_threshold`, `morph_otsu_threshold`, `morph_erode`, `morph_dilate`, `morph_opening`, `morph_closing`
- **Depends on:** `wave-4-edge-detection`, ADR-004
- **Allowed files:** `backend/app/processing/morphology/`, registry, dispatcher, schemas, routes, `frontend/`, `docs/`, workboard

## Goal

Deliver thresholding and morphological operators with binary mask outputs, odd
structuring-element validation, and connected-component counts exposed in API metadata.

## Contract and conventions

Threshold operations require grayscale input (`requires_grayscale: true` in registry).
Binary masks use `output_kind: mask`. `metadata.connected_components` is populated for
binary mask results after morphology/threshold. Kernel sizes must be odd.

## Plan and acceptance criteria

- [x] Binary, adaptive, and Otsu threshold operations.
- [x] Erosion, dilation, opening, and closing with configurable kernel size.
- [x] Connected components count in `ProcessResponse.metadata`.
- [x] Frontend displays component count when present.
- [x] pytest coverage for Otsu, adaptive params, and component counting.

## Non-goals

Contour tracing, OCR, frequency analysis, compare mode, or persistent masks.

## Evidence / handoff

Local verification recorded on 2026-10-13 (wave closure review):

- `.venv/bin/ruff check backend` — passed.
- `.venv/bin/pytest backend` — 31 passed (includes morphology suite).
- `cd frontend && npm run lint && npm run test` — passed.

Reviewer check: frequency handlers not introduced. Task complete; no handoff.
