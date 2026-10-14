from base64 import b64encode
from json import JSONDecodeError, loads
from math import isinf
from time import perf_counter

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.api.processing_helpers import parse_operation_form
from app.core.images import DecodedImage, ImageValidationError, decode_upload, encode_png
from app.metrics.image import mse, psnr, ssim
from app.processing.dispatcher import execute
from app.processing.models import ProcessResult
from app.processing.registry import get_operations, validate_params
from app.schemas.compare import CompareArmResult, CompareResponse
from app.schemas.metrics import MetricsResponse
from app.schemas.operations import OperationsResponse
from app.schemas.process import HistogramChart, ImageMetadata, ProcessResponse
from app.schemas.system import HealthResponse

router = APIRouter(prefix="/api")


def _image_metadata(decoded: DecodedImage, result: ProcessResult | None = None) -> ImageMetadata:
    meta = result.metadata if result else None
    return ImageMetadata(
        width=decoded.width,
        height=decoded.height,
        channels=3,
        source_format=decoded.source_format,
        source_file_size_bytes=decoded.file_size_bytes,
        output_color_space=(meta or {}).get("output_color_space") if meta else None,
        connected_components=(meta or {}).get("connected_components") if meta else None,
    )


def _encode_operation_result(
    operation_id: str, result: ProcessResult, processing_ms: float
) -> CompareArmResult:
    return CompareArmResult(
        operation_id=operation_id,
        output_image=b64encode(encode_png(result.image)).decode("ascii"),
        processing_ms=processing_ms,
    )


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
    image: UploadFile = File(...), operation_id: str = Form(...), params: str = Form("{}")
) -> ProcessResponse:
    """Validate, run, and encode one stateless registry-backed operation."""
    started_at = perf_counter()
    raw_bytes = await image.read()
    try:
        parsed_params = loads(params)
        if not isinstance(parsed_params, dict):
            raise ValueError("Field 'params' must be a JSON object.")
        validated_params = validate_params(operation_id, parsed_params)
        decoded = decode_upload(raw_bytes)
        result, processing_ms = execute(operation_id, decoded.image, validated_params)
    except JSONDecodeError as error:
        raise HTTPException(status_code=422, detail="Field 'params' must be valid JSON.") from error
    except ImageValidationError as error:
        raise HTTPException(status_code=error.status_code, detail=str(error)) from error
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error

    output_image = b64encode(encode_png(result.image)).decode("ascii")
    request_ms = (perf_counter() - started_at) * 1000
    histogram = result.aux.get("histogram") if result.aux else None
    return ProcessResponse(
        operation_id=operation_id,
        output_image=output_image,
        processing_ms=processing_ms,
        request_ms=request_ms,
        metadata=_image_metadata(decoded, result),
        histogram=HistogramChart.model_validate(histogram) if histogram else None,
    )


@router.post("/compare", response_model=CompareResponse, tags=["processing"])
async def compare_operations(
    image: UploadFile = File(...),
    operation_a: str = Form(...),
    operation_b: str = Form(...),
) -> CompareResponse:
    """Run two registry operations on the same upload and return both outputs."""
    started_at = perf_counter()
    raw_bytes = await image.read()
    try:
        decoded = decode_upload(raw_bytes)
        op_a, params_a = parse_operation_form(operation_a, "operation_a")
        op_b, params_b = parse_operation_form(operation_b, "operation_b")
        result_a, ms_a = execute(op_a, decoded.image, params_a)
        result_b, ms_b = execute(op_b, decoded.image, params_b)
    except ImageValidationError as error:
        raise HTTPException(status_code=error.status_code, detail=str(error)) from error
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error

    request_ms = (perf_counter() - started_at) * 1000
    return CompareResponse(
        result_a=_encode_operation_result(op_a, result_a, ms_a),
        result_b=_encode_operation_result(op_b, result_b, ms_b),
        request_ms=request_ms,
        metadata=_image_metadata(decoded),
    )


@router.post("/metrics", response_model=MetricsResponse, tags=["processing"])
async def compute_metrics(
    reference_image: UploadFile = File(...),
    candidate_image: UploadFile = File(...),
) -> MetricsResponse:
    """Compute MSE, PSNR, and SSIM for two equally sized RGB or grayscale images."""
    started_at = perf_counter()
    try:
        reference = decode_upload(await reference_image.read())
        candidate = decode_upload(await candidate_image.read())
        if reference.image.shape != candidate.image.shape:
            raise ValueError("Reference and candidate images must have the same dimensions.")
        psnr_value = psnr(reference.image, candidate.image)
    except ImageValidationError as error:
        raise HTTPException(status_code=error.status_code, detail=str(error)) from error
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error

    request_ms = (perf_counter() - started_at) * 1000
    return MetricsResponse(
        mse=mse(reference.image, candidate.image),
        psnr=None if isinf(psnr_value) else psnr_value,
        ssim=ssim(reference.image, candidate.image),
        request_ms=request_ms,
    )
