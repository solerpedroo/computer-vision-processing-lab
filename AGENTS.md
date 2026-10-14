# Computer Vision Processing Lab — agent entrypoint

## Current boundary

**MVP gate closed (waves 0–9).** New work must be scoped outside [`docs/project-scope.md`](docs/project-scope.md) §8
future features or as maintenance. See [`docs/mvp-acceptance.md`](docs/mvp-acceptance.md) and
[`docs/agentic/workboard.md`](docs/agentic/workboard.md).

## Start protocol

1. Read `docs/project-scope.md`, then `docs/implementation-plan.md`.
2. Read `docs/agentic/architecture-decisions.md` and the assigned task card.
   If no card exists, create one from `task-template.md` before code.
3. Claim one bounded task only. Do not mix unrelated operations or waves.
4. Read the applicable rule in `.cursor/rules/` and skill in `.cursor/skills/`.
5. Implement, validate, document a handoff, and stop at the task boundary.

## Shared invariants

- The operation registry is the future single source of truth for operations
  and parameters. Never duplicate defaults or bounds in UI code.
- Image processing is pure, deterministic where feasible, and independent of
  FastAPI and React. Routes adapt transport; components render state.
- Preserve the original upload; validate actual image bytes, dimensions, and
  parameters. The server is stateless by default.
- Use explicit color order, dtype, value range, alpha behavior, border mode,
  and timing scope in every new operation.
- UI and user-facing technical copy are English. Planning and internal docs may
  be Portuguese or English, but do not silently translate API identifiers.
- Do not add a dependency, endpoint, or data model outside the assigned task
  without recording an ADR and getting the Planner to split the work.

## Context that survives agents

Use repository artifacts, not chat memory, as the handoff protocol:

- `docs/agentic/architecture-decisions.md` — accepted cross-cutting choices.
- `docs/agentic/tasks/` — one committed, bounded task card per implementation
  task; task cards link requirements, contracts, tests, and DoD.
- `docs/agentic/handoffs/` — committed factual handoffs for incomplete work or
  non-obvious follow-up. Do not write a handoff for a clean, completed task.
- `docs/agentic/workboard.md` — current wave status and ownership; edit only
  your row, and avoid simultaneous broad rewrites.

Never treat an uncommitted file, terminal history, or a previous agent message
as authoritative context.

## Required handoff content

When work is incomplete or needs review, copy `handoff-template.md` into the
`handoffs/` directory as `YYYY-MM-DD-<task-id>.md`. Include: exact commit/diff
scope, decisions made, commands and results, remaining risks, and the next
single action. Never include secrets, base64 image payloads, or large logs.

## Roles

Use the specialized agents in `.cursor/agents/`:

- `cv-planner` owns slicing, dependencies, and task cards.
- `cv-implementer` owns one vertical operation slice.
- `cv-test-engineer` owns numerical test design and regression evidence.
- `cv-reviewer` owns contract, safety, and scientific-review gates.

The same person or agent may fill several roles sequentially; do not ask two
agents to edit the same source files concurrently.

## Completion gate

Before a task is ready for review: run the commands specified by its task card,
update its DoD, update its workboard row, and create a factual handoff if the
next person needs context. A reviewer may reject scope creep even if tests pass.
