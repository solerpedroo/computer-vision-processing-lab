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
