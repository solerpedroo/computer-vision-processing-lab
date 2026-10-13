from app.processing.dispatcher import assert_registry_integrity
from app.processing.registry import get_operations


def test_registered_noop_operation_has_no_dispatcher_drift() -> None:
    assert get_operations()[0]["id"] == "color_noop"
    assert_registry_integrity()
