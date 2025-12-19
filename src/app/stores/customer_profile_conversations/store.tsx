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
  addErrorMessage,
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

export interface IErrorMessage extends Omit<IBaseMessage, 'role'> {
  role: 'error';
  content: string;
  code?: string;
}

export type CustomerProfileMessage =
  | IUserMessage
  | IAssistantMessage
  | IErrorMessage;

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

// Export initial state for use in store and reset functionality
export const initialCustomerProfileConversationState = {
  sessionId: undefined as string | undefined,
  customerProfileUuid: undefined as string | undefined,
  messages: [] as CustomerProfileMessage[],
  currentMessage: undefined as string | undefined,
  isAucctusTyping: false,
  thinkingMessage: undefined as string | undefined,
};

const customerProfileConversationSlice: Lens<
  ICustomerProfileConversationState,
  IAppStore
> = (set, get, storeApi) => {
  const actionContext = { set, get, storeApi };

  return {
    ...initialCustomerProfileConversationState,
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
    addErrorMessage: addErrorMessage.bind(actionContext),
    agentIsThinking: agentIsThinking.bind(actionContext),
  };
};

export default lens<ICustomerProfileConversationState, IAppStore>(
  customerProfileConversationSlice,
);
