from functools import lru_cache
from pathlib import Path
from typing import Any

import yaml

REGISTRY_PATH = Path(__file__).with_name("registry.yaml")


@lru_cache(maxsize=1)
def get_operations() -> tuple[dict[str, Any], ...]:
    """Load immutable operation metadata from the canonical registry."""
    loaded = yaml.safe_load(REGISTRY_PATH.read_text(encoding="utf-8"))
    if not isinstance(loaded, dict) or not isinstance(loaded.get("operations"), list):
        raise RuntimeError("Operation registry must define an 'operations' list.")

    operations = loaded["operations"]
    if any(not isinstance(operation, dict) for operation in operations):
        raise RuntimeError("Each operation registry entry must be an object.")
    return tuple(operations)


def get_operation_ids() -> tuple[str, ...]:
    """Return the stable IDs used to detect registry/dispatcher drift."""
    operation_ids = tuple(operation.get("id") for operation in get_operations())
    if any(not isinstance(operation_id, str) or not operation_id for operation_id in operation_ids):
        raise RuntimeError("Each operation registry entry must define a non-empty 'id'.")
    if len(set(operation_ids)) != len(operation_ids):
        raise RuntimeError("Operation registry contains duplicate IDs.")
    return operation_ids
