from typing import Literal

from pydantic import BaseModel, Field


class ImageMetadata(BaseModel):
    width: int = Field(gt=0)
    height: int = Field(gt=0)
    channels: Literal[3]
    source_format: str
    source_file_size_bytes: int = Field(ge=0)


class ProcessResponse(BaseModel):
    operation_id: str
    output_image: str
    processing_ms: float = Field(ge=0)
    request_ms: float = Field(ge=0)
    metadata: ImageMetadata
