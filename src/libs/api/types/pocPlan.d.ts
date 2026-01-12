/**
 * POC Plan Types
 * Types for the Proof of Concept Plan feature
 *
 * NOTE: These types use camelCase for frontend convenience.
 * The API service handles transformation from backend snake_case responses.
 */

export type PocPlanStatus = 'generating' | 'complete' | 'failed';

export type PocMilestoneStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'blocked';

export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';

export type RiskLikelihood = 'unlikely' | 'possible' | 'likely' | 'very_likely';

export type PocRiskCategory =
  | 'technical'
  | 'market'
  | 'financial'
  | 'operational'
  | 'regulatory';

export type ResourceCategory =
  | 'personnel'
  | 'technology'
  | 'budget'
  | 'external';

export type MetricFrequency =
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'milestone'
  | 'end_of_poc';

/**
 * POC Plan Objective
 */
export interface IPocObjective {
  uuid: string;
  title: string;
  description: string;
  hypothesisToValidate: string;
  successCriteria: string;
  order: number;
}

/**
 * POC Plan Milestone
 */
export interface IPocMilestone {
  uuid: string;
  title: string;
  description: string;
  deliverables: string[];
  dependencies: string[];
  status: PocMilestoneStatus;
  weekNumber: number;
  order: number;
}

/**
 * POC Plan Resource
 */
export interface IPocResource {
  uuid: string;
  category: ResourceCategory;
  name: string;
  description: string;
  estimatedCost?: number;
  quantity?: number;
  unit?: string;
  isRequired: boolean;
}

/**
 * POC Plan Risk
 */
export interface IPocRisk {
  uuid: string;
  title: string;
  description: string;
  category: PocRiskCategory;
  severity: RiskSeverity;
  likelihood: RiskLikelihood;
  mitigationStrategy: string;
  contingencyPlan?: string;
  owner?: string;
}

/**
 * POC Plan Success Metric
 */
export interface IPocSuccessMetric {
  uuid: string;
  name: string;
  description: string;
  targetValue: string;
  currentValue?: string;
  unit?: string;
  measurementMethod: string;
  frequency: MetricFrequency;
  isGoNoGoCriteria: boolean;
}

/**
 * POC Timeline Phase
 */
export interface IPocTimelinePhase {
  uuid: string;
  name: string;
  description: string;
  startWeek: number;
  endWeek: number;
  color: string;
  milestoneIds: string[];
}

/**
 * POC Plan Executive Summary
 */
export interface IPocExecutiveSummary {
  overview: string;
  strategicRationale: string;
  expectedOutcome: string;
  investmentRequired: string;
  decisionCriteria: string;
}

/**
 * POC Plan Next Steps
 */
export interface IPocNextStep {
  uuid: string;
  title: string;
  description: string;
  assignee?: string;
  dueDate?: string;
  order: number;
}

/**
 * Complete POC Plan
 */
export interface IPocPlan {
  uuid: string;
  conceptRootUuid: string;
  conceptIdentifier: string;
  status: PocPlanStatus;
  errorMessage?: string;

  // Executive Summary
  executiveSummary: IPocExecutiveSummary;

  // Timeline
  totalWeeks: number;
  goNoGoDate?: string;

  // Version tracking
  version: number;

  // Nested entities
  objectives: IPocObjective[];
  milestones: IPocMilestone[];
  resources: IPocResource[];
  risks: IPocRisk[];
  successMetrics: IPocSuccessMetric[];
  timelinePhases: IPocTimelinePhase[];
  nextSteps: IPocNextStep[];

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

/**
 * POC Plan Generation Request
 */
export interface IPocPlanGenerationRequest {
  conceptUuid: string;
  regenerate?: boolean;
}

/**
 * POC Plan Generation Response
 */
export interface IPocPlanGenerationResponse {
  uuid: string;
  status: PocPlanStatus;
  message: string;
}

/**
 * POC Plan Generation Progress (for HTTP status polling)
 */
export interface IPocPlanGenerationProgress {
  status: PocPlanStatus;
  stage?: string;
  progress?: number;
  message?: string;
}

/**
 * POC Plan Exists Response
 */
export interface IPocPlanExistsResponse {
  exists: boolean;
  status?: PocPlanStatus;
}

/**
 * POC Modal Item Content
 * Contextualized content for a single modal item
 */
export interface IPocModalItemContent {
  key: string;
  title: string;
  description: string;
}

/**
 * POC Modal Content Response
 * Response containing all contextualized modal items
 */
export interface IPocModalContentResponse {
  items: IPocModalItemContent[];
}
