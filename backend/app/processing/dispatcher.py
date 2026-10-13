from collections.abc import Callable

from app.processing.registry import get_operation_ids

Handler = Callable[..., object]

# Future waves register pure processing functions here. The empty foundation is
# intentional: it proves the registry drift check without creating a fake operation.
HANDLERS: dict[str, Handler] = {}


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
