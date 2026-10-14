import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def test_noise_reduction_cli_runs() -> None:
    result = subprocess.run(
        [sys.executable, str(ROOT / "experiments/noise-reduction/run.py")],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    assert result.returncode == 0, result.stderr
    assert "spatial_median_filter" in result.stdout
