import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints as endpoints } from './endpoints';
import type {
  IAddToConceptBankResponse,
  IWatchtowerDashboard,
  IWatchtowerMonitoringRule,
  IWatchtowerRefreshResponse,
  IWatchtowerRuleGenerationResponse,
  IWatchtowerScanListItem,
  ICreateMonitoringRulePayload,
  IUpdateMonitoringRulePayload,
  IWatchtowerConfigDetail,
  IWatchtowerConfigListItem,
  IWatchtowerConfigRule,
  ICreateWatchtowerConfigPayload,
} from './types/watchtower';

/**
 * Watchtower API
 *
 * Handles all requests for Watchtower signal monitoring functionality.
 */
export class WatchtowerApi extends ApiService {
  constructor(apiInstance: Api, apiConfig: IApiServiceConfig) {
    super(apiInstance, apiConfig);
    this._setupMiddleware();
  }

  // ============================================
  // Dashboard & Monitoring Rules
  // ============================================

  /**
   * Get the Watchtower dashboard data.
   * Returns signals, predictions, trends, domains, opportunities, metrics, and rules.
   * Optionally pass a scanUuid to load a specific historical scan.
   */
  getWatchtowerDashboard(
    includeConceptImpacts: boolean = false,
    scanUuid?: string,
    watchtowerConfigUuid?: string,
  ) {
    const params: Record<string, unknown> = {};
    if (includeConceptImpacts) {
      params.include_concept_impacts = true;
    }
    if (scanUuid) {
      params.scan_uuid = scanUuid;
    }
    if (watchtowerConfigUuid) {
      params.watchtower_config_uuid = watchtowerConfigUuid;
    }
    return this.get<IWatchtowerDashboard>(endpoints.watchtowerDashboard, {
      params,
    });
  }

  /**
   * Get scan history (completed scans) for the account.
   */
  getScanHistory(watchtowerConfigUuid?: string) {
    const params: Record<string, unknown> = {};
    if (watchtowerConfigUuid) {
      params.watchtower_config_uuid = watchtowerConfigUuid;
    }
    return this.get<IWatchtowerScanListItem[]>(endpoints.watchtowerScans, {
      params,
    });
  }

  /**
   * Trigger a refresh of Watchtower data.
   * Uses Gemini with Google Search for signal discovery.
   * Returns immediately with a task ID for tracking.
   */
  refreshWatchtower(watchtowerConfigUuid?: string) {
    const params: Record<string, unknown> = {};
    if (watchtowerConfigUuid) {
      params.watchtower_config_uuid = watchtowerConfigUuid;
    }
    return this.post<IWatchtowerRefreshResponse>(
      endpoints.watchtowerRefresh,
      undefined,
      { params },
    );
  }

  /**
   * Get all monitoring rules for the account.
   */
  getMonitoringRules() {
    return this.get<IWatchtowerMonitoringRule[]>(endpoints.watchtowerRules);
  }

  /**
   * Create a new monitoring rule.
   * Monitoring rules influence AI signal scanning.
   */
  createMonitoringRule(data: ICreateMonitoringRulePayload) {
    return this.post<IWatchtowerMonitoringRule, ICreateMonitoringRulePayload>(
      endpoints.watchtowerRules,
      data,
    );
  }

  /**
   * Update a monitoring rule.
   */
  updateMonitoringRule(ruleUuid: string, data: IUpdateMonitoringRulePayload) {
    return this.patch<IWatchtowerMonitoringRule, IUpdateMonitoringRulePayload>(
      endpoints.watchtowerRule(ruleUuid),
      data,
    );
  }

  /**
   * Delete a monitoring rule.
   */
  deleteMonitoringRule(ruleUuid: string) {
    return this.delete(endpoints.watchtowerRule(ruleUuid));
  }

  /**
   * Add a concept opportunity to the concept bank.
   * Creates a new Concept from the Watchtower opportunity data.
   */
  addOpportunityToConceptBank(opportunityUuid: string) {
    return this.post<IAddToConceptBankResponse>(
      endpoints.watchtowerOpportunityAddToBank(opportunityUuid),
    );
  }

  /**
   * Toggle the tracking/pinned status of a Watchtower signal.
   * Tracked signals persist across refreshes and appear at the top of the dashboard.
   */
  toggleWatchtowerSignalTracking(signalId: string, isTracked: boolean) {
    return this.patch<{ message: string; isTracked: boolean }>(
      endpoints.watchtowerSignalTracking(signalId),
      { isTracked },
    );
  }

  // ============================================
  // Watchtower Configs
  // ============================================

  generateWatchtowerRules(description: string, files?: File[]) {
    const formData = new FormData();
    formData.append('description', description);
    if (files) {
      files.forEach((file) => formData.append('files', file));
    }
    return this.post<IWatchtowerRuleGenerationResponse>(
      endpoints.watchtowerConfigGenerateRules,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  }

  createWatchtowerConfig(data: ICreateWatchtowerConfigPayload) {
    return this.post<IWatchtowerConfigDetail>(
      endpoints.watchtowerConfigs,
      data,
    );
  }

  getWatchtowerConfigs() {
    return this.get<IWatchtowerConfigListItem[]>(endpoints.watchtowerConfigs);
  }

  getWatchtowerConfig(uuid: string) {
    return this.get<IWatchtowerConfigDetail>(endpoints.watchtowerConfig(uuid));
  }

  deleteWatchtowerConfig(uuid: string) {
    return this.delete(endpoints.watchtowerConfig(uuid));
  }

  scanWatchtowerConfig(uuid: string) {
    return this.post<IWatchtowerRefreshResponse>(
      endpoints.watchtowerConfigScan(uuid),
    );
  }

  addWatchtowerConfigRule(configUuid: string, ruleText: string) {
    return this.post<IWatchtowerConfigRule>(
      endpoints.watchtowerConfigRules(configUuid),
      { rule_text: ruleText },
    );
  }

  deleteWatchtowerConfigRule(configUuid: string, ruleUuid: string) {
    return this.delete(endpoints.watchtowerConfigRule(configUuid, ruleUuid));
  }
}
