"""Experiment A — noise reduction (Gaussian vs impulse noise)."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(ROOT), str(ROOT / "backend")]

from app.processing.dispatcher import execute

from experiments.common import add_gaussian_noise, add_impulse_noise, gradient_rgb, metric_row

CONFIG = Path(__file__).with_name("config.json")


def main() -> None:
    config = json.loads(CONFIG.read_text(encoding="utf-8"))
    clean = gradient_rgb()
    scenarios = [
        ("gaussian", add_gaussian_noise(clean, config["gaussian_sigma"], config["seed"])),
        ("impulse", add_impulse_noise(clean, config["impulse_fraction"], config["seed"])),
    ]
    for noise_name, noisy in scenarios:
        print(f"\n=== Noise: {noise_name} ===")
        print("filter,mse,psnr,ssim")
        for entry in config["filters"]:
            op_id = entry["operation_id"]
            result, _ = execute(op_id, noisy, entry["params"])
            row = metric_row(op_id, clean, result.image)
            psnr_display = row["psnr"]
            print(f"{op_id},{row['mse']:.6f},{psnr_display},{row['ssim']:.4f}")


if __name__ == "__main__":
    main()
