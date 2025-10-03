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
}

// ==========================================
// Synthetic Execution Messages
// ==========================================

export interface ISyntheticExecutionProgressMessage extends BaseSocketEvent {
  type: 'synthetic.execution.progress.user';
  conceptUuid: string;
  testUuid: string;
  accountUuid: string;
  stage: string;
  message: string;
  progress: number;
  currentPersona?: string;
  totalPersonas?: number;
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
  | IConceptWorkflowMessage
  | ISyntheticExecutionProgressMessage
  | ISyntheticExecutionCompletedMessage
  | ISyntheticExecutionErrorMessage
  | IConceptVideoGenerationStartedMessage
  | IConceptVideoGenerationProgressMessage
  | IConceptVideoGenerationCompletedMessage
  | IConceptVideoGenerationErrorMessage
  | INucleusUploadProgressMessage
  | INucleusUploadCompletedMessage
  | INucleusUploadErrorMessage;

export type InboundSocketEventType = InboundSocketEvent['type'];
