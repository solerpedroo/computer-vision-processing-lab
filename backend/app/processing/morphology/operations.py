import cv2
import numpy as np

from app.processing.models import ProcessResult


def _gray(image: np.ndarray) -> np.ndarray:
    if image.ndim != 3 or image.shape[2] != 3 or image.dtype != np.uint8:
        raise ValueError("Threshold and morphology operations require an RGB uint8 image.")
    return cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)


def _kernel(kernel_size: int) -> np.ndarray:
    if kernel_size < 3 or kernel_size % 2 == 0:
        raise ValueError("kernel_size must be odd and at least 3.")
    return cv2.getStructuringElement(cv2.MORPH_RECT, (kernel_size, kernel_size))


def _result(mask: np.ndarray, name: str) -> ProcessResult:
    components = cv2.connectedComponents(mask)[0] - 1
    return ProcessResult(
        image=mask,
        metadata={
            "output_color_space": "Binary mask",
            "operation": name,
            "connected_components": components,
        },
    )


def binary_threshold(image: np.ndarray, threshold: int) -> ProcessResult:
    """Global threshold of grayscale RGB input; output is a 0/255 uint8 mask."""
    _, mask = cv2.threshold(_gray(image), threshold, 255, cv2.THRESH_BINARY)
    return _result(mask, "Binary threshold")


def adaptive_threshold(image: np.ndarray, block_size: int, offset: int) -> ProcessResult:
    """Gaussian adaptive threshold with odd local block size and signed offset."""
    if block_size < 3 or block_size % 2 == 0:
        raise ValueError("block_size must be odd and at least 3.")
    mask = cv2.adaptiveThreshold(
        _gray(image), 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, block_size, offset
    )
    return _result(mask, "Adaptive threshold")


def otsu_threshold(image: np.ndarray) -> ProcessResult:
    """Otsu global threshold of grayscale RGB input; output is a 0/255 mask."""
    _, mask = cv2.threshold(_gray(image), 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return _result(mask, "Otsu threshold")


def erode(image: np.ndarray, kernel_size: int) -> ProcessResult:
    return _result(cv2.erode(_gray(image), _kernel(kernel_size)), "Erosion")


def dilate(image: np.ndarray, kernel_size: int) -> ProcessResult:
    return _result(cv2.dilate(_gray(image), _kernel(kernel_size)), "Dilation")


def opening(image: np.ndarray, kernel_size: int) -> ProcessResult:
    return _result(cv2.morphologyEx(_gray(image), cv2.MORPH_OPEN, _kernel(kernel_size)), "Opening")


def closing(image: np.ndarray, kernel_size: int) -> ProcessResult:
    return _result(cv2.morphologyEx(_gray(image), cv2.MORPH_CLOSE, _kernel(kernel_size)), "Closing")
