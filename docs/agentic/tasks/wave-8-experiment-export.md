# Task: `wave-8-experiment-export`

- **Status:** done
- **Wave:** 8 — Experiment export & scientific studies
- **Owner / role:** cv-implementer → cv-test-engineer → cv-reviewer
- **Depends on:** `wave-7-comparison`
- **Allowed files:** `frontend/lib/experiment.ts`, `experiments/`, docs, workboard

## Goal

Export reproducible experiment records (JSON, CSV, PNG) from the UI, import JSON to
restore configuration, and document three CLI studies aligned with scope §6.

## Plan and acceptance criteria

- [x] Client-side experiment record schema v1 (process + compare modes).
- [x] Export bundle: JSON ficha, CSV metrics/timing, PNG downloads.
- [x] Import JSON restores mode, operations, and parameters (image re-upload required).
- [x] `experiments/noise-reduction`, `edge-detection`, `frequency-filtering` with README + `run.py`.
- [x] `test_experiment_cli.py` smoke for noise-reduction runner.
- [x] Vitest coverage for JSON round-trip and metrics CSV.

## Evidence / handoff

2026-10-13:

- `.venv/bin/pytest backend` — 36 passed.
- `cd frontend && npm run lint && npm run test && npm run build` — passed (6 tests).

Next: Wave 9 hardening, E2E, deploy.
