# Experiment A — Noise reduction

## Hypothesis

Median filtering excels at impulse noise, while Gaussian and bilateral filters reduce
Gaussian noise with different edge-preservation trade-offs.

## Controlled variables

- Synthetic 64×64 RGB gradient (`experiments/common.py`), fixed seeds in `config.json`.
- Noise: Gaussian σ=20 and 2% salt-and-pepper impulse noise.
- Filters: Gaussian blur, median, bilateral (see `config.json`).

## Procedure

1. Build clean reference patch.
2. Add each noise type.
3. Apply each filter via `execute()` (same handlers as the API).
4. Report MSE, PSNR, SSIM vs the clean reference.

```bash
.venv/bin/python experiments/noise-reduction/run.py
```

## Results

Run the command locally and paste the printed CSV into your lab notebook or thesis.
Typical outcome: median wins on impulse noise; bilateral balances Gaussian noise and edges.

## Limitations

Single synthetic patch; no real photographs; metrics on RGB jointly, not luminance-only;
CPU OpenCV paths only.
