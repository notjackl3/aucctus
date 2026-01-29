import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints as endpoints } from './endpoints';
import type {
  ICompetitor,
  ICompetitorAssessmentDashboard,
  ICompetitorAssessmentRefreshResponse,
  ICreateCompetitorPayload,
  IUpdateCompetitorPayload,
  IUpdateConfigPayload,
  IWhiteSpaceOpportunity,
  ICompetitorAssessmentConfig,
} from './types/competitorAssessment';

/**
 * Competitor Assessment API
 *
 * Handles all requests for Competitor Assessment functionality.
 */
export class CompetitorAssessmentApi extends ApiService {
  constructor(apiInstance: Api, apiConfig: IApiServiceConfig) {
    super(apiInstance, apiConfig);
    this._setupMiddleware();
  }

  // ============================================
  // Dashboard
  // ============================================

  /**
   * Get the Competitor Assessment dashboard data.
   * Returns competitors with assessments, white spaces, config, and metrics.
   */
  getDashboard() {
    return this.get<ICompetitorAssessmentDashboard>(
      endpoints.competitorAssessmentDashboard,
    );
  }

  /**
   * Trigger a refresh of Competitor Assessment data.
   * Runs competitor discovery, research, and white space analysis.
   * Returns immediately with a task ID for tracking.
   */
  refresh() {
    return this.post<ICompetitorAssessmentRefreshResponse>(
      endpoints.competitorAssessmentRefresh,
    );
  }

  // ============================================
  // Competitors CRUD
  // ============================================

  /**
   * Get all competitors for the account.
   */
  getCompetitors() {
    return this.get<ICompetitor[]>(endpoints.competitorAssessmentCompetitors);
  }

  /**
   * Create a new competitor (user-added).
   */
  createCompetitor(data: ICreateCompetitorPayload) {
    return this.post<ICompetitor, ICreateCompetitorPayload>(
      endpoints.competitorAssessmentCompetitors,
      data,
    );
  }

  /**
   * Update a competitor.
   */
  updateCompetitor(competitorUuid: string, data: IUpdateCompetitorPayload) {
    return this.patch<ICompetitor, IUpdateCompetitorPayload>(
      endpoints.competitorAssessmentCompetitor(competitorUuid),
      data,
    );
  }

  /**
   * Delete (soft delete) a competitor.
   */
  deleteCompetitor(competitorUuid: string) {
    return this.delete(
      endpoints.competitorAssessmentCompetitor(competitorUuid),
    );
  }

  // ============================================
  // Config
  // ============================================

  /**
   * Update Competitor Assessment configuration.
   */
  updateConfig(data: IUpdateConfigPayload) {
    return this.patch<ICompetitorAssessmentConfig, IUpdateConfigPayload>(
      endpoints.competitorAssessmentConfig,
      data,
    );
  }

  // ============================================
  // White Spaces
  // ============================================

  /**
   * Get all white space opportunities from the latest scan.
   */
  getWhiteSpaces() {
    return this.get<IWhiteSpaceOpportunity[]>(
      endpoints.competitorAssessmentWhiteSpaces,
    );
  }
}
