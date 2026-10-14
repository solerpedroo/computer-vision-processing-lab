# Agent playbook

This is the concise operational companion to [`../AGENTS.md`](../AGENTS.md).
Use the durable coordination records under [`agentic/`](agentic/), rather than
relying on a previous agent's conversation context.

## Loop for every bounded task

1. **Plan:** the Planner creates a card in `agentic/tasks/`, checks dependencies
   and declares its allowed files.
2. **Implement:** one Implementer claims it, follows the applicable rules and
   skills, and makes the smallest vertical change.
3. **Test:** the Test Engineer records exact test commands, results, fixtures,
   numerical conventions, and tolerances in the card.
4. **Review:** the Reviewer checks the plan, ADRs, diff, and evidence. Blockers
   are fixed in the same card; cross-cutting discoveries become an ADR proposal.
5. **Handoff:** leave a factual handoff only for partial, blocked, or non-obvious
   work. Update the owner's row on the workboard.

## Parallelism protocol

Parallelize independent processing modules and tests only after the Planner
assigns disjoint file boundaries. Serialize edits to shared integration points:
the registry, dispatcher, Pydantic schemas, typed API client, and generic
parameter panel. No two agents edit the same card or workboard row.

## Per-wave gate

- All task-card DoD items are checked.
- Relevant local CI commands pass with recorded output.
- ADRs cover any cross-cutting convention introduced or changed.
- The Reviewer confirms the wave does not start future-scope features.
- Any continuation can start from the committed card and handoff alone.

Refer to `implementation-plan.md` for the product-specific DoD of every wave.

## Wave progress (maintain on closure)

| Wave | Status | Task card | Last verified |
|------|--------|-----------|---------------|
| 0 | done | `wave-0-contract-baseline.md` | 2026-10-13 |
| 1 | done | `wave-1-image-input.md` | 2026-10-13 |
| 2 | done | `wave-2-color-processing.md` | 2026-10-13 |
| 3 | done | `wave-3-spatial-filtering.md` | 2026-10-13 |
| 4 | done | `wave-4-edge-detection.md` | 2026-10-13 |
| 5 | done | `wave-5-morphology.md` | 2026-10-13 |
| 6 | done | `wave-6-frequency.md` | 2026-10-13 |
| 7 | done | `wave-7-comparison.md` | 2026-10-13 |
| 8 | done | `wave-8-experiment-export.md` | 2026-10-13 |
| 9 | planned | — | E2E + deploy |

When marking a wave **done**, update this table, the workboard row, and record
`ruff` / `pytest` / frontend test output in the task card.
