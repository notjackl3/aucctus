export type AllEditableConceptSections =
  // Top-level
  | 'overview'
  | 'market_scan'
  | 'ecosystem_v2'
  | 'financial_projection'
  | 'assumptions'
  | 'tests'
  // Concept subsections
  | 'concept_title'
  | 'concept_overview'
  | 'concept_value_proposition'
  | 'concept_problem_statement'
  | 'what_is_this'
  | 'should_we_do_this'
  | 'regenerate_image'
  | 'differentiators'
  | 'rights_to_win'
  // Trends subsections
  | 'trends_full'
  | 'trends_analysis'
  | 'trends_key_findings'
  | 'trends_priority_insights'
  | 'trends_market_forces'
  // Ecosystem subsections
  | 'ecosystem_v2_full'
  | 'ecosystem_v2_startups'
  | 'ecosystem_v2_incumbents'
  | 'ecosystem_v2_competitive_forces'
  | 'ecosystem_v2_crowdedness'
  | 'ecosystem_v2_future_predictions'
  // Financial subsections
  | 'financial_projection_full'
  | 'savings_method'
  | 'savings'
  | 'target_savings_areas'
  | 'cost_interferences'
  | 'impact_sizing'
  | 'business_model'
  | 'pricing'
  | 'distribution_channels'
  | 'cost_drivers'
  | 'top_down_market_sizing'
  | 'bottom_up_market_sizing'
  // Customer profile subsections
  | 'customer_profiles'
  | 'customer_jobs'
  | 'customer_pains'
  | 'customer_alternatives'
  | 'customer_journey_steps'
  | 'customer_real_world_signals';

/**
 * Discriminator for edit suggestion cards emitted by Overseer.
 * - `concept` → legacy concept-section edits (applied via useConceptAiEditing)
 * - `jtbd_rule` → JTBD monitoring rule add/update/delete/toggle
 * - `jtbd_scan` → triggers a new JTBD scan for a config
 * - `jtbd_note_add` → add a user-authored note widget to a job
 * - `jtbd_job_edit` → unified JTBD job edit (widget / whole-job / widget-add)
 *   that re-runs evidence research via the single `/jtbd/jobs/{uuid}/edit/`
 *   endpoint.
 * - `jtbd_job_merge` → user-initiated merge of two JTBD jobs. The secondary
 *   job is deleted and its notes are migrated to the primary. Fires a Celery
 *   merge pipeline and resolves via the `jtbd.jobs.merged.account` WebSocket
 *   event.
 * - `jtbd_ideate` → trigger concept ideation from a JTBD job, optionally with
 *   free-form generation guidance
 *
 * When omitted on the wire, treat as `concept` for backward compatibility.
 */
export type EditSuggestionKind =
  | 'concept'
  | 'jtbd_rule'
  | 'jtbd_scan'
  | 'jtbd_note_add'
  | 'jtbd_job_edit'
  | 'jtbd_job_merge'
  | 'jtbd_ideate'
  | 'jtbd_scan_delete'
  | 'jtbd_config_edit'
  | 'jtbd_config_clone'
  | 'jtbd_config_delete'
  | 'jtbd_config_personas'
  | 'jtbd_note_update'
  | 'jtbd_note_delete'
  | 'jtbd_job_delete';

/**
 * Payload for a JTBD monitoring rule edit suggestion.
 * `ruleUuid` required for update/delete actions.
 * `ruleText` required for add/update actions.
 */
export interface IJTBDRuleEditPayload {
  configUuid: string;
  action: 'add' | 'update' | 'delete';
  ruleUuid?: string;
  ruleText?: string;
}

/**
 * Payload for a JTBD scan trigger suggestion.
 */
export interface IJTBDScanTriggerPayload {
  configUuid: string;
  reason: string;
}

/**
 * Payload for adding a user-authored note widget to a JTBD job via the
 * Overseer edit-suggestion flow.
 */
export interface IJTBDNoteAddPayload {
  jobUuid: string;
  body: string;
}

/**
 * Scope discriminator for a `jtbd_job_edit` suggestion. Identifies which
 * part of the job the edit targets.
 *
 * - `widget` — edit a specific widget (carries `widgetUuid`)
 * - `job` — re-evaluate the entire job (all widgets + scoring)
 * - `widget_add` — append a brand-new widget to the job
 * - `constraint_field` — edit a single constraint-analysis field
 *   (`root_constraint` or `solution_landscape`); `capability_fit` is
 *   intentionally not editable via this scope.
 */
export type IJTBDJobEditScope =
  | { kind: 'widget'; widgetUuid: string }
  | { kind: 'job' }
  | { kind: 'widget_add' }
  | {
      kind: 'constraint_field';
      field: 'root_constraint' | 'solution_landscape';
    };

/**
 * Unified payload for `jtbd_job_edit` suggestions. Replaces the former
 * widget-reassess / job-reassess / widget-add payloads with one shape that
 * carries a `scope` discriminator.
 */
export interface IJTBDJobEditPayload {
  jobUuid: string;
  scope: IJTBDJobEditScope;
  instructions: string;
  targetWidgetUuid?: string;
}

/**
 * Payload for a user-initiated `jtbd_job_merge` suggestion. Carries the
 * primary UUID plus one or more secondary UUIDs involved in the merge, along
 * with any free-form merge instructions the agent proposed. On accept, the
 * secondary jobs are deleted and their notes are migrated to the primary; the
 * refreshed primary arrives via `jtbd.jobs.merged.account`.
 */
export interface IJTBDJobMergePayload {
  primaryJobUuid: string;
  secondaryJobUuids: string[];
  mergeInstructions: string | null;
  rationale: string;
}

/**
 * Payload for triggering concept ideation from a JTBD job via the Overseer
 * edit-suggestion flow. `generationInstructions` is an optional free-form
 * string piped to the concept ideation pipeline (capped at 2000 chars server
 * side).
 */
export interface IJTBDIdeatePayload {
  jobUuid: string;
  generationInstructions?: string;
}

/**
 * Payload for a `jtbd_scan_delete` suggestion — removes a specific (non-current)
 * scan and its jobs. Backend route: `DELETE /jtbd/configs/{configUuid}/scans/{scanUuid}/`.
 */
export interface IJTBDScanDeletePayload {
  configUuid: string;
  scanUuid: string;
  rationale: string;
}

/**
 * Payload for a `jtbd_config_edit` suggestion — partial update of a JTBD config's
 * name and/or description. Empty-value semantics follow the backend contract:
 * fields the agent did not mean to change are omitted (undefined) rather than
 * sent as null.
 */
export interface IJTBDConfigEditPayload {
  configUuid: string;
  name?: string | null;
  description?: string | null;
  rationale: string;
}

/**
 * Payload for a `jtbd_config_clone` suggestion — duplicates a config with its
 * rules and documents. Optional `newName` overrides the default clone naming
 * policy (backend applies its own default when omitted / null).
 */
export interface IJTBDConfigClonePayload {
  configUuid: string;
  newName?: string | null;
  rationale: string;
}

/**
 * Payload for a `jtbd_config_delete` suggestion — cascades to rules, documents,
 * scans, and jobs.
 */
export interface IJTBDConfigDeletePayload {
  configUuid: string;
  rationale: string;
}

/**
 * Payload for a `jtbd_config_personas` suggestion — additive/subtractive diff
 * on a config's attached personas. The frontend handler resolves the current
 * `personaUuids` from cache and computes the full new list
 * (`current ∪ add \ remove`) before PUTting to the config update endpoint.
 */
export interface IJTBDConfigPersonasPayload {
  configUuid: string;
  addPersonaUuids: string[];
  removePersonaUuids: string[];
  rationale: string;
}

/**
 * Payload for a `jtbd_note_update` suggestion — replace the body of an
 * existing user-authored note item.
 */
export interface IJTBDNoteUpdatePayload {
  noteUuid: string;
  body: string;
  rationale: string;
}

/**
 * Payload for a `jtbd_note_delete` suggestion — remove a user-authored note
 * item (the backend removes the parent widget when the last note is removed).
 */
export interface IJTBDNoteDeletePayload {
  noteUuid: string;
  rationale: string;
}

/**
 * Payload for a `jtbd_job_delete` suggestion — permanently delete a JTBD job
 * and all of its widgets. Backend route: `DELETE /jtbd/jobs/{jobUuid}/`.
 * Returns 204 with no body on success; 409 `{ code: "locked" }` when the job
 * is currently being edited or merged.
 */
export interface IJTBDJobDeletePayload {
  jobUuid: string;
  rationale: string;
}

/**
 * Concept edit suggestions do not require a structured payload —
 * the concept AI-editing route consumes the suggestion itself.
 */
export type IConceptEditPayload = Record<string, never>;

export type EditSuggestionPayload =
  | IConceptEditPayload
  | IJTBDRuleEditPayload
  | IJTBDScanTriggerPayload
  | IJTBDNoteAddPayload
  | IJTBDJobEditPayload
  | IJTBDJobMergePayload
  | IJTBDIdeatePayload
  | IJTBDScanDeletePayload
  | IJTBDConfigEditPayload
  | IJTBDConfigClonePayload
  | IJTBDConfigDeletePayload
  | IJTBDConfigPersonasPayload
  | IJTBDNoteUpdatePayload
  | IJTBDNoteDeletePayload
  | IJTBDJobDeletePayload;

/**
 * Fields shared by every suggestion variant, independent of `kind`.
 */
interface IAiEditingSuggestionBase {
  section: AllEditableConceptSections | string;
  title: string;
  description: string;
  reason: string;
  icon?: string;
  /**
   * Structured agent instructions that describe how the change should be
   * applied downstream. Present on JTBD suggestions; optional for concept.
   */
  agentImplementationInstructions?: string;
}

/**
 * Discriminated union of edit suggestions. Each variant pairs a `kind`
 * literal with its corresponding `payload` shape, so consumers can narrow
 * via `if (suggestion.kind === 'jtbd_job_edit')` without casting.
 *
 * The `concept` variant accepts both an explicit `'concept'` kind and
 * undefined (wire-level backward compatibility — legacy concept-only
 * emitters predate the `kind` discriminator).
 */
export type IAiEditingSuggestion =
  | (IAiEditingSuggestionBase & {
      kind?: 'concept';
      payload?: IConceptEditPayload;
    })
  | (IAiEditingSuggestionBase & {
      kind: 'jtbd_rule';
      payload?: IJTBDRuleEditPayload;
    })
  | (IAiEditingSuggestionBase & {
      kind: 'jtbd_scan';
      payload?: IJTBDScanTriggerPayload;
    })
  | (IAiEditingSuggestionBase & {
      kind: 'jtbd_note_add';
      payload?: IJTBDNoteAddPayload;
    })
  | (IAiEditingSuggestionBase & {
      kind: 'jtbd_job_edit';
      payload?: IJTBDJobEditPayload;
    })
  | (IAiEditingSuggestionBase & {
      kind: 'jtbd_job_merge';
      payload?: IJTBDJobMergePayload;
    })
  | (IAiEditingSuggestionBase & {
      kind: 'jtbd_ideate';
      payload?: IJTBDIdeatePayload;
    })
  | (IAiEditingSuggestionBase & {
      kind: 'jtbd_scan_delete';
      payload?: IJTBDScanDeletePayload;
    })
  | (IAiEditingSuggestionBase & {
      kind: 'jtbd_config_edit';
      payload?: IJTBDConfigEditPayload;
    })
  | (IAiEditingSuggestionBase & {
      kind: 'jtbd_config_clone';
      payload?: IJTBDConfigClonePayload;
    })
  | (IAiEditingSuggestionBase & {
      kind: 'jtbd_config_delete';
      payload?: IJTBDConfigDeletePayload;
    })
  | (IAiEditingSuggestionBase & {
      kind: 'jtbd_config_personas';
      payload?: IJTBDConfigPersonasPayload;
    })
  | (IAiEditingSuggestionBase & {
      kind: 'jtbd_note_update';
      payload?: IJTBDNoteUpdatePayload;
    })
  | (IAiEditingSuggestionBase & {
      kind: 'jtbd_note_delete';
      payload?: IJTBDNoteDeletePayload;
    })
  | (IAiEditingSuggestionBase & {
      kind: 'jtbd_job_delete';
      payload?: IJTBDJobDeletePayload;
    });

export interface IConceptReportEdit {
  reply: string;
  edits: IAiEditingSuggestion[];
  uuid: string;
}

export interface IAiEditingContext {
  uuid: string;
  conceptUuid: string;
  sessionId: string;
  name: string;
  timestamp: number;
}
