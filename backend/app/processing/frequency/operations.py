import numpy as np

from app.processing.models import ProcessResult


def _gray_float(image: np.ndarray) -> np.ndarray:
    if image.ndim != 3 or image.shape[2] != 3 or image.dtype != np.uint8:
        raise ValueError("Frequency operations require an RGB uint8 image.")
    return (0.299 * image[:, :, 0] + 0.587 * image[:, :, 1] + 0.114 * image[:, :, 2]) / 255.0


def _spectrum(values: np.ndarray) -> np.ndarray:
    shifted = np.fft.fftshift(np.fft.fft2(values))
    magnitude = np.log1p(np.abs(shifted))
    if not magnitude.max():
        return np.zeros_like(values, dtype=np.uint8)
    return np.clip(magnitude / magnitude.max() * 255, 0, 255).astype(np.uint8)


def _gaussian_mask(shape: tuple[int, int], sigma: float) -> np.ndarray:
    rows, cols = shape
    y, x = np.ogrid[-rows // 2 : rows - rows // 2, -cols // 2 : cols - cols // 2]
    return np.exp(-2 * np.pi**2 * sigma**2 * ((x / cols) ** 2 + (y / rows) ** 2))


def _filtered(values: np.ndarray, sigma: float, high_pass: bool) -> np.ndarray:
    mask = _gaussian_mask(values.shape, sigma)
    if high_pass:
        mask = 1 - mask
    restored = np.fft.ifft2(np.fft.ifftshift(np.fft.fftshift(np.fft.fft2(values)) * mask))
    if np.abs(restored.imag).max() > 1e-10:
        raise ValueError("Unexpected IFFT imaginary residual.")
    return restored.real


def fft_spectrum(image: np.ndarray) -> ProcessResult:
    """Centered log-magnitude FFT spectrum of normalized grayscale input."""
    return ProcessResult(
        image=_spectrum(_gray_float(image)), metadata={"output_color_space": "Grayscale"}
    )


def frequency_gaussian_lowpass(image: np.ndarray, sigma: float) -> ProcessResult:
    """Gaussian frequency low-pass; sigma maps to spatial Gaussian sigma in pixels."""
    output = _filtered(_gray_float(image), sigma, False)
    return ProcessResult(
        image=np.clip(output * 255, 0, 255).astype(np.uint8),
        metadata={"output_color_space": "Grayscale"},
    )


def frequency_gaussian_highpass(image: np.ndarray, sigma: float) -> ProcessResult:
    """Gaussian frequency high-pass, reconstructed with IFFT then display-normalized."""
    output = _filtered(_gray_float(image), sigma, True)
    display = np.clip((output + 0.5) * 255, 0, 255).astype(np.uint8)
    return ProcessResult(image=display, metadata={"output_color_space": "Grayscale"})
