import { Mimetype } from '../osiris';
import { BaseSocketEvent } from './base';

export interface IncubationAiSuggestionsRequestEvent extends BaseSocketEvent {
  type: 'incubation.ai.suggestions.request';
  seedUuid: string;
  questionId: int;
  answer?: string[];
  conceptUuid?: string;
}

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

// These are base interface and to be extended by the other interfaces
// They define the common structure of the chat messaging system with Aucctus
interface OutboundChatMessage extends ITextMessage, BaseSocketEvent {
  type: 'chat.message';
  // The conversation uuid
  session_id: string;
  content: string;
  media?: IMediaMessage;
}

interface OutboundChatMediaMessage extends IMediaMessage, BaseSocketEvent {
  type: 'chat.media.message';
  session_id: string;
  filename: string;
  // Additional Message
  content?: string;
}

interface IUserTypingMessage extends BaseSocketEvent {
  type: 'chat.user.typing';
  session_id: string;
  value: boolean;
}

interface BaseAiEditingMessage extends BaseSocketEvent {
  conceptUuid: string;
}

export interface IAiEditingConversationStartMessage
  extends BaseAiEditingMessage,
    IConversationStartMessage {
  type: 'ai.editing.conversation.start';
  uuid?: string; // Optional uuid value that can be sent to create the message with using the same uuid
}

export interface IAiEditingOutboundChatMessage
  extends BaseAiEditingMessage,
    OutboundChatMessage {
  type: 'ai.editing.message';
}

export interface IAiEditingOutboundChatMediaMessage
  extends BaseAiEditingMessage,
    OutboundChatMediaMessage {
  type: 'ai.editing.conversation.media.message';
}

export interface IAiEditingOutboundTypingMessage
  extends BaseAiEditingMessage,
    IUserTypingMessage {
  type: 'ai.editing.user.typing';
}

export type OutboundSocketEvent =
  | IncubationAiSuggestionsRequestEvent
  | IAiEditingConversationStartMessage
  | IAiEditingOutboundChatMessage
  | IAiEditingOutboundChatMediaMessage
  | IAiEditingOutboundTypingMessage;

export type OutboundSocketEventType = OutboundSocketEvent['type'];
