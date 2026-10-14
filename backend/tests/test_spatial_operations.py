import numpy as np
import pytest

from app.processing.registry import validate_params
from app.processing.spatial.operations import (
    spatial_bilateral_filter,
    spatial_box_filter,
    spatial_gaussian_blur,
    spatial_laplacian,
    spatial_median_filter,
    spatial_sharpen,
)


def test_smoothing_filters_preserve_a_constant_rgb_image() -> None:
    image = np.full((9, 9, 3), 120, dtype=np.uint8)

    for result in (
        spatial_box_filter(image, 3),
        spatial_gaussian_blur(image, 3, 1.0),
        spatial_median_filter(image, 3),
        spatial_bilateral_filter(image, 3, 20.0, 20.0),
    ):
        assert np.array_equal(result.image, image)


def test_gaussian_reduces_impulse_peak_and_median_removes_it() -> None:
    image = np.zeros((9, 9, 3), dtype=np.uint8)
    image[4, 4] = 255

    assert spatial_gaussian_blur(image, 3, 1.0).image[4, 4, 0] < 255
    assert spatial_median_filter(image, 3).image[4, 4, 0] == 0


def test_sharpen_amount_zero_is_identity_and_laplacian_finds_step() -> None:
    image = np.zeros((9, 9, 3), dtype=np.uint8)
    image[:, 5:] = 255

    assert np.array_equal(spatial_sharpen(image, 0.0).image, image)
    assert spatial_laplacian(image, 3).image[:, 4:6].max() > 0


def test_odd_kernel_rules_are_enforced_by_registry_and_processor() -> None:
    image = np.zeros((5, 5, 3), dtype=np.uint8)
    with pytest.raises(ValueError, match="odd"):
        validate_params("spatial_box_filter", {"kernel_size": 4})
    with pytest.raises(ValueError, match="odd"):
        spatial_box_filter(image, 4)
