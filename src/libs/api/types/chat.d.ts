export interface IConversationFilterOptions {
  message: string;
}

export interface IBaseMessage {
  uuid: string;
  // This could be a a string or an object. for now, we'll just use a string.
  content: string;
  role: 'user' | 'assistant';
  createdAt: string;
}

interface IConversationMetadata {
  [key: string]: unknown;
}

export interface IConversation<T = IConversationMetadata> {
  uuid: string;
  summary?: string;
  // The last message in the conversation or the message the best matches the search query
  message: IMessage;
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
