from typing import Literal

from pydantic import BaseModel, Field


class ImageMetadata(BaseModel):
    width: int = Field(gt=0)
    height: int = Field(gt=0)
    channels: Literal[3]
    source_format: str
    source_file_size_bytes: int = Field(ge=0)
    output_color_space: str | None = None
    connected_components: int | None = Field(default=None, ge=0)


class HistogramSeries(BaseModel):
    name: str
    x: list[int]
    counts: list[int]


class HistogramChart(BaseModel):
    title: str
    series: list[HistogramSeries]


class ProcessResponse(BaseModel):
    operation_id: str
    output_image: str
    processing_ms: float = Field(ge=0)
    request_ms: float = Field(ge=0)
    metadata: ImageMetadata
    histogram: HistogramChart | None = None
