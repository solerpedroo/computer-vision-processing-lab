from base64 import b64encode
from time import perf_counter

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.core.images import ImageValidationError, decode_upload, encode_png
from app.processing.dispatcher import execute
from app.processing.registry import get_operations
from app.schemas.operations import OperationsResponse
from app.schemas.process import ImageMetadata, ProcessResponse
from app.schemas.system import HealthResponse

router = APIRouter(prefix="/api")


@router.get("/health", response_model=HealthResponse, tags=["system"])
def health() -> HealthResponse:
    """Return liveness data without exposing environment configuration."""
    return HealthResponse(status="ok", api_version="0.1.0")


@router.get("/operations", response_model=OperationsResponse, tags=["operations"])
def operations() -> OperationsResponse:
    """Expose the registry metadata consumed by future API and UI layers."""
    return OperationsResponse(operations=get_operations())


@router.post("/process", response_model=ProcessResponse, tags=["processing"])
async def process(
    image: UploadFile = File(...), operation_id: str = Form(...)
) -> ProcessResponse:
    """Validate, run, and encode one stateless registry-backed operation."""
    started_at = perf_counter()
    raw_bytes = await image.read()
    try:
        decoded = decode_upload(raw_bytes)
        result, processing_ms = execute(operation_id, decoded.image)
    except ImageValidationError as error:
        raise HTTPException(status_code=error.status_code, detail=str(error)) from error
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error

    output_image = b64encode(encode_png(result.image)).decode("ascii")
    request_ms = (perf_counter() - started_at) * 1000
    return ProcessResponse(
        operation_id=operation_id,
        output_image=output_image,
        processing_ms=processing_ms,
        request_ms=request_ms,
        metadata=ImageMetadata(
            width=decoded.width,
            height=decoded.height,
            channels=3,
            source_format=decoded.source_format,
            source_file_size_bytes=decoded.file_size_bytes,
        ),
    )
