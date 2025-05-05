import { IPageQueryOptions, IPageResponse } from './osiris';
export interface IConversationFilterOptions extends IPageQueryOptions {
  message: string;
}

export interface IBaseMessage {
  uuid: string;
  // This could be a a string or an object. for now, we'll just use a string.
  content: string;
  role: 'user' | 'assistant';
  name?: string;
  timestamp: string;
  createdAt: string;
}

// This is a message that is derived from the conversation as an snippet or the first message. Do not use anywhere else.
export interface IAggregatedMessage extends IBaseMessage {
  messageSnippet?: string;
}
interface IConversationMetadata {
  [key: string]: unknown;
}

export interface IConversation<T = IConversationMetadata> {
  uuid: string;
  summary?: string;
  // The last message in the conversation or the message the best matches the search query
  message: IAggregatedMessage;
  matchingMessageCount?: number;
  metadata: T;
  createdAt: string;
  updatedAt: string;
}

export interface ICustomerProfileMetadata {
  customerProfileUuid: string;
  conceptUuid: string;
}

export interface ICustomerProfileConversation
  extends IConversation<ICustomerProfileMetadata> {}

export interface ICustomerProfileConversationPage
  extends IPageResponse<ICustomerProfileConversation> {}

export interface IUserMessage extends IBaseMessage {
  role: 'user';
}

export interface IAssistantMessage extends IBaseMessage {
  role: 'assistant';
}

export type ChatMessage = IUserMessage | IAssistantMessage;

export interface IConversationMessagePage extends IPageResponse<ChatMessage> {}
