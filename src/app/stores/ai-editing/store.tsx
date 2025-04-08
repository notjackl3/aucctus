import { Lens, lens } from '@dhmk/zustand-lens';
import { IMediaMessage } from '@libs/api/types';
import { IConceptReportEdit } from '@libs/api/types/ai-editing';
import type { IAppStore } from '../store';
import {
  addAssistantMessage,
  agentIsTyping,
  clearConversation,
  handleAiEditingMessage,
  IAiEditingActions,
  performHandshake,
  sendMessage,
  setCurrentMessage,
} from './actions';

// This is just a placeholder for now...
export interface IUserMessage {
  uuid: string;
  content: string;
  role: 'user';
  media?: IMediaMessage;
}

export interface IAssistantMessage {
  agentId: string;
  uuid: string;
  role: 'assistant';
  content: Partial<IConceptReportEdit> | IConceptReportEdit;
}

export type EditMessage = IUserMessage | IAssistantMessage;

export interface IAiEditingState extends IAiEditingActions {
  sessionId?: string;
  messages: EditMessage[];
  currentMessage?: string;

  currentMediaUpload?: File;

  isAucctusTyping: boolean;
  userInputLocked: boolean;
}

const aiEditingSlice: Lens<IAiEditingState, IAppStore> = (
  set,
  get,
  storeApi,
) => {
  const actionContext = { set, get, storeApi };

  return {
    sessionId: undefined,
    messages: [],
    currentMessage: undefined,
    isAucctusTyping: false,
    // User input is locked both when the agent is typing and when the streams are incoming
    // This is to prevent the user from sending multiple messages at once.
    userInputLocked: false,
    sendMessage: sendMessage.bind(actionContext),
    setCurrentMessage: setCurrentMessage.bind(actionContext),
    handleAiEditingMessage: handleAiEditingMessage.bind(actionContext),
    performHandshake: performHandshake.bind(actionContext),
    clearConversation: clearConversation.bind(actionContext),
    addAssistantMessage: addAssistantMessage.bind(actionContext),
    agentIsTyping: agentIsTyping.bind(actionContext),
  };
};

export default lens<IAiEditingState, IAppStore>(aiEditingSlice);
