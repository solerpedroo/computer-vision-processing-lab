import numpy as np


def mse(reference: np.ndarray, candidate: np.ndarray) -> float:
    """Mean squared error for equally shaped uint8 images, normalized to [0, 1]."""
    _same_shape(reference, candidate)
    return float(np.mean(((reference.astype(np.float64) - candidate) / 255.0) ** 2))


def psnr(reference: np.ndarray, candidate: np.ndarray) -> float:
    error = mse(reference, candidate)
    return float("inf") if error == 0 else float(10 * np.log10(1 / error))


def ssim(reference: np.ndarray, candidate: np.ndarray) -> float:
    """Global SSIM approximation on normalized luminance; exact 1 for equal arrays."""
    _same_shape(reference, candidate)
    x = reference.astype(np.float64) / 255
    y = candidate.astype(np.float64) / 255
    ux, uy, vx, vy = x.mean(), y.mean(), x.var(), y.var()
    cov = np.mean((x - ux) * (y - uy))
    numerator = (2 * ux * uy + 0.01**2) * (2 * cov + 0.03**2)
    denominator = (ux**2 + uy**2 + 0.01**2) * (vx + vy + 0.03**2)
    return float(numerator / denominator)


def _same_shape(first: np.ndarray, second: np.ndarray) -> None:
    if first.shape != second.shape:
        raise ValueError("Metric images must have the same shape.")
