from io import BytesIO

import numpy as np
import pytest
from PIL import Image

from app.core import images
from app.core.images import ImageValidationError, decode_upload, encode_png


def image_bytes(image_format: str, size: tuple[int, int] = (3, 2)) -> bytes:
    pixels = Image.new("RGB", size, (12, 34, 56))
    output = BytesIO()
    pixels.save(output, format=image_format)
    return output.getvalue()


@pytest.mark.parametrize("image_format", ["PNG", "JPEG"])
def test_decode_upload_accepts_real_png_and_jpeg(image_format: str) -> None:
    decoded = decode_upload(image_bytes(image_format))

    assert decoded.source_format == image_format
    assert decoded.image.shape == (2, 3, 3)
    assert decoded.image.dtype == np.uint8
    assert decoded.image.flags.c_contiguous


def test_decode_upload_rejects_non_image_bytes() -> None:
    with pytest.raises(ImageValidationError, match="Only PNG and JPEG") as error:
        decode_upload(b"not an image")

    assert error.value.status_code == 415


def test_decode_upload_rejects_files_over_the_byte_limit(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(images, "MAX_UPLOAD_BYTES", 4)

    with pytest.raises(ImageValidationError, match="10 MiB") as error:
        decode_upload(b"12345")

    assert error.value.status_code == 413


def test_decode_upload_rejects_dimensions_over_the_limit() -> None:
    oversized_png = image_bytes("PNG", size=(4097, 1))

    with pytest.raises(ImageValidationError, match="4096") as error:
        decode_upload(oversized_png)

    assert error.value.status_code == 413


def test_encode_png_requires_canonical_rgb_uint8() -> None:
    with pytest.raises(ValueError, match="RGB uint8"):
        encode_png(np.zeros((2, 2), dtype=np.uint8))
