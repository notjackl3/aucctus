import { Lens, lens } from '@dhmk/zustand-lens';
import {
  IBaseMessage,
  IInboundChatMessage,
  IMediaMessage,
} from '@libs/api/types';
import type { IAppStore } from '../store';
import {
  ICustomerProfileConversationActions,
  addAssistantMessage,
  agentIsThinking,
  clearConversation,
  handleMessage,
  performHandshake,
  sendMessage,
  setConversation,
  setCurrentMessage,
  setCustomerProfileUuid,
} from './actions';

// This is just a placeholder for now...
export interface IUserMessage extends Omit<IBaseMessage, 'role'> {
  role: 'user';
  media?: IMediaMessage;
}

export interface IAssistantMessage
  extends Omit<IInboundChatMessage, 'role' | 'type' | 'content' | 'sessionId'> {
  role: 'assistant';
  content: string;
}

export type CustomerProfileMessage = IUserMessage | IAssistantMessage;

export interface ICustomerProfileConversation {
  uuid: string;
  summary?: string;
  createdAt: string;
  messages?: CustomerProfileMessage[];
}

export interface ICustomerProfileConversationState
  extends ICustomerProfileConversationActions {
  sessionId?: string;
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
    setConversation: setConversation.bind(actionContext),
    clearConversation: clearConversation.bind(actionContext),
    addAssistantMessage: addAssistantMessage.bind(actionContext),
    agentIsThinking: agentIsThinking.bind(actionContext),
  };
};

export default lens<ICustomerProfileConversationState, IAppStore>(
  customerProfileConversationSlice,
);
