---
name: Gemini Tool Factory Pattern
description: Factory pattern for creating read-only Gemini tools that close over account scope; includes circular-import gotcha and BaseGeminiAgentBuilder wiring
type: project
last_modified: 2026-04-20
---

# Gemini Tool Factory Pattern

## Canonical pattern

Reference: `projects/server/server/core/ai/gemini/nucleus_search.py:52-133` and `projects/server/server/core/ai/gemini/jtbd_tools.py`.

Every Gemini tool:
1. Factory closes over scope (e.g. `account_uuid`) — never bind the loaded object instance.
2. Inner `async def` has a rich docstring (Gemini uses this as the tool description — write in second person: "Use this tool when…").
3. Explicit `fn.__name__ = "snake_case_name"` — this is the Gemini-visible name.
4. Return values should be plain `dict[str, Any]` — JSON-serializable.

## Wiring into `BaseGeminiAgentBuilder`

1. Add a `_include_<group>_tools: bool = False` flag in `__init__`.
2. Add a fluent `.with_<group>_tools(...)` method.
3. In `_build_tools`, append factory-created callables when the flag is set.
4. If tools need a system-prompt addendum, add a `_build_<group>_tools_addendum()` method and append inside `_build_system_instruction`.

Subclasses (like `OverseerGeminiAgentBuilder`) inherit the method automatically.

## CRITICAL: Circular import gotcha

**Do NOT import Django models or services at the top level of a file in `core/ai/gemini/`.**

`core.ai.gemini.__init__` re-exports `BaseGeminiAgentBuilder`. Many app-specific agents (e.g. `apps.jtbd.ai.agents.jtbd_agent_builder`) import `BaseGeminiAgentBuilder` from `core.ai.gemini`. If your tool module imports `apps.jtbd.models.*` or `apps.jtbd.services.*` at the top, Python hits `apps.jtbd.ai.agents.*` during module init, which re-enters `core.ai.gemini.__init__` before it has finished loading → `ImportError: cannot import name 'BaseGeminiAgentBuilder' from partially initialized module 'core.ai.gemini'`.

**Fix:** Defer all app model/service imports to inside each inner tool function (or lazy-import helper). Only `django.db.models` imports (Count, Prefetch, Q, etc.) and `TYPE_CHECKING` imports are safe at module top.

**Why:** A `TYPE_CHECKING` block is frequently auto-pruned by ruff if the only import is in it — if you genuinely need the type hint, use `from __future__ import annotations` + `Any` instead.

## Account scoping

Never bypass the service-layer account scope. Resolve `Account.objects.aget(uuid=account_uuid)` at tool-invocation time (inside the inner async function), not at factory time — this ensures account deletions/renames are reflected, and the closure stays small (just a string UUID).

## Overseer tool-activity display labels

Add an entry to `_TOOL_DISPLAY_CONFIG` in `projects/server/server/apps/chat/ai/agents/overseer_agent/gemini_builder.py` with `start_label`, `done_label`, `start_icon`, `done_icon`. Icons in use: `search`, `scan`, `analyze`, `check`.

## Always-on page-context gating

To make a tool group ambient on a specific Overseer page (e.g. JTBD canvas), call `.with_<group>_tools(account_uuid)` inside `_build_agent` in `gemini_agents.py` gated by `if page_context == "<name>"`. Don't wire via the router's `classify_intent` flags — ambient tools should be unconditional on their page context.
