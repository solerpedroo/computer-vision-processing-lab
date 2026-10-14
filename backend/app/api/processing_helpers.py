from json import JSONDecodeError, loads

from app.processing.registry import validate_params


def parse_operation_form(raw: str, field_name: str) -> tuple[str, dict[str, object]]:
    """Parse multipart JSON for ``operation_id`` and optional ``params``."""
    try:
        data = loads(raw)
    except JSONDecodeError as error:
        raise ValueError(f"Field '{field_name}' must be valid JSON.") from error
    if not isinstance(data, dict):
        raise ValueError(f"Field '{field_name}' must be a JSON object.")
    operation_id = data.get("operation_id")
    if not isinstance(operation_id, str) or not operation_id:
        raise ValueError(f"Field '{field_name}' must include a non-empty operation_id.")
    params = data.get("params", {})
    if not isinstance(params, dict):
        raise ValueError(f"Field '{field_name}.params' must be a JSON object.")
    return operation_id, validate_params(operation_id, params)
