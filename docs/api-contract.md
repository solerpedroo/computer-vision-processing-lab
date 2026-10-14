# API contract — Wave 0 baseline

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

Returns the canonical registry metadata. It is empty during Wave 0 because no
product operation exists yet.

```json
{
  "operations": []
}
```

## `POST /api/process`

The first image-bearing endpoint accepts `multipart/form-data`:

- `image` — a PNG or JPEG file, validated by magic bytes rather than extension;
- `operation_id` — currently only `color_noop`.

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
`processing_ms` from full `request_ms`. `/api/compare`, `/api/frequency`, and
`/api/metrics` remain deferred to their planned waves.

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
