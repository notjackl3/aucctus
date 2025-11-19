import type { IPageResponse } from '../osiris';

// Test Result Types
export interface ITestResult {
  uuid: string;
  title: string;
  description?: string;
  fileType: string;
  testDetailsUuid: string;
  sourceUuid: string;
  fileUrl: string;
  filePath: string;
  fileSize: number;
  originalFilename: string;
  summary?: string;
  learnings?: ITestLearning[];
  createdAt: string;
  updatedAt: string;
  editRecommendations?: IEditRecommendation[];
  files: ITestFile[];

  // Synthetic testing fields
  isSynthetic?: boolean; // Maps to is_synthetic from Django model
  personaName?: string; // Maps to persona_name from Django model
  personaUuid?: string; // Maps to persona_uuid from Django model

  // Phase 1: Synthetic distribution fields
  baseProfileUuid?: string; // Maps to base_profile_uuid from Django model
  variationMetadata?: Record<string, any>; // Maps to variation_metadata from Django model
  syntheticWeight?: number; // Maps to synthetic_weight from Django model
  collateralUuid?: string; // Maps to collateral_uuid from Django model

  // Structured synthetic interview fields
  keyInsights?: string; // Maps to key_insights from Django model
  painPoints?: string; // Maps to pain_points from Django model
  solutionFeedback?: string; // Maps to solution_feedback from Django model
  willingnessToPayFeedback?: string; // Maps to willingness_to_pay from Django model
  overallSentiment?: string; // Maps to overall_sentiment from Django model
  rawInterviewTranscript?: string; // Maps to raw_interview_transcript from Django model
}

export interface ITestFile {
  uuid: string;
  originalFilename: string;
  fileExtension: string;
  fileSize: number;
  fileUrl: string;
  filePath: string;
  createdAt: string;
}

// Test Learning Types
export interface ITestLearning {
  uuid: string;
  learning: string;
  impact: string;
  testResultUuid: string;
  createdAt: string;
  updatedAt: string;
  sourceUuid: string;
  sourceFilename: string;
}

// Edit Recommendation Types
export interface IEditRecommendation {
  title: string;
  reason: string;
  section: string;
  description: string;
  testEvidence: string;
}

// Comprehensive Edit Recommendation Types (synthesized from multiple test results)
export interface IComprehensiveEditRecommendation {
  uuid: string;
  section: string;
  recommendation: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  rationale: string;
  sourceCount: number;
  sourceDetails: string[];
  status: 'pending' | 'applied' | 'rejected';
  appliedAt?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Test Collateral Types
export type CollateralType = 'text' | 'image' | 'file';

export interface ITestCollateral {
  id: string;
  title: string;
  description: string;
  type: CollateralType;
  content: string;
  format?: string; // for files: pdf, docx, etc.
  createdAt: string;
  updatedAt: string;
}

export interface ICollateralRegenerationStatus {
  status: 'idle' | 'running' | 'completed' | 'error';
  startedAt?: string;
  updatedAt?: string;
  completedAt?: string;
  message?: string;
}

// Test Status Types
export type TestExecutionStatus = 'notStarted' | 'inProgress' | 'completed';

// Test Execution Mode Types
export type TestExecutionMode =
  | 'facilitated'
  | 'expertLed'
  | 'automated'
  | 'synthetic';

// Synthetic Distribution Types (Phase 1)
export interface IProfileDistribution {
  profileUuid: string;
  profileName: string;
  isPrimary: boolean;
  testCount: number;
  weight: number;
}

export interface IDistributionPreview {
  totalTests: number;
  totalAllocatedTests: number;
  distributionStrategy: string;
  collateralUuid?: string;
  collateralTitle?: string;
  profileDistributions: IProfileDistribution[];
}

export interface IDistributionPreviewRequest {
  totalTests?: number;
  collateralUuid?: string;
  customWeights?: Record<string, number>;
}

export interface ISyntheticExecutionRequest {
  total_tests?: number;
  collateral_uuids?: string[];
  collateral_uuid?: string; // DEPRECATED: Use collateral_uuids instead
  distribution_weights?: Record<string, number>;
}

export interface ITestCollateralOption {
  uuid: string;
  title: string;
  description?: string;
  type: CollateralType;
  createdAt: string;
}

export interface ITestCollateralPageResponse
  extends IPageResponse<ITestCollateral> {
  collateralRegeneration?: ICollateralRegenerationStatus;
}

export interface ITestCollateralOptionPageResponse
  extends IPageResponse<ITestCollateralOption> {
  collateralRegeneration?: ICollateralRegenerationStatus;
}

// Synthetic Execution Response Types
export interface ISyntheticExecutionStartResponse {
  executionId: string;
  conceptUuid: string;
  testUuid: string;
  message: string;
}

export interface ISyntheticExecutionStatusResponse {
  executionId: string;
  conceptUuid: string;
  testUuid: string;
  workflowExecutionUuid: string;
  status:
    | 'pending'
    | 'running'
    | 'completed'
    | 'error'
    | 'cancelled'
    | 'cancelling';
  progress: number;
  message: string;
  startedAt?: string;
  completedAt?: string;
  resultsCount?: number;
  durationSeconds?: number;
  error?: any;
  // Legacy fields for backward compatibility
  currentPersona?: string;
  totalPersonas?: number;
  errorDetails?: any;
}

// Apply Recommendations Request/Response Types
export interface IApplyRecommendationsRequest {
  recommendationUuids: string[];
}

export interface IApplyRecommendationsResponse {
  taskId: string;
  status: string;
  recommendationsCount: number;
}

// Generate Next Test Response
export interface IGenerateNextTestResponse {
  taskId: string;
  status: string;
  generatedTestUuid: string;
  conceptUuid: string;
  message: string;
}
