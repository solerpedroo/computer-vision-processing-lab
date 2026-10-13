from collections.abc import Callable
from time import perf_counter

import numpy as np

from app.processing.color.noop import color_noop
from app.processing.models import ProcessResult
from app.processing.registry import get_operation_ids

Handler = Callable[[np.ndarray], ProcessResult]

HANDLERS: dict[str, Handler] = {"color_noop": color_noop}


def execute(operation_id: str, image: np.ndarray) -> tuple[ProcessResult, float]:
    """Run a registered processor and measure only its numerical execution."""
    try:
        handler = HANDLERS[operation_id]
    except KeyError as error:
        raise ValueError(f"Unknown operation_id: {operation_id}") from error

    started_at = perf_counter()
    result = handler(image)
    return result, (perf_counter() - started_at) * 1000


def assert_registry_integrity() -> None:
    """Raise when a registry operation has no processing handler."""
    missing_handlers = set(get_operation_ids()) - set(HANDLERS)
    orphaned_handlers = set(HANDLERS) - set(get_operation_ids())
    if missing_handlers or orphaned_handlers:
        details = []
        if missing_handlers:
            details.append(f"missing handlers: {sorted(missing_handlers)}")
        if orphaned_handlers:
            details.append(f"orphaned handlers: {sorted(orphaned_handlers)}")
        raise RuntimeError("Registry/dispatcher drift: " + "; ".join(details))
