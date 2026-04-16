import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints as endpoints } from './endpoints';
import type {
  IJTBDActiveScan,
  IJTBDConfigDetail,
  IJTBDConfigDocument,
  IJTBDConfigList,
  IJTBDIdeateResponse,
  IJTBDJob,
  IJTBDMessageResponse,
  IJTBDRefreshResponse,
  IJTBDRule,
  IJTBDRuleGenerationResponse,
  IJTBDScan,
  IJTBDScanDetail,
  ICreateJTBDConfigPayload,
  IUpdateJTBDConfigPayload,
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
   */
  cloneConfig(configUuid: string) {
    return this.post<IJTBDConfigDetail>(endpoints.jtbdConfigClone(configUuid));
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

  // ============================================
  // Jobs
  // ============================================

  /**
   * Get a single JTBD job with nested widgets, items, and sources.
   */
  getJob(jobUuid: string) {
    return this.get<IJTBDJob>(endpoints.jtbdJob(jobUuid));
  }

  /**
   * Trigger concept ideation from a JTBD job.
   * Creates a Seed + AnchorThought and dispatches the ideation pipeline.
   */
  ideateFromJob(jobUuid: string) {
    return this.post<IJTBDIdeateResponse>(endpoints.jtbdIdeateFromJob(jobUuid));
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
}
