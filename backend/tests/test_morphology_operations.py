import numpy as np

from app.processing.morphology.operations import closing, dilate, opening, otsu_threshold


def rgb(mask: np.ndarray) -> np.ndarray:
    return np.repeat(mask[:, :, None], 3, axis=2).astype(np.uint8)


def test_opening_removes_a_single_bright_speck() -> None:
    mask = np.zeros((9, 9), dtype=np.uint8)
    mask[4, 4] = 255
    assert opening(rgb(mask), 3).image[4, 4] == 0


def test_closing_fills_a_small_hole_and_counts_components() -> None:
    mask = np.zeros((9, 9), dtype=np.uint8)
    mask[2:7, 2:7] = 255
    mask[4, 4] = 0
    result = closing(rgb(mask), 3)
    assert result.image[4, 4] == 255
    assert result.metadata["connected_components"] == 1


def test_dilation_expands_and_otsu_returns_binary_mask() -> None:
    mask = np.zeros((9, 9), dtype=np.uint8)
    mask[4, 4] = 255
    assert dilate(rgb(mask), 3).image.sum() > mask.sum()
    bimodal = np.zeros((4, 4), dtype=np.uint8)
    bimodal[:, 2:] = 255
    assert set(np.unique(otsu_threshold(rgb(bimodal)).image)).issubset({0, 255})
