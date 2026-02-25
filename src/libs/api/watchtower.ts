import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints as endpoints } from './endpoints';
import type {
  IAddToConceptBankResponse,
  IWatchtowerDashboard,
  IWatchtowerMonitoringRule,
  IWatchtowerRefreshResponse,
  IWatchtowerScanListItem,
  ICreateMonitoringRulePayload,
  IUpdateMonitoringRulePayload,
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
  ) {
    const params: Record<string, unknown> = {};
    if (includeConceptImpacts) {
      params.include_concept_impacts = true;
    }
    if (scanUuid) {
      params.scan_uuid = scanUuid;
    }
    return this.get<IWatchtowerDashboard>(endpoints.watchtowerDashboard, {
      params,
    });
  }

  /**
   * Get scan history (completed scans) for the account.
   */
  getScanHistory() {
    return this.get<IWatchtowerScanListItem[]>(endpoints.watchtowerScans);
  }

  /**
   * Trigger a refresh of Watchtower data.
   * Uses Gemini with Google Search for signal discovery.
   * Returns immediately with a task ID for tracking.
   */
  refreshWatchtower() {
    return this.post<IWatchtowerRefreshResponse>(endpoints.watchtowerRefresh);
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
}
