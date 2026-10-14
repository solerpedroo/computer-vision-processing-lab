# Computer Vision Processing Lab

Interactive web lab for **classical digital image processing**: color spaces,
spatial filters, edge detection, morphology, FFT analysis, algorithm comparison,
and reproducible experiment export.

**Stack:** Next.js (TypeScript) · FastAPI · OpenCV · NumPy  
**Status:** MVP complete (waves 0–9). See [`docs/mvp-acceptance.md`](docs/mvp-acceptance.md).

## Live demo

Deploy the frontend to Vercel and the API to Railway using [`docs/deploy.md`](docs/deploy.md).
Set `NEXT_PUBLIC_API_URL` to your Railway service URL.

<!-- Replace with your deployed URL when published -->
<!-- **Demo:** https://your-app.vercel.app -->

## Features

- Registry-driven operations with validated parameters (`GET /api/operations`)
- Multipart image processing with separate **processing** vs **request** timing
- Compare two algorithms on the same upload with PSNR / SSIM / MSE
- Export experiment JSON, CSV metrics, and PNG snapshots; import JSON to restore config
- CLI studies under [`experiments/`](experiments/README.md) reusing the same Python handlers

## Architecture

```text
Browser (Next.js)  →  /api/*  →  FastAPI routes  →  dispatcher  →  pure OpenCV/NumPy
                         ↑
              registry.yaml (single source of operation definitions)
```

Details: [`docs/architecture.md`](docs/architecture.md) · API: [`docs/api-contract.md`](docs/api-contract.md)

## Quick start

**Requirements:** Python 3.11+, Node 24+

```bash
python -m venv .venv
.venv/bin/python -m pip install -e "./backend[dev]"

# Terminal 1 — API
.venv/bin/uvicorn app.main:app --app-dir backend --reload --port 8000

# Terminal 2 — UI
cd frontend
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:8000
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Optional API-only container:

```bash
docker compose up --build
```

## Quality checks

```bash
.venv/bin/ruff check backend
.venv/bin/pytest backend
cd frontend && npm run lint && npm run test && npm run build
cd frontend && npx playwright install chromium && npm run test:e2e
```

CI runs backend, frontend unit tests, and Playwright on GitHub Actions.

## Documentation map

| Document | Purpose |
|----------|---------|
| [`docs/project-scope.md`](docs/project-scope.md) | Product and scientific scope |
| [`docs/implementation-plan.md`](docs/implementation-plan.md) | Delivery waves |
| [`docs/deploy.md`](docs/deploy.md) | Vercel + Railway |
| [`docs/demo-storyboard.md`](docs/demo-storyboard.md) | Short demo video outline |
| [`AGENTS.md`](AGENTS.md) | Multi-agent development protocol |

## License

Portfolio / academic use — add a license file before public redistribution if required.
