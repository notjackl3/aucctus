/**
 * Signal Scanning / Strategic Foresight Types
 *
 * Backend Contract:
 * - GET  /api/v1/signal-scanning/dashboard        -> ISignalScanningDashboard
 * - GET  /api/v1/signal-scanning/signals          -> ISignalsResponse (with filtering)
 * - GET  /api/v1/signal-scanning/signals/{uuid}   -> ISignal
 * - POST /api/v1/signal-scanning/refresh          -> ISignalRefreshResponse
 * - PATCH /api/v1/signal-scanning/signals/{uuid}/status
 * - POST /api/v1/signal-scanning/signals/{uuid}/create-concept
 * - POST /api/v1/signal-scanning/signals/{uuid}/attach-concept
 * - GET  /api/v1/signal-scanning/opportunities    -> IOpportunity[]
 * - POST /api/v1/signal-scanning/opportunities/{uuid}/create-concept
 * - GET  /api/v1/signal-scanning/intelligence     -> IIntelligenceItem[]
 */

// ============================================
// Signal Core Types
// ============================================

export type SignalTheme =
  | 'market_trend'
  | 'competitor_action'
  | 'regulatory_change'
  | 'technology_shift'
  | 'customer_insight'
  | 'economic_indicator';

export type SignalStance = 'bullish' | 'bearish' | 'neutral';

export type SignalStatus =
  | 'new'
  | 'exploring'
  | 'monitoring'
  | 'ignored'
  | 'actioned';

export type SignalSourceType =
  | 'news_article'
  | 'industry_report'
  | 'social_media'
  | 'internal_data'
  | 'competitor_intel'
  | 'regulatory_filing';

export type SignalImpact = 'high' | 'medium' | 'low';

export type SignalTrend = 'accelerating' | 'stable' | 'decelerating';

// ============================================
// Signal Interfaces
// ============================================

export interface ISignalSource {
  uuid: string;
  title: string;
  url: string;
  description?: string | null;
}

export interface ISignal {
  uuid: string;
  title: string;
  description: string;
  theme: SignalTheme;
  stance: SignalStance;
  status: SignalStatus;
  impact: SignalImpact;
  trend: SignalTrend;
  confidence: number; // 0-100
  relevanceScore: number; // 0-100
  sources: ISignalSource[];
  sourcesCount: number;
  tags: string[];
  detectedAt: string;
  updatedAt: string;
  // Nucleus context enrichment
  relatedCustomers?: string[];
  relatedCompetitors?: string[];
  relatedIndustries?: string[];
  // Concept linkage
  linkedConceptUuid?: string | null;
  linkedConceptTitle?: string | null;
}

// ============================================
// Metrics & Dashboard Types
// ============================================

export interface ISignalMetrics {
  activeSignals: number;
  newThisWeek: number;
  quickWins: number;
  pipelineValue: number | null;
}

export type GutCheckStatus = 'generating' | 'complete' | 'failed';

export interface IGutCheckSummary {
  uuid: string;
  summary: string;
  keyInsights: string[];
  recommendedActions: string[];
  status: GutCheckStatus;
  generatedAt: string;
}

// ============================================
// Opportunity Types
// ============================================

export type OpportunityEffort = 'low' | 'medium' | 'high';
export type OpportunityImpact = 'low' | 'medium' | 'high';
export type OpportunityStatus =
  | 'identified'
  | 'evaluating'
  | 'planned'
  | 'in_progress'
  | 'completed'
  | 'dismissed';
export type OpportunityPriority = 'high' | 'medium' | 'low';
export type OpportunityCategory =
  | 'market_entry'
  | 'product_innovation'
  | 'process_improvement'
  | 'strategic_partnership'
  | 'risk_mitigation'
  | 'cost_optimization';

export interface IOpportunity {
  uuid: string;
  title: string;
  description: string;
  category: OpportunityCategory | string;
  impact: OpportunityImpact;
  effort: OpportunityEffort;
  priority: OpportunityPriority;
  priorityScore: number; // Calculated 0-100
  confidence: number; // 0-100
  estimatedValue: number | null; // Dollar value
  targetDate: string | null;
  linkedSignalUuids: string[]; // Signal UUIDs
  status: OpportunityStatus;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Intelligence Types
// ============================================

export type IntelligenceCategory =
  | 'competitive'
  | 'regulatory'
  | 'market'
  | 'technology'
  | 'retail';

export interface IIntelligenceItem {
  uuid: string;
  title: string;
  summary: string;
  category: IntelligenceCategory | string;
  source: string;
  sourceLogoUrl: string | null;
  url: string | null;
  relevanceScore: number; // 0-100
  publishedAt: string;
  createdAt: string;
}

// ============================================
// Radar Visualization Types
// ============================================

export type RadarCategory =
  | 'market'
  | 'technology'
  | 'sustainability'
  | 'operations'
  | 'product';

export type RadarTimeHorizon = 'now' | 'next' | 'later';

export interface IRadarPoint {
  uuid: string;
  label: string;
  category: RadarCategory;
  impact: SignalImpact;
  timeHorizon: RadarTimeHorizon;
  // Position on radar (0-1 scale, center to edge represents time horizon)
  radialPosition: number; // 0.0 = center (immediate/Now), 1.0 = edge (long-term/Later)
  angularPosition: number; // 0-360 degrees
}

// ============================================
// Query & Response Types
// ============================================

export interface ISignalQueryOptions {
  theme?: SignalTheme[];
  stance?: SignalStance[];
  status?: SignalStatus[];
  impact?: SignalImpact[];
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: 'relevance' | 'detected_at' | 'impact';
  sortDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface ISignalsResponse {
  signals: ISignal[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface ISignalScanningDashboard {
  gutCheck: IGutCheckSummary | null;
  metrics: ISignalMetrics;
  recentSignals: ISignal[];
  topOpportunities: IOpportunity[];
  industryIntelligence: IIntelligenceItem[];
  radarPoints: IRadarPoint[];
}

export interface ISignalRefreshResponse {
  message: string;
  status: 'queued';
  taskId: string;
}

export interface ICreateConceptResponse {
  message: string;
  conceptUuid: string;
  signalUuid?: string;
  opportunityUuid?: string;
}

// ============================================
// Action Payload Types
// ============================================

export interface ICreateConceptFromSignalPayload {
  title?: string;
  description?: string;
}

export interface IAttachSignalToConceptPayload {
  conceptUuid: string;
}

export interface IUpdateSignalStatusPayload {
  status: SignalStatus;
}

// ============================================
// Clustered Feed Types (Frontend-only)
// ============================================

/**
 * Priority-sorted clustered feed for the unified Signal Scanning view.
 * Opportunities are the primary unit with linked signals nested beneath.
 * Standalone signals and intelligence items fill the gaps.
 */

/** Opportunity with its linked signals resolved and optional related intelligence */
export interface IOpportunityCluster {
  type: 'opportunity_cluster';
  opportunity: IOpportunity;
  linkedSignals: ISignal[];
  relatedIntelligence: IIntelligenceItem[];
  /** Composite score for feed sorting (higher = more important) */
  priorityScore: number;
  /** ISO timestamp for recency sorting fallback */
  sortDate: string;
}

/** Signal not linked to any opportunity - shown standalone in feed */
export interface IStandaloneSignal {
  type: 'standalone_signal';
  signal: ISignal;
  /** Composite score for feed sorting */
  priorityScore: number;
  sortDate: string;
}

/** Intelligence item shown standalone in feed */
export interface IStandaloneIntelligence {
  type: 'standalone_intelligence';
  intelligence: IIntelligenceItem;
  /** Composite score for feed sorting */
  priorityScore: number;
  sortDate: string;
}

/** Union type for all clustered feed items */
export type ClusteredFeedItem =
  | IOpportunityCluster
  | IStandaloneSignal
  | IStandaloneIntelligence;
