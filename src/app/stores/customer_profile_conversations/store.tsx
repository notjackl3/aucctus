import { Lens, lens } from '@dhmk/zustand-lens';
import { IInboundChatMessage, IMediaMessage } from '@libs/api/types';
import type { IAppStore } from '../store';
import {
  ICustomerProfileConversationActions,
  addAssistantMessage,
  agentIsThinking,
  clearConversation,
  handleMessage,
  performHandshake,
  sendMessage,
  setCurrentMessage,
  setCustomerProfileUuid,
} from './actions';

// This is just a placeholder for now...
export interface IUserMessage {
  uuid: string;
  content: string;
  role: 'user';
  media?: IMediaMessage;
}

export interface IAssistantMessage
  extends Omit<IInboundChatMessage, 'role' | 'type' | 'content' | 'sessionId'> {
  role: 'assistant';
  content: string;
}

export type EditMessage = IUserMessage | IAssistantMessage;

export type CustomerProfileMessage = IUserMessage | IAssistantMessage;

export interface ICustomerProfileConversationState
  extends ICustomerProfileConversationActions {
  sessionId?: string;
  conversationUuid?: string;
  customerProfileUuid?: string;
  messages: CustomerProfileMessage[];
  currentMessage?: string;

  currentMediaUpload?: File;

  isAucctusTyping: boolean;
  thinkingMessage?: string;
}

const customerProfileConversationSlice: Lens<
  ICustomerProfileConversationState,
  IAppStore
> = (set, get, storeApi) => {
  const actionContext = { set, get, storeApi };

  return {
    sessionId: undefined,
    conversationUuid: undefined,
    customerProfileUuid: undefined,
    messages: [],
    currentMessage: undefined,
    isAucctusTyping: false,
    // User input is locked both when the agent is typing and when the streams are incoming
    // This is to prevent the user from sending multiple messages at once.
    userInputLocked: false,
    sendMessage: sendMessage.bind(actionContext),
    setCurrentMessage: setCurrentMessage.bind(actionContext),
    setCustomerProfileUuid: setCustomerProfileUuid.bind(actionContext),
    handleMessage: handleMessage.bind(actionContext),
    performHandshake: performHandshake.bind(actionContext),
    clearConversation: clearConversation.bind(actionContext),
    addAssistantMessage: addAssistantMessage.bind(actionContext),
    agentIsThinking: agentIsThinking.bind(actionContext),
  };
};

export default lens<ICustomerProfileConversationState, IAppStore>(
  customerProfileConversationSlice,
);
