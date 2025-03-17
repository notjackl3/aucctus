interface BaseSocketEvent {}

interface IncubationAiSuggestionsRequestEvent extends BaseSocketEvent {
  type: 'incubation.ai.suggestions.request';
  seed_uuid: string;
  identifier: string; // The question Identifier(And Strict Typing to this)
  answer?: string[];
}

interface ErrorEvent extends BaseSocketEvent {
  type: 'error';
  error: string;
  details: string | object | number | boolean;
}

interface NotificationEvent extends BaseSocketEvent {
  type: 'notification.user' | 'notification.account';
  title: string;
  body: string;
}

interface ChatMessageEvent extends BaseSocketEvent {
  type: 'chat.message.user';
  message: string;
  sender: string;
}

/**
 * Base interface for all stream events.
 * Stream events represent data that is sent incrementally over time.
 */
interface IBaseStreamEvent<C extends object> extends BaseSocketEvent {
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
interface IStreamDeltaEvent<T, C> extends IBaseStreamEvent<C> {
  stage: 'delta';
  content: Partial<T>;
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
interface IStreamDoneEvent<T, C> extends IBaseStreamEvent<C> {
  stage: 'done';
  content: T;
}

/**
 * Stream Error Event
 *
 * Indicates that an error occurred during streaming.
 * This terminates the stream and signals that no more data will be sent.
 */
interface IStreamErrorEvent<C> extends IBaseStreamEvent<C> {
  stage: 'error';
  content: null;
}

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
interface ChatStreamEvent<C = {}>
  extends IStreamDeltaEvent<string, C>,
    IStreamDoneEvent<string, C>,
    IStreamErrorEvent<C> {
  type: 'stream.chat';
}

interface AISuggestionsStreamEvent
  extends IStreamDeltaEvent<IAISuggestionList, IAISuggestionsContext>,
    IStreamDoneEvent<IAISuggestionList, IAISuggestionsContext>,
    IStreamErrorEvent<IAISuggestionsContext> {
  type: 'stream.structured.ai.suggestions';
}

interface ConceptGenerationStreamEvent
  extends IStreamDeltaEvent<IConceptList, IConceptGenerationContext>,
    IStreamDoneEvent<IConceptList, IConceptGenerationContext>,
    IStreamErrorEvent<IConceptGenerationContext> {
  type: 'stream.structured.concept.generation';
}

interface IncubationAiSuggestionsRequestEvent extends BaseSocketEvent {
  type: 'incubation.ai.suggestions.request';
  seed_uuid: string;
  identifier: string; // The question Identifier(And Strict Typing to this)
  answer?: string[];
}

type SocketEvent<C = {}> =
  | ErrorEvent
  | NotificationEvent
  | ChatMessageEvent
  | ChatStreamEvent<C>
  | IncubationAiSuggestionsRequestEvent
  | AISuggestionsStreamEvent
  | ConceptGenerationStreamEvent;

type SocketEventType = SocketEvent['type'];
