import { IAiEditingContext, IConceptReportEdit } from '../ai-editing';
import { IBaseMessage } from '../chat';
import {
  IConceptGenerationContext,
  IGeneratedConceptList,
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
  stage: 'extracting_text' | 'analyzing_content' | 'generating_insights';
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
  type: 'customer.profile.chat.error';
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
  | ITestResultErrorMessage;

export type InboundSocketEventType = InboundSocketEvent['type'];
