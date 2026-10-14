# MVP acceptance checklist (scope §9)

Verified for Wave 9 release. Evidence: automated tests + manual smoke.

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Valid upload and original visualization | done | Wave 1; Playwright `process-flow.spec.ts` |
| Main modules with configurable parameters | done | Registry modules color–frequency; UI operation panel |
| FFT spectrum correct | done | `frequency_spectrum`; `test_frequency.py` |
| IFFT reconstruction within tolerance | done | Wave 6 numerical gate in `test_frequency.py` |
| Two-algorithm comparison | done | `/api/compare`; Compare UI |
| PSNR, SSIM, MSE with reference | done | `/api/metrics`; compare metrics table |
| Export results and parameters | done | Wave 8 export bundle + import JSON |
| Automated tests on main algorithms | done | `pytest backend` (36+); module tests per wave |
| Three documented experiments | done | `experiments/noise-reduction`, `edge-detection`, `frequency-filtering` |
| README, install, examples | done | Root README + `docs/deploy.md` + `experiments/` |

**Explicit non-goals (scope §8):** video/webcam, multi-filter DAG, ROI tools, GPU benchmark — not implemented.
