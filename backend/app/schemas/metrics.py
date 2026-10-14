from pydantic import BaseModel, Field


class MetricsResponse(BaseModel):
    mse: float = Field(ge=0)
    psnr: float | None = Field(
        default=None,
        description="Peak SNR in dB; null when images are identical (infinite PSNR).",
    )
    ssim: float = Field(ge=-1, le=1)
    request_ms: float = Field(ge=0)
