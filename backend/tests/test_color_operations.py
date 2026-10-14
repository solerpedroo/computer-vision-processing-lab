import numpy as np
import pytest

from app.processing.color.operations import (
    color_brightness,
    color_channel_hsv,
    color_contrast,
    color_gamma,
    color_grayscale,
    color_hsv,
)
from app.processing.registry import validate_params


def test_grayscale_known_rgb_pixels_and_histogram_sum() -> None:
    image = np.array([[[255, 0, 0], [0, 255, 0]]], dtype=np.uint8)
    result = color_grayscale(image)

    assert result.image.shape == (1, 2)
    assert result.image.tolist() == [[76, 150]]
    histogram = result.aux["histogram"]
    assert sum(histogram["series"][0]["counts"]) == 2


def test_hsv_channel_uses_native_hue_values() -> None:
    image = np.array([[[255, 0, 0], [0, 255, 0]]], dtype=np.uint8)

    assert color_hsv(image).image.tolist() == [[[0, 255, 255], [60, 255, 255]]]
    assert color_channel_hsv(image, "hue").image.tolist() == [[0, 60]]


def test_brightness_clips_and_contrast_zero_becomes_mid_gray() -> None:
    image = np.array([[[250, 10, 128]]], dtype=np.uint8)

    assert color_brightness(image, 10).image.tolist() == [[[255, 20, 138]]]
    assert color_contrast(image, 0.0).image.tolist() == [[[128, 128, 128]]]


def test_gamma_is_monotonic_and_gamma_one_is_identity() -> None:
    image = np.array([[[0, 64, 255]]], dtype=np.uint8)
    identity = color_gamma(image, 1.0).image
    gamma = color_gamma(image, 0.5).image

    assert np.array_equal(identity, image)
    assert gamma[0, 0, 0] <= gamma[0, 0, 1] <= gamma[0, 0, 2]
    assert gamma[0, 0, 1] > image[0, 0, 1]


def test_registry_applies_defaults_and_rejects_invalid_color_params() -> None:
    assert validate_params("color_gamma", {}) == {"gamma": 1.0}
    with pytest.raises(ValueError, match="between"):
        validate_params("color_gamma", {"gamma": 4.0})
    with pytest.raises(ValueError, match="one of"):
        validate_params("color_channel_rgb", {"channel": "hue"})
