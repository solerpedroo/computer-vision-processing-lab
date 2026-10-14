# Computer Vision Processing Lab

An experimental web platform for learning and comparing classical digital image
processing algorithms. Its planned stack is Next.js/TypeScript on the frontend
and FastAPI/OpenCV/NumPy on the backend.

## Project status

**Waves 0–7 are complete** through algorithm comparison and metrics. The lab supports
registry-driven processing via `POST /api/process`, dual-run `POST /api/compare`, and
reference metrics via `POST /api/metrics`, with a **Compare** mode in the UI.
Next: Wave 8 experiment export. See [`docs/agentic/workboard.md`](docs/agentic/workboard.md).

## Read first

- [Project scope](docs/project-scope.md) — product, scientific, and technical requirements.
- [Implementation plan](docs/implementation-plan.md) — waves, contracts, acceptance gates, and delivery order.
- [Agent entrypoint](AGENTS.md) — required workflow for humans and coding agents.
- [Agentic workboard](docs/agentic/workboard.md) — current task state.

## Intended modules

Image input and visualization; color spaces and histograms; spatial filters;
edge detection; thresholding and morphology; FFT analysis; algorithm comparison;
and reproducible experiment export (Wave 8+).

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
