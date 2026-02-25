/**
 * Watchtower API Types
 *
 * Types for the Watchtower feature including:
 * - Signals (mapped from StrategicInsight)
 * - Predictions
 * - Trends
 * - Future Domains
 * - Concept Opportunities
 * - Monitoring Rules
 */

// ============================================
// Concept Impact Assessment Types
// ============================================

export interface IConceptImpactAssessment {
  uuid: string;
  conceptIdentifier: string;
  conceptName: string;
  impactType: 'disruption' | 'acceleration';
  impactStatement: string;
  isMaterial: boolean;
  assessedAt: string;
}

// ============================================
// Signal Types (mapped from StrategicInsight)
// ============================================

export type WatchtowerSignalType = 'threat' | 'opportunity' | 'watch';

export type WatchtowerSignalCategory =
  | 'competition'
  | 'market'
  | 'technology'
  | 'regulatory'
  | 'capital';

export type WatchtowerTimeHorizon = 'immediate' | 'strategic' | 'horizon';

export type WatchtowerConfidence = 'high' | 'medium' | 'low';

export interface IWatchtowerSignalSource {
  title: string;
  url: string;
  excerpt: string;
  type: 'News' | 'Report' | 'Filing' | 'Internal' | 'Analysis';
}

export interface IWatchtowerSignalEvidence {
  title: string;
  description: string;
  status: string;
  signalCount: number;
  companies: string[];
}

export interface IWatchtowerSignal {
  id: string;
  title: string;
  type: WatchtowerSignalType;
  category: WatchtowerSignalCategory;
  confidence: WatchtowerConfidence;
  timeHorizon: WatchtowerTimeHorizon;
  timeHorizonLabel: string;
  radarDistance: number;
  radarAngle: number;
  recommendedAction: string;
  whatChanged: string;
  whyItMatters: string;
  likelyImpact: string;
  isNew: boolean;
  isTracked: boolean; // Whether the signal is pinned/tracked by the user
  dateAdded: string;
  evidence: IWatchtowerSignalEvidence[];
  sources: IWatchtowerSignalSource[];
  conceptImpacts?: IConceptImpactAssessment[]; // Optional concept impact assessments
  conceptImpactEvaluatedAt?: string | null; // When concept impact evaluation was last run (null = not yet evaluated)
}

// ============================================
// Impacted Concept Types
// ============================================

export interface IWatchtowerImpactedConcept {
  id: string;
  conceptName: string;
  impact: string;
  suggestedChange: string;
  image: string;
}

// ============================================
// Prediction Types
// ============================================

/**
 * Rich source data for predictions - compatible with ISource.
 * Supports both legacy format (name/initial/color) and new format (uuid/title/url).
 * Includes citations (verbatim quotes) for evidence-backed predictions.
 */
export interface IWatchtowerPredictionSource {
  uuid: string;
  title: string;
  url: string;
  citations?: string; // Verbatim quotes from the source
  description?: string;
  classification?: string;
}

export interface IWatchtowerPrediction {
  id: string;
  title: string;
  description: string;
  sources: IWatchtowerPredictionSource[];
  hasAiReasoning: boolean;
}

export interface IWatchtowerPredictionDetail extends IWatchtowerPrediction {
  aiReasoning: string;
  confidence: WatchtowerConfidence;
  timeHorizon: string;
}

// ============================================
// Trend Types
// ============================================

export type WatchtowerTrendPeriod = '6mo' | '12mo' | '12plus';

export interface IWatchtowerTrendBullet {
  text: string;
  highlight?: string;
  highlightColor?: string;
}

export interface IWatchtowerTrendsByPeriod {
  period6mo: IWatchtowerTrendBullet[];
  period12mo: IWatchtowerTrendBullet[];
  period12plus: IWatchtowerTrendBullet[];
}

// ============================================
// Future Domain Types
// ============================================

export interface IWatchtowerFutureDomain {
  id: string;
  name: string;
  description: string;
  whyThisMatters: string;
  evidenceBasis: string[];
  timeHorizon: string;
}

// ============================================
// Concept Opportunity Types
// ============================================

export type WatchtowerOpportunityUrgency =
  | 'immediate'
  | 'strategic'
  | 'exploratory';

export interface IWatchtowerConceptOpportunity {
  id: string;
  title: string;
  description: string;
  signalBasis: string;
  urgency: WatchtowerOpportunityUrgency;
  potentialImpact: string;
  image: string;
  isAddedToBank: boolean;
}

// ============================================
// Monitoring Rule Types
// ============================================

export interface IWatchtowerMonitoringRule {
  uuid: string;
  ruleText: string;
  isActive: boolean;
  createdAt: string;
}

export interface ICreateMonitoringRulePayload {
  ruleText: string;
}

export interface IUpdateMonitoringRulePayload {
  ruleText?: string;
  isActive?: boolean;
}

// ============================================
// Dashboard Types
// ============================================

export interface IWatchtowerMetrics {
  totalSignals: number;
  threats: number;
  opportunities: number;
  watching: number;
  newThisWeek: number;
  patternsDetected: number;
  activeRules: number;
}

export interface IWatchtowerActiveScan {
  scanUuid: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  stage?: string;
  progress?: number;
  message?: string;
}

export interface IWatchtowerScanListItem {
  uuid: string;
  scannedAt: string;
  completedAt?: string | null;
  status: string;
}

export interface IWatchtowerDashboard {
  signals: IWatchtowerSignal[];
  predictions: IWatchtowerPrediction[];
  trends: IWatchtowerTrendsByPeriod;
  futureDomains: IWatchtowerFutureDomain[];
  conceptOpportunities: IWatchtowerConceptOpportunity[];
  metrics: IWatchtowerMetrics;
  monitoringRules: IWatchtowerMonitoringRule[];
  lastRefreshedAt: string | null;
  isRefreshing: boolean; // True if auto-refresh was triggered due to stale data (>2 weeks old)
  activeScan?: IWatchtowerActiveScan | null; // Active scan progress for state recovery on page load
}

// ============================================
// Add to Concept Bank Response Types
// ============================================

export interface IAddToConceptBankResponse {
  conceptUuid: string;
  conceptIdentifier: string;
  message: string;
}

// ============================================
// Refresh Response Types
// ============================================

export interface IWatchtowerRefreshResponse {
  taskId: string;
  message: string;
}

export interface IWatchtowerRefreshStatus {
  taskId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number;
  message?: string;
  patternsCreated?: number;
  insightsCreated?: number;
  predictionsCreated?: number;
  trendsCreated?: number;
  domainsCreated?: number;
  opportunitiesCreated?: number;
}
