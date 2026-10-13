# Task: `wave-0-contract-baseline`

- **Status:** done
- **Wave:** 0 — Foundation & agentic toolchain
- **Owner / role:** cv-planner → cv-implementer
- **Operation IDs:** none (empty registry baseline only)
- **Depends on:** ADR-001, ADR-002, ADR-003
- **Allowed files:** `backend/`, `frontend/`, `docs/architecture.md`,
  `docs/api-contract.md`, `.github/`, `docker-compose.yml`, this task card, and
  the workboard. Do not implement product operations.

## Goal

Establish the smallest executable monorepo foundation and record the conventions
that every future CV operation needs. This is the first product-code task; it
must not absorb Wave 1 upload or color processing work.

## Contract and conventions

Before writing a processor, add an ADR selecting the canonical in-memory image
convention (color order, dtype/range, and alpha policy) and a documented primary
request transport (multipart or base64). The empty registry, handler boundary,
health endpoint, and `GET /api/operations` must agree with that contract.

## Plan and acceptance criteria

- [x] Select and record image and transport conventions in ADR-004.
- [x] Add minimal FastAPI health and empty operations-registry endpoints.
- [x] Add minimal Next.js shell and typed API-client boundary without M01 UI.
- [x] Configure Ruff/pytest and ESLint/Vitest smoke checks.
- [x] Add CI skeleton and reproducible local commands.
- [x] Verify the registry/dispatcher drift test works with the empty baseline.
- [x] Update `docs/architecture.md` and `docs/api-contract.md`.

## Tests and commands

```bash
python -m venv .venv
.venv/bin/python -m pip install -e "./backend[dev]"
.venv/bin/ruff check backend
.venv/bin/pytest backend

cd frontend && npm ci
npm run lint
npm run test
npm run build
```

## Non-goals

No upload processing, image persistence, sample assets, registry operation,
color conversion, or full visual lab layout. Those begin in Wave 1 and Wave 2.

## Evidence / handoff

Local verification completed on 2026-10-13:

- `.venv/bin/ruff check backend` — passed.
- `.venv/bin/pytest backend` — 2 passed.
- `frontend/npm ci`, `npm run lint`, `npm run test`, and `npm run build` — passed.
- The registry remains intentionally empty; the drift assertion is exercised by
  `backend/tests/test_registry.py`.

Reviewer check: the diff remains within Wave 0. It adds no image upload,
processor, sample, or Wave 1 UI. No handoff is required because the task is
complete.
