---
name: Overseer Edit Suggestion Kinds Pattern
description: How to extend the Overseer `overseer.edit.suggestion` carousel with new suggestion kinds (currently `concept`, `jtbd_rule`, `jtbd_scan`, `jtbd_widget_reassess`, `jtbd_job_reassess`, `jtbd_note_add`). Covers the type contract, carousel branching, and mutation dispatch in `handleConfirmEdits`.
type: project
last_modified: 2026-04-20
---

# Overseer Edit Suggestion Kinds

The Overseer edit-suggestion carousel is a single carousel UI that can carry
heterogeneous suggestion cards. Each card's downstream mutation is selected
by a `kind` discriminator on the suggestion itself.

## Contract

The backend emits `overseer.edit.suggestion` with:

```ts
content: IConceptReportEdit = { reply, edits: IAiEditingSuggestion[], uuid }
```

`IAiEditingSuggestion` (in `aucctus/src/libs/api/types/ai-editing.d.ts`) carries:

- `kind?: 'concept' | 'jtbd_rule' | 'jtbd_scan'` — missing defaults to `concept`
- `section: string` — concept path still uses `AllEditableConceptSections`; JTBD kinds use placeholder strings and are not highlighted on the page
- `title`, `description`, `reason`, `icon` — always present
- `agentImplementationInstructions?: string` — structured instructions from the agent
- `payload?: EditSuggestionPayload` — kind-specific data (see below)

Payload shapes:

- `IJTBDRuleEditPayload` — `{ configUuid, action: 'add' | 'update' | 'delete' | 'toggle', ruleUuid?, ruleText?, isActive? }`
- `IJTBDScanTriggerPayload` — `{ configUuid, reason }`
- `IConceptEditPayload` — empty object; concept flow reads the suggestion fields directly

## Carousel branching

`AIEditCarousel.tsx` renders a per-kind body block in addition to the shared
title/description/reason card. For JTBD kinds it resolves the config name
from the React Query cache (no extra fetch):

```ts
queryClient.getQueryData<IJTBDConfigList[]>(jtbdKeys.configs())?.find(c => c.uuid === configUuid)
  ?? queryClient.getQueryData<IJTBDConfigDetail>(jtbdKeys.config(configUuid))
```

Falls back to `Config ${uuid.slice(0, 8)}` when the cache is cold.

## Confirm handler (dispatch)

`handleConfirmEdits` in `OverseerPopup.tsx` groups `selectedEdits` by
`kind` and dispatches to the correct mutation:

| kind | hook | variables |
|------|------|-----------|
| `concept` (default) | `useConceptAiEditing().mutate` | `{ concept_uuid, session_id, edit }` |
| `jtbd_rule` action=add | `useAddJTBDRule().addRuleAsync` | `{ configUuid, data: { ruleText } }` |
| `jtbd_rule` action=update | `useUpdateJTBDRule().updateRuleAsync` | `{ ruleUuid, configUuid, data: { ruleText } }` |
| `jtbd_rule` action=toggle | `useUpdateJTBDRule().updateRuleAsync` | `{ ruleUuid, configUuid, data: { isActive } }` |
| `jtbd_rule` action=delete | `useDeleteJTBDRule().deleteRuleAsync` | `{ ruleUuid, configUuid }` |
| `jtbd_scan` | `useTriggerJTBDScan().triggerScanAsync` | `configUuid` |
| `jtbd_widget_reassess` | `useReassessJTBDJob().reassessJobAsync` | `{ jobUuid, editInstructions, widgetUuids }` |
| `jtbd_job_reassess` | `useReassessJTBDJob().reassessJobAsync` | `{ jobUuid, editInstructions }` |
| `jtbd_note_add` | `api.jtbd.createNote` (direct, no hook) | `jobUuid, { body }` + manual invalidate of `jtbdKeys.job/jobs/currentScan` |

JTBD mutations run in parallel via `Promise.allSettled`; each hook already
invalidates its own `jtbdKeys` on success so the canvas reflects the change
automatically (no `markConceptSectionsPending`-style helper was required
for this phase — only invalidate `jtbdKeys.configs()` defensively after
the batch to cover mixed-config updates).

The concept path is unchanged — it still sessions through `useConceptAiEditing`
and uses `markConceptSectionsPending` for skeletons.

## Gotcha

Historical edit_suggestion messages are restored from server metadata as
`IOverseerEditSuggestionMessage` in `loadConversation` (`actions.tsx`). The
parsed `edits` array carries `kind`/`payload` automatically (JSON.parse),
so no migration logic is needed — old records without `kind` simply default
to `concept` via the `kind ?? 'concept'` fallback in the carousel and
confirm handler.

## Where `is_active` travels

`IUpdateJTBDRulePayload` (in `libs/api/types/jtbd.d.ts`) carries both
`ruleText?` and `isActive?`. Backend `UpdateJTBDRuleSchema` accepts both —
this phase ships the toggle support.

## Backend agent (shipped Phase 3)

`apps.chat.ai.agents.jtbd_edit_agent.run_jtbd_edit_extraction(account_uuid, user_message, page_metadata)`
returns a `JTBDEditReport` (`kind='jtbd'`) containing zero-or-more
`JTBDEditSuggestion` entries. Invoked from Overseer's `_handle_jtbd_edit_routing`
in `agent.py` when `should_edit` AND `page_context == 'jtbd'`.

- Two-stage: planner (JTBDEditExtractionPlan) → parallel rule/scan extractors
- Payloads are defensively sealed (`config_uuid` forced to the resolved value,
  invalid rule-edit actions dropped) so hallucinated UUIDs can't slip through
- Plan-level fallback message when neither extractor fires
- Concept-edit path now also sets `content.kind = 'concept'` via
  `setdefault("kind", "concept")` so the frontend dispatcher has a uniform
  top-level discriminator
