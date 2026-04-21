---
name: Idea Playground Persona Insight Pipeline
description: Pattern for persona insights as regular insight bubbles in Idea Playground, and persona-context weaving patterns (consider_all_personas toggle, __PERSONA_BLOCK__, with_persona_context helper)
type: project
last_modified: 2026-04-21
---

The old persona question injection system (injecting a special "Which personas fit this idea?" question with `is_persona_question` flag, `PersonaOptionSchema`, `SetPersonaSelectionsRequest`, and `set_persona_selections` route/service) was fully removed in April 2026 -- both backend and frontend.

Replaced with a `PersonaInsightPipeline` that runs in parallel with research/nucleus/file/supplementary pipelines inside `_generate_insights_parallel()`. It generates 1-3 persona-specific insight bubbles (one per persona, max 3) with `source_type: "persona"` that appear alongside other insights.

**Why:** Persona perspectives are better delivered as insight bubbles (consistent UX) rather than a separate question type that required its own selection UI and didn't participate in the insight pipeline.

**How to apply:** When adding new insight pipeline types to Idea Playground, follow the pattern: create a static method `_run_*_pipeline` on `IdeaPlaygroundService`, add it to `asyncio.gather` in `_generate_insights_parallel`, unpack the result in `generate_combined_insights`, and append to `insights_data` with the appropriate `source_type`.

**Frontend cleanup completed:**
- Deleted `PersonaChips.tsx` component
- Removed `IPersonaOption` interface, `PERSONA_MATCH` from `QuestionType`, persona fields from `IAnchorQuestion` and `Question`
- Removed `setPersonaSelections()` API method and `ideaPlaygroundPersonaSelections` endpoint
- Added `'persona'` to all `sourceType` unions (`IResearchInsight`, `INucleusInsight`, `IBulkInsight`, `InsightCard`)
- Added persona insight handling in `ResearchInsightCard.tsx` (User icon, blocks double-click/source-click)

Key files:
- Pipeline: `apps/concepts/ai/pipelines/idea_playground/persona_insight_pipeline.py`
- Types: `PersonaInsight` / `PersonaInsightList` in `types.py`
- Prompt: `PERSONA_INSIGHT_SYSTEM_INSTRUCTION` in `prompts.py`
- Integration: `IdeaPlaygroundService._run_persona_insight_pipeline()` extracted as static method to keep complexity under 10

## Persona-Context Weaving (PR-#1012, follow-ups in branch `persona-weaving-follow-ups`)

Two delivery paths coexist:
1. **Tagged personas** → inline text via `_load_persona_contexts(seed)` → passed as `persona_contexts: list[str] | None` to pipelines.
2. **Account-wide fallback (opt-in via `Seed.consider_all_personas`)** → Gemini Files via `_get_persona_gemini_files(seed, account_id)` → merged into `gemini_files` arg. Pre-seed title generation uses `_get_account_persona_gemini_files(account_id, cache_key=None)` which is the shared helper the seed-scoped function delegates to.

**Prompt placeholder pattern:**
- Every persona-aware system prompt contains a single `__PERSONA_BLOCK__` placeholder.
- `with_persona_context(prompt, block, include)` from `prompts.py` injects or strips the block. It **raises `ValueError`** if the placeholder is missing (structural contract). Injection surrounds the block with canonical `\n\n` padding; the block's own leading/trailing newlines are stripped to avoid triple-newlines.
- Each pipeline imports `PERSONA_BLOCK_*` constant + `with_persona_context` and wraps `system_instruction=with_persona_context(SYSTEM_INSTRUCTION, PERSONA_BLOCK_*, has_persona_context)` at every call site.

**Pipeline contract:** Any persona-aware Idea Playground pipeline must have:
- `has_persona_context: bool` in `State` TypedDict + `setup()` signature.
- System instruction with `__PERSONA_BLOCK__` placeholder + `with_persona_context(...)` wrapper.
- Service/task callers load both `persona_contexts` + `persona_files` and pass `has_persona_context=_has_persona_context(persona_contexts, persona_files)`.

**DRY helper:** Module-level `_has_persona_context(contexts, files)` in `idea_playground_service.py` centralizes the truthiness check — used across 11+ call sites.

**Mutual exclusivity:** Tagged personas override `consider_all_personas=True`. Single source of truth is inside `IdeaPlaygroundService.create_seed_with_thought` (not in routes).

**Backfill migration `0193`:** Preserves implicit account-wide behavior for seeds created before PR-#1012 landed. Target = seeds with no tagged personas + at least one generated Concept whose `living_personas` M2M is populated (durable DB signal that implicit persona weaving took effect). Forward flips `consider_all_personas=True`. Reverse is a no-op.
