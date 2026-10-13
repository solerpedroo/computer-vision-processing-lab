from typing import Any

from pydantic import BaseModel


class OperationsResponse(BaseModel):
    operations: tuple[dict[str, Any], ...]
