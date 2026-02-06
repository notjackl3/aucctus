/**
 * Portfolio Insights API Types
 *
 * TypeScript interfaces for Portfolio Insights feature.
 * Represents actionable observations about the account's concept portfolio.
 */

/**
 * Portfolio Insight Type
 *
 * Each type represents a specific pattern or issue that warrants attention:
 * - stale_concepts: High-priority concepts that have gone dormant (90+ days)
 * - risk_concentration: Multiple concepts sharing the same high-severity risk
 * - emerging_theme: Strong thematic cluster suggesting new strategic direction
 * - validation_gap: High-scoring concepts lacking market validation evidence
 * - strategic_misalignment: Portfolio distribution misaligned with strategic priorities
 * - horizon_imbalance: Over-concentration in one innovation horizon (H1/H2/H3)
 */
export type PortfolioInsightType =
  | 'stale_concepts'
  | 'risk_concentration'
  | 'emerging_theme'
  | 'validation_gap'
  | 'strategic_misalignment'
  | 'horizon_imbalance';

/**
 * Portfolio Insight Severity
 *
 * Severity level indicating urgency of the insight:
 * - low: Informational, no immediate action needed
 * - medium: Should be addressed in next planning cycle
 * - high: Requires immediate attention or decision
 */
export type PortfolioInsightSeverity = 'low' | 'medium' | 'high';

/**
 * Portfolio Insight
 *
 * Represents a single portfolio-level insight detected by analyzing the concept portfolio.
 */
export interface IPortfolioInsight {
  /** Unique identifier for this portfolio insight */
  uuid: string;

  /** Type of insight (stale_concepts, risk_concentration, etc.) */
  insightType: PortfolioInsightType;

  /** Short, attention-grabbing headline for the insight */
  title: string;

  /** Detailed explanation of what was observed and why it matters */
  description: string;

  /** Ordering priority for displaying multiple insights (0-100, higher = more important) */
  priority: number;

  /** Urgency level for this insight (low, medium, high) */
  severity: PortfolioInsightSeverity;

  /** Supporting data including related concept UUIDs, metrics, thresholds, and detection parameters */
  metadata: Record<string, any>;

  /** Timestamp when this insight was first detected */
  detectedAt: string;

  /** When this record was created */
  createdAt: string;

  /** When this record was last updated */
  updatedAt: string;
}

/**
 * Portfolio Insight List Response
 *
 * Paginated response for listing portfolio insights.
 */
export interface IPortfolioInsightListResponse {
  /** List of portfolio insights */
  insights: IPortfolioInsight[];

  /** Total number of insights for the account */
  totalCount: number;

  /** Current page number (1-indexed) */
  page: number;

  /** Number of items per page */
  pageSize: number;

  /** Whether more pages are available */
  hasMore: boolean;
}

/**
 * WebSocket message sent when portfolio insights generation starts.
 */
export interface IPortfolioInsightsProcessingMessage {
  type: 'portfolio.insights.processing.user';
  accountUuid: string;
}

/**
 * WebSocket message sent when portfolio insights are successfully generated.
 */
export interface IPortfolioInsightsGeneratedMessage {
  type: 'portfolio.insights.generated.user';
  accountUuid: string;
  insightCount: number;
  insightUuids: string[];
}

/**
 * WebSocket message sent when portfolio insights generation fails.
 */
export interface IPortfolioInsightsErrorMessage {
  type: 'portfolio.insights.error.user';
  accountUuid: string;
  errorMessage: string;
}
