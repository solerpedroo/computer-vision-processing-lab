# Architecture decisions

This log is the durable decision record for people and agents. Add an entry
before changing a cross-cutting convention. Accepted decisions supersede informal
chat context; implementation details belong in task cards.

## ADR-001 — Agentic foundation precedes product implementation

- **Status:** accepted
- **Date:** 2026-10-13
- **Decision:** Establish project agents, CV skills, file-scoped rules, task
  cards, handoffs, and a workboard before Wave 0 source scaffolding.
- **Why:** The project spans numerical Python, HTTP contracts, and a registry-
  driven UI. A durable coordination protocol limits contract drift and context
  loss across agents.
- **Consequence:** Product code starts only from a planned Wave 0 task card.

## ADR-002 — Registry-led operation contract

- **Status:** accepted (design baseline from implementation plan §5.2)
- **Decision:** A registry is the future canonical definition of each operation
  ID, module, English display text, output kind, and parameter schema.
- **Consequence:** Backend handlers, API validation, and frontend controls must
  be tested against the registry; no second source of parameter defaults exists.

## ADR-003 — Explicit image conventions are mandatory

- **Status:** accepted
- **Decision:** Each public processing operation declares color order, dtype,
  value range, alpha policy, border mode, and grayscale behavior.
- **Consequence:** A task card cannot be marked ready without that convention
  and corresponding test evidence. The exact baseline convention is selected in
  the first Wave 0 architecture task rather than guessed here.

## ADR-004 — Canonical in-memory image and transport convention

- **Status:** accepted
- **Date:** 2026-10-13
- **Decision:** The backend canonicalizes decoded images to a contiguous
  three-channel RGB `numpy.ndarray` of `uint8` values in `[0, 255]`; alpha is
  discarded at decode and grayscale results are two-dimensional `uint8` arrays
  in the same range. Operations that require floats create a local documented
  float representation and convert only at their output boundary. The primary
  image transport for image-bearing endpoints will be `multipart/form-data`.
- **Why:** RGB is the browser-facing convention, a fixed integer boundary makes
  encoded results and metadata unambiguous, and multipart avoids base64 payload
  overhead. OpenCV BGR conversions remain isolated in adapters or functions that
  explicitly document them.
- **Consequence:** Future registry entries, processing docstrings, schemas, and
  tests use this convention. Wave 1 implements the decoder and upload limits;
  Wave 0 deliberately has no image-bearing endpoint.

## ADR-005 — Upload safety envelope

- **Status:** accepted
- **Date:** 2026-10-13
- **Decision:** Wave 1 accepts only byte-verified PNG and JPEG uploads up to
  10 MiB and decoded dimensions up to 4096 × 4096 pixels. Decoding discards
  alpha and returns RGB `uint8` under ADR-004. Upload bytes and decoded arrays
  exist only for the request lifetime.
- **Why:** These limits make the CPU-only MVP responsive and constrain malformed
  or decompression-bomb-like input without imposing an unnecessary database or
  storage service.
- **Consequence:** API validation returns clear 4xx errors; the UI advertises
  the same file envelope. A later performance wave may amend the numbers with
  measured evidence, not per-route overrides.

## ADR-006 — Native color components and preview encoding

- **Status:** accepted
- **Date:** 2026-10-13
- **Decision:** RGB input is converted to OpenCV's native HSV or Lab component
  arrays for analysis. When a three-channel HSV/Lab result is exported as PNG,
  those native component values occupy the PNG's RGB slots solely as an
  inspection preview; it is not a perceptual RGB rendition. Channel operations
  return a grayscale view of the selected native component, and histograms name
  component axes explicitly.
- **Why:** This preserves numerical meaning for experiments while avoiding a
  second, misleading color conversion at the API boundary.
- **Consequence:** The UI must label HSV/Lab previews and charts accurately;
  code and documentation cannot imply that an HSV/Lab preview is display RGB.
