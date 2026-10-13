from dataclasses import dataclass
from typing import Any

import numpy as np


@dataclass(frozen=True)
class ProcessResult:
    """Output of a pure processor, before HTTP encoding and request timing."""

    image: np.ndarray
    aux: dict[str, Any] | None = None
    metadata: dict[str, Any] | None = None
