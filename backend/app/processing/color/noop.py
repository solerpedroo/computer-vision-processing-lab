import numpy as np

from app.processing.models import ProcessResult


def color_noop(image: np.ndarray) -> ProcessResult:
    """Return an independent copy of a canonical RGB image unchanged.

    Input and output are contiguous RGB ``uint8`` arrays in ``[0, 255]`` with
    shape ``(height, width, 3)``. Alpha is absent, no grayscale conversion or
    border operation occurs, and there are no parameters. The caller measures
    processing time around this function only.
    """
    if image.ndim != 3 or image.shape[2] != 3 or image.dtype != np.uint8:
        raise ValueError("color_noop requires an RGB uint8 image.")
    return ProcessResult(image=image.copy())
