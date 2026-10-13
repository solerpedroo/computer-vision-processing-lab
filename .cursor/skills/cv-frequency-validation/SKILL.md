---
name: cv-frequency-validation
description: Validates FFT, IFFT, spectra, and frequency filters in Computer Vision Processing Lab. Use for Wave 6 frequency-domain work, numerical regressions, or reviewing spectral results.
---

# Frequency-domain validation

Read the Wave 6 acceptance gate in `docs/implementation-plan.md` and the ADRs
before changing code or tolerances.

## Required conventions

- Convert to a documented grayscale float pipeline before FFT.
- State normalization range, padding/window policy, and `fftshift` placement.
- Compute display magnitude with a documented log transform and finite-value
  handling; presentation scaling must not affect reconstruction data.
- Build masks in shifted frequency coordinates and apply the inverse shift before
  IFFT when required by the implementation.
- Return real reconstructed values only after checking the imaginary residual;
  clip/convert only at output encoding.

## Minimum evidence

- IFFT(FFT(x)) reconstructs a small ramp and a checkerboard within a documented tolerance.
- Spectrum centering is checked on a synthetic periodic pattern.
- Low-pass behavior is checked against a spatial Gaussian with matching,
  documented parameters; use the Wave 6 MSE gate on the normalized test patch.
- Tests explain edge/padding differences and demonstrate that an ideal cutoff
  can ring. Do not use pixel-perfect encoded-image snapshots for float paths.
