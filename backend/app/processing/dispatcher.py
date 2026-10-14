from collections.abc import Callable
from time import perf_counter

import numpy as np

from app.processing.color.noop import color_noop
from app.processing.color.operations import (
    color_brightness,
    color_channel_hsv,
    color_channel_lab,
    color_channel_rgb,
    color_contrast,
    color_gamma,
    color_grayscale,
    color_hsv,
    color_lab,
)
from app.processing.edges.operations import (
    canny,
    edge_laplacian,
    prewitt,
    sobel_magnitude,
    sobel_x,
    sobel_y,
)
from app.processing.models import ProcessResult
from app.processing.registry import get_operation_ids
from app.processing.spatial.operations import (
    spatial_bilateral_filter,
    spatial_box_filter,
    spatial_gaussian_blur,
    spatial_laplacian,
    spatial_median_filter,
    spatial_sharpen,
)

Handler = Callable[..., ProcessResult]

HANDLERS: dict[str, Handler] = {
    "color_noop": color_noop,
    "color_grayscale": color_grayscale,
    "color_hsv": color_hsv,
    "color_lab": color_lab,
    "color_channel_rgb": color_channel_rgb,
    "color_channel_hsv": color_channel_hsv,
    "color_channel_lab": color_channel_lab,
    "color_brightness": color_brightness,
    "color_contrast": color_contrast,
    "color_gamma": color_gamma,
    "spatial_box_filter": spatial_box_filter,
    "spatial_gaussian_blur": spatial_gaussian_blur,
    "spatial_median_filter": spatial_median_filter,
    "spatial_bilateral_filter": spatial_bilateral_filter,
    "spatial_sharpen": spatial_sharpen,
    "spatial_laplacian": spatial_laplacian,
    "edge_sobel_x": sobel_x, "edge_sobel_y": sobel_y, "edge_sobel_magnitude": sobel_magnitude,
    "edge_prewitt": prewitt, "edge_laplacian": edge_laplacian, "edge_canny": canny,
}


def execute(
    operation_id: str, image: np.ndarray, params: dict[str, object]
) -> tuple[ProcessResult, float]:
    """Run a registered processor and measure only its numerical execution."""
    try:
        handler = HANDLERS[operation_id]
    except KeyError as error:
        raise ValueError(f"Unknown operation_id: {operation_id}") from error

    started_at = perf_counter()
    result = handler(image, **params)
    return result, (perf_counter() - started_at) * 1000


def assert_registry_integrity() -> None:
    """Raise when a registry operation has no processing handler."""
    missing_handlers = set(get_operation_ids()) - set(HANDLERS)
    orphaned_handlers = set(HANDLERS) - set(get_operation_ids())
    if missing_handlers or orphaned_handlers:
        details = []
        if missing_handlers:
            details.append(f"missing handlers: {sorted(missing_handlers)}")
        if orphaned_handlers:
            details.append(f"orphaned handlers: {sorted(orphaned_handlers)}")
        raise RuntimeError("Registry/dispatcher drift: " + "; ".join(details))
