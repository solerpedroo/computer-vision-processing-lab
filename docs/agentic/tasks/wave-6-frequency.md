# Task: `wave-6-frequency`

- **Status:** done
- **Wave:** 6 — Frequency domain (FFT)
- **Owner / role:** cv-implementer → cv-test-engineer → cv-reviewer
- **Operation IDs:** `frequency_spectrum`, `frequency_gaussian_lowpass`, `frequency_gaussian_highpass`
- **Depends on:** `wave-5-morphology`, ADR-004, implementation plan §5.6 FFT gate
- **Allowed files:** `backend/app/processing/frequency/`, registry, dispatcher, tests, `frontend/`, `docs/`, workboard

## Goal

Provide centered log-magnitude spectrum visualization and Gaussian LPF/HPF masks with
IFFT reconstruction, plus numerical tests for round-trip FFT and LPF vs spatial Gaussian MSE gate.

## Contract and conventions

Frequency operations require grayscale input. Spectrum output uses `output_kind: spectrum`.
LPF/HPF apply smooth Gaussian masks in the frequency domain (not ideal brick-wall cuts),
then inverse-transform to grayscale `uint8`. Display uses `fftshift` and log magnitude.

## Plan and acceptance criteria

- [x] Log magnitude spectrum operation registered and visualized in UI.
- [x] Gaussian low-pass and high-pass with IFFT reconstruction.
- [x] Round-trip FFT numerical test within documented tolerance.
- [x] LPF vs spatial Gaussian MSE gate (implementation plan §5.6).
- [x] Checkerboard / synthetic regression coverage in `test_frequency.py`.

## Non-goals

Separate `/api/frequency` route (uses unified `/api/process`), ideal HPF ringing tutorial,
GPU FFT, or compare/metrics endpoints (Wave 7).

## Evidence / handoff

Local verification recorded on 2026-10-13 (wave closure review):

- `.venv/bin/ruff check backend` — passed.
- `.venv/bin/pytest backend` — 31 passed (includes `test_frequency.py`).
- `cd frontend && npm run lint && npm run test` — passed.

Reviewer check: compare and export features not started. Task complete; no handoff.
