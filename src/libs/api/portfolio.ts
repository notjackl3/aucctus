import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints as endpoints } from './endpoints';
import type { IPortfolioExecutiveSummary } from './types/portfolio';

/**
 * Portfolio API
 *
 * Handles all requests for Portfolio Executive Summary functionality.
 */
export class PortfolioApi extends ApiService {
  constructor(apiInstance: Api, apiConfig: IApiServiceConfig) {
    super(apiInstance, apiConfig);
    this._setupMiddleware();
  }

  // ============================================
  // Portfolio Executive Summary
  // ============================================

  /**
   * Get the latest portfolio executive summary for the account.
   * Returns the most recent AI-generated executive summary analyzing
   * the entire concept portfolio in context of the company's Nucleus data.
   */
  getPortfolioExecutiveSummary() {
    return this.get<IPortfolioExecutiveSummary>(
      endpoints.portfolioExecutiveSummary,
    );
  }
}
