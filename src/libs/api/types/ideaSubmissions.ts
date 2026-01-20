/**
 * Types for the Employee Idea Submission System
 */

// Updated status values to match new backend schema
export type IdeaSubmissionStatus = 'to_review' | 'approved' | 'rejected';

/**
 * Source file info for bulk-uploaded ideas
 */
export interface ISourceFileInfo {
  uuid: string;
  filename: string;
  fileType: string;
}

// Legacy status values for backward compatibility
export type LegacyIdeaSubmissionStatus = 'pending' | 'reviewed' | 'archived';

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
  // New name fields
  firstName: string;
  lastName: string;
  displayName: string;
  /** @deprecated Use firstName + lastName */
  submitterName: string;
  submitterEmail: string;
  department: string | null;
  category: IdeaSubmissionCategory | null;
  title: string;
  problemStatement: string;
  proposedSolution: string;
  expectedImpact: string;
  /** @deprecated Legacy field - use problemStatement and proposedSolution instead */
  description: string;
  status: IdeaSubmissionStatus;
  createdAt: string;
  updatedAt: string;

  /** Total score (0-100) */
  totalScore: number | null;
  /** AI explanation of the scoring */
  scoreReasoning: string | null;

  // ==========================================================================
  // THEME AND DUPLICATE TRACKING
  // ==========================================================================
  /** Assigned theme category from AI analysis */
  theme: string | null;
  /** UUID linking duplicate/similar ideas */
  duplicateGroupId: string | null;
  /** Whether this is the primary idea in a duplicate group */
  isPrimaryInGroup: boolean;

  // ==========================================================================
  // ASSOCIATIONS
  // ==========================================================================
  /** UUID of the submission link this was submitted through */
  submissionLinkUuid: string | null;
  /** UUID of the Concept created from this submission (via Save to Bank) */
  conceptUuid: string | null;
  /** Whether a concept report has been generated for this submission */
  reportGenerated: boolean;

  // ==========================================================================
  // SOURCE FILE INFO (for bulk uploads)
  // ==========================================================================
  /** Source file info if this idea was bulk uploaded */
  sourceFile: ISourceFileInfo | null;
}

/**
 * Payload for creating a new idea submission via legacy UUID route (public form)
 * Note: Uses snake_case to match backend API expectations
 * @deprecated Use ICreateIdeaSubmissionViaLink for new slug-based submissions
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
 * Payload for creating a new idea submission via slug-based link route
 * Note: Uses snake_case to match backend API expectations
 */
export interface ICreateIdeaSubmissionViaLink {
  first_name: string;
  last_name: string;
  email: string;
  title: string;
  description: string;
  problem_statement: string;
  expected_impact?: string;
  /** Password for protected links */
  password?: string;
  /** Honeypot field for bot detection - should always be empty */
  website?: string;
  /** Cloudflare Turnstile CAPTCHA token */
  captcha_token: string;
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

// ============================================
// SUBMISSION LINK TYPES
// ============================================

/**
 * Theme stored in SubmissionLink.themes JSONField
 */
export interface ISubmissionLinkTheme {
  name: string;
  description: string;
  count: number;
  submissionUuids: string[];
}

/**
 * A submission link/portal for collecting ideas
 */
export interface ISubmissionLink {
  uuid: string;
  title: string;
  slug: string;
  description: string;
  isActive: boolean;
  requiresPassword: boolean;
  backgroundImageUrl: string;
  submissionCount: number;
  createdAt: string;
  updatedAt: string;

  // Analysis fields (populated after submissions are analyzed)
  /** List of themes with submission counts */
  themes: ISubmissionLinkTheme[] | null;
  /** AI-generated insight bullets */
  analysisSummary: string[] | null;
  /** Count of submissions with score >= 80 */
  highPriorityCount: number;
  /** Number of duplicate groups detected */
  duplicateGroupCount: number;
  /** When the link was last analyzed */
  lastAnalyzedAt: string | null;
}

/**
 * Payload for creating a new submission link
 * Note: Uses snake_case to match backend API expectations
 */
export interface ICreateSubmissionLink {
  title: string;
  slug: string;
  description?: string;
  password?: string;
  background_image_url?: string;
}

/**
 * Payload for updating a submission link
 * Note: Uses snake_case to match backend API expectations
 */
export interface IUpdateSubmissionLink {
  title?: string;
  slug?: string;
  description?: string;
  password?: string | null;
  is_active?: boolean;
  background_image_url?: string;
}

/**
 * Public submission link info returned before submitting
 */
export interface ISubmissionLinkInfo {
  title: string;
  description: string;
  accountName: string;
  /** Domain of the organization for logo fetching (e.g., "schreiber.com") */
  accountDomain: string | null;
  requiresPassword: boolean;
  backgroundImageUrl: string | null;
  /** Presigned URL for headquarters video from Nucleus report */
  headquartersVideoUrl: string | null;
}

// ============================================
// SCORE BREAKDOWN TYPES (5-category system)
// ============================================

/**
 * A single sub-question score within a category
 */
export interface ISubQuestionScore {
  question: string;
  /** Score for this sub-question (0-5) */
  score: number;
  justification: string;
}

/**
 * A single scoring category with sub-question breakdown
 */
export interface ICategoryScore {
  categoryName: string;
  /** Three sub-question scores (5 points each) */
  subQuestions: ISubQuestionScore[];
  /** Total score for this category (0-15) */
  categoryTotal: number;
  categorySummary: string;
}

/**
 * Complete 5-category score breakdown
 */
export interface IScoreBreakdown {
  strategicFit: ICategoryScore;
  marketOpportunity: ICategoryScore;
  customerValue: ICategoryScore;
  feasibility: ICategoryScore;
  riskProfile: ICategoryScore;
  /** 1-3 key strengths of this idea */
  strengths: string[];
  /** 1-3 key weaknesses or concerns */
  weaknesses: string[];
  recommendation: string;
}

// ============================================
// COMPARISON TYPES
// ============================================

/**
 * Request payload for comparing multiple submissions
 */
export interface ICompareSubmissionsRequest {
  /** List of submission UUIDs to compare (2-5 submissions) */
  submission_uuids: string[];
}

/**
 * A single idea's comparison analysis
 */
export interface IIdeaComparison {
  uuid: string;
  title: string;
  /** 2-3 key strengths of this idea */
  pros: string[];
  /** 2-3 key weaknesses or concerns */
  cons: string[];
  /** 1-2 unknowns or risks */
  unknowns: string[];
  recommendation: string;
}

/**
 * The winning idea in a comparison
 */
export interface IComparisonWinner {
  uuid: string;
  title: string;
  /** Detailed reasoning for why this idea was selected as the winner */
  reasoning: string;
}

/**
 * Response from comparing multiple submissions
 */
export interface ICompareSubmissionsResponse {
  /** Comparison analysis for each submitted idea */
  ideas: IIdeaComparison[];
  /** The winning idea with reasoning */
  winner: IComparisonWinner;
}

// ============================================
// SAVE TO BANK TYPES
// ============================================

/**
 * Request payload for saving a submission to the concept bank
 */
export interface ISaveToBankRequest {
  /** If true, automatically generate a concept report after saving */
  generateReport?: boolean;
}

/**
 * Response from saving a submission to the concept bank
 */
export interface ISaveToBankResponse {
  conceptUuid: string;
  conceptTitle: string;
  message: string;
}

// ============================================
// Question Score Update Types
// ============================================

/**
 * Request payload for updating a question score on a submission
 */
export interface IUpdateQuestionScoreRequest {
  question_uuid: string;
  score: number;
}

/**
 * Response from updating a question score
 */
export interface IUpdateQuestionScoreResponse {
  questionUuid: string;
  score: number;
  message?: string;
}

// ============================================
// File Upload Types
// ============================================

/**
 * Response from uploading a file with idea submissions
 */
export interface IFileUploadResponse {
  taskId: string;
  sourceFileUuid: string;
  filename: string;
  fileType: string;
  message: string;
}

// ============================================
// DETAILED SUBMISSION SCORE TYPES
// (Used by GET /submission-links/{uuid}/submissions/{submissionUuid}/details)
// ============================================

/**
 * Detailed question score with AI reasoning
 */
export interface IQuestionScoreDetail {
  questionUuid: string;
  questionText: string;
  categoryName: string;
  /** Score from 1-5 (0 if not scored) */
  score: number;
  /** AI explanation for this score */
  reasoning: string;
  /** Question importance level */
  importance: 'low' | 'medium' | 'high';
  /** Whether this score was AI-generated */
  isAiGenerated: boolean;
}

/**
 * Detailed category score with question breakdowns
 */
export interface ICategoryScoreDetail {
  categoryUuid: string;
  categoryName: string;
  /** Icon identifier for the category */
  categoryIcon: string;
  /** Sum of question scores */
  score: number;
  /** Maximum possible score (questions × 5) */
  maxScore: number;
  /** Individual question scores */
  questions: IQuestionScoreDetail[];
}

/**
 * Complete submission detail with full score breakdown
 * Returned by GET /submission-links/{linkUuid}/submissions/{submissionUuid}/details
 */
export interface IIdeaSubmissionDetail {
  uuid: string;
  firstName: string;
  lastName: string;
  displayName: string;
  /** @deprecated Use firstName + lastName */
  submitterName: string;
  submitterEmail: string;
  department: string | null;
  category: IdeaSubmissionCategory | null;
  title: string;
  problemStatement: string;
  proposedSolution: string;
  expectedImpact: string;
  /** @deprecated Legacy field */
  description: string;
  status: IdeaSubmissionStatus;
  createdAt: string;
  updatedAt: string;

  // Detailed scoring (enriched with category/question metadata)
  totalScore: number | null;
  scoreReasoning: string | null;
  isAiGenerated: boolean;
  scoringConfigVersionUuid: string | null;
  /** Detailed category scores with question breakdowns */
  categoryScores: ICategoryScoreDetail[];

  // Theme and duplicate tracking
  theme: string | null;
  duplicateGroupId: string | null;
  isPrimaryInGroup: boolean;

  // Links
  submissionLinkUuid: string | null;
  conceptUuid: string | null;
  /** Whether a concept report has been generated for this submission */
  reportGenerated: boolean;

  // Source file info (for bulk uploads)
  /** Source file info if this idea was bulk uploaded */
  sourceFile: ISourceFileInfo | null;
}
