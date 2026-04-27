---
name: JTBD Citation Registration & Drop Surfacing
description: How `_register_citations` validates SourceCitations per source_type and surfaces drops to the agent via `dropped_citations` in tool responses
type: project
last_modified: 2026-04-26
---

# JTBD Citation Registration

Reference: `projects/server/server/core/ai/gemini/jtbd_mutation_tools.py` (`_is_valid_citation`, `_register_citations`).

## Validation rules (`_is_valid_citation`)

Returns `(bool, reason | None)`:
- **All source_types**: `title` is required (non-empty after strip).
- **`source_type='nucleus'`**: `snippet` required; `source_url` optional. Nucleus pills render on the frontend as non-clickable references with the snippet shown via the native `title` attribute on hover.
- **All other source_types**: `source_url` must start with `http://` or `https://`.

Cross-field rules (e.g. nucleus requires snippet) live in `_is_valid_citation`, NOT in Pydantic. Pydantic accepts the broader shape so malformed citations reach the validator and produce useful drop records rather than cryptic `ValidationError`s.

## `_register_citations` return shape

Returns `tuple[list[Any], list[dict[str, Any]]]` — `(newly_registered_ids, dropped_records)`. A drop record is `{title, source_url, source_type, reason}`. Each drop is also logged via `logger.warning` so it's debuggable from `osiris-worker-1` logs without needing the agent transcript.

## Caller contract

Every caller (`add_*_widget`, `update_*_widget`, `add_job_source`, `_persist_constraint_field_update`) MUST:
1. Capture both return values: `registered, dropped = _register_citations(...)`.
2. Surface drops in the tool response under `dropped_citations` ONLY when the list is non-empty.

The agent prompt's "Drop feedback" section instructs it to read `dropped_citations` and re-emit corrected citations.

## SourceCitation Pydantic shape

`apps/jtbd/ai/agents/jtbd_job_editor/types.py`:
- `source_url: str = Field(default="", ...)` — defaults to empty string for nucleus citations.
- `title: str = Field(..., min_length=1, ...)` — required.
- `snippet: Optional[str]` — required at validator level for nucleus, optional otherwise.

## `add_job_source` nucleus exemption

The pre-`_persist` URL gate in `add_job_source` skips the http(s):// check when `source_type == JTBDSourceType.NUCLEUS.value`. The shape check (title + snippet) happens inside `_register_citations`.
