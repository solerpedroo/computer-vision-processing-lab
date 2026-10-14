# Architecture — product baseline (through Wave 6)

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
a registry operation without a handler or an orphaned handler.

## Timing and state

Future process responses expose algorithm-only `processing_ms` separately from
total `request_ms`. The original image belongs to client state and remains
unchanged until explicit reset. The server does not persist uploads by default.

## Wave 1 image path

`POST /api/process` receives an `image` multipart file and an `operation_id`.
The image adapter verifies PNG/JPEG signatures, caps input at 10 MiB and
4096 × 4096 pixels, decodes it to the ADR-004 RGB representation, and discards
the bytes after the request. `color_noop` is a pure identity operation used to
prove the full path; its output is encoded as PNG only at the HTTP boundary.

The Wave 1 UI creates a local URL for the original image and keeps it immutable.
It displays a separate processed PNG URL, client-side metadata, timing, shared
zoom, reset, and download. Wave 2 will replace the fixed identity selection with
registry-driven operation controls.

## Wave 2 color pipeline

The dispatcher validates multipart JSON parameters against `registry.yaml`,
applies defaults there, then invokes a pure color handler. Handlers return a
`ProcessResult` with a displayable image and histogram data; the API adapts that
data to JSON and Plotly renders it in the frontend. The UI fetches color registry
entries once, generates selects/sliders from their schema, and only reprocesses
when the user chooses **Apply operation**.

OpenCV receives RGB arrays. Grayscale results are two-dimensional `uint8` PNGs.
HSV and Lab results preserve native component arrays for channels and charts;
their three-channel PNG is explicitly an inspection encoding per ADR-006.

## Wave 3 spatial filtering

Spatial operations receive and return RGB `uint8` arrays. Box and Gaussian
filters use `REFLECT_101` borders; median uses OpenCV's documented edge behavior;
bilateral uses its native edge-preserving implementation. Odd kernels are
validated by the registry and again at the processing boundary. Sharpening uses
a fixed 5×5 Gaussian unsharp mask; Laplacian returns its absolute RGB response.

## Wave 4 edge detection

Edge operations convert canonical RGB input to grayscale internally and return
grayscale `uint8` responses. Sobel, Prewitt, and Laplacian responses are
absolute magnitudes; Canny returns a binary `0`/`255` edge map and rejects
reversed thresholds.

## Wave 5 thresholding & morphology

Morphology handlers operate on grayscale-derived binary masks. Threshold operations
produce `{0, 255}` masks; morphological filters use odd square structuring elements.
When the output is a binary mask, processors attach `connected_components` in result
metadata; the API maps this into `ProcessResponse.metadata` for the UI metrics strip.

## Wave 6 frequency domain

Grayscale input is converted to normalized float for FFT. The spectrum operation
returns a log-magnitude, fftshift-centered visualization (`output_kind: spectrum`).
Gaussian LPF/HPF multiply the shifted spectrum by smooth radial masks, inverse-transform,
and re-quantize to `uint8`. Numerical acceptance tests compare frequency Gaussian LPF
against a spatial Gaussian low-pass on the same patch (see implementation plan §5.6).

## Wave 7 comparison & metrics

Pure metric functions live in `backend/app/metrics/` without FastAPI imports.
`POST /api/compare` decodes once and invokes the dispatcher twice. `POST /api/metrics`
decodes two uploads and returns MSE, PSNR (nullable), and SSIM. The frontend **Compare**
mode runs both arms, shows three viewers, and fetches metrics against the original upload.

## Wave 8 experiment export

Export is implemented in the browser (`frontend/lib/experiment.ts`): structured JSON
records, CSV derivatives, and sequential PNG downloads. Import parses JSON and restores
UI state without storing images server-side. Reproducible batch studies use Python CLIs
under `experiments/*/run.py` calling the same dispatcher as the API.
