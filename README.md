# Computer Vision Processing Lab

An experimental web platform for learning and comparing classical digital image
processing algorithms. Its planned stack is Next.js/TypeScript on the frontend
and FastAPI/OpenCV/NumPy on the backend.

## Project status

The repository is intentionally at the **agentic-foundation gate**. Product code
has not started: the next approved implementation step is Wave 0, as described
in the delivery plan. This keeps a multi-agent implementation aligned before
the frontend, API, and numerical code begin to diverge.

## Read first

- [Project scope](docs/project-scope.md) — product, scientific, and technical requirements.
- [Implementation plan](docs/implementation-plan.md) — waves, contracts, acceptance gates, and delivery order.
- [Agent entrypoint](AGENTS.md) — required workflow for humans and coding agents.
- [Agentic workboard](docs/agentic/workboard.md) — current task state.

## Intended modules

Image input and visualization; color spaces and histograms; spatial filters;
edge detection; thresholding and morphology; FFT analysis; algorithm comparison;
and reproducible experiment export. Wave 1 is implemented: upload a PNG/JPEG to
validate the full identity-processing path before selecting a real operation.

## Multi-agent workflow

Work proceeds as **Planner → Implementer → Test Engineer → Reviewer**. Durable
task cards, architecture decisions, and factual handoffs preserve context across
agents. See [`AGENTS.md`](AGENTS.md) and [`docs/agentic/`](docs/agentic/).

## Local development

The Wave 0 shell runs with Python 3.11+ and Node 24+:

```bash
python -m venv .venv
.venv/bin/python -m pip install -e "./backend[dev]"
.venv/bin/uvicorn app.main:app --app-dir backend --reload
```

In another terminal:

```bash
cd frontend
cp .env.example .env.local
npm ci
npm run dev
```

Run the full checks with `ruff check backend`, `pytest backend`, `npm run lint`,
`npm run test`, and `npm run build` (the last three from `frontend/`).
