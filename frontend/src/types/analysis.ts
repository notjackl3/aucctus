// ─── Core enums ───

export type Recommendation = 'go' | 'no-go' | 'maybe';
export type AnalysisStatus = 'pending' | 'running' | 'completed' | 'error';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

// ─── Shared primitives ───

export interface Source {
  title: string;
  url: string;
  publisher: string;
  date?: string;
  snippet?: string;
}

export interface ConfidenceIndicator {
  level: ConfidenceLevel;
  score: number; // 0-100
  reasoning: string;
}

// ─── Research space: Incumbents ───

export interface Incumbent {
  name: string;
  description: string;
  marketPosition: string; // e.g. "Leader", "Challenger", "Niche"
  strengths: string[];
  weaknesses: string[];
  estimatedRevenue?: string;
  founded?: string;
  headquarters?: string;
}

export interface IncumbentsResult {
  summary: string;
  players: Incumbent[];
  marketConcentration: string; // e.g. "High - top 3 control 70%+"
  confidence: ConfidenceIndicator;
  sources: Source[];
}

// ─── Research space: Emerging Competitors ───

export interface EmergingCompetitor {
  name: string;
  description: string;
  fundingStage: string; // e.g. "Series A", "Seed"
  fundingAmount?: string;
  fundingDate?: string;
  investors?: string[];
  differentiator: string;
}

export interface EmergingCompetitorsResult {
  summary: string;
  competitors: EmergingCompetitor[];
  totalFundingInSpace: string;
  fundingTrend: string;
  confidence: ConfidenceIndicator;
  sources: Source[];
}

// ─── Research space: Market Sizing ───

export interface MarketSizingResult {
  summary: string;
  tam: string; // e.g. "$45B"
  sam: string;
  som?: string;
  cagr: string; // e.g. "12.3%"
  growthDrivers: string[];
  constraints: string[];
  timeframe: string; // e.g. "2024-2030"
  confidence: ConfidenceIndicator;
  sources: Source[];
}

// ─── Synthesis: Opportunity Assessment ───

export interface OpportunityAssessment {
  recommendation: Recommendation;
  score: number; // 0-100
  headline: string;
  reasoning: string;
  strategicFitSummary?: string;
  reasonsToBelieve: string[];
  reasonsToChallenge: string[];
  conditionsToPursue?: string[];
  whiteSpaceOpportunities: string[];
  keyRisks: string[];
  timingAssessment?: string; // early | on-time | late | unclear
  rightToWin?: string;
  needsLeadershipInput?: string[];
  confidence: ConfidenceIndicator;
}

// ─── Analysis pipeline status ───

export interface ResearchStepStatus {
  step: 'incumbents' | 'emerging_competitors' | 'market_sizing' | 'synthesis';
  label: string;
  status: AnalysisStatus;
  startedAt?: string;
  completedAt?: string;
}

// ─── Top-level analysis object ───

export interface AnalysisRequest {
  companyName: string;
  marketSpace: string;
  companyContext?: string;
}

export interface AnalysisResult {
  id: string;
  request: AnalysisRequest;
  status: AnalysisStatus;
  steps: ResearchStepStatus[];
  incumbents?: IncumbentsResult;
  emergingCompetitors?: EmergingCompetitorsResult;
  marketSizing?: MarketSizingResult;
  opportunityAssessment?: OpportunityAssessment;
  createdAt: string;
  completedAt?: string;
}
