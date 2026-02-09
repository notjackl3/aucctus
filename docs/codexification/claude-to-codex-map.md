# Claude to Codex Mapping (aucctus)

## Purpose
Provide a clean mapping from existing Claude frontend workflows to new Codex-native files without replacing Claude.

## Mapping

| Claude Pattern | Codex Equivalent | Notes |
|---|---|---|
| `aucctus/.claude/*` instructions | `aucctus/AGENTS.md` | Codex reads scoped agent instructions from `AGENTS.md`. |
| `aucctus/.claude/skills/*` | `aucctus/.agents/skills/*` | Frontend skills ported with high-parity names. |
| Claude local settings and hooks | `aucctus/.codex/config.toml` + skill checklists | Operational parity via process guardrails instead of hook parity. |

## Coexistence Rules
- Keep all Claude assets intact.
- Implement Codex assets as net-new only.
- Use project-scoped Codex config under `aucctus/.codex/`.

## Validation Expectations
- Always run:
  - `cd aucctus && npm run type-check`
  - `cd aucctus && npm run lint`

