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

## Future image-bearing endpoints

`POST /api/process`, `/api/compare`, `/api/frequency`, and `/api/metrics` are
not implemented in Wave 0. Their primary image transport will be
`multipart/form-data`: an `image` file field plus typed operation fields or a
validated JSON parameter part. Wave 1 defines exact request/response schemas,
magic-byte validation, file/dimension limits, and error payloads.

All output images will be encoded PNG. Responses will distinguish algorithm
`processing_ms` from full `request_ms`.
