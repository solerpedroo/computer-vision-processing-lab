# Agentic workboard

One task owner edits only their row. New implementation tasks are created from
[`task-template.md`](task-template.md); details and evidence stay in the linked
card rather than this table.

| Wave | Task card | Status | Owner | Dependency / next gate |
|---|---|---|---|---|
| Foundation | Agentic layer (ADR-001) | done | repository | Planner creates Wave 0 task cards before product code |
| 0 | `tasks/wave-0-contract-baseline.md` | done | cv-reviewer | Wave 1 image input task may now be planned |
| 1 | `tasks/wave-1-image-input.md` | done | cv-reviewer | Wave 2 color task may now be planned |
| 2 | `tasks/wave-2-color-processing.md` | done | cv-reviewer | Wave 3 spatial-filter task may now be planned |
| 3–9 | — | blocked by preceding waves | — | follow delivery sequence in implementation plan |
