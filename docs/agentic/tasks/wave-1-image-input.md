# Task: `wave-1-image-input`

- **Status:** done
- **Wave:** 1 — Image input & visualization
- **Owner / role:** cv-planner → cv-implementer → cv-test-engineer → cv-reviewer
- **Operation IDs:** `color_noop`
- **Depends on:** `wave-0-contract-baseline`, ADR-004, ADR-005
- **Allowed files:** `backend/`, `frontend/`, `docs/api-contract.md`,
  `docs/architecture.md`, this task card, and the workboard.

## Goal

Provide the first end-to-end, stateless image-processing path: a user selects a
real PNG or JPEG, the API validates and normalizes it, the `color_noop` operation
returns a PNG, and the UI shows original and processed images with metadata,
zoom, reset, and download.

## Contract and conventions

Input transport is multipart: `image` is the uploaded file and `operation_id`
is `color_noop`. Only actual PNG/JPEG magic bytes are accepted. Decoded images
follow ADR-004. `processing_ms` measures the identity handler only, while
`request_ms` includes transport, decode, encode, and handling. No upload is
persisted.

## Plan and acceptance criteria

- [x] Add byte, dimension, and magic-byte validation plus RGB decode/PNG encode.
- [x] Register pure `color_noop` identity processing and enforce registry drift checks.
- [x] Implement `POST /api/process` with clear client errors and separate timing fields.
- [x] Add original/processed views, drag-drop/file input, metadata, zoom, reset, and download.
- [x] Test valid PNG/JPEG, invalid bytes, size/dimension rejection, noop behavior, and metadata parsing.
- [x] Update API/architecture docs and record exact verification evidence.

## Tests and commands

```bash
.venv/bin/ruff check backend
.venv/bin/pytest backend
cd frontend && npm ci && npm run lint && npm run test && npm run build
```

## Non-goals

Sample gallery, persistent image history, color transformations, histograms,
parameter controls, authentication, and any Wave 2+ algorithms.

## Evidence / handoff

Local verification completed on 2026-10-13:

- `.venv/bin/ruff check backend` — passed.
- `.venv/bin/pytest backend` — 11 passed.
- `cd frontend && npm run lint && npm run test && npm run build` — passed;
  frontend suite: 2 files, 3 tests passed.
- Manual API smoke test with Uvicorn confirmed `GET /api/health` and
  `GET /api/operations`, including the `color_noop` registry entry.

Reviewer check: implementation is confined to the Wave 1 identity pipeline.
There is no sample gallery, color transform, histogram, persistent upload, or
future-wave endpoint. No handoff is required because the task is complete.
