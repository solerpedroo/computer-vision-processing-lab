import cv2
import numpy as np

from app.processing.models import ProcessResult


def _require_rgb_uint8(image: np.ndarray) -> None:
    if image.ndim != 3 or image.shape[2] != 3 or image.dtype != np.uint8:
        raise ValueError("Color operations require an RGB uint8 image.")


def _histogram(image: np.ndarray, names: tuple[str, ...], title: str) -> dict[str, object]:
    channels = [image] if image.ndim == 2 else [image[:, :, index] for index in range(3)]
    return {
        "title": title,
        "series": [
            {
                "name": name,
                "x": list(range(256)),
                "counts": np.bincount(channel.ravel(), minlength=256).tolist(),
            }
            for name, channel in zip(names, channels, strict=True)
        ],
    }


def _result(
    image: np.ndarray, names: tuple[str, ...], title: str, color_space: str
) -> ProcessResult:
    return ProcessResult(
        image=image,
        aux={"histogram": _histogram(image, names, title)},
        metadata={"output_color_space": color_space},
    )


def color_grayscale(image: np.ndarray) -> ProcessResult:
    """Convert canonical RGB uint8 input to a uint8 grayscale image in [0, 255]."""
    _require_rgb_uint8(image)
    output = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    return _result(output, ("Intensity",), "Grayscale intensity", "Grayscale")


def color_hsv(image: np.ndarray) -> ProcessResult:
    """Convert RGB uint8 input to native OpenCV HSV component values (H: 0–179)."""
    _require_rgb_uint8(image)
    output = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
    return _result(output, ("Hue (0–179)", "Saturation", "Value"), "HSV components", "HSV")


def color_lab(image: np.ndarray) -> ProcessResult:
    """Convert RGB uint8 input to native OpenCV Lab components (a/b are offset)."""
    _require_rgb_uint8(image)
    output = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
    return _result(output, ("L* (scaled)", "a* (offset)", "b* (offset)"), "Lab components", "Lab")


def color_channel_rgb(image: np.ndarray, channel: str) -> ProcessResult:
    """Return a grayscale RGB channel view; no border behavior or alpha applies."""
    _require_rgb_uint8(image)
    index = {"red": 0, "green": 1, "blue": 2}[channel]
    return _result(image[:, :, index], (channel.title(),), f"RGB {channel} channel", "Grayscale")


def color_channel_hsv(image: np.ndarray, channel: str) -> ProcessResult:
    """Return a grayscale native HSV component view from canonical RGB input."""
    _require_rgb_uint8(image)
    hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
    index = {"hue": 0, "saturation": 1, "value": 2}[channel]
    return _result(hsv[:, :, index], (channel.title(),), f"HSV {channel} channel", "Grayscale")


def color_channel_lab(image: np.ndarray, channel: str) -> ProcessResult:
    """Return a grayscale native Lab component view from canonical RGB input."""
    _require_rgb_uint8(image)
    lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
    index = {"lightness": 0, "a": 1, "b": 2}[channel]
    return _result(lab[:, :, index], (channel,), f"Lab {channel} channel", "Grayscale")


def color_brightness(image: np.ndarray, amount: int) -> ProcessResult:
    """Shift RGB uint8 intensity by an integer amount in [-100, 100]."""
    _require_rgb_uint8(image)
    output = np.clip(image.astype(np.int16) + amount, 0, 255).astype(np.uint8)
    return _result(output, ("Red", "Green", "Blue"), "RGB after brightness", "RGB")


def color_contrast(image: np.ndarray, factor: float) -> ProcessResult:
    """Scale RGB contrast around mid-gray 128; output stays uint8 in [0, 255]."""
    _require_rgb_uint8(image)
    output = np.clip((image.astype(np.float32) - 128.0) * factor + 128.0, 0, 255).astype(np.uint8)
    return _result(output, ("Red", "Green", "Blue"), "RGB after contrast", "RGB")


def color_gamma(image: np.ndarray, gamma: float) -> ProcessResult:
    """Apply RGB gamma in normalized [0, 1] float space and return uint8 RGB."""
    _require_rgb_uint8(image)
    output = np.clip((image.astype(np.float32) / 255.0) ** gamma * 255.0, 0, 255).astype(np.uint8)
    return _result(output, ("Red", "Green", "Blue"), "RGB after gamma", "RGB")
