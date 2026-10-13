from fastapi import APIRouter

from app.processing.registry import get_operations
from app.schemas.operations import OperationsResponse
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
