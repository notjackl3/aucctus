import type { IBaseConceptEntity } from './concepts';
import type { ISupport, ISource } from './support';

export type EngagementAction =
  | 'partnership'
  | 'investment'
  | 'acquisition'
  | 'customer'
  | 'supplier';
export interface IPotentialEngagement {
  description: string;
  action: EngagementAction;
}

export interface IContact {
  name: string;
  title: string;
  email?: string;
  linkedin?: string;
}

export interface IKeyFact {
  text: string;
  evidence: FieldEvidence;
}

export interface INewsAndActivities {
  text: string;
  evidence: FieldEvidence;
}

export interface IBaseMarketScanCompany extends IBaseConceptEntity {
  name: string;
  domain?: string;
  overview?: string;
  overviewEvidence?: FieldEvidence;
  founded?: string;
  foundedEvidence?: FieldEvidence;
  headquarters?: string;
  headquartersEvidence?: FieldEvidence;
  relevance?: string;
  newsAndActivities?: INewsAndActivities[];

  status: 'isPending' | 'completed';
}

export interface IStartup extends IBaseMarketScanCompany {
  uuid: string;

  relevance?: string;
  predictions?: string;

  valueProposition: string;
  valuePropositionEvidence: FieldEvidence;

  competitiveAdvantage: string;
  competitiveAdvantageEvidence: FieldEvidence;

  keyContacts: IContact[];
  keyFacts: IKeyFact[];
  hasCompetitiveProduct: boolean;
  potentialEngagements?: IPotentialEngagement[];
}

export interface FieldEvidence {
  insight: string;
  // The source of the evidence
  sources: ISource[];
}

export interface IIncumbent extends IBaseMarketScanCompany {
  hasCompetitiveProduct: boolean;
}

export type TrendChangeType = 'increasing' | 'decreasing' | 'stagnating';

export interface ITrendsAndDrivers extends IBaseConceptEntity {
  uuid: string;
  name: string;
  description: string;
  trendChange: TrendChangeType; // Use the literal type
  support: ISupport;
  createdAt: string;
  updatedAt: string;
}

export interface IMarketScan extends IBaseConceptEntity {
  name: string;

  ecosystemDescription: string;
  startups: IStartup[];
  incumbents: IIncumbent[];

  trendsAndDriversDescription: string;
  trendsAndDrivers: ITrendsAndDrivers[];
}

// ===== MarketScan V3 Visualization Types =====

export type IconVariant =
  | 'activity'
  | 'gear'
  | 'trendup'
  | 'user-group'
  | 'shield-dollar'
  | 'globe'
  | 'lifebuoy'
  | 'arrowup'
  | 'arrowdown'
  | 'check'
  | 'arrowright'
  | 'chevronup'
  | 'chevrondown'
  | 'political'
  | 'economic'
  | 'social'
  | 'technological'
  | 'environmental'
  | 'legal';

export interface ITrendCategory {
  name: string;
  icon: IconVariant;
  status: 'favorable' | 'manageable' | 'challenging';
  position: { x: number; y: number };
  radarValue: number;
  conclusion: string;
  explanation: string;
  mitigation: string[];
}

export interface IPriorityInsight {
  title: string;
  impact: string;
  direction: 'up' | 'down';
  sources: Array<{
    name: string;
    count: number;
  }>;
}

export interface IPESTELSection {
  category: string;
  icon: IconVariant;
  summary: string;
  impact: string;
  keyFindings: Array<{
    text: string;
    source: string;
    type: string;
    direction: 'up' | 'down';
  }>;
}

// ===== MarketScan V3 API Response Types =====

export interface IKeyFindingSourceV3 {
  uuid: string;
  type: string;
  classification: string;
  url: string;
  title: string;
  summary: string;
  keywords: string[];
  citations: string[];
  credibility: number;
  timestamp: string;
  metadata: Record<string, any>;
}

export interface IKeyFindingV3 {
  uuid: string;
  text: string;
  source: string;
  type: string;
  direction: string;
  sources?: IKeyFindingSourceV3[];
  sourcesCount?: number;
  createdAt?: string;
  id?: number;
  updatedAt?: string;
}

export interface ITrendV3 {
  uuid: string;
  category: string; // PESTEL category (Political, Economic, etc.)
  icon: string; // Icon identifier
  summary: string; // Trend description
  impact: string; // Impact assessment
  keyFinding: IKeyFindingV3[];
  keyFindingsCount?: number;
  trendStrength?: string;
  riskLevel?: string;
  createdAt?: string;
  id?: number;
  updatedAt?: string;
}

export interface IPriorityInsightV3 {
  uuid: string;
  title: string;
  description: string;
  priority_level: string; // High, Medium, Low
  category: string;
  // Additional fields per backend schema
}

export interface IMarketForceV3 {
  uuid: string;
  category: string; // PESTEL category
  icon: string; // Icon identifier
  summary: string; // Force description
  impact: string; // Impact assessment
  // Similar structure to trends but without key_findings
}

// ===== Ecosystem V2 API Response Types =====

export interface IEcosystemProduct {
  id: number;
  name: string;
  company: string;
  image?: string | null;
  price: string;
  format: string;
  differentiator: string;
  strength: number;
  tags: string[];
  url: string;
  sources: ISource[];
}

export interface IEcosystemCompetitiveAdvantage {
  id: number;
  advantage: string;
  sources: ISource[];
}

export interface IEcosystemRecommendedAction {
  id: number;
  action: string;
  description: string;
}

export interface IStrategicTag {
  tag: string;
  confidence: number;
  reason: string;
}

export interface IEcosystemCompany {
  id: number;
  uuid: string;
  name: string;
  type: 'startup' | 'incumbent';
  foundedYear: number;
  headquarters: string;
  x: number;
  y: number;
  size: number;
  brandColor: string;
  logoType: 'image' | 'text';
  logoUrl?: string | null;
  logoText?: string | null;
  product: string;
  differentiator: string;
  website: string;
  description: string;
  competitiveAdvantage: string;
  strategicTags?: IStrategicTag[] | null;
  relevantProducts: IEcosystemProduct[];
  competitiveAdvantages: IEcosystemCompetitiveAdvantage[];
  recommendedActions: IEcosystemRecommendedAction[];
  nextSteps?: string[];

  // Metric fields
  revenue?: number | null;
  revenueSourceType?: 'direct' | 'ai_reasoning' | 'unknown' | null;
  revenueSourceLabel?: string | null;
  revenueAiExplanation?: string | null;

  employees?: number | null;
  employeesSourceType?: 'direct' | 'ai_reasoning' | 'unknown' | null;
  employeesSourceLabel?: string | null;
  employeesAiExplanation?: string | null;

  funding?: number | null;
  fundingSourceType?: 'direct' | 'ai_reasoning' | 'unknown' | null;
  fundingSourceLabel?: string | null;
  fundingAiExplanation?: string | null;

  parentCompany?: string | null;
}

export interface IEcosystemPrediction {
  id: number;
  title: string;
  description: string;
  category: string;
  categoryIcon: string | null;
  sources: ISource[];
}

export interface IEcosystemV2Response {
  needsUpgrade?: boolean;
  ecosystemData: IEcosystemCompany[];
  headwinds: Array<{ id: number; description: string }>;
  tailwinds: Array<{ id: number; description: string }>;
  crowdedness: {
    score: number;
    directCompetitors: number;
  };
  futurePredictions: IEcosystemPrediction[];
}
