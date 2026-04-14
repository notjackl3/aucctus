---
name: Idea Playground Persona Insight Pipeline
description: Pattern for persona insights as regular insight bubbles in Idea Playground, replacing the old persona question injection system
type: project
last_modified: 2026-04-09
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
