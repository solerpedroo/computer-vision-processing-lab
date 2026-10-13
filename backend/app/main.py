from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.config import get_settings
from app.processing.dispatcher import assert_registry_integrity


def create_app() -> FastAPI:
    """Create the transport-only API shell used by every future wave."""
    settings = get_settings()
    assert_registry_integrity()

    app = FastAPI(title="Computer Vision Processing Lab API", version="0.1.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(settings.allowed_origins),
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
    )
    app.include_router(router)
    return app


app = create_app()
