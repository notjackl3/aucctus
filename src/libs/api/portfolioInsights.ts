import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints as endpoints } from './endpoints';
import type { IPortfolioInsightListResponse } from './types/portfolioInsights';

/**
 * Portfolio Insights API
 *
 * Handles all requests for Portfolio Insights functionality.
 * Portfolio insights provide actionable observations about the account's
 * concept portfolio, identifying patterns, risks, and opportunities.
 */
export class PortfolioInsightsApi extends ApiService {
  constructor(apiInstance: Api, apiConfig: IApiServiceConfig) {
    super(apiInstance, apiConfig);
    this._setupMiddleware();
  }

  /**
   * Fetch all portfolio insights for the authenticated user's account.
   *
   * Returns insights ordered by priority (descending), then severity (descending),
   * then detected_at (descending). Supports pagination.
   *
   * @param page - Page number (1-indexed, default: 1)
   * @param pageSize - Items per page (default: 20, max: 100)
   * @returns Paginated list of portfolio insights
   */
  fetchPortfolioInsights(page: number = 1, pageSize: number = 20) {
    return this.get<IPortfolioInsightListResponse>(
      endpoints.portfolioInsights(page, pageSize),
    );
  }
}
