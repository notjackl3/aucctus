export interface IOverseerConversation {
  uuid: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
  pageContext: string | null;
  contextType: string | null;
}

export interface IOverseerConversationMessage {
  uuid: string;
  role: 'user' | 'assistant';
  name: string;
  content: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface IOverseerConversationDetail {
  uuid: string;
  name: string | null;
  createdAt: string;
  pageContext: string | null;
  contextType: string | null;
  selectedText: string | null;
  expandedText: string | null;
  conceptUuid: string | null;
  accountUuid: string | null;
  messages: IOverseerConversationMessage[];
}
