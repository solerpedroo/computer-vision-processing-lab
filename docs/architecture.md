# Architecture — Wave 0 baseline

## Boundary map

```text
Next.js UI  →  typed API client  →  FastAPI routes  →  registry/dispatcher  →  pure processors
                 presentation         transport            contract              numerical logic
```

The frontend never reimplements algorithms. FastAPI routes own HTTP decoding,
validation, error mapping, and encoding. The future dispatcher invokes pure
processing functions, which do not import FastAPI or frontend code.

## Image convention

Per ADR-004, all decoded color images passed into processors are contiguous RGB
`numpy.ndarray` values with shape `(height, width, 3)`, `uint8` dtype, and range
`[0, 255]`. Alpha is discarded at decode. Grayscale outputs are two-dimensional
`uint8` arrays in the same range. A processor documents any local float range,
color conversion, and border behavior.

## Operation registry

`backend/app/processing/registry.yaml` is the canonical operation contract. It
will supply stable IDs, English labels, descriptions, output kinds, constraints,
and controls to the API and UI. The dispatcher integrity assertion rejects either
a registry operation without a handler or an orphaned handler. The empty list is
intentional during Wave 0.

## Timing and state

Future process responses expose algorithm-only `processing_ms` separately from
total `request_ms`. The original image belongs to client state and remains
unchanged until explicit reset. The server does not persist uploads by default.
