# Implementation Lead Memory

- [idea_playground_persona_pipeline.md](idea_playground_persona_pipeline.md) - Persona insight pipeline + persona-context weaving (consider_all_personas, __PERSONA_BLOCK__, with_persona_context) in Idea Playground (2026-04-21)
## Project Patterns
- [jtbd_widget_pattern.md](jtbd_widget_pattern.md) - Full-stack JTBD widget type addition pattern incl. user-authored `note` variant (REST CRUD, sparkle-gating, JTBDCard Notes section) (2026-04-20)
- [gemini_tool_factory_pattern.md](gemini_tool_factory_pattern.md) - Gemini tool factory pattern, BaseGeminiAgentBuilder wiring, and the core.ai.gemini circular-import gotcha (2026-04-20)
- [overseer_edit_suggestion_kinds.md](overseer_edit_suggestion_kinds.md) - Overseer edit-suggestion carousel kinds (concept / jtbd_rule / jtbd_scan / jtbd_widget_reassess / jtbd_job_reassess / jtbd_note_add) — type contract, carousel branching, and handleConfirmEdits dispatch (2026-04-20)
- [llm_context_mixin_fk_rendering.md](llm_context_mixin_fk_rendering.md) - How bare-FK entries in `__context_fields__` serialize: full nested block when related model is LLMContextMixin, `__str__` fallback otherwise (2026-04-26)
- [jtbd_scan_edit_mutex.md](jtbd_scan_edit_mutex.md) - JTBD scan/edit mutex: PENDING-row + Redis lock + counter ordering, fail-closed `EditTrackingUnavailable` → 503, canonical UUID lock keys (2026-04-26)
- [jtbd_citation_registration.md](jtbd_citation_registration.md) - `_register_citations` per-source_type validation, nucleus URL-optional contract, `dropped_citations` surfacing for agent self-correction (2026-04-26)
- [overseer_prefill_nonce.md](overseer_prefill_nonce.md) - Overseer `prefillNonce` counter: how `openWithPrefill` signals a fresh prefill so `OverseerInput` moves the caret to the end without re-running on every keystroke (2026-04-26)
