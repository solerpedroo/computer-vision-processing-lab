import asyncio
from base64 import b64decode
from io import BytesIO

from httpx import ASGITransport, AsyncClient
from PIL import Image

from app.main import create_app


def png_bytes() -> bytes:
    pixels = Image.new("RGB", (2, 1))
    pixels.putdata([(255, 0, 0), (0, 255, 0)])
    output = BytesIO()
    pixels.save(output, format="PNG")
    return output.getvalue()


async def post_process(
    content: bytes, operation_id: str = "color_noop", params: str = "{}"
) -> tuple[int, dict[str, object]]:
    async with AsyncClient(
        transport=ASGITransport(app=create_app()), base_url="http://testserver"
    ) as client:
        response = await client.post(
            "/api/process",
            data={"operation_id": operation_id, "params": params},
            files={"image": ("fixture.png", content, "image/png")},
        )
    return response.status_code, response.json()


def test_process_noop_returns_a_png_and_separate_timing() -> None:
    source = png_bytes()
    status_code, payload = asyncio.run(post_process(source))

    assert status_code == 200
    assert payload["operation_id"] == "color_noop"
    assert payload["processing_ms"] >= 0
    assert payload["request_ms"] >= payload["processing_ms"]
    assert payload["metadata"] == {
        "width": 2,
        "height": 1,
        "channels": 3,
        "source_format": "PNG",
        "source_file_size_bytes": len(source),
        "output_color_space": None,
        "connected_components": None,
    }
    assert b64decode(payload["output_image"]).startswith(b"\x89PNG\r\n\x1a\n")


def test_process_rejects_invalid_bytes() -> None:
    status_code, payload = asyncio.run(post_process(b"invalid"))

    assert status_code == 415
    assert payload["detail"] == "Only PNG and JPEG image bytes are accepted."


def test_process_rejects_unknown_operation() -> None:
    status_code, payload = asyncio.run(post_process(png_bytes(), operation_id="unknown"))

    assert status_code == 422
    assert payload["detail"] == "Unknown operation_id: unknown"


def test_process_validates_registry_params_and_returns_a_histogram() -> None:
    status_code, payload = asyncio.run(
        post_process(png_bytes(), operation_id="color_gamma", params='{"gamma": 0.5}')
    )

    assert status_code == 200
    assert payload["metadata"]["output_color_space"] == "RGB"
    assert payload["histogram"]["title"] == "RGB after gamma"
    assert len(payload["histogram"]["series"]) == 3


def test_process_rejects_invalid_registry_params() -> None:
    status_code, payload = asyncio.run(
        post_process(png_bytes(), operation_id="color_gamma", params='{"gamma": 4}')
    )

    assert status_code == 422
    assert "between" in payload["detail"]
