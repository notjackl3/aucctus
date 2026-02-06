import { IAiEditingContext, IConceptReportEdit } from '../ai-editing';
import { IBaseMessage } from '../chat';
import {
  IConceptGenerationContext,
  IGeneratedConceptList,
  ConceptReportStatusBySection,
} from '../concept/concepts';
import {
  IAISuggestionList,
  IAISuggestionsContext,
} from '../incubation/aiSuggestions';
import { BaseSocketEvent } from './base';

// ==========================================
// Base Interfaces
// ==========================================

export interface ErrorEvent extends BaseSocketEvent {
  type: 'error';
  error: string;
  details: string | object | number | boolean;
}

interface IBaseInboundChatMessage {
  sessionId: string;
}

// ==========================================
// General Chat Messages
// ==========================================

export interface IHandshakeMessage
  extends IBaseInboundChatMessage,
    BaseSocketEvent {
  type: 'ai.editing.conversation.start';
  // Add typing for initial message
}

export interface IInboundChatMessage
  extends Omit<IBaseMessage, 'createdAt'>,
    IBaseInboundChatMessage,
    BaseSocketEvent {
  type: 'chat.message';
  uuid: string; // The uuid of the message
}

// ==========================================
// AI Editing Related Messages
// ==========================================

export interface IAiEditingHandshakeMessage
  extends IBaseInboundChatMessage,
    BaseSocketEvent {
  type: 'ai.editing.handshake';
  sessionId: string;
  conceptUuid: string;
  account_uuid: string;
  user_uuid: string;
}

export interface IAiEditingInboundChatMessage
  extends IInboundChatMessage,
    BaseSocketEvent {
  type: 'ai.editing.chat';
  conceptUuid: string;
  account_uuid: string;
  user_uuid: string;
}

export interface IAiEditingTypingMessage extends BaseSocketEvent {
  type: 'ai.editing.chat.typing';
  conceptUuid: string;
  value: boolean;
  content?: string;
  account_uuid: string;
  user_uuid: string;
}

export interface IAiEditingErrorMessage extends BaseSocketEvent {
  type: 'ai.editing.error';
  conceptUuid: string;
  code: string; // This should match your ConsumerErrorCodes enum
  message: string;
  account_uuid: string;
  user_uuid: string;
}

export interface IAiEditingSuggestionsEvent extends BaseSocketEvent {
  type: 'ai.editing.edit.suggestion';
  uuid: string;
  name: string;
  conceptUuid: string;
  sessionId: string;
  content: IConceptReportEdit;
  timestamp?: number;
  account_uuid: string;
  user_uuid: string;
}

export interface IAIEditingStartedMessage extends BaseSocketEvent {
  type: 'ai.editing.started';
  conceptUuid: string;
  userUuid: string;
  userFirstName: string;
  userLastName: string;
  account_uuid: string;
  user_uuid: string;
}

// ==========================================
// Overseer (AI Context Analysis) Messages
// ==========================================

export interface IOverseerHandshakeMessage extends BaseSocketEvent {
  type: 'overseer.handshake';
  sessionId: string;
  conceptUuid: string;
}

export interface IOverseerChatMessage extends BaseSocketEvent {
  type: 'overseer.chat';
  uuid: string;
  sessionId: string;
  conceptUuid: string;
  role: 'assistant';
  name: string;
  content: string;
  timestamp?: string;
}

export interface IOverseerChatStreamMessage extends BaseSocketEvent {
  type: 'overseer.chat.stream';
  content?: string;
  context?: {
    uuid: string;
    conceptUuid: string;
    sessionId: string;
    name: string;
    timestamp?: string;
  };
}

export interface IOverseerTypingMessage extends BaseSocketEvent {
  type: 'overseer.chat.typing';
  conceptUuid: string;
  sessionId: string;
  value: boolean;
  content?: string;
}

export interface IOverseerSuggestedQuestionsMessage extends BaseSocketEvent {
  type: 'overseer.suggested.questions';
  conceptUuid: string;
  sessionId: string;
  questions: string[];
}

export interface IOverseerErrorMessage extends BaseSocketEvent {
  type: 'overseer.error';
  conceptUuid: string;
  code: string;
  message: string;
}

export interface IOverseerToolActivityMessage extends BaseSocketEvent {
  type: 'overseer.tool.activity';
  conceptUuid: string;
  sessionId: string;
  toolName: string;
  activityMessage: string;
}

export interface IOverseerEditSuggestionMessage extends BaseSocketEvent {
  type: 'overseer.edit.suggestion';
  conceptUuid: string;
  sessionId: string;
  content: IConceptReportEdit;
}

// ==========================================
// Test Result Related Messages
// ==========================================

export interface ITestLearningData {
  uuid: string;
  learning: string;
  impact: string;
}

export interface ITestResultHandshakeMessage extends BaseSocketEvent {
  type: 'test.result.handshake';
  conceptUuid: string;
  testUuid: string;
  testResultUuid: string;
  account_uuid: string;
  user_uuid: string;
}

export interface ITestResultProcessingMessage extends BaseSocketEvent {
  type: 'test.result.processing';
  conceptUuid: string;
  testUuid: string;
  testResultUuid: string;
  stage:
    | 'extracting_text'
    | 'analyzing_content'
    | 'generating_insights'
    | 'analyzing_results'
    | 'processing_files'
    | 'extracting_findings';
  progress?: number; // 0-100
  value: boolean; // Whether processing is active
  account_uuid: string;
  user_uuid: string;
}

export interface ITestResultCompletedMessage extends BaseSocketEvent {
  type: 'test.result.completed';
  conceptUuid: string;
  testUuid: string;
  testResultUuid: string;
  summary: string;
  learnings: ITestLearningData[];
  keywords: string[];
  account_uuid: string;
  user_uuid: string;
}

export interface ITestResultErrorMessage extends BaseSocketEvent {
  type: 'test.result.error';
  conceptUuid: string;
  testUuid: string;
  testResultUuid: string;
  code: string;
  message: string;
  account_uuid: string;
  user_uuid: string;
}

// ==========================================
// Test Collateral Processing Messages
// ==========================================

export interface ITestCollateralProgressMessage extends BaseSocketEvent {
  type: 'test_collateral.progress.user';
  conceptUuid: string;
  testUuid: string;
  collateralUuid: string;
  progress: number; // 0-100
  message: string;
  stage: string;
  account_uuid: string;
  user_uuid: string;
}

export interface ITestCollateralCompletedMessage extends BaseSocketEvent {
  type: 'test_collateral.completed.user';
  conceptUuid: string;
  testUuid: string;
  collateralUuid: string;
  collateral: any; // The completed collateral data
  account_uuid: string;
  user_uuid: string;
}

export interface ITestCollateralErrorMessage extends BaseSocketEvent {
  type: 'test_collateral.error.user';
  conceptUuid: string;
  testUuid: string;
  collateralUuid?: string;
  message: string;
  details?: string;
  account_uuid: string;
  user_uuid: string;
}

// ==========================================
// Test Collateral Update Processing Messages
// ==========================================

export interface ITestCollateralUpdateProgressMessage extends BaseSocketEvent {
  type: 'test_collateral.update.progress.user';
  conceptUuid: string;
  testUuid: string;
  collateralUuid: string;
  progress: number; // 0-100
  message: string;
  stage: string;
  account_uuid: string;
  user_uuid: string;
}

// ==========================================
// Test Generation Progress Messages
// ==========================================

export interface ITestGenerationStartedMessage extends BaseSocketEvent {
  type: 'test.generation.started.user';
  conceptUuid: string;
  testUuid: string;
  accountUuid: string;
  message: string;
}

export interface ITestGenerationProgressMessage extends BaseSocketEvent {
  type: 'test.generation.progress.user';
  conceptUuid: string;
  testUuid: string;
  accountUuid: string;
  progress: number;
  stage: string;
  message: string;
}

export interface ITestGenerationCompletedMessage extends BaseSocketEvent {
  type: 'test.generation.completed.user';
  conceptUuid: string;
  testUuid: string;
  accountUuid: string;
  message: string;
}

export interface ITestGenerationErrorMessage extends BaseSocketEvent {
  type: 'test.generation.error.user';
  conceptUuid: string;
  testUuid?: string;
  accountUuid: string;
  error: string;
  message: string;
  details?: Record<string, any>;
}

export interface ITestCollateralUpdateCompletedMessage extends BaseSocketEvent {
  type: 'test_collateral.update.completed.user';
  conceptUuid: string;
  testUuid: string;
  collateralUuid: string;
  collateral: any; // The updated collateral data
  account_uuid: string;
  user_uuid: string;
}

export interface ITestCollateralUpdateErrorMessage extends BaseSocketEvent {
  type: 'test_collateral.update.error.user';
  conceptUuid: string;
  testUuid: string;
  collateralUuid?: string;
  message: string;
  details?: string;
  account_uuid: string;
  user_uuid: string;
}

// ==========================================
// Customer Profile Related Messages
// ==========================================

export interface ICustomerProfileHandshakeMessage
  extends IBaseInboundChatMessage,
    BaseSocketEvent {
  type: 'customer.profile.handshake';
  sessionId: string;
  conceptUuid: string;
  customerProfileUuid: string;
  account_uuid: string;
  user_uuid: string;
}

export interface ICustomerProfileInboundChatMessage
  extends IInboundChatMessage,
    BaseSocketEvent {
  type: 'customer.profile.chat';
  conceptUuid: string;
  customerProfileUuid: string;
  account_uuid: string;
  user_uuid: string;
}

export interface ICustomerProfileInboundTypingMessage
  extends IBaseInboundChatMessage,
    BaseSocketEvent {
  type: 'customer.profile.chat.typing';
  value: boolean;
  conceptUuid: string;
  customerProfileUuid: string;
  account_uuid: string;
  user_uuid: string;
}

export interface ICustomerProfileInboundErrorEvent
  extends IBaseInboundChatMessage,
    BaseSocketEvent {
  type: 'customer.profile.error';
  code: string;
  message: string;
  account_uuid: string;
  user_uuid: string;
}

// ==========================================
// Stream Event Interfaces
// ==========================================

/**
 * Base interface for all stream events.
 * Stream events represent data that is sent incrementally over time.
 */
export interface IBaseStreamEvent<T extends string, C extends object>
  extends BaseSocketEvent {
  type: T;
  id: string; // Unique identifier for the stream
  context: C; // Context of the stream that can be defined based on the current context. Will often contain user id.
}

/**
 * Stream Delta Event
 *
 * Represents an incremental update in a streaming response.
 * Used when data is being sent in chunks or partial updates.
 */
export interface IStreamDeltaEvent<
  T extends string,
  K extends string,
  C extends object,
> extends IBaseStreamEvent<T, C> {
  stage: 'delta';
  content: Partial<K>;
}

/**
 * Stream Done Event
 *
 * Signals the successful completion of a stream with the final complete data.
 */
export interface IStreamDoneEvent<
  T extends string,
  K extends string,
  C extends object,
> extends IBaseStreamEvent<T, C> {
  stage: 'done';
  content: K;
}

/**
 * Stream Error Event
 *
 * Indicates that an error occurred during streaming.
 */
export interface IStreamErrorEvent<T extends string, C extends object>
  extends IBaseStreamEvent<T, C> {
  stage: 'error';
  content: null;
}

// ==========================================
// Stream Event Types
// ==========================================

export type StreamEvent<T extends string, K extends string, C extends object> =
  | IStreamDeltaEvent<T, K, C>
  | IStreamDoneEvent<T, K, C>
  | IStreamErrorEvent<T, C>;

export type ChatStreamEvent<C = {}> = StreamEvent<'stream.chat', string, C>; // TODO: This needs to be properly updated to conform to the correct typing

export type AISuggestionsStreamEvent = StreamEvent<
  'stream.structured.ai.suggestions',
  IAISuggestionList,
  IAISuggestionsContext
>;

export type ConceptGenerationStreamEvent = StreamEvent<
  'stream.structured.concept.generation',
  IGeneratedConceptList,
  IConceptGenerationContext
>;

export type CustomerProfileStreamEvent = StreamEvent<
  'customer.profile.chat.stream',
  string,
  ICustomerProfileContext
>;

// ==========================================
// Union Types
// ==========================================
export type AiEditingChatStreamEvent = StreamEvent<
  'ai.editing.chat.stream',
  string,
  IAiEditingContext
>;

export type IAiEditingSuggestionsStreamEvent = StreamEvent<
  'stream.ai.editing.edit.suggestion',
  IConceptReportEdit,
  IAiEditingContext
>;

// ==========================================
// Concept Workflow Event Interfaces
// ==========================================

/**
 * Interface for concept workflow status update events.
 * Sent when concept report generation status changes.
 * Updated to match backend ConceptWorkflowMessage class.
 */
export interface IConceptWorkflowMessage extends BaseSocketEvent {
  type: 'concept.workflow.update.account';

  // Core identifiers
  conceptUuid: string;
  conceptRootIdentifier?: string;
  conceptTitle?: string;

  // Event details
  eventType:
    | 'workflow_completed'
    | 'workflow_error'
    | 'section_started'
    | 'section_completed';

  progressPercentage?: number;
  completedSections?: string[];
  totalSections?: number;

  // Section-level status data (for real-time updates)
  reportStatusBySection?: ConceptReportStatusBySection;

  // Backend-calculated aggregate status (CRITICAL for real-time updates)
  aggregateStatus?: string;

  // Additional context
  message?: string;
  errorDetails?: any;

  // Progress tracking
  agentName?: string; // Agent name for section-specific timing estimates (e.g., 'CustomerProfilePipeline', 'MarketScanPipeline')
  estimatedTime?: number; // Backend-calculated estimated time in seconds for this section/workflow
}

// ==========================================
// Synthetic Execution Messages
// ==========================================

export interface ISyntheticExecutionProgressMessage extends BaseSocketEvent {
  type: 'synthetic.execution.progress.user';
  conceptUuid: string;
  testUuid: string;
  accountUuid: string;
  executionId: string;
  stage: string;
  message: string;
  progress: number;
  currentPersona?: string;
  totalPersonas?: number;
  conceptTitle?: string;
}

export interface ISyntheticExecutionCompletedMessage extends BaseSocketEvent {
  type: 'synthetic.execution.completed.user';
  conceptUuid: string;
  testUuid: string;
  accountUuid: string;
  resultsCount: number;
  message: string;
}

export interface ISyntheticExecutionErrorMessage extends BaseSocketEvent {
  type: 'synthetic.execution.error.user';
  conceptUuid: string;
  testUuid: string;
  accountUuid: string;
  errorMessage: string;
  details?: any;
}

export interface ISyntheticInterviewQuoteMessage extends BaseSocketEvent {
  type: 'synthetic.interview.quote.user';
  conceptUuid: string;
  testUuid: string;
  accountUuid: string;
  quote: string;
  baseProfileUuid?: string; // UUID of the base customer profile this quote came from
}

export interface ISyntheticProfileCompletedMessage extends BaseSocketEvent {
  type: 'synthetic.profile.completed.user';
  conceptUuid: string;
  testUuid: string;
  accountUuid: string;
  baseProfileUuid?: string;
  profileName: string;
  interviewType: 'original' | 'variation';
  completedCount: number;
  totalCount: number;
}

// ==========================================
// Concept Video Generation Messages
// ==========================================

export interface IConceptVideoGenerationStartedMessage extends BaseSocketEvent {
  type: 'concept.video.generation.started.user';
  conceptUuid: string;
  accountUuid: string;
  message: string;
}

export interface IConceptVideoGenerationProgressMessage
  extends BaseSocketEvent {
  type: 'concept.video.generation.progress.user';
  conceptUuid: string;
  accountUuid: string;
  stage: string;
  message: string;
  progress: number;
}

export interface IConceptVideoGenerationCompletedMessage
  extends BaseSocketEvent {
  type: 'concept.video.generation.completed.user';
  conceptUuid: string;
  accountUuid: string;
  videoUrl: string;
  message: string;
}

export interface IConceptVideoGenerationErrorMessage extends BaseSocketEvent {
  type: 'concept.video.generation.error.user';
  conceptUuid: string;
  accountUuid: string;
  errorMessage: string;
  details?: any;
}

// ==========================================
// Nucleus Upload Event Messages
// ==========================================

export interface INucleusUploadProgressMessage extends BaseSocketEvent {
  type: 'nucleus_upload.progress.account';
  accountUuid: string;
  nucleusReportUuid: string;
  stage: 'uploading' | 'validating' | 'processing' | 'completed';
  message: string;
  progress?: number;
  filesProcessed?: number;
  totalFiles?: number;
}

export interface INucleusUploadCompletedMessage extends BaseSocketEvent {
  type: 'nucleus_upload.completed.account';
  accountUuid: string;
  nucleusReportUuid: string;
  uploadedCount: number;
  sourceUuids: string[];
  totalFileSize: number;
}

export interface INucleusUploadErrorMessage extends BaseSocketEvent {
  type: 'nucleus_upload.error.account';
  accountUuid: string;
  nucleusReportUuid?: string;
  message: string;
  errorCode?: string;
  details?: any;
}

// Nucleus Answer Generation Event Messages
export interface INucleusAnswerProgressMessage extends BaseSocketEvent {
  type: 'nucleus_answer.progress.account';
  accountUuid: string;
  nucleusReportUuid: string;
  questionUuid: string;
  stage: 'started' | 'researching' | 'extracting' | 'generating' | 'completed';
  message: string;
  progress?: number;
}

export interface INucleusAnswerCompletedMessage extends BaseSocketEvent {
  type: 'nucleus_answer.completed.account';
  accountUuid: string;
  nucleusReportUuid: string;
  questionUuid: string;
  answerUuid: string;
  sourceCount: number;
  isAiReasoning: boolean;
  confidenceLevel: string;
  sectionType: string;
  answerText: string;
}

export interface INucleusAnswerErrorMessage extends BaseSocketEvent {
  type: 'nucleus_answer.error.account';
  accountUuid: string;
  nucleusReportUuid: string;
  questionUuid: string;
  message: string;
  errorCode?: string;
  details?: any;
}

export interface INucleusReportProgressMessage extends BaseSocketEvent {
  type: 'nucleus_report.progress.account';
  accountUuid: string;
  nucleusReportUuid: string;
  overallProgressPercent: number;
  totalSections: number;
  sectionsPhase1Complete: number;
  sectionsPhase2Complete: number;
  sectionsPhase3Complete: number;
  totalQuestions: number;
  totalQuestionsWithAnswers: number;
  totalQuestionsValidated: number;
  sections: Record<
    string,
    {
      totalQuestions: number;
      questionsWithAnswers: number;
      questionsValidated: number;
      progressPercent: number;
      currentPhase: string;
      phase1Complete: boolean;
      phase2Complete: boolean;
      phase3Complete: boolean;
      estimatedTotalSeconds: number;
    }
  >;
  estimatedTotalSeconds?: number;
  startTime?: number;
  headquartersVideoUrl?: string;
  emailWhenReadyEnabled?: boolean;
  recentAnswers?: Array<{
    questionUuid: string;
    answerText: string;
    sectionType: string;
  }>;
}

// Magic Share Event Messages
export interface IMagicShareProgressMessage extends BaseSocketEvent {
  type: 'magic_share.progress.account';
  accountUuid: string;
  conceptUuid: string;
  stage:
    | 'started'
    | 'gathering_data'
    | 'generating_html'
    | 'generating_pdf'
    | 'generating_video'
    | 'generating_slides'
    | 'uploading'
    | 'completed';
  message: string;
  progress?: number;
}

export interface IMagicShareCompletedMessage extends BaseSocketEvent {
  type: 'magic_share.completed.account';
  accountUuid: string;
  conceptUuid: string;
  snapshotUrl: string;
  magicShareUuid: string;
  fileUrl?: string;
}

export interface IMagicShareErrorMessage extends BaseSocketEvent {
  type: 'magic_share.error.account';
  accountUuid: string;
  conceptUuid: string;
  message: string;
  errorCode?: string;
  details?: any;
}

// ==========================================
// POC Plan Generation Messages
// ==========================================

export interface IPocPlanGenerationProgressMessage extends BaseSocketEvent {
  type: 'poc_plan.generation.progress.account';
  account_uuid: string;
  concept_uuid: string;
  concept_identifier: string;
  poc_plan_uuid: string;
  stage: string;
  progress: number;
  message: string;
  status: string;
  error_details?: string;
}

export interface IPocPlanGenerationCompleteMessage extends BaseSocketEvent {
  type: 'poc_plan.generation.complete.account';
  account_uuid: string;
  concept_uuid: string;
  concept_identifier: string;
  poc_plan_uuid: string;
  status: 'complete';
  message: string;
}

export interface IPocPlanGenerationErrorMessage extends BaseSocketEvent {
  type: 'poc_plan.generation.error.account';
  account_uuid: string;
  concept_uuid: string;
  concept_identifier: string;
  poc_plan_uuid: string;
  status: 'failed';
  error_message: string;
  error_code?: string;
}

// ==========================================
// Idea Submissions Event Messages
// ==========================================

export interface IIdeaSubmissionsProcessingStartedMessage
  extends BaseSocketEvent {
  type: 'idea_submissions.processing.started.user';
  accountUuid: string;
  taskId: string;
  submissionCount: number;
}

export interface IIdeaSubmissionsProcessingCompletedMessage
  extends BaseSocketEvent {
  type: 'idea_submissions.processing.completed.user';
  accountUuid: string;
  taskId: string;
  totalIdeasProcessed: number;
  uniqueIdeasCount: number;
  themesCount: number;
  topRecommendationsCount: number;
  executiveSummary: string;
}

export interface IIdeaSubmissionsProcessingErrorMessage
  extends BaseSocketEvent {
  type: 'idea_submissions.processing.error.user';
  accountUuid: string;
  taskId: string;
  errorMessage: string;
  details?: string;
}

// ==========================================
// Idea Submissions Upload Event Messages
// ==========================================

export interface IIdeaSubmissionsUploadStartedMessage extends BaseSocketEvent {
  type: 'idea_submissions.upload.started.user';
  accountUuid: string;
  submissionLinkUuid: string;
  sourceFileUuid: string;
  taskId: string;
  filename: string;
  fileType: string;
}

export interface IIdeaSubmissionsUploadProgressMessage extends BaseSocketEvent {
  type: 'idea_submissions.upload.progress.user';
  accountUuid: string;
  submissionLinkUuid: string;
  sourceFileUuid: string;
  taskId: string;
  stage: string;
  message: string;
  progress: number; // 0-100
}

export interface IIdeaSubmissionsUploadCompletedMessage
  extends BaseSocketEvent {
  type: 'idea_submissions.upload.completed.user';
  accountUuid: string;
  submissionLinkUuid: string;
  sourceFileUuid: string;
  taskId: string;
  ideasExtracted: number;
  fileType: string; // 'tabular' or 'document'
}

export interface IIdeaSubmissionsUploadErrorMessage extends BaseSocketEvent {
  type: 'idea_submissions.upload.error.user';
  accountUuid: string;
  submissionLinkUuid: string;
  sourceFileUuid: string;
  taskId: string;
  errorMessage: string;
  details?: string;
}

// ==========================================
// Idea Playground Event Messages
// ==========================================

export interface IIdeaPlaygroundInsightEnhancedMessage extends BaseSocketEvent {
  type: 'idea_playground.insight.enhanced.user';
  seedUuid: string;
  questionUuid: string;
  insightUuid: string;
  accountUuid: string;
  moreDetails: string;
  goodNews: string;
  badNews: string;
}

export interface IIdeaPlaygroundInsightValidationFailedMessage
  extends BaseSocketEvent {
  type: 'idea_playground.insight.validation_failed.user';
  seedUuid: string;
  questionUuid: string;
  insightUuid: string;
  accountUuid: string;
  errorMessage: string;
}

export interface IIdeaPlaygroundQuestionsGeneratedMessage
  extends BaseSocketEvent {
  type: 'idea_playground.questions.generated.user';
  seedUuid: string;
  accountUuid: string;
  questionCount: number;
}

export interface IIdeaPlaygroundConceptsGeneratedMessage
  extends BaseSocketEvent {
  type: 'idea_playground.concepts.generated.user';
  seedUuid: string;
  accountUuid: string;
  conceptCount: number;
  coreCount: number;
  adjacentCount: number;
  disruptiveCount: number;
}

export interface IIdeaPlaygroundMoreConceptsGeneratedMessage
  extends BaseSocketEvent {
  type: 'idea_playground.more_concepts.generated.user';
  seedUuid: string;
  accountUuid: string;
  newConceptCount: number;
  totalConceptCount: number;
}

export interface IIdeaPlaygroundErrorMessage extends BaseSocketEvent {
  type: 'idea_playground.error.user';
  seedUuid: string;
  accountUuid: string;
  operation: string;
  errorMessage: string;
  details?: Record<string, any>;
}

export interface IIdeaPlaygroundPossibleAnswerProcessingMessage
  extends BaseSocketEvent {
  type: 'idea_playground.possible_answer.processing.user';
  seedUuid: string;
  questionUuid: string;
  accountUuid: string;
}

export interface IIdeaPlaygroundPossibleAnswerGeneratedMessage
  extends BaseSocketEvent {
  type: 'idea_playground.possible_answer.generated.user';
  seedUuid: string;
  questionUuid: string;
  accountUuid: string;
}

export interface IIdeaPlaygroundResearchInsightsProcessingMessage
  extends BaseSocketEvent {
  type: 'idea_playground.research_insights.processing.user';
  seedUuid: string;
  questionUuid: string;
  accountUuid: string;
}

export interface IIdeaPlaygroundResearchInsightsGeneratedMessage
  extends BaseSocketEvent {
  type: 'idea_playground.research_insights.generated.user';
  seedUuid: string;
  questionUuid: string;
  accountUuid: string;
  insightCount: number;
}

// ==========================================
// Ecosystem Product Search Messages
// ==========================================

export interface IEcosystemProductSearchUpdateMessage extends BaseSocketEvent {
  type: 'ecosystem.product_search.update';
  conceptUuid: string;
  accountUuid: string;
  status: 'pending' | 'in_progress' | 'complete' | 'error';
  totalCompanies?: number;
  completedCompanies?: number;
  productsFound?: number;
  errorMessage?: string;
}

// ==========================================
// Watchtower Scan Messages
// ==========================================

export interface IWatchtowerScanProgressMessage extends BaseSocketEvent {
  type: 'watchtower.scan.progress.account';
  accountUuid: string;
  stage: string;
  progress: number;
  message: string;
}

export interface IWatchtowerScanCompletedMessage extends BaseSocketEvent {
  type: 'watchtower.scan.completed.account';
  accountUuid: string;
  patternsCreated: number;
  insightsCreated: number;
  predictionsCreated: number;
  trendsCreated: number;
  domainsCreated: number;
  opportunitiesCreated: number;
  message: string;
}

export interface IWatchtowerScanErrorMessage extends BaseSocketEvent {
  type: 'watchtower.scan.error.account';
  accountUuid: string;
  error: string;
  message: string;
  details?: string;
}

// ==========================================
// Competitor Assessment Scan Messages
// ==========================================

export interface ICompetitorAssessmentScanProgressMessage
  extends BaseSocketEvent {
  type: 'competitor_assessment.scan.progress.account';
  accountUuid: string;
  stage: string;
  progress: number;
  message: string;
  currentCompetitor?: string;
}

export interface ICompetitorAssessmentScanCompletedMessage
  extends BaseSocketEvent {
  type: 'competitor_assessment.scan.completed.account';
  accountUuid: string;
  competitorsAssessed: number;
  whiteSpacesFound: number;
  message: string;
}

export interface ICompetitorAssessmentScanErrorMessage extends BaseSocketEvent {
  type: 'competitor_assessment.scan.error.account';
  accountUuid: string;
  error: string;
  message: string;
  details?: string;
}

// ==========================================
// Portfolio Executive Summary Messages
// ==========================================

export interface IPortfolioExecutiveSummaryGenerationProgressMessage
  extends BaseSocketEvent {
  type: 'portfolio_executive_summary.generation.progress.account';
  accountUuid: string;
  stage: string;
  progress: number;
  message: string;
}

export interface IPortfolioExecutiveSummaryGenerationCompletedMessage
  extends BaseSocketEvent {
  type: 'portfolio_executive_summary.generation.completed.account';
  accountUuid: string;
  summaryUuid: string;
  conceptCount: number;
  message: string;
}

export interface IPortfolioExecutiveSummaryGenerationErrorMessage
  extends BaseSocketEvent {
  type: 'portfolio_executive_summary.generation.error.account';
  accountUuid: string;
  error: string;
  message: string;
  details?: string;
}

// ==========================================
// Portfolio Insights Messages
// ==========================================

export interface IPortfolioInsightsGeneratedMessage extends BaseSocketEvent {
  type: 'portfolio.insights.generated.user';
  accountUuid: string;
  insightCount: number;
  insightUuids: string[];
}

export interface IPortfolioInsightsErrorMessage extends BaseSocketEvent {
  type: 'portfolio.insights.error.user';
  accountUuid: string;
  errorMessage: string;
}

// ==========================================
// Concept Priority Messages
// ==========================================

export interface IConceptPriorityCompletedMessage extends BaseSocketEvent {
  type: 'concept.priority.completed.user';
  conceptUuid: string;
  accountUuid: string;
  overallPriorityScore: number;
  strategicAlignmentScore: number;
  financialOpportunityScore: number;
  innovationRiskScore: number;
  message: string;
}

export interface IConceptPriorityErrorMessage extends BaseSocketEvent {
  type: 'concept.priority.error.user';
  conceptUuid: string;
  accountUuid: string;
  error: string;
  message: string;
  details?: string;
}

export interface IBulkPriorityProgressMessage extends BaseSocketEvent {
  type: 'concept.priority.bulk.progress.user';
  accountUuid: string;
  current: number;
  total: number;
  successCount: number;
  errorCount: number;
  currentConceptTitle: string;
}

export interface IBulkPriorityCompletedMessage extends BaseSocketEvent {
  type: 'concept.priority.bulk.completed.user';
  accountUuid: string;
  totalCount: number;
  successCount: number;
  errorCount: number;
  message: string;
}

export interface ITopPrioritySummary {
  title: string;
  overallScore: number;
  keyStrength: string;
}

export type InnovationHorizon = 'core' | 'adjacent' | 'disruptive';

export interface IHorizonBreakdown {
  coreCount: number;
  adjacentCount: number;
  disruptiveCount: number;
  corePercentage: number;
  adjacentPercentage: number;
  disruptivePercentage: number;
}

export interface IPortfolioSummaryMessage extends BaseSocketEvent {
  type: 'concept.priority.portfolio_summary.user';
  accountUuid: string;
  totalAnalyzed: number;
  highPriorityCount: number;
  averageScore: number;
  executiveInsight: string;
  keyRecommendation: string;
  portfolioHealth: 'strong' | 'balanced' | 'needs_attention';
  topPriorities: ITopPrioritySummary[];
  horizonBreakdown: IHorizonBreakdown;
}

export type InboundSocketEvent<C = {}> =
  | ErrorEvent
  | ChatStreamEvent<C>
  | AISuggestionsStreamEvent
  | ConceptGenerationStreamEvent
  | IHandshakeMessage
  | IInboundChatMessage
  | IAiEditingHandshakeMessage
  | IAiEditingInboundChatMessage
  | IAiEditingTypingMessage
  | IAiEditingErrorMessage
  | IAiEditingSuggestionsEvent
  | ICustomerProfileHandshakeMessage
  | ICustomerProfileInboundChatMessage
  | ICustomerProfileInboundTypingMessage
  | ICustomerProfileInboundErrorEvent
  | IAiEditingSuggestionsStreamEvent
  | AiEditingChatStreamEvent
  | CustomerProfileStreamEvent
  | IAIEditingStartedMessage
  | ITestResultHandshakeMessage
  | ITestResultProcessingMessage
  | ITestResultCompletedMessage
  | ITestResultErrorMessage
  | ITestCollateralProgressMessage
  | ITestCollateralCompletedMessage
  | ITestCollateralErrorMessage
  | IConceptWorkflowMessage
  | ITestCollateralUpdateProgressMessage
  | ITestCollateralUpdateCompletedMessage
  | ITestCollateralUpdateErrorMessage
  | ITestGenerationStartedMessage
  | ITestGenerationProgressMessage
  | ITestGenerationCompletedMessage
  | ITestGenerationErrorMessage
  | IConceptWorkflowMessage
  | ISyntheticExecutionProgressMessage
  | ISyntheticExecutionCompletedMessage
  | ISyntheticExecutionErrorMessage
  | ISyntheticInterviewQuoteMessage
  | ISyntheticProfileCompletedMessage
  | IConceptVideoGenerationStartedMessage
  | IConceptVideoGenerationProgressMessage
  | IConceptVideoGenerationCompletedMessage
  | IConceptVideoGenerationErrorMessage
  | INucleusUploadProgressMessage
  | INucleusUploadCompletedMessage
  | INucleusUploadErrorMessage
  | INucleusAnswerProgressMessage
  | INucleusAnswerCompletedMessage
  | INucleusAnswerErrorMessage
  | INucleusReportProgressMessage
  | IMagicShareProgressMessage
  | IMagicShareCompletedMessage
  | IMagicShareErrorMessage
  | IIdeaPlaygroundInsightEnhancedMessage
  | IIdeaPlaygroundInsightValidationFailedMessage
  | IIdeaPlaygroundQuestionsGeneratedMessage
  | IIdeaPlaygroundConceptsGeneratedMessage
  | IIdeaPlaygroundMoreConceptsGeneratedMessage
  | IIdeaPlaygroundErrorMessage
  | IIdeaPlaygroundPossibleAnswerProcessingMessage
  | IIdeaPlaygroundPossibleAnswerGeneratedMessage
  | IIdeaPlaygroundResearchInsightsProcessingMessage
  | IIdeaPlaygroundResearchInsightsGeneratedMessage
  | IPocPlanGenerationProgressMessage
  | IPocPlanGenerationCompleteMessage
  | IPocPlanGenerationErrorMessage
  | IPortfolioExecutiveSummaryGenerationProgressMessage
  | IPortfolioExecutiveSummaryGenerationCompletedMessage
  | IPortfolioExecutiveSummaryGenerationErrorMessage
  | IPortfolioInsightsGeneratedMessage
  | IPortfolioInsightsErrorMessage
  | IConceptPriorityCompletedMessage
  | IConceptPriorityErrorMessage
  | IBulkPriorityProgressMessage
  | IBulkPriorityCompletedMessage
  | IPortfolioSummaryMessage
  | IIdeaSubmissionsProcessingStartedMessage
  | IIdeaSubmissionsProcessingCompletedMessage
  | IIdeaSubmissionsProcessingErrorMessage
  | IEcosystemProductSearchUpdateMessage
  | IWatchtowerScanProgressMessage
  | IWatchtowerScanCompletedMessage
  | IWatchtowerScanErrorMessage
  | ICompetitorAssessmentScanProgressMessage
  | ICompetitorAssessmentScanCompletedMessage
  | ICompetitorAssessmentScanErrorMessage
  | IIdeaSubmissionsUploadStartedMessage
  | IIdeaSubmissionsUploadProgressMessage
  | IIdeaSubmissionsUploadCompletedMessage
  | IIdeaSubmissionsUploadErrorMessage
  | IOverseerHandshakeMessage
  | IOverseerChatMessage
  | IOverseerChatStreamMessage
  | IOverseerTypingMessage
  | IOverseerSuggestedQuestionsMessage
  | IOverseerErrorMessage
  | IOverseerToolActivityMessage
  | IOverseerEditSuggestionMessage;

export type InboundSocketEventType = InboundSocketEvent['type'];
