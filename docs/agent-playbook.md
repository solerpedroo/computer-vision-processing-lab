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
