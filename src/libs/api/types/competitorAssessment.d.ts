/**
 * Competitor Assessment API Types
 *
 * Types for the Competitor Assessment feature including:
 * - Competitors (with assessments)
 * - Assessment data (3M template)
 * - White Space Opportunities
 * - Config
 */

// ============================================
// Confidence & Urgency Types
// ============================================

export type CompetitorAssessmentConfidence = 'high' | 'medium' | 'low';

export type WhiteSpaceUrgency = 'immediate' | 'strategic' | 'exploratory';

export type CompetitorSource = 'ai_suggested' | 'user_added';

// ============================================
// Assessment Source Types
// ============================================

export interface IAssessmentSource {
  uuid: string;
  title: string;
  url: string;
  sourceType: string;
  supportedFields: string[];
  citation: string;
}

// ============================================
// Competitor Assessment Types (3M Template)
// ============================================

export interface ICompetitorAssessment {
  uuid: string;
  applicationUseCase: string;
  leadProduct: string;
  productDescription: string;
  materialsOfConstruction: string;
  valueProposition: string;
  weaknessesGaps: string;
  howTheyWin: string;
  pricingInfo: string;
  confidence: CompetitorAssessmentConfidence;
  confidenceScore: number;
  sources: IAssessmentSource[];
}

// ============================================
// Competitor Types
// ============================================

export interface ICompetitor {
  uuid: string;
  name: string;
  website: string;
  logoUrl: string;
  description: string;
  source: CompetitorSource;
  isYourCompany: boolean;
  isActive: boolean;
  displayOrder: number;
  assessment: ICompetitorAssessment | null;
}

export interface ICreateCompetitorPayload {
  name: string;
  website?: string;
  description?: string;
}

export interface IUpdateCompetitorPayload {
  name?: string;
  website?: string;
  description?: string;
  isActive?: boolean;
  displayOrder?: number;
}

// ============================================
// White Space Opportunity Types
// ============================================

export interface IWhiteSpaceOpportunity {
  uuid: string;
  title: string;
  description: string;
  gapType: string;
  marketOpportunity: string;
  evidenceSummary: string;
  recommendation: string;
  urgency: WhiteSpaceUrgency;
  opportunityScore: number;
  displayOrder: number;
}

// ============================================
// Config Types
// ============================================

export interface ICompetitorAssessmentConfig {
  uuid: string;
  yourCompanyName: string;
  yourCompanyWebsite: string;
  yourCompanyDescription: string;
  yourCompanyLogoUrl: string;
  industryContext: string;
  retentionDays: number;
}

export interface IUpdateConfigPayload {
  yourCompanyName?: string;
  yourCompanyWebsite?: string;
  yourCompanyDescription?: string;
  yourCompanyLogoUrl?: string;
  industryContext?: string;
  retentionDays?: number;
}

// ============================================
// Metrics Types
// ============================================

export interface ICompetitorAssessmentMetrics {
  totalCompetitors: number;
  activeCompetitors: number;
  whiteSpacesFound: number;
  lastScanDate: string | null;
}

// ============================================
// Dashboard Types
// ============================================

export interface ICompetitorAssessmentDashboard {
  competitors: ICompetitor[];
  whiteSpaces: IWhiteSpaceOpportunity[];
  config: ICompetitorAssessmentConfig;
  metrics: ICompetitorAssessmentMetrics;
  lastRefreshedAt: string | null;
  isRefreshing: boolean;
}

// ============================================
// Refresh Response Types
// ============================================

export interface ICompetitorAssessmentRefreshResponse {
  taskId: string;
  message: string;
}
