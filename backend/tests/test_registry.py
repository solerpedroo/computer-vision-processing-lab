from app.processing.dispatcher import assert_registry_integrity
from app.processing.registry import get_operations


def test_empty_foundation_registry_is_valid_and_has_no_drift() -> None:
    assert get_operations() == ()
    assert_registry_integrity()
