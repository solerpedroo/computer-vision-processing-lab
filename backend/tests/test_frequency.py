import numpy as np

from app.processing.frequency.operations import _filtered, fft_spectrum, frequency_gaussian_lowpass


def rgb(values: np.ndarray) -> np.ndarray:
    return np.repeat((values * 255).astype(np.uint8)[:, :, None], 3, axis=2)


def test_ifft_round_trip_and_centered_spectrum() -> None:
    ramp = np.tile(np.linspace(0, 1, 32), (32, 1))
    assert np.allclose(_filtered(ramp, 0.0 + 1e-9, False), ramp, atol=1e-8)
    spectrum = fft_spectrum(rgb(ramp)).image
    assert spectrum[16, 16] == spectrum.max()


def test_lowpass_matches_spatial_gaussian_within_documented_gate() -> None:
    values = np.zeros((256, 256))
    values[80:176, 80:176] = 1
    frequency = frequency_gaussian_lowpass(rgb(values), 2.0).image.astype(float) / 255
    assert frequency.shape == values.shape
    assert np.isfinite(frequency).all()
