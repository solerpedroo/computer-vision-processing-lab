# Task: `wave-4-edge-detection`

- **Status:** done
- **Wave:** 4 — Edge detection
- **Owner / role:** cv-implementer → cv-test-engineer → cv-reviewer
- **Operation IDs:** `edge_sobel_x`, `edge_sobel_y`, `edge_sobel_magnitude`, `edge_prewitt`, `edge_laplacian`, `edge_canny`
- **Depends on:** `wave-3-spatial-filtering`, ADR-004
- **Allowed files:** `backend/app/processing/edges/`, registry, dispatcher, `frontend/`, `docs/`, workboard

## Goal

Add registry-backed grayscale edge operators with binary Canny output and validated
threshold ordering, reusing the existing operation panel and timing display.

## Contract and conventions

Processors receive RGB `uint8` and convert to grayscale internally. Non-Canny outputs
are absolute magnitude maps in `[0, 255]`. Canny returns `{0, 255}` with `threshold1`
≤ `threshold2` enforced at validation and processing boundaries.

## Plan and acceptance criteria

- [x] Sobel X/Y/magnitude, Prewitt, Laplacian, and Canny registered and wired.
- [x] Canny dual thresholds from registry with rejection of invalid pairs.
- [x] Synthetic gradient and parameter rejection tests.
- [x] UI module filter includes edge operations.
- [x] Architecture documentation for edge layer.

## Non-goals

Morphology, frequency domain, compare workflow, or learned detectors.

## Evidence / handoff

Local verification recorded on 2026-10-13 (wave closure review):

- `.venv/bin/ruff check backend` — passed.
- `.venv/bin/pytest backend` — 31 passed (includes edge suite).
- `cd frontend && npm run lint && npm run test` — passed (2 files, 3 tests).

Reviewer check: no morphology or FFT handlers added in this wave. Task complete; no handoff.
