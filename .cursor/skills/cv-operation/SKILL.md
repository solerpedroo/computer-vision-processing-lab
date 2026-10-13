---
name: cv-operation
description: Adds or changes a classical image-processing operation in Computer Vision Processing Lab. Use for color, spatial, edge, morphology, frequency, metric, or registry-backed processing work.
---

# CV operation workflow

Read `AGENTS.md`, the assigned task card, and `docs/agentic/architecture-decisions.md`.
If an image convention is absent, stop and propose an ADR before implementation.

## Required operation contract

Document in the processing function docstring and test:

- input color order and alpha policy;
- accepted dtype and value range, plus output dtype/range;
- grayscale conversion behavior, if any;
- parameter units, bounds, defaults, and odd-kernel constraints;
- border mode and behavior on tiny images;
- `aux`/metadata fields and whether timing excludes decode/encode.

Keep processing pure: no HTTP, filesystem, environment, or UI imports. Use the
operation registry as the parameter contract; routes validate/decode/encode;
the frontend consumes registry metadata rather than restating constraints.

## Implementation checklist

- [ ] Add or change the registry entry and its handler together.
- [ ] Reject invalid parameters explicitly; never silently coerce a different algorithm.
- [ ] Preserve input shape unless the documented output kind says otherwise.
- [ ] Add synthetic invariant tests and one licensed sample-image test when samples exist.
- [ ] Measure only the operation in `processing_ms`.
- [ ] Update the task card, workboard, and handoff evidence.

## Numerical defaults

Use fixed seeds for generated noise. Normalize deliberately before MSE/PSNR/SSIM
comparisons; record the selected scale. Use `allclose` or bounded-error tests for
floating-point paths, with tolerance explained by the implementation rather than
chosen after a failure. Keep integer conversion and clipping at defined edges of
the pipeline, not inside arbitrary intermediate steps.
