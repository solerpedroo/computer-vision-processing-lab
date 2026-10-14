"""Shared synthetic fixtures for CLI experiment runners."""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
BACKEND = ROOT / "backend"
if str(BACKEND) not in sys.path:
    sys.path.insert(0, str(BACKEND))

from app.metrics.image import mse, psnr, ssim


def gradient_rgb(size: int = 64) -> np.ndarray:
    axis = np.linspace(0, 255, size, dtype=np.float32)
    grid_x, grid_y = np.meshgrid(axis, axis)
    red = grid_x.astype(np.uint8)
    green = grid_y.astype(np.uint8)
    blue = ((grid_x + grid_y) / 2).astype(np.uint8)
    return np.stack([red, green, blue], axis=2)


def add_gaussian_noise(image: np.ndarray, sigma: float, seed: int) -> np.ndarray:
    rng = np.random.default_rng(seed)
    noisy = image.astype(np.float32) + rng.normal(0, sigma, image.shape)
    return np.clip(noisy, 0, 255).astype(np.uint8)


def add_impulse_noise(image: np.ndarray, amount: float, seed: int) -> np.ndarray:
    rng = np.random.default_rng(seed)
    noisy = image.copy()
    count = int(amount * noisy.size)
    indices = rng.choice(noisy.size, size=count, replace=False)
    flat = noisy.reshape(-1)
    flat[indices] = rng.choice([0, 255], size=count)
    return flat.reshape(noisy.shape)


def metric_row(name: str, reference: np.ndarray, candidate: np.ndarray) -> dict[str, float | str]:
    psnr_value = psnr(reference, candidate)
    return {
        "label": name,
        "mse": mse(reference, candidate),
        "psnr": "inf" if psnr_value == float("inf") else psnr_value,
        "ssim": ssim(reference, candidate),
    }
