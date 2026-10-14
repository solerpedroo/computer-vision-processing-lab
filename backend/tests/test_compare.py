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


async def post_compare(
    content: bytes,
    operation_a: str,
    operation_b: str,
) -> tuple[int, dict[str, object]]:
    async with AsyncClient(
        transport=ASGITransport(app=create_app()), base_url="http://testserver"
    ) as client:
        response = await client.post(
            "/api/compare",
            data={"operation_a": operation_a, "operation_b": operation_b},
            files={"image": ("fixture.png", content, "image/png")},
        )
    return response.status_code, response.json()


def test_compare_runs_two_operations_with_separate_processing_times() -> None:
    source = png_bytes()
    config = '{"operation_id": "color_noop", "params": {}}'
    status_code, payload = asyncio.run(post_compare(source, config, config))

    assert status_code == 200
    assert payload["result_a"]["operation_id"] == "color_noop"
    assert payload["result_b"]["operation_id"] == "color_noop"
    assert payload["result_a"]["processing_ms"] >= 0
    assert payload["result_b"]["processing_ms"] >= 0
    assert payload["request_ms"] >= max(
        payload["result_a"]["processing_ms"], payload["result_b"]["processing_ms"]
    )
    assert b64decode(payload["result_a"]["output_image"]).startswith(b"\x89PNG\r\n\x1a\n")
    assert b64decode(payload["result_b"]["output_image"]).startswith(b"\x89PNG\r\n\x1a\n")


def test_compare_rejects_invalid_operation_config() -> None:
    status_code, payload = asyncio.run(
        post_compare(png_bytes(), '{"operation_id": "missing"}', '{"operation_id": "color_noop"}')
    )

    assert status_code == 422
    assert "Unknown operation_id" in payload["detail"]
