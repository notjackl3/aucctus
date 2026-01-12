/**
 * Strategic Foresight Types (V2)
 *
 * CEO Vision Alignment:
 * - THREE core signal types: competitor_announcement, startup_launch, investment_activity
 * - Pattern aggregation layer (signals clustered by theme/trend)
 * - Strategic insights with interpretation (What changed? Why does it matter? What's the impact?)
 * - Classification: THREAT / OPPORTUNITY / WATCH
 * - Business unit mapping
 * - Connection to Aucctus concepts
 */

// ============================================
// Core Enums & Primitives
// ============================================

/**
 * FOUR signal themes aligned to external market moves
 * Maps to radar quadrants: Top=Regulation, Right=Competitor, Bottom=Investment, Left=Startup
 */
export type SignalThemeV2 =
  | 'competitor_announcement' // Competitor product launches, partnerships, pivots (RIGHT quadrant)
  | 'startup_launch' // New market entrants, disruptive startups (LEFT quadrant)
  | 'investment_activity' // Funding rounds, M&A, acquisitions (BOTTOM quadrant)
  | 'regulatory_change'; // Regulatory shifts, compliance changes, policy updates (TOP quadrant)

/**
 * Strategic classification (replaces old status workflow)
 */
export type InsightClassification = 'threat' | 'opportunity' | 'watch';

/**
 * Time horizons for expected impact (executive language)
 */
export type TimeHorizon =
  | 'immediate' // 0-6 months
  | 'near_term' // 6-18 months
  | 'long_term'; // 18+ months

/**
 * Trend direction for pattern analysis
 */
export type TrendDirection = 'accelerating' | 'stable' | 'decelerating';

/**
 * Confidence level
 */
export type ConfidenceLevel = 'high' | 'medium' | 'low';

/**
 * Impact level
 */
export type ImpactLevel = 'high' | 'medium' | 'low';

// ============================================
// Business Unit Types
// ============================================

export interface IBusinessUnit {
  uuid: string;
  name: string;
  color?: string;
}

// ============================================
// Concept Link Types
// ============================================

export interface IConceptLink {
  uuid: string;
  title: string;
  identifier: string;
  status: 'incubating' | 'testing' | 'validated' | 'archived';
  relationshipType: 'validates' | 'challenges' | 'extends' | 'competes';
}

// ============================================
// Recommended Concept Action Types
// ============================================

/**
 * Type of action recommended for a concept based on a strategic insight.
 */
export type RecommendedActionType = 'net_new' | 'modify';

/**
 * A recommended concept action suggests either modifying an existing concept
 * or creating a new one based on market signals detected in an insight.
 */
export interface IRecommendedConceptAction {
  uuid: string;
  /** Type of action: 'net_new' for new concept, 'modify' for existing concept */
  actionType: RecommendedActionType;
  /** Brief explanation of the recommended action (1-2 sentences) */
  actionTitle: string;
  /**
   * Detailed action instructions:
   * - For 'net_new': anchor thought to seed new concept generation
   * - For 'modify': AI edit request describing the changes to make
   */
  actionDetails: string;
  /** Human-readable identifier of concept to modify (only for 'modify' type) */
  affectedConceptIdentifier: string | null;
  /** Title of concept to modify (only for 'modify' type) */
  affectedConceptTitle: string | null;
  /** When the recommendation was generated */
  createdAt: string;
}

// ============================================
// Signal Source Types
// ============================================

export interface ISignalSourceV2 {
  uuid: string;
  title: string;
  url: string;
  publishedAt?: string;
  sourceType:
    | 'news_article'
    | 'press_release'
    | 'crunchbase'
    | 'linkedin'
    | 'sec_filing';
  /** Description of how this source relates to the pattern/insight */
  association?: string;
  /** Key citation or quote from the source */
  citation?: string;
}

// ============================================
// Pattern Types (Aggregated Clusters)
// ============================================

/**
 * A PATTERN is multiple related signals aggregated into a thematic cluster.
 * Example: "Enterprise AI adoption in financial services" (from 8 raw signals)
 */
export interface IPattern {
  uuid: string;
  title: string;
  summary: string;
  theme: SignalThemeV2;

  // Aggregation metadata
  signalCount: number;
  firstDetected: string;
  lastUpdated: string;

  // Pattern analysis
  trendDirection: TrendDirection;
  confidence: ConfidenceLevel;

  // Key companies/entities involved
  keyCompanies: string[];
  relatedKeywords: string[];

  // Source attribution
  sources: ISignalSourceV2[];
}

// ============================================
// Strategic Insight Types (Primary UI Entity)
// ============================================

/**
 * A STRATEGIC INSIGHT is the interpreted meaning of a pattern for the client.
 * This is what executives see - the "so what?" layer.
 *
 * Answers:
 * - What changed?
 * - Why does it matter?
 * - What is the likely impact and time horizon?
 */
export interface IStrategicInsight {
  uuid: string;

  // Classification
  classification: InsightClassification;
  theme: SignalThemeV2;

  // Core identification
  headline: string;

  // Executive interpretation (THE CORE VALUE)
  whatChanged: string;
  whyItMatters: string;
  likelyImpact: string;
  timeHorizon: TimeHorizon;
  timeHorizonLabel: string; // e.g., "3-6 months"

  // Confidence & Priority
  confidence: ConfidenceLevel;
  impact: ImpactLevel;
  priorityScore: number; // 0-100, composite score for sorting

  // Business context
  affectedBusinessUnits: IBusinessUnit[];

  // Pattern linkage (evidence)
  patterns: IPattern[];
  totalSignalCount: number;

  // Concept linkage
  relatedConcepts: IConceptLink[];

  // Recommended action (legacy - general text recommendation)
  recommendedAction: string;

  // Recommended concept actions (AI-generated suggestions for concept modifications or new concepts)
  recommendedConceptActions: IRecommendedConceptAction[];

  // Status tracking
  status: 'active' | 'acknowledged' | 'actioned' | 'dismissed';
  acknowledgedBy?: string;
  acknowledgedAt?: string;

  // Manual tracking (pinning)
  isTracked: boolean;
  trackedBy?: string;
  trackedAt?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Radar Types (Constellation Style)
// ============================================

export interface IRadarBlip {
  uuid: string;
  label: string;
  classification: InsightClassification;
  timeHorizon: TimeHorizon;
  angularPosition: number; // 0-360
  confidence: ConfidenceLevel;
  impact: ImpactLevel;
  insightUuid: string;
}

// ============================================
// Executive Brief Types
// ============================================

export interface IExecutiveBrief {
  narrative: string; // AI-generated executive summary
}

// ============================================
// Dashboard Types
// ============================================

export interface IStrategicForesightMetrics {
  totalInsights: number;
  threats: number;
  opportunities: number;
  watching: number;
  newThisWeek: number;
  patternsDetected: number;
}

export interface IStrategicForesightDashboard {
  executiveBrief: IExecutiveBrief | null;
  metrics: IStrategicForesightMetrics;
  insights: IStrategicInsight[];
  radarBlips: IRadarBlip[];
  lastRefreshedAt: string;
}

// ============================================
// Query & Response Types
// ============================================

export interface IInsightQueryOptions {
  classification?: InsightClassification[];
  theme?: SignalThemeV2[];
  timeHorizon?: TimeHorizon[];
  confidence?: ConfidenceLevel[];
  businessUnit?: string[];
  status?: ('active' | 'acknowledged' | 'actioned' | 'dismissed')[];
  search?: string;
  sort?: 'priority' | 'created_at' | 'confidence';
  sortDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface IInsightsResponse {
  insights: IStrategicInsight[];
  count: number;
  next: string | null;
  previous: string | null;
}

// ============================================
// Action Payload Types
// ============================================

export interface IUpdateInsightStatusPayload {
  status: 'acknowledged' | 'actioned' | 'dismissed';
  notes?: string;
}

export interface IUpdateInsightTrackingPayload {
  isTracked: boolean;
}

export interface ICreateConceptFromInsightPayload {
  insightUuid: string;
  title?: string;
  description?: string;
}

export interface ILinkInsightToConceptPayload {
  conceptUuid: string;
  relationshipType?: IConceptLink['relationshipType'];
}
