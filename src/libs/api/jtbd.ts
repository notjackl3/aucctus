import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints as endpoints } from './endpoints';
import type {
  IJTBDActiveScan,
  IJTBDConfigDetail,
  IJTBDConfigDocument,
  IJTBDConfigList,
  IJTBDCustomWidget,
  IJTBDEditJobRequest,
  IJTBDEditJobResponse,
  IJTBDIdeateRequest,
  IJTBDIdeateResponse,
  IJTBDJob,
  IJTBDMergeJobsAccepted,
  IJTBDMergeJobsRequest,
  IJTBDMessageResponse,
  IJTBDRefreshResponse,
  IJTBDRule,
  IJTBDRuleGenerationResponse,
  IJTBDScan,
  IJTBDScanDetail,
  ICreateJTBDConfigPayload,
  ICreateJTBDNotePayload,
  IUpdateJTBDConfigPayload,
  IUpdateJTBDNotePayload,
  IAddJTBDRulePayload,
  IUpdateJTBDRulePayload,
} from './types/jtbd';

/**
 * JTBD Canvas API
 *
 * Handles all requests for the Jobs-To-Be-Done Canvas feature.
 */
export class JtbdApi extends ApiService {
  constructor(apiInstance: Api, apiConfig: IApiServiceConfig) {
    super(apiInstance, apiConfig);
    this._setupMiddleware();
  }

  // ============================================
  // Rule Generation
  // ============================================

  /**
   * Generate monitoring rules from a description using AI.
   * Returns a task ID; results arrive via WebSocket.
   */
  generateRules(description: string, files?: File[]) {
    const formData = new FormData();
    formData.append('description', description);
    if (files) {
      files.forEach((file) => formData.append('files', file));
    }
    return this.post<IJTBDRuleGenerationResponse>(
      endpoints.jtbdConfigGenerateRules,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  }

  // ============================================
  // Config CRUD
  // ============================================

  /**
   * List all JTBD configs for the account.
   */
  listConfigs() {
    return this.get<IJTBDConfigList[]>(endpoints.jtbdConfigs);
  }

  /**
   * Get a single JTBD config with rules and documents.
   */
  getConfig(configUuid: string) {
    return this.get<IJTBDConfigDetail>(endpoints.jtbdConfig(configUuid));
  }

  /**
   * Create a new JTBD config.
   */
  createConfig(data: ICreateJTBDConfigPayload) {
    return this.post<IJTBDConfigDetail, ICreateJTBDConfigPayload>(
      endpoints.jtbdConfigs,
      data,
    );
  }

  /**
   * Update a JTBD config.
   */
  updateConfig(configUuid: string, data: IUpdateJTBDConfigPayload) {
    return this.put<IJTBDMessageResponse, IUpdateJTBDConfigPayload>(
      endpoints.jtbdConfig(configUuid),
      data,
    );
  }

  /**
   * Delete a JTBD config (cascades to rules, documents, scans, jobs).
   */
  deleteConfig(configUuid: string) {
    return this.delete<IJTBDMessageResponse>(endpoints.jtbdConfig(configUuid));
  }

  /**
   * Clone a JTBD config (creates a duplicate with all rules and documents).
   * Accepts an optional `newName` body that overrides the backend's default
   * clone naming policy ("{original} (copy)"). Sent as a partial payload so
   * callers that want the default can invoke with no arguments.
   */
  cloneConfig(configUuid: string, body?: { newName?: string | null }) {
    return this.post<IJTBDConfigDetail, { newName?: string | null }>(
      endpoints.jtbdConfigClone(configUuid),
      body ?? {},
    );
  }

  // ============================================
  // Rule Management
  // ============================================

  /**
   * Add a monitoring rule to a JTBD config.
   */
  addRule(configUuid: string, data: IAddJTBDRulePayload) {
    return this.post<IJTBDRule, IAddJTBDRulePayload>(
      endpoints.jtbdConfigRules(configUuid),
      data,
    );
  }

  /**
   * Update a JTBD rule.
   */
  updateRule(ruleUuid: string, data: IUpdateJTBDRulePayload) {
    return this.put<IJTBDRule, IUpdateJTBDRulePayload>(
      endpoints.jtbdRule(ruleUuid),
      data,
    );
  }

  /**
   * Delete a JTBD rule.
   */
  deleteRule(ruleUuid: string) {
    return this.delete<IJTBDMessageResponse>(endpoints.jtbdRule(ruleUuid));
  }

  // ============================================
  // Document Management
  // ============================================

  /**
   * Upload a context document to a JTBD config.
   */
  uploadDocument(configUuid: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.postFormData<IJTBDConfigDocument>(
      endpoints.jtbdConfigDocuments(configUuid),
      formData,
    );
  }

  /**
   * List documents for a JTBD config.
   */
  listDocuments(configUuid: string) {
    return this.get<IJTBDConfigDocument[]>(
      endpoints.jtbdConfigDocuments(configUuid),
    );
  }

  /**
   * Delete a JTBD config document.
   */
  deleteDocument(documentUuid: string) {
    return this.delete<IJTBDMessageResponse>(
      endpoints.jtbdDocument(documentUuid),
    );
  }

  // ============================================
  // Scans
  // ============================================

  /**
   * Trigger a JTBD scan for a config.
   * Returns immediately with a task ID for tracking.
   */
  triggerScan(configUuid: string) {
    return this.post<IJTBDRefreshResponse>(
      endpoints.jtbdTriggerScan(configUuid),
    );
  }

  /**
   * List all scans for a config, most recent first.
   */
  listScans(configUuid: string) {
    return this.get<IJTBDScan[]>(endpoints.jtbdScans(configUuid));
  }

  /**
   * Get the current scan (is_current=True) with all jobs and widgets.
   */
  getCurrentScan(configUuid: string) {
    return this.get<IJTBDScanDetail>(endpoints.jtbdCurrentScan(configUuid));
  }

  /**
   * Get the active (in-progress) scan for a config.
   * Returns 404 if no scan is in progress.
   */
  getActiveScan(configUuid: string) {
    return this.get<IJTBDActiveScan>(endpoints.jtbdActiveScan(configUuid));
  }

  /**
   * Delete a completed or failed (non-current) scan and its jobs.
   * 409 if the scan is current or still running.
   */
  deleteScan(configUuid: string, scanUuid: string) {
    return this.delete<IJTBDMessageResponse>(
      endpoints.jtbdScan(configUuid, scanUuid),
    );
  }

  // ============================================
  // Jobs
  // ============================================

  /**
   * List jobs for a config. When `scanUuids` is provided, returns the union
   * of jobs across those scans; otherwise returns the current scan's jobs.
   */
  listJobs(configUuid: string, scanUuids?: string[]) {
    const params = new URLSearchParams();
    scanUuids?.forEach((uuid) => params.append('scan_uuids', uuid));
    const query = params.toString();
    const url = query
      ? `${endpoints.jtbdJobs(configUuid)}?${query}`
      : endpoints.jtbdJobs(configUuid);
    return this.get<IJTBDJob[]>(url);
  }

  /**
   * Get a single JTBD job with nested widgets, items, and sources.
   */
  getJob(jobUuid: string) {
    return this.get<IJTBDJob>(endpoints.jtbdJob(jobUuid));
  }

  /**
   * Permanently delete a JTBD job and all of its widgets. Returns 204 with no
   * body on success. A 409 response with `code: "locked"` indicates the job is
   * currently being edited or merged (see `details.lockedJobUuid`).
   */
  deleteJob(jobUuid: string) {
    return this.delete<void>(endpoints.jtbdJobDelete(jobUuid));
  }

  /**
   * Trigger concept ideation from a JTBD job.
   * Creates a Seed + AnchorThought and dispatches the ideation pipeline.
   * Accepts an optional `generationInstructions` string (capped at 2000 chars
   * by the backend) that is piped into the concept ideation agent as free-form
   * user guidance.
   */
  ideateFromJob(jobUuid: string, payload?: IJTBDIdeateRequest) {
    return this.post<IJTBDIdeateResponse, IJTBDIdeateRequest>(
      endpoints.jtbdIdeateFromJob(jobUuid),
      payload ?? {},
    );
  }

  /**
   * Unified JTBD job-edit entry point. A single call whose `scope`
   * discriminates widget-edit / whole-job-edit / widget-add semantics.
   * Returns 202 with a task ID; the refreshed job arrives via the
   * `jtbd.job.edited.account` WebSocket event. Backend responds 409
   * (`job_edit_in_progress`) if an edit is already running for this job.
   */
  editJob(jobUuid: string, body: IJTBDEditJobRequest) {
    return this.post<IJTBDEditJobResponse, IJTBDEditJobRequest>(
      endpoints.jtbdJobEdit(jobUuid),
      body,
    );
  }

  /**
   * User-initiated merge of JTBD jobs. The secondaries are deleted and their
   * notes are migrated to the primary; the refreshed primary arrives via
   * the `jtbd.jobs.merged.account` WebSocket event. Returns 202 with a task
   * ID. A 409 response with `error: "locked"` indicates one of the jobs is
   * already being edited/merged (see `details.lockedJobUuid`).
   */
  mergeJobs(primaryUuid: string, body: IJTBDMergeJobsRequest) {
    return this.post<IJTBDMergeJobsAccepted, IJTBDMergeJobsRequest>(
      endpoints.jtbdJobMerge(primaryUuid),
      body,
    );
  }

  /**
   * Request an email notification when the active scan completes.
   * Returns 409 if no scan is currently running.
   */
  emailWhenReady(configUuid: string) {
    return this.post<IJTBDMessageResponse>(
      endpoints.jtbdEmailWhenReady(configUuid),
    );
  }

  // ============================================
  // User-authored Notes
  // ============================================

  /**
   * Create a user-authored note on a JTBD job. Returns the full widget payload
   * (a `note`-type `IJTBDCustomWidget`) so the caller can splice it directly
   * into the job's widgets list.
   */
  createNote(jobUuid: string, payload: ICreateJTBDNotePayload) {
    return this.post<IJTBDCustomWidget, ICreateJTBDNotePayload>(
      endpoints.jtbdJobNotes(jobUuid),
      payload,
    );
  }

  /**
   * Update the body of an existing note item.
   */
  updateNote(itemUuid: string, payload: IUpdateJTBDNotePayload) {
    return this.put<IJTBDMessageResponse, IUpdateJTBDNotePayload>(
      endpoints.jtbdNoteItem(itemUuid),
      payload,
    );
  }

  /**
   * Delete a note item (and its parent widget when it's the last note).
   */
  deleteNote(itemUuid: string) {
    return this.delete<IJTBDMessageResponse>(endpoints.jtbdNoteItem(itemUuid));
  }
}
