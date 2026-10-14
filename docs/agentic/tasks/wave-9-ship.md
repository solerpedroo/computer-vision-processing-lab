# Task: `wave-9-ship`

- **Status:** done
- **Wave:** 9 — Hardening, E2E, deploy, portfolio
- **Depends on:** `wave-8-experiment-export`

## Goal

Ship MVP-quality tooling: Playwright happy path, deploy artifacts, portfolio README,
acceptance checklist, demo storyboard.

## Acceptance criteria

- [x] Playwright: upload → process → timing visible → download link present.
- [x] `backend/Dockerfile` + `docker-compose.yml` for Railway/local API.
- [x] `docs/deploy.md` (Vercel + Railway env vars).
- [x] `docs/demo-storyboard.md`, `docs/mvp-acceptance.md`.
- [x] CI job `e2e` on GitHub Actions.
- [x] README portfolio sections (architecture, deploy, quality commands).

## Evidence

2026-10-13:

- `cd frontend && npm run test:e2e` — passed (with Playwright browsers installed).
- `pytest backend` — passed.
- `npm run lint && npm run test && npm run build` — passed.

MVP gate complete per `docs/mvp-acceptance.md`.
