import cv2
import numpy as np

from app.processing.models import ProcessResult


def _rgb(image: np.ndarray) -> None:
    if image.ndim != 3 or image.shape[2] != 3 or image.dtype != np.uint8:
        raise ValueError("Spatial filters require an RGB uint8 image.")


def _odd(kernel_size: int) -> None:
    if kernel_size < 3 or kernel_size % 2 == 0:
        raise ValueError("kernel_size must be odd and at least 3.")


def _result(image: np.ndarray, name: str) -> ProcessResult:
    return ProcessResult(image=image, metadata={"output_color_space": "RGB", "filter": name})


def spatial_box_filter(image: np.ndarray, kernel_size: int) -> ProcessResult:
    """Mean RGB filter with REFLECT_101 borders and an odd pixel kernel."""
    _rgb(image)
    _odd(kernel_size)
    output = cv2.blur(image, (kernel_size, kernel_size), borderType=cv2.BORDER_REFLECT_101)
    return _result(output, "Box filter")


def spatial_gaussian_blur(image: np.ndarray, kernel_size: int, sigma: float) -> ProcessResult:
    """Gaussian RGB low-pass with REFLECT_101 borders; sigma is in pixels."""
    _rgb(image)
    _odd(kernel_size)
    if sigma <= 0:
        raise ValueError("sigma must be greater than zero.")
    output = cv2.GaussianBlur(
        image, (kernel_size, kernel_size), sigma, borderType=cv2.BORDER_REFLECT_101
    )
    return _result(output, "Gaussian blur")


def spatial_median_filter(image: np.ndarray, kernel_size: int) -> ProcessResult:
    """Median RGB filter with an odd kernel; OpenCV defines its edge handling."""
    _rgb(image)
    _odd(kernel_size)
    return _result(cv2.medianBlur(image, kernel_size), "Median filter")


def spatial_bilateral_filter(
    image: np.ndarray, diameter: int, sigma_color: float, sigma_space: float
) -> ProcessResult:
    """Edge-preserving bilateral RGB filter; sigmas are color/value and pixel distance."""
    _rgb(image)
    if diameter < 3 or diameter % 2 == 0:
        raise ValueError("diameter must be odd and at least 3.")
    if sigma_color <= 0 or sigma_space <= 0:
        raise ValueError("Bilateral sigmas must be greater than zero.")
    output = cv2.bilateralFilter(image, diameter, sigma_color, sigma_space)
    return _result(output, "Bilateral filter")


def spatial_sharpen(image: np.ndarray, amount: float) -> ProcessResult:
    """Unsharp RGB mask using a fixed 5×5 Gaussian, clipped to uint8 output."""
    _rgb(image)
    if amount < 0:
        raise ValueError("amount must not be negative.")
    blurred = cv2.GaussianBlur(image, (5, 5), 1.0, borderType=cv2.BORDER_REFLECT_101)
    return _result(cv2.addWeighted(image, 1 + amount, blurred, -amount, 0), "Sharpen")


def spatial_laplacian(image: np.ndarray, kernel_size: int) -> ProcessResult:
    """Absolute RGB Laplacian response with REFLECT_101 borders and odd kernel."""
    _rgb(image)
    _odd(kernel_size)
    response = cv2.Laplacian(
        image, cv2.CV_16S, ksize=kernel_size, borderType=cv2.BORDER_REFLECT_101
    )
    return _result(cv2.convertScaleAbs(response), "Laplacian")
