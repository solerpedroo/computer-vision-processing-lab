from pydantic import BaseModel, Field

from app.schemas.process import ImageMetadata


class CompareArmResult(BaseModel):
    operation_id: str
    output_image: str
    processing_ms: float = Field(ge=0)


class CompareResponse(BaseModel):
    result_a: CompareArmResult
    result_b: CompareArmResult
    request_ms: float = Field(ge=0)
    metadata: ImageMetadata
