import numpy as np
import pytest

from app.processing.edges.operations import canny, prewitt, sobel_x, sobel_y


def step(vertical: bool) -> np.ndarray:
    image = np.zeros((16, 16, 3), dtype=np.uint8)
    if vertical:
        image[:, 8:] = 255
    else:
        image[8:, :] = 255
    return image


def test_sobel_orientation_peaks_on_matching_step() -> None:
    assert sobel_x(step(True), 3).image.max() > 0
    assert sobel_y(step(False), 3).image.max() > 0
    assert prewitt(step(True)).image.max() > 0


def test_canny_is_binary_and_rejects_reversed_thresholds() -> None:
    edges = canny(step(True), 50, 150).image
    assert set(np.unique(edges)).issubset({0, 255})
    with pytest.raises(ValueError, match="less"):
        canny(step(True), 150, 50)
