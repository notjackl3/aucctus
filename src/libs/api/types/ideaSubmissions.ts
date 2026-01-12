/**
 * Types for the Employee Idea Submission System
 */

export type IdeaSubmissionStatus = 'pending' | 'reviewed' | 'archived';

export type IdeaSubmissionCategory =
  | 'process_improvement'
  | 'product_service'
  | 'cost_reduction'
  | 'customer_experience'
  | 'technology'
  | 'sustainability'
  | 'culture'
  | 'other';

/**
 * Category labels for display
 */
export const CATEGORY_LABELS: Record<IdeaSubmissionCategory, string> = {
  process_improvement: 'Process Improvement',
  product_service: 'Product/Service Development',
  cost_reduction: 'Cost Reduction',
  customer_experience: 'Customer Experience',
  technology: 'Technology/Tools',
  sustainability: 'Sustainability',
  culture: 'Culture/Workplace',
  other: 'Other',
};

/**
 * Idea submission as returned from the API
 */
export interface IIdeaSubmission {
  uuid: string;
  submitterName: string;
  submitterEmail: string;
  department: string;
  category: IdeaSubmissionCategory;
  title: string;
  problemStatement: string;
  proposedSolution: string;
  expectedImpact: string;
  /** @deprecated Legacy field - use problemStatement and proposedSolution instead */
  description: string;
  status: IdeaSubmissionStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Payload for creating a new idea submission (public form)
 * Note: Uses snake_case to match backend API expectations
 */
export interface ICreateIdeaSubmission {
  submitter_name: string;
  submitter_email: string;
  department?: string;
  category?: IdeaSubmissionCategory;
  title: string;
  problem_statement: string;
  proposed_solution: string;
  expected_impact?: string;
}

/**
 * Payload for updating submission status (admin only)
 */
export interface IUpdateIdeaSubmissionStatus {
  status: IdeaSubmissionStatus;
}

// ============================================
// IDEA PROCESSING TYPES
// ============================================

/**
 * A single processed idea with evaluation scores
 */
export interface IProcessedIdea {
  uuid: string;
  title: string;
  summary: string;
  category: string;
  strategicAlignmentScore: number;
  innovationScore: number;
  feasibilityScore: number;
  impactScore: number;
  overallScore: number;
  reasoning: string;
  submitterName: string;
}

/**
 * A group of similar/duplicate ideas
 */
export interface IDuplicateGroup {
  primaryIdeaUuid: string;
  duplicateUuids: string[];
  similarityReason: string;
  mergedTitle: string;
  mergedSummary: string;
}

/**
 * A theme grouping related ideas
 */
export interface IIdeaTheme {
  themeName: string;
  themeDescription: string;
  ideaUuids: string[];
  themePriority: number;
  themeIcon: string;
}

/**
 * A top-ranked idea with recommendation details
 */
export interface IRankedIdea {
  uuid: string;
  title: string;
  rank: number;
  overallScore: number;
  recommendation: string;
  keyStrengths: string[];
  potentialChallenges: string[];
}

/**
 * Complete response from processing idea submissions
 */
export interface IProcessIdeasResponse {
  executiveSummary: string;
  totalIdeasProcessed: number;
  uniqueIdeasCount: number;
  duplicateGroups: IDuplicateGroup[];
  themes: IIdeaTheme[];
  topRecommendations: IRankedIdea[];
  allProcessedIdeas: IProcessedIdea[];
  keyInsights: string[];
  suggestedNextSteps: string[];
}

/**
 * Response when processing is started asynchronously
 */
export interface IProcessIdeasTaskResponse {
  taskId: string;
  message: string;
  submissionCount: number;
}

/**
 * Status of a processing task
 */
export interface IProcessTaskStatus {
  taskId: string;
  status: 'PENDING' | 'STARTED' | 'SUCCESS' | 'FAILURE' | 'RETRY';
  ready: boolean;
  result?: IProcessIdeasResponse;
  error?: string;
}
