---
name: LLMContextMixin FK rendering semantics
description: How bare-FK entries in `__context_fields__` are serialized for LLM context — full nested block vs `__str__` fallback
type: project
last_modified: 2026-04-26
---

# How `__context_fields__` renders FK fields

Source: `projects/server/server/core/django/models/llm_context_mixin.py` — `_get_nested_value` (line ~455) + `format_nested_context` (line ~196).

## Decision tree for a bare FK name in `__context_fields__`

For an entry like `"some_fk"` (no dot path):

1. `getattr(self, "some_fk", None)` — if `None`, the field is omitted.
2. If the related instance is a `LLMContextMixin` subclass → emits a full nested context block, recursing through that model's own `__context_fields__`. This can be heavy.
3. If the related instance is **not** a `LLMContextMixin` (plain `models.Model`) → falls through to returning the raw object. `format_nested_context` then renders `<some_fk>{value}</some_fk>`, which str-coerces via `__str__`.

## Implication for context-field selection

- Listing an FK to an `LLMContextMixin` model = subscribing to that model's full context block. Token-expensive, but high-fidelity.
- Listing an FK to a plain model with a meaningful `__str__` = a compact human-readable label. Cheap and useful for "which scan/job/source was this".
- Listing an FK to a plain model with default `__str__` = the unhelpful `ModelName object (1)` repr. Avoid; document the omission inline.

## Reference precedents

- `apps/concepts/models/research_insight.py` — lists `"source"` bare; `knowledge.Source` is `LLMContextMixin`, so emits full block.
- `apps/jtbd/models/jtbd_job.py` — lists `"merged_from_scan"` bare; `JTBDScan` is plain `models.Model` with a date+status `__str__`, yielding `<merged_from_scan>JTBD Scan 2026-04-26 14:30 (current) [completed]</merged_from_scan>`.

## How to apply

When adding FK fields to `__context_fields__`, check the related model:
- `grep -n "class {RelatedModel}" ... | grep LLMContextMixin` — is it a mixin subclass?
- Read `__str__` on the related model — is it informative?
Then choose: list bare for cheap label, list bare for full nested block, or omit and leave a one-line comment explaining the omission.
