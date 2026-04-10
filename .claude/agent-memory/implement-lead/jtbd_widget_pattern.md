---
name: JTBD Widget System Pattern
description: Full-stack pattern for adding new widget types to the JTBD canvas - backend (enum, model, migration, Pydantic, prompt, service, prefetch, schema, route) and frontend (types, component, renderer, index, COL_SPAN)
type: project
last_modified: 2026-04-10
---

## Backend (8 touch points)

Adding a new JTBD widget type on the backend requires changes in 8 files:

1. **Enum** (`apps/jtbd/enums.py`):
   - Add value to `JTBDWidgetType` TextChoices
   - If the new widget has its own choices (e.g., metric types), add a new enum class

2. **Model** (`apps/jtbd/models/jtbd_custom_widget.py`):
   - New item model inheriting `LLMContextMixin, models.Model` with: uuid, widget FK, item-specific fields, sources JSONField, display_order
   - Add TYPE_CHECKING annotation on `JTBDCustomWidget` for the related manager
   - Update `__init__.py` exports and `__all__`

3. **Migration**: `uv run makemigrations jtbd --name descriptive_name`

4. **Pydantic output** (`ai/agents/evidence_extraction/types.py`):
   - Add item output class following `AucctusBaseModel` pattern
   - Add to `WidgetType` Literal
   - Add items list to `JTBDCustomWidgetOutput`

5. **Prompt** (`ai/agents/evidence_extraction/prompts.py`):
   - Add numbered section to system prompt describing the widget type
   - Update widget count in "Choose 0-N widgets from these N types"

6. **Agent** (`ai/agents/evidence_extraction/agent.py`):
   - Pass any new context data to `get_evidence_extraction_user_prompt()`
   - Add new item list to `_strip_empty_url_sources` and `_strip_social_urls_from_widget` item_lists

7. **Service** (`services/jtbd_service.py`):
   - Import new model
   - Add `_VALID_xxx` set if needed
   - Add `elif wtype == JTBDWidgetType.XXX` branch in `_create_widgets()`
   - Add `Prefetch("xxx_items", ..., to_attr="ordered_xxx_items")` in BOTH `get_job()` and `_job_prefetches()`

8. **Schema + Route**:
   - Add item schema in `schemas/custom_widget.py`
   - Add to `JTBDCustomWidgetSchema` widgetType Literal + items list
   - Add serialization block in `routes/v1/scan.py` `_build_widget_schema()`
   - Import new schema in route file

## Frontend (5 touch points)

1. **Types** (`src/libs/api/types/jtbd.d.ts`):
   - Add literal to `JTBDWidgetType` union
   - Add `IJTBDXxxItem` interface with uuid, sources, displayOrder
   - Add `xxxItems: IJTBDXxxItem[]` to `IJTBDCustomWidget` (flat-polymorphic)

2. **Component** (`src/app/pages/JTBD/widgets/XxxWidget.tsx`):
   - Receives `widget: IJTBDCustomWidget`
   - Sorts items by `displayOrder`
   - Uses `WidgetHeader` + `ItemSources`/`SourcePill`
   - Framer Motion entry animations

3. **Renderer** (`src/app/pages/JTBD/widgets/WidgetRenderer.tsx`):
   - Add import + `case 'xxx':` in switch

4. **Index** (`src/app/pages/JTBD/widgets/index.ts`):
   - Re-export new widget

5. **COL_SPAN** (`src/app/pages/JTBD/JTBDCard.tsx`):
   - Add entry to `COL_SPAN` Record for grid layout

**Why:** The widget system is flat-polymorphic (all item arrays on every widget, only matching one populated). This avoids discriminated unions in favor of simpler serialization from the backend.

**How to apply:** Follow this checklist for any future widget type additions. As of 2026-04-10 there are 8 widget types: metric_chart, trend_chart, card_list, stat_list, social_post, survey, sparkline_stat, market_sizing.
