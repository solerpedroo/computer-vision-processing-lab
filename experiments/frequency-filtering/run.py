"""Experiment C — frequency-domain Gaussian LPF/HPF vs spatial reference."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(ROOT), str(ROOT / "backend")]

from app.processing.color.operations import color_grayscale
from app.processing.dispatcher import execute

from experiments.common import gradient_rgb, metric_row

CONFIG = Path(__file__).with_name("config.json")


def main() -> None:
    config = json.loads(CONFIG.read_text(encoding="utf-8"))
    rgb = gradient_rgb()
    gray = color_grayscale(rgb).image
    print("sigma,path,mse_vs_gray,ssim_vs_gray")
    for sigma in config["sigma_values"]:
        params = {"sigma": sigma}
        freq_lpf, _ = execute("frequency_gaussian_lowpass", gray, params)
        spatial, _ = execute(
            "spatial_gaussian_blur",
            np.stack([gray, gray, gray], axis=2),
            {"kernel_size": 5, "sigma": sigma},
        )
        spatial_gray = spatial.image if spatial.image.ndim == 2 else np.mean(spatial.image, axis=2).astype(np.uint8)
        row = metric_row("freq_vs_spatial", spatial_gray, freq_lpf.image)
        print(f"{sigma},frequency_lpf,{row['mse']:.6f},{row['ssim']:.4f}")
        freq_hpf, _ = execute("frequency_gaussian_highpass", gray, params)
        hpf_energy = float(np.mean(freq_hpf.image.astype(np.float32)))
        print(f"{sigma},frequency_hpf,hpf_mean_intensity={hpf_energy:.2f},")


if __name__ == "__main__":
    main()
