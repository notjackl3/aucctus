import { Mimetype } from '../osiris';
import { BaseSocketEvent } from './base';

// ----------------
// Base Interfaces
// ----------------

/**
 * Base interface for text messages
 */
export interface ITextMessage {
  uuid?: string; // Optional uuid value that can be sent to create the message with using the same uuid
  content?: string;
}

/**
 * Base interface for media messages
 */
export interface IMediaMessage {
  // The actual media data(e.g., base64 encoded or a URL)
  mediaData: string;
  // The MIME type of the media
  mimetype: Mimetype;
  // The filename of the media
  filename?: string;
  // The caption of the media
  caption?: string;
}

interface IConversationStartMessage extends ITextMessage, BaseSocketEvent {
  type: 'conversation.start';
  // Optionally include media data during the handshake.
  media?: IMediaMessage;
}

// ----------------
// Chat Messages
// ----------------

/**
 * Base interface for outbound chat text messages
 */
interface OutboundChatMessage extends ITextMessage, BaseSocketEvent {
  type: 'chat.message';
  // The conversation uuid
  session_id: string;
  content: string;
  media?: IMediaMessage;
}

/**
 * Base interface for outbound chat media messages
 */
interface OutboundChatMediaMessage extends IMediaMessage, BaseSocketEvent {
  type: 'chat.media.message';
  session_id: string;
  filename: string;
  // Additional Message
  content?: string;
}

/**
 * Interface for user typing indicators
 */
interface IUserTypingMessage extends BaseSocketEvent {
  type: 'chat.user.typing';
  session_id: string;
  value: boolean;
}

// ----------------
// AI Editing Messages
// ----------------

/**
 * Base interface for AI editing messages
 */
interface BaseAiEditingMessage extends BaseSocketEvent {
  conceptUuid: string;
}

/**
 * Interface for starting an AI editing conversation
 */
export interface IAiEditingConversationStartMessage
  extends BaseAiEditingMessage,
    IConversationStartMessage {
  type: 'ai.editing.conversation.start';
  uuid?: string; // Optional uuid value that can be sent to create the message with using the same uuid
  content: string;
}

/**
 * Interface for AI editing chat messages
 */
export interface IAiEditingOutboundChatMessage
  extends BaseAiEditingMessage,
    OutboundChatMessage {
  type: 'ai.editing.message';
}

/**
 * Interface for AI editing file messages
 */
export interface IAiEditingOutboundFileMessage
  extends BaseAiEditingMessage,
    OutboundChatMediaMessage {
  type: 'ai.editing.file.message';
}

/**
 * Interface for AI cancelling ai edit tasks
 */
export interface IAiEditingOutboundCancelMessage
  extends BaseAiEditingMessage,
    BaseSocketEvent {
  type: 'ai.editing.cancel';
}

/**
 * Interface for AI editing typing indicators
 */
export interface IAiEditingOutboundTypingMessage
  extends BaseAiEditingMessage,
    IUserTypingMessage {
  type: 'ai.editing.user.typing';
}

// ----------------
// Customer Profile Messages
// ----------------

/**
 * Base interface for customer profile conversation messages
 */
interface BaseCustomerProfileConversationMessage
  extends ITextMessage,
    BaseSocketEvent {
  customerProfileUuid: string;
  conceptUuid: string;
}

/**
 * Interface for starting a customer profile conversation
 */
export interface ICustomerProfileOutboundConversationStartMessage
  extends BaseCustomerProfileConversationMessage,
    IConversationStartMessage {
  type: 'customer.profile.conversation.start';
  uuid?: string; // Optional uuid value that can be sent to create the message with using the same uuid
  content: string;
}

/**
 * Interface for customer profile chat messages
 */
export interface ICustomerProfileOutboundChatMessage
  extends BaseCustomerProfileConversationMessage,
    OutboundChatMessage {
  type: 'customer.profile.message';
}

/**
 * Interface for customer profile file messages
 */
export interface ICustomerProfileOutboundFileMessage
  extends BaseCustomerProfileConversationMessage,
    OutboundChatMediaMessage {
  type: 'customer.profile.file.message';
}

/**
 * Interface for customer profile typing indicators
 */
export interface ICustomerProfileOutboundTypingMessage
  extends BaseCustomerProfileConversationMessage,
    IUserTypingMessage {
  type: 'customer.profile.user.typing';
}

// ----------------
// Overseer Messages
// ----------------

/**
 * Base interface for Overseer messages
 * Supports two modes:
 * 1. Concept mode: conceptUuid is required, accountUuid is optional
 * 2. Account mode: accountUuid is required, conceptUuid is optional
 */
interface BaseOverseerMessage extends BaseSocketEvent {
  conceptUuid?: string;
  accountUuid?: string;
  pageContext: string;
  mentions?: Array<{ uuid: string; name: string; type: 'concept' | 'persona' }>;
}

/**
 * Interface for starting an Overseer conversation
 */
export interface IOverseerConversationStartMessage extends BaseOverseerMessage {
  type: 'overseer.conversation.start';
  uuid?: string;
  selectedText: string;
  expandedText: string;
  content: string;
  images?: IMediaMessage[];
}

/**
 * Interface for Overseer follow-up messages
 */
export interface IOverseerOutboundChatMessage extends BaseOverseerMessage {
  type: 'overseer.message';
  uuid?: string;
  sessionId: string;
  content: string;
  images?: IMediaMessage[];
  selectedText?: string;
}

/**
 * Interface for cancelling Overseer tasks
 */
export interface IOverseerOutboundCancelMessage extends BaseOverseerMessage {
  type: 'overseer.cancel';
}

// ----------------
// Incubation Messages
// ----------------

/**
 * Interface for requesting AI suggestions during incubation
 */
export interface IncubationAiSuggestionsRequestEvent extends BaseSocketEvent {
  type: 'incubation.ai.suggestions.request';
  seedUuid: string;
  questionId: number; // Changed from 'int' to 'number' for TypeScript compatibility
  answer?: string[];
  conceptUuid?: string;
}

// ----------------
// Persona Chat Messages
// ----------------

/**
 * Structured mention data sent with persona chat messages
 */
export interface IOutboundMention {
  uuid: string;
  type: 'concept' | 'persona';
  name: string;
}

/**
 * Base interface for persona chat messages
 */
interface BasePersonaChatMessage extends ITextMessage, BaseSocketEvent {
  personaUuid: string;
  mentions?: IOutboundMention[];
  conceptUuid?: string;
}

/**
 * Interface for starting a persona chat conversation
 */
export interface IPersonaChatOutboundConversationStartMessage
  extends BasePersonaChatMessage,
    IConversationStartMessage {
  type: 'persona.chat.conversation.start';
  content: string;
}

/**
 * Interface for persona chat messages
 */
export interface IPersonaChatOutboundMessage
  extends BasePersonaChatMessage,
    OutboundChatMessage {
  type: 'persona.chat.message';
  personaUuid: string;
}

// ----------------
// Export Types
// ----------------

/**
 * Union type of all outbound socket events
 */
export type OutboundSocketEvent =
  | IncubationAiSuggestionsRequestEvent
  | IAiEditingConversationStartMessage
  | IAiEditingOutboundChatMessage
  | IAiEditingOutboundFileMessage
  | IAiEditingOutboundCancelMessage
  | IAiEditingOutboundTypingMessage
  | ICustomerProfileOutboundConversationStartMessage
  | ICustomerProfileOutboundChatMessage
  | ICustomerProfileOutboundFileMessage
  | ICustomerProfileOutboundTypingMessage
  | IOverseerConversationStartMessage
  | IOverseerOutboundChatMessage
  | IOverseerOutboundCancelMessage
  | IPersonaChatOutboundConversationStartMessage
  | IPersonaChatOutboundMessage
  | OutboundChatMessage
  | OutboundChatMediaMessage
  | IUserTypingMessage;

/**
 * Type representing all possible outbound event types
 */
export type OutboundSocketEventType = OutboundSocketEvent['type'];
