# API contract — through Wave 6 (`/api/process`)

Base URL in local development: `http://localhost:8000`. The frontend obtains it
from `NEXT_PUBLIC_API_URL`.

## `GET /api/health`

Liveness endpoint with no configuration or environment data.

```json
{
  "status": "ok",
  "api_version": "0.1.0"
}
```

## `GET /api/operations`

Returns the canonical registry metadata for all implemented operations (color,
spatial, edge, morphology, frequency). Shape matches each entry in
`backend/app/processing/registry.yaml`.

## `POST /api/process`

The first image-bearing endpoint accepts `multipart/form-data`:

- `image` — a PNG or JPEG file, validated by magic bytes rather than extension;
- `operation_id` — any registered operation id;
- `params` — optional JSON object (form field) when the operation defines parameters.

Limits are 10 MiB and 4096 × 4096 decoded pixels. Valid input is normalized to
RGB `uint8`, processed in memory, and never persisted. Unsupported or corrupt
bytes return `415`; files exceeding size or dimension limits return `413`; an
unknown operation returns `422`.

```json
{
  "operation_id": "color_noop",
  "output_image": "<base64 PNG>",
  "processing_ms": 0.02,
  "request_ms": 3.41,
  "metadata": {
    "width": 640,
    "height": 480,
    "channels": 3,
    "source_format": "PNG",
    "source_file_size_bytes": 12345
  }
}
```

All output images are encoded PNG. Responses distinguish algorithm
`processing_ms` from full `request_ms`. Wave 2+ responses may include a `histogram`
chart payload. Morphology mask results may include `metadata.connected_components`.

Frequency work uses `/api/process` with frequency operation ids (no separate
`/api/frequency` route).

## `POST /api/compare`

Multipart fields:

- `image` — PNG/JPEG input (same limits as `/api/process`);
- `operation_a` — JSON `{"operation_id": "...", "params": { ... }}`;
- `operation_b` — JSON with the same shape.

Runs both operations on the decoded RGB array and returns base64 PNG outputs,
per-arm `processing_ms`, and total `request_ms`.

## `POST /api/metrics`

Multipart fields:

- `reference_image` — PNG/JPEG reference;
- `candidate_image` — PNG/JPEG candidate.

Both images must decode to the same shape. Response:

```json
{
  "mse": 0.0012,
  "psnr": 29.2,
  "ssim": 0.984,
  "request_ms": 4.1
}
```

`psnr` is `null` when images are identical (infinite PSNR).

## Color operations and histograms

`/api/operations` now publishes color operations and their parameter defaults,
limits, steps, and enum values. `POST /api/process` accepts an optional `params`
multipart field containing a JSON object; unknown keys, invalid enums, and values
outside registry bounds return `422`.

Every Wave 2 result can include a labelled `histogram` containing 256 bins and
series names. RGB and grayscale outputs use component/intensity values in
`[0, 255]`. HSV and Lab previews pack native components into PNG slots for
inspection; they are **not** RGB color renderings. Their chart labels and channel
views retain the corresponding native component semantics.

## Spatial operations

The registry also exposes `spatial_box_filter`, `spatial_gaussian_blur`,
`spatial_median_filter`, `spatial_bilateral_filter`, `spatial_sharpen`, and
`spatial_laplacian`. Kernel and bilateral diameter parameters must be odd, and
all sigma/amount bounds are validated from the same registry metadata used by
the frontend controls.

## Edge operations

Registry ids: `edge_sobel_x`, `edge_sobel_y`, `edge_sobel_magnitude`, `edge_prewitt`,
`edge_laplacian`, `edge_canny`. Canny accepts `threshold1` and `threshold2` (integers,
`threshold1` ≤ `threshold2`). Outputs are grayscale PNG unless noted as binary for Canny.

## Morphology operations

Registry ids: `morph_binary_threshold`, `morph_adaptive_threshold`, `morph_otsu_threshold`,
`morph_erode`, `morph_dilate`, `morph_opening`, `morph_closing`. Grayscale input required.
Responses may set `metadata.connected_components` for binary masks.

## Frequency operations

Registry ids: `frequency_spectrum`, `frequency_gaussian_lowpass`, `frequency_gaussian_highpass`.
Grayscale input required. LPF/HPF accept `sigma` and return reconstructed grayscale images;
spectrum returns a log-magnitude visualization (`output_kind: spectrum`).
