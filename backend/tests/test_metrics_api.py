import asyncio
from io import BytesIO

from httpx import ASGITransport, AsyncClient
from PIL import Image

from app.main import create_app


def png_bytes(color: tuple[int, int, int]) -> bytes:
    pixels = Image.new("RGB", (2, 2), color)
    output = BytesIO()
    pixels.save(output, format="PNG")
    return output.getvalue()


async def post_metrics(reference: bytes, candidate: bytes) -> tuple[int, dict[str, object]]:
    async with AsyncClient(
        transport=ASGITransport(app=create_app()), base_url="http://testserver"
    ) as client:
        response = await client.post(
            "/api/metrics",
            files={
                "reference_image": ("ref.png", reference, "image/png"),
                "candidate_image": ("cand.png", candidate, "image/png"),
            },
        )
    return response.status_code, response.json()


def test_metrics_returns_perfect_scores_for_identical_images() -> None:
    source = png_bytes((40, 80, 120))
    status_code, payload = asyncio.run(post_metrics(source, source))

    assert status_code == 200
    assert payload["mse"] == 0
    assert payload["psnr"] is None
    assert payload["ssim"] == 1.0
    assert payload["request_ms"] >= 0


def test_metrics_rejects_mismatched_dimensions() -> None:
    small = png_bytes((10, 20, 30))
    large = Image.new("RGB", (3, 3), (0, 0, 0))
    buffer = BytesIO()
    large.save(buffer, format="PNG")
    status_code, payload = asyncio.run(post_metrics(small, buffer.getvalue()))

    assert status_code == 422
    assert "same dimensions" in payload["detail"]
