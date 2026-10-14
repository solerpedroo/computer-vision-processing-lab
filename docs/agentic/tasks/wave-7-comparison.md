# Task: `wave-7-comparison`

- **Status:** done
- **Wave:** 7 — Algorithm comparison & metrics
- **Owner / role:** cv-implementer → cv-test-engineer → cv-reviewer
- **Depends on:** `wave-6-frequency`, `backend/app/metrics/image.py`
- **Allowed files:** API routes/schemas, metrics, frontend compare UI, docs

## Goal

Run two registry-backed configurations on the same upload, show side-by-side outputs
and timings, and compute PSNR/SSIM/MSE against the uploaded reference image.

## Contract and conventions

- `POST /api/compare` — multipart: `image`, `operation_a`, `operation_b` (JSON objects with `operation_id` and optional `params`).
- `POST /api/metrics` — multipart: `reference_image`, `candidate_image`; equal shapes required.
- PSNR is JSON `null` when images are identical (infinite PSNR).
- Each compare arm exposes its own `processing_ms`; response includes total `request_ms`.

## Plan and acceptance criteria

- [x] Pure MSE, PSNR, SSIM in `backend/app/metrics/image.py`.
- [x] `POST /api/compare` with dual outputs and timing fields.
- [x] `POST /api/metrics` wired to metric primitives.
- [x] Frontend **Compare** mode: operation A/B, triple viewer, metrics table vs upload.
- [x] `test_compare.py`, `test_metrics_api.py`, API client tests.
- [x] API contract and architecture updated.

## Tests and commands

```bash
.venv/bin/ruff check backend
.venv/bin/pytest backend
cd frontend && npm run lint && npm run test && npm run build
```

## Non-goals

Batch benchmarks, experiment export (Wave 8), Playwright E2E (Wave 9).

## Evidence / handoff

Local verification on 2026-10-13:

- `.venv/bin/ruff check backend` — passed.
- `.venv/bin/pytest backend` — 35 passed.
- `cd frontend && npm run lint && npm run test && npm run build` — passed (4 tests).

Reviewer check: Wave 8 export not started. Task complete; no handoff.
