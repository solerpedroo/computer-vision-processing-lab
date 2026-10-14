# Experiment B — Edge detection

## Hypothesis

Gradient-based operators (Sobel, Prewitt) remain stable on smooth gradients, while
Canny yields sparser binary maps and Laplacian is more noise-sensitive.

## Controlled variables

- RGB gradient patch; optional Gaussian noise σ=15.
- Operators and Canny thresholds in `config.json`.

## Procedure

1. Run detectors on clean and noisy inputs.
2. Report edge-density proxy (fraction of pixels > 127) and `processing_ms`.

```bash
.venv/bin/python experiments/edge-detection/run.py
```

## Results

Record stdout tables when executing locally. Expect higher edge density on noisy inputs
for Sobel/Prewitt; Canny density depends strongly on thresholds.

## Limitations

No ground-truth edge maps; density proxy is not Precision/Recall; grayscale internal
conversion only.
