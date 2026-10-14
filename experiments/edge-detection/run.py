"""Experiment B — edge detector comparison on synthetic edges."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(ROOT), str(ROOT / "backend")]

from app.processing.dispatcher import execute

from experiments.common import add_gaussian_noise, gradient_rgb

CONFIG = Path(__file__).with_name("config.json")


def edge_density(image: np.ndarray) -> float:
    """Fraction of pixels above half max (proxy for edge activity)."""
    return float(np.mean(image > 127))


def main() -> None:
    config = json.loads(CONFIG.read_text(encoding="utf-8"))
    clean = gradient_rgb()
    noisy = add_gaussian_noise(clean, sigma=15, seed=7)
    for label, source in [("clean", clean), ("noisy", noisy)]:
        print(f"\n=== Input: {label} ===")
        print("operator,edge_density,processing_ms")
        for entry in config["operators"]:
            op_id = entry["operation_id"]
            result, ms = execute(op_id, source, entry["params"])
            print(f"{op_id},{edge_density(result.image):.4f},{ms:.3f}")


if __name__ == "__main__":
    main()
