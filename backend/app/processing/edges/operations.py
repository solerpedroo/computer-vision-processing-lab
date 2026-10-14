import cv2
import numpy as np

from app.processing.models import ProcessResult


def _gray(image: np.ndarray) -> np.ndarray:
    if image.ndim != 3 or image.shape[2] != 3 or image.dtype != np.uint8:
        raise ValueError("Edge detectors require an RGB uint8 image.")
    return cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)


def _result(image: np.ndarray, name: str) -> ProcessResult:
    return ProcessResult(
        image=image, metadata={"output_color_space": "Grayscale", "edge_detector": name}
    )


def sobel_x(image: np.ndarray, kernel_size: int) -> ProcessResult:
    """Absolute x-gradient of RGB input after documented grayscale conversion."""
    gray = _gray(image)
    output = cv2.convertScaleAbs(cv2.Sobel(gray, cv2.CV_16S, 1, 0, ksize=kernel_size))
    return _result(output, "Sobel X")


def sobel_y(image: np.ndarray, kernel_size: int) -> ProcessResult:
    """Absolute y-gradient of RGB input after documented grayscale conversion."""
    gray = _gray(image)
    output = cv2.convertScaleAbs(cv2.Sobel(gray, cv2.CV_16S, 0, 1, ksize=kernel_size))
    return _result(output, "Sobel Y")


def sobel_magnitude(image: np.ndarray, kernel_size: int) -> ProcessResult:
    """Euclidean magnitude of signed Sobel derivatives, clipped to uint8."""
    gray = _gray(image)
    x = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=kernel_size)
    y = cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=kernel_size)
    return _result(cv2.convertScaleAbs(cv2.magnitude(x, y)), "Sobel magnitude")


def prewitt(image: np.ndarray) -> ProcessResult:
    """Prewitt magnitude with REFLECT_101 borders on grayscale input."""
    gray = _gray(image)
    x = cv2.filter2D(gray, cv2.CV_32F, np.array([[-1, 0, 1]] * 3, dtype=np.float32))
    y_kernel = np.array([[-1, -1, -1], [0, 0, 0], [1, 1, 1]], dtype=np.float32)
    y = cv2.filter2D(gray, cv2.CV_32F, y_kernel)
    return _result(cv2.convertScaleAbs(cv2.magnitude(x, y)), "Prewitt")


def edge_laplacian(image: np.ndarray, kernel_size: int) -> ProcessResult:
    """Absolute second derivative after grayscale conversion with odd kernel."""
    gray = _gray(image)
    output = cv2.convertScaleAbs(cv2.Laplacian(gray, cv2.CV_16S, ksize=kernel_size))
    return _result(output, "Laplacian")


def canny(image: np.ndarray, low_threshold: int, high_threshold: int) -> ProcessResult:
    """Binary Canny edges; thresholds are ordered intensity-gradient bounds."""
    if low_threshold >= high_threshold:
        raise ValueError("low_threshold must be less than high_threshold.")
    return _result(cv2.Canny(_gray(image), low_threshold, high_threshold), "Canny")
