import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints as endpoints } from './endpoints';
import utils from '@libs/utils';
import type {
  ISignalScanningDashboard,
  ISignal,
  ISignalsResponse,
  IOpportunity,
  IIntelligenceItem,
  ISignalQueryOptions,
  ISignalRefreshResponse,
  ICreateConceptResponse,
  IUpdateSignalStatusPayload,
  ICreateConceptFromSignalPayload,
  IAttachSignalToConceptPayload,
} from './types/signalScanning';
import type {
  IStrategicForesightDashboard,
  IStrategicInsight,
  IInsightsResponse,
  IInsightQueryOptions,
  IUpdateInsightStatusPayload,
  IUpdateInsightTrackingPayload,
} from './types/strategicForesight';
import type {
  IAddToConceptBankResponse,
  IWatchtowerDashboard,
  IWatchtowerMonitoringRule,
  IWatchtowerRefreshResponse,
  ICreateMonitoringRulePayload,
  IUpdateMonitoringRulePayload,
} from './types/watchtower';

/**
 * Signal Scanning API
 *
 * Handles all requests for signal scanning / strategic foresight functionality.
 */
export class SignalScanningApi extends ApiService {
  constructor(apiInstance: Api, apiConfig: IApiServiceConfig) {
    super(apiInstance, apiConfig);
    this._setupMiddleware();
  }

  // ============================================
  // Dashboard
  // ============================================

  /**
   * Get the main dashboard data for Signal Scanning.
   * Returns gut check, metrics, recent signals, opportunities, intelligence, and radar points.
   */
  getDashboard() {
    return this.get<ISignalScanningDashboard>(
      endpoints.signalScanningDashboard,
    );
  }

  /**
   * Trigger a background task to scan for new signals.
   * Returns immediately with a task ID for tracking.
   */
  refreshSignals() {
    return this.post<ISignalRefreshResponse>(endpoints.signalScanningRefresh);
  }

  // ============================================
  // Signals
  // ============================================

  /**
   * Get a list of signals with optional filtering.
   */
  getSignals(options?: ISignalQueryOptions) {
    const url = options
      ? utils.string.queryStringGenerator(
          endpoints.signalScanningSignals,
          options,
        )
      : endpoints.signalScanningSignals;
    return this.get<ISignalsResponse>(url);
  }

  /**
   * Get a single signal by UUID.
   */
  getSignal(signalUuid: string) {
    return this.get<ISignal>(endpoints.signalScanningSignal(signalUuid));
  }

  /**
   * Update the status of a signal.
   */
  updateSignalStatus(signalUuid: string, data: IUpdateSignalStatusPayload) {
    return this.patch<ISignal, IUpdateSignalStatusPayload>(
      endpoints.signalScanningSignalStatus(signalUuid),
      data,
    );
  }

  /**
   * Create a new concept from a signal.
   * Automatically sets signal status to "actioned".
   */
  createConceptFromSignal(
    signalUuid: string,
    data?: ICreateConceptFromSignalPayload,
  ) {
    return this.post<
      ICreateConceptResponse,
      ICreateConceptFromSignalPayload | undefined
    >(endpoints.signalScanningSignalCreateConcept(signalUuid), data);
  }

  /**
   * Attach a signal to an existing concept.
   * Sets signal status to "actioned".
   */
  attachSignalToConcept(
    signalUuid: string,
    data: IAttachSignalToConceptPayload,
  ) {
    return this.post<ISignal, IAttachSignalToConceptPayload>(
      endpoints.signalScanningSignalAttachConcept(signalUuid),
      data,
    );
  }

  // ============================================
  // Opportunities
  // ============================================

  /**
   * Get a list of opportunities sorted by priority score.
   */
  getOpportunities() {
    return this.get<IOpportunity[]>(endpoints.signalScanningOpportunities);
  }

  /**
   * Get a single opportunity by UUID.
   */
  getOpportunity(opportunityUuid: string) {
    return this.get<IOpportunity>(
      endpoints.signalScanningOpportunity(opportunityUuid),
    );
  }

  /**
   * Create a concept from an opportunity.
   * Sets opportunity status to "in_progress" and marks linked signals as "actioned".
   */
  createConceptFromOpportunity(opportunityUuid: string) {
    return this.post<ICreateConceptResponse>(
      endpoints.signalScanningOpportunityCreateConcept(opportunityUuid),
    );
  }

  // ============================================
  // Intelligence
  // ============================================

  /**
   * Get a list of intelligence items.
   */
  getIntelligence() {
    return this.get<IIntelligenceItem[]>(endpoints.signalScanningIntelligence);
  }

  // ============================================
  // Strategic Foresight V2 - Dashboard & Insights
  // ============================================

  /**
   * Get the Strategic Foresight V2 dashboard data.
   * Returns executive brief, metrics, insights, radar blips, and last refresh time.
   */
  getStrategicDashboard() {
    return this.get<IStrategicForesightDashboard>(
      endpoints.signalScanningDashboard,
    );
  }

  /**
   * Trigger a refresh of strategic foresight analysis.
   * Returns immediately with a task ID for tracking.
   */
  refreshStrategicForesight() {
    return this.post<ISignalRefreshResponse>(endpoints.signalScanningRefresh);
  }

  /**
   * Get a list of strategic insights with optional filtering.
   */
  getInsights(options?: IInsightQueryOptions) {
    const url = options
      ? utils.string.queryStringGenerator(
          endpoints.signalScanningInsights,
          options,
        )
      : endpoints.signalScanningInsights;
    return this.get<IInsightsResponse>(url);
  }

  /**
   * Get a single strategic insight by UUID.
   */
  getInsight(insightUuid: string) {
    return this.get<IStrategicInsight>(
      endpoints.signalScanningInsight(insightUuid),
    );
  }

  /**
   * Update the status of a strategic insight.
   * Valid statuses: 'acknowledged', 'actioned', 'dismissed'
   */
  updateInsightStatus(insightUuid: string, data: IUpdateInsightStatusPayload) {
    return this.patch<IStrategicInsight, IUpdateInsightStatusPayload>(
      endpoints.signalScanningInsightStatus(insightUuid),
      data,
    );
  }

  /**
   * Toggle the tracking status of a strategic insight.
   * Tracked insights are pinned to the top of lists.
   */
  toggleInsightTracking(insightUuid: string, isTracked: boolean) {
    return this.patch<{ message: string }, IUpdateInsightTrackingPayload>(
      endpoints.signalScanningInsightTracking(insightUuid),
      { isTracked },
    );
  }

  // ============================================
  // Watchtower - Dashboard & Monitoring Rules
  // ============================================

  /**
   * Get the Watchtower dashboard data.
   * Returns signals, predictions, trends, domains, opportunities, metrics, and rules.
   */
  getWatchtowerDashboard() {
    return this.get<IWatchtowerDashboard>(endpoints.watchtowerDashboard);
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
