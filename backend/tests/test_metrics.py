import numpy as np

from app.metrics.image import mse, psnr, ssim


def test_identical_images_have_perfect_metrics() -> None:
    image = np.full((4, 4, 3), 127, dtype=np.uint8)
    assert mse(image, image) == 0
    assert psnr(image, image) == float("inf")
    assert ssim(image, image) == 1.0


def test_metrics_degrade_for_different_images() -> None:
    assert mse(np.zeros((4, 4), dtype=np.uint8), np.full((4, 4), 255, dtype=np.uint8)) == 1
