# Experiment C — Frequency filtering

## Hypothesis

Smooth Gaussian LPF masks in the frequency domain approximate spatial Gaussian blur
with low MSE; high-pass responses emphasize fine structure and can show ringing near
sharp transitions when σ is small.

## Controlled variables

- Grayscale conversion of the standard gradient patch.
- σ ∈ {1, 2, 4} for both frequency Gaussian LPF/HPF and spatial Gaussian blur (kernel 5).

## Procedure

1. Compare frequency LPF reconstruction to spatial Gaussian output (MSE/SSIM).
2. Report mean intensity of HPF output as a simple high-frequency energy proxy.

```bash
.venv/bin/python experiments/frequency-filtering/run.py
```

## Results

Fill in after running locally. LPF MSE should stay within the Wave 6 gate order of
magnitude; HPF mean intensity rises as σ decreases.

## Limitations

Single patch; spatial comparison uses RGB Gaussian on stacked grayscale; no visual
ringing figures committed to git (generate locally).
