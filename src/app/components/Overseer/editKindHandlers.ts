/**
 * Edit-kind handler registry.
 *
 * `OverseerPopup.handleConfirmEdits` iterates over accepted suggestions and
 * dispatches each one to the handler registered against its `kind`.
 *
 * Each handler is a pure-ish async function that receives:
 * - the full suggestion (for type + payload),
 * - an `EditKindHandlerContext` bundling the mutation hooks, React Query
 *   client, navigate function, and UI callbacks it may need.
 *
 * Keeping the dispatch table in one place (rather than a switch inside the
 * popup) makes it trivial for the contract test to assert the frontend covers
 * every backend-emitted kind.
 */

import type { QueryClient } from 'react-query';

import type {
  EditSuggestionKind,
  IAiEditingSuggestion,
  IConceptEditPayload,
  IJTBDNoteAddPayload,
} from '@libs/api/types';
import type {
  IJTBDConfigDetail,
  IJTBDConfigList,
  IJTBDEditJobRequest,
  IJTBDMergeJobsRequest,
  IUpdateJTBDConfigPayload,
  IUpdateJTBDNotePayload,
} from '@libs/api/types/jtbd';

/**
 * Bundle of mutation hooks + utilities passed to every handler so the handler
 * functions stay pure with respect to component state. Constructed once inside
 * `OverseerPopup.handleConfirmEdits`.
 */
export interface EditKindHandlerContext {
  queryClient: QueryClient;

  // JTBD rule mutations (async variants)
  addJTBDRule: (params: {
    configUuid: string;
    data: { ruleText: string };
  }) => Promise<unknown>;
  updateJTBDRule: (params: {
    ruleUuid: string;
    configUuid: string;
    data: { ruleText?: string; isActive?: boolean };
  }) => Promise<unknown>;
  deleteJTBDRule: (params: {
    ruleUuid: string;
    configUuid: string;
  }) => Promise<unknown>;

  // JTBD scan trigger
  triggerJTBDScan: (configUuid: string) => Promise<unknown>;

  // Unified JTBD job edit (widget / whole-job / widget-add). Resolves on 202
  // dispatch; the refreshed job arrives via the
  // `jtbd.job.edited.account` WebSocket event and replaces the job in cache.
  editJTBDJob: (params: {
    jobUuid: string;
    body: IJTBDEditJobRequest;
  }) => Promise<unknown>;

  // User-initiated JTBD job merge. Resolves on 202 dispatch; the refreshed
  // primary job arrives via `jtbd.jobs.merged.account` and the secondaries
  // are removed from caches by the same listener.
  mergeJTBDJobs: (
    primaryJobUuid: string,
    body: IJTBDMergeJobsRequest,
  ) => Promise<unknown>;

  // JTBD note add (REST call + cache invalidation — note mutations are
  // job-scoped hooks so the popup drives this through the raw API directly).
  addJTBDNote: (payload: IJTBDNoteAddPayload) => Promise<void>;

  // JTBD ideate (Phase 6 — returns the seed uuid so the handler can navigate)
  ideateFromJTBDJob: (params: {
    jobUuid: string;
    payload?: { generationInstructions?: string };
  }) => Promise<{ seedUuid: string }>;

  // JTBD scan delete — removes a non-current scan and its jobs. The backend
  // 409s when the scan is current or running; errors are surfaced by the
  // underlying hook's `onError` toast.
  deleteJTBDScan: (params: {
    configUuid: string;
    scanUuid: string;
  }) => Promise<unknown>;

  // JTBD config edit — partial update of a config's name / description /
  // personaUuids list. Callers pass only the fields that should change.
  updateJTBDConfig: (params: {
    configUuid: string;
    data: IUpdateJTBDConfigPayload;
  }) => Promise<unknown>;

  // JTBD config clone — duplicates a config with its rules + documents.
  // Optional `newName` overrides the backend's default clone naming policy.
  cloneJTBDConfig: (params: {
    configUuid: string;
    newName?: string | null;
  }) => Promise<unknown>;

  // JTBD config delete — cascades to rules, documents, scans, and jobs.
  deleteJTBDConfig: (configUuid: string) => Promise<unknown>;

  // JTBD note update by note UUID (no parent jobUuid required). Used by the
  // Overseer `jtbd_note_update` suggestion flow.
  updateJTBDNote: (params: {
    noteUuid: string;
    data: IUpdateJTBDNotePayload;
  }) => Promise<unknown>;

  // JTBD note delete by note UUID (no parent jobUuid required). Mirrors
  // `updateJTBDNote` for the `jtbd_note_delete` suggestion flow.
  deleteJTBDNote: (params: { noteUuid: string }) => Promise<unknown>;

  // JTBD job delete — permanently removes a job and its widgets. The
  // backend returns 204 on success and 409 `locked` when the job is
  // currently being edited or merged; surfaces via the hook's toasts.
  deleteJTBDJob: (jobUuid: string) => Promise<unknown>;

  // Persona-diff resolver for `jtbd_config_personas` — reads the config's
  // current `personaUuids` list from the React Query cache. Returns `null`
  // when the cache is cold, in which case the handler falls back to the
  // supplied add/remove arrays verbatim.
  resolveConfigPersonaUuids: (configUuid: string) => string[] | null;

  // Concept edits are batch-applied via the legacy AI-editing route — the
  // popup short-circuits those and passes every `concept` suggestion in a
  // single call to this callback.
  applyConceptEdits: (conceptEdits: IAiEditingSuggestion[]) => void;

  // UX side-effects shared by JTBD handlers that navigate or close the popup.
  navigateTo: (path: string) => void;
  closeOverseer: () => void;
}

export type EditKindHandler = (
  suggestion: IAiEditingSuggestion,
  ctx: EditKindHandlerContext,
) => Promise<void>;

// ---------------------------------------------------------------------------
// Handlers (one per kind)
// ---------------------------------------------------------------------------

const handleConceptEdit: EditKindHandler = async () => {
  // Concept suggestions are dispatched as a single batch by the popup (they
  // require a shared session_id + concept_uuid). The per-suggestion handler is
  // a no-op so the registry still covers the `concept` key for the contract
  // test.
  return;
};

const handleJTBDRuleEdit: EditKindHandler = async (suggestion, ctx) => {
  if (suggestion.kind !== 'jtbd_rule') return;
  const payload = suggestion.payload;
  if (!payload) return;

  const { configUuid, action, ruleUuid, ruleText, isActive } = payload;

  if (action === 'add') {
    if (!ruleText) return;
    await ctx.addJTBDRule({ configUuid, data: { ruleText } });
    return;
  }

  if (action === 'update') {
    if (!ruleUuid || !ruleText) return;
    await ctx.updateJTBDRule({
      ruleUuid,
      configUuid,
      data: { ruleText },
    });
    return;
  }

  if (action === 'toggle') {
    if (!ruleUuid || typeof isActive !== 'boolean') return;
    await ctx.updateJTBDRule({
      ruleUuid,
      configUuid,
      data: { isActive },
    });
    return;
  }

  if (action === 'delete') {
    if (!ruleUuid) return;
    await ctx.deleteJTBDRule({ ruleUuid, configUuid });
  }
};

const handleJTBDScanTrigger: EditKindHandler = async (suggestion, ctx) => {
  if (suggestion.kind !== 'jtbd_scan') return;
  const payload = suggestion.payload;
  if (!payload?.configUuid) return;
  await ctx.triggerJTBDScan(payload.configUuid);
};

const handleJTBDNoteAdd: EditKindHandler = async (suggestion, ctx) => {
  if (suggestion.kind !== 'jtbd_note_add') return;
  const payload = suggestion.payload;
  if (!payload?.jobUuid || !payload.body?.trim()) return;
  await ctx.addJTBDNote({
    jobUuid: payload.jobUuid,
    body: payload.body.trim(),
  });
};

const handleJTBDJobEdit: EditKindHandler = async (suggestion, ctx) => {
  if (suggestion.kind !== 'jtbd_job_edit') return;
  const payload = suggestion.payload;
  if (!payload?.jobUuid || !payload.scope) return;

  // Build the wire body. `userMessage` is the user-facing description shown
  // on the carousel card; `agentImplementationInstructions` is the
  // agent-authored, research-ready restatement consumed downstream.
  const body: IJTBDEditJobRequest = {
    userMessage: payload.instructions,
    agentImplementationInstructions:
      suggestion.agentImplementationInstructions ?? payload.instructions,
    scope: payload.scope,
  };

  await ctx.editJTBDJob({ jobUuid: payload.jobUuid, body });
};

const handleJTBDJobMerge: EditKindHandler = async (suggestion, ctx) => {
  if (suggestion.kind !== 'jtbd_job_merge') return;
  const payload = suggestion.payload;
  if (!payload?.primaryJobUuid || !payload.secondaryJobUuids?.length) return;

  const body: IJTBDMergeJobsRequest = {
    userMessage: suggestion.description ?? payload.rationale ?? '',
    mergeInstructions: payload.mergeInstructions,
    secondaryJobUuids: payload.secondaryJobUuids,
  };

  await ctx.mergeJTBDJobs(payload.primaryJobUuid, body);
};

const handleJTBDIdeate: EditKindHandler = async (suggestion, ctx) => {
  if (suggestion.kind !== 'jtbd_ideate') return;
  const payload = suggestion.payload;
  if (!payload?.jobUuid) return;

  const response = await ctx.ideateFromJTBDJob({
    jobUuid: payload.jobUuid,
    payload: payload.generationInstructions
      ? { generationInstructions: payload.generationInstructions }
      : undefined,
  });

  // Navigate to the Idea Playground seeded with the freshly-created seed and
  // close the Overseer popup so the user can see the generated concepts.
  ctx.navigateTo(`/playground?seed=${response.seedUuid}`);
  ctx.closeOverseer();
};

const handleJTBDScanDelete: EditKindHandler = async (suggestion, ctx) => {
  if (suggestion.kind !== 'jtbd_scan_delete') return;
  const payload = suggestion.payload;
  if (!payload?.configUuid || !payload.scanUuid) return;
  await ctx.deleteJTBDScan({
    configUuid: payload.configUuid,
    scanUuid: payload.scanUuid,
  });
};

const handleJTBDConfigEdit: EditKindHandler = async (suggestion, ctx) => {
  if (suggestion.kind !== 'jtbd_config_edit') return;
  const payload = suggestion.payload;
  if (!payload?.configUuid) return;

  // Build the partial update body — omit fields the agent did not mean to
  // change (undefined). `null` is treated as "clear this field" on the wire
  // and passed through so the backend can decide whether to accept it.
  const data: IUpdateJTBDConfigPayload = {};
  if (payload.name !== undefined) data.name = payload.name ?? undefined;
  if (payload.description !== undefined) {
    data.description = payload.description ?? undefined;
  }

  // Nothing to update — skip the network call rather than hit the endpoint
  // with an empty body.
  if (Object.keys(data).length === 0) return;

  await ctx.updateJTBDConfig({ configUuid: payload.configUuid, data });
};

const handleJTBDConfigClone: EditKindHandler = async (suggestion, ctx) => {
  if (suggestion.kind !== 'jtbd_config_clone') return;
  const payload = suggestion.payload;
  if (!payload?.configUuid) return;

  await ctx.cloneJTBDConfig({
    configUuid: payload.configUuid,
    newName: payload.newName ?? undefined,
  });
};

const handleJTBDConfigDelete: EditKindHandler = async (suggestion, ctx) => {
  if (suggestion.kind !== 'jtbd_config_delete') return;
  const payload = suggestion.payload;
  if (!payload?.configUuid) return;

  await ctx.deleteJTBDConfig(payload.configUuid);
};

const handleJTBDConfigPersonas: EditKindHandler = async (suggestion, ctx) => {
  if (suggestion.kind !== 'jtbd_config_personas') return;
  const payload = suggestion.payload;
  if (!payload?.configUuid) return;

  // Resolve the current persona list from the React Query cache. When the
  // cache is cold (e.g. the configs page hasn't been visited yet) we fall
  // back to treating the diff as the full list — the backend is the source
  // of truth for the actual union/difference.
  const current = ctx.resolveConfigPersonaUuids(payload.configUuid);
  const addSet = new Set(payload.addPersonaUuids ?? []);
  const removeSet = new Set(payload.removePersonaUuids ?? []);

  let newPersonaUuids: string[];
  if (current === null) {
    // No cached snapshot — best we can do is send the additions, trusting
    // the backend to 4xx if the diff is invalid. Better than silently
    // dropping the request.
    newPersonaUuids = Array.from(addSet);
  } else {
    const union = new Set<string>([...current, ...addSet]);
    for (const uuid of removeSet) union.delete(uuid);
    newPersonaUuids = Array.from(union);
  }

  await ctx.updateJTBDConfig({
    configUuid: payload.configUuid,
    data: { personaUuids: newPersonaUuids },
  });
};

const handleJTBDNoteUpdate: EditKindHandler = async (suggestion, ctx) => {
  if (suggestion.kind !== 'jtbd_note_update') return;
  const payload = suggestion.payload;
  if (!payload?.noteUuid || !payload.body?.trim()) return;

  await ctx.updateJTBDNote({
    noteUuid: payload.noteUuid,
    data: { body: payload.body.trim() },
  });
};

const handleJTBDNoteDelete: EditKindHandler = async (suggestion, ctx) => {
  if (suggestion.kind !== 'jtbd_note_delete') return;
  const payload = suggestion.payload;
  if (!payload?.noteUuid) return;

  await ctx.deleteJTBDNote({ noteUuid: payload.noteUuid });
};

const handleJTBDJobDelete: EditKindHandler = async (suggestion, ctx) => {
  if (suggestion.kind !== 'jtbd_job_delete') return;
  const payload = suggestion.payload;
  if (!payload?.jobUuid) return;

  await ctx.deleteJTBDJob(payload.jobUuid);
};

// ---------------------------------------------------------------------------
// Registry — keep this exhaustive. The contract test asserts its keys are a
// superset of the backend-emitted kinds.
// ---------------------------------------------------------------------------

export const EDIT_KIND_HANDLERS: Record<EditSuggestionKind, EditKindHandler> = {
  concept: handleConceptEdit,
  jtbd_rule: handleJTBDRuleEdit,
  jtbd_scan: handleJTBDScanTrigger,
  jtbd_note_add: handleJTBDNoteAdd,
  jtbd_job_edit: handleJTBDJobEdit,
  jtbd_job_merge: handleJTBDJobMerge,
  jtbd_ideate: handleJTBDIdeate,
  jtbd_scan_delete: handleJTBDScanDelete,
  jtbd_config_edit: handleJTBDConfigEdit,
  jtbd_config_clone: handleJTBDConfigClone,
  jtbd_config_delete: handleJTBDConfigDelete,
  jtbd_config_personas: handleJTBDConfigPersonas,
  jtbd_note_update: handleJTBDNoteUpdate,
  jtbd_note_delete: handleJTBDNoteDelete,
  jtbd_job_delete: handleJTBDJobDelete,
};

// `IJTBDConfigDetail` / `IJTBDConfigList` are imported only for the ctx
// resolver's type inference; keep the re-export guard for the barrel.
export type _EditKindHandlerConfigDetail = IJTBDConfigDetail;
export type _EditKindHandlerConfigList = IJTBDConfigList;

/**
 * Deliberately unused import guard so tree-shaking doesn't strip the
 * `IConceptEditPayload` type re-export — the popup imports it via the index
 * barrel in other files.
 */
export type _EditKindHandlerConceptPayload = IConceptEditPayload;
