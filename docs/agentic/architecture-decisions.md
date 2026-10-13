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
