---
name: JTBD Widget System Pattern
description: Full-stack pattern for adding new widget types to the JTBD canvas - backend (enum, model, migration, Pydantic, prompt, service, prefetch, schema, route) and frontend (types, component, renderer, index, COL_SPAN). User-authored `note` variant sidesteps the AI extraction path.
type: project
last_modified: 2026-04-20
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

**How to apply:** Follow this checklist for any future widget type additions. As of 2026-04-20 there are 9 widget types: metric_chart, trend_chart, card_list, stat_list, social_post, survey, sparkline_stat, market_sizing, note.

## User-authored notes (`note` widget type)

Notes diverge from the AI-authored widget pattern in a few places — remember:

1. **No evidence-extraction hooks.** Skip the Pydantic output class, the prompt section, and the agent's `item_lists` updates. The backend skips these too.
2. **REST CRUD, not AI generation.** Endpoints:
   - `POST /api/v1/jtbd/jobs/{jobUuid}/notes/` body `{ body }` → 201 returns the full `IJTBDCustomWidget`
   - `PUT /api/v1/jtbd/jobs/notes/{itemUuid}/` body `{ body }` → 200
   - `DELETE /api/v1/jtbd/jobs/notes/{itemUuid}/` → 204
3. **WidgetRenderer gates the sparkle "Refine" button** on `widget.widgetType !== 'note'` — user-authored widgets don't reassess. `NoteWidget` requires `jobUuid` to render (edit/delete mutations need it).
4. **JTBDCard has a third section: Notes.** The expanded card splits `customWidgets` into `marketSizingWidgets` / `evidenceWidgets` / `noteWidgets`; notes render in their own `CollapsibleSection` with an inline add-note form at the bottom.
5. **`IJTBDNoteItem` shape:** `{ uuid, body, createdBy: string | null, createdAt, updatedAt }` — no `sources` or `displayOrder` fields.
6. **Hooks are in jtbd.hook.ts:** `useCreateJTBDNote(jobUuid)` (job-scoped), `useUpdateJTBDNote()` + `useDeleteJTBDNote()` (take `{ itemUuid, jobUuid }` mutation vars). All invalidate `jtbdKeys.job(jobUuid)` + `jtbdKeys.all/jobs` + `jtbdKeys.all/currentScan` via a shared `invalidateJobCaches` helper.
7. **Overseer integration:** `'jtbd_note_add'` edit-suggestion kind with `{ jobUuid, body }` payload. `OverseerPopup.applyJTBDNoteAdd` calls `api.jtbd.createNote` directly (not the hook) because the hook is job-scoped and the carousel can target arbitrary jobs — manual cache invalidation after the POST. Tracks its own `isAddingJTBDNote` flag folded into `isApplyingEdits`.
