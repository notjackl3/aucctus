import { IConceptReportEdit } from '../ai-editing';
import {
  IConceptGenerationContext,
  IGeneratedConceptList,
} from '../concept/concepts';
import {
  IAISuggestionList,
  IAISuggestionsContext,
} from '../incubation/aiSuggestions';
import { BaseSocketEvent } from './base';

export interface ErrorEvent extends BaseSocketEvent {
  type: 'error';
  error: string;
  details: string | object | number | boolean;
}

interface IBaseInboundChatMessage {
  sessionId: string;
}

// The handshake simply responds back with the created session id after the user has sent the first message... Probably could have been a post...
export interface IHandshakeMessage
  extends IBaseInboundChatMessage,
    BaseSocketEvent {
  type: 'ai.editing.conversation.start';
  // Add typing for initial message
}

export interface IInboundChatMessage
  extends IBaseInboundChatMessage,
    BaseSocketEvent {
  type: 'chat.message';
  uuid: string; // The uuid of the message
  content: string;
  timestamp: number | str; // The timestamp of the message
  name: string; // The name of the user who sent the message or Aucctus
  role: 'user' | 'assistant';
}

export interface IAiEditingHandshakeMessage
  extends IBaseInboundChatMessage,
    BaseSocketEvent {
  type: 'ai.editing.handshake';
  sessionId: string;
  conceptUuid: string;
}

export interface IAiEditingInboundChatMessage
  extends IInboundChatMessage,
    BaseSocketEvent {
  type: 'ai.editing.chat';
  conceptUuid: string;
}

// AI Editing Typing Message
export interface IAiEditingTypingMessage extends BaseSocketEvent {
  type: 'ai.editing.chat.typing';
  conceptUuid: string;
  value: boolean;
  content?: string;
}

// AI Editing Error Message
export interface IAiEditingErrorMessage extends BaseSocketEvent {
  type: 'ai.editing.error';
  conceptUuid: string;
  code: string; // This should match your ConsumerErrorCodes enum
  message: string;
}

export interface IAiEditingSuggestionsEvent extends BaseSocketEvent {
  type: 'ai.editing.edit.suggestion';
  uuid: string;
  name: string;
  conceptUuid: string;
  sessionId: string;
  content: IConceptReportEdit;
  timestamp?: number;
}

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
 *
 * The 'delta' stage allows for progressive rendering of content as it arrives,
 * enabling real-time updates without waiting for the complete response.
 * This is particularly useful for:
 * - Long-running operations where partial results are valuable
 * - Chat interfaces showing typing indicators or partial messages
 * - Large data sets that can be processed incrementally
 *
 * @template T The complete data type that will eventually be assembled
 *
 * Note: For 'stream.chat' type, T will be string
 * For 'stream.structured' type, T will be an object
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
 * This event indicates that all data has been transmitted and no more
 * delta events will be sent for this stream.
 *
 * @template T The complete data type that has been assembled
 *
 * Note: For 'stream.chat' type, T will be string
 * For 'stream.structured' type, T will be an object
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
 * This terminates the stream and signals that no more data will be sent.
 */
export interface IStreamErrorEvent<T extends string, C extends object>
  extends IBaseStreamEvent<T, C> {
  stage: 'error';
  content: null;
}

export type StreamEvent<T extends string, K extends string, C extends object> =
  | IStreamDeltaEvent<T, K, C>
  | IStreamDoneEvent<T, K, C>
  | IStreamErrorEvent<T, C>;

/**
 * Union type representing all possible stream events.
 *
 * Streams are split into different stages (delta, done, error) to handle
 * the lifecycle of streaming data:
 *
 * 1. Delta: Partial updates arrive incrementally, allowing for real-time processing
 * 2. Done: The stream completes successfully with final data
 * 3. Error: The stream terminates due to an error
 *
 * This pattern enables efficient handling of streaming data while maintaining
 * type safety throughout the different stages of the stream lifecycle.
 *
 * @template T The type of data being streamed

 * Type-safe helpers for stream events based on their type
 */
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
  | IAiEditingSuggestionsEvent;

export type InboundSocketEventType = InboundSocketEvent['type'];
