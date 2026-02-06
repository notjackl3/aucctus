/**
 * Portfolio Executive Summary API Types
 *
 * Types for the Portfolio Executive Summary feature.
 */

// ============================================
// Portfolio Executive Summary Types
// ============================================

export interface IPortfolioExecutiveSummary {
  uuid: string;
  summaryText: string;
  metadata: {
    conceptCount?: number;
    nucleusSections?: string[];
    generationParameters?: Record<string, any>;
    [key: string]: any;
  };
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
}
