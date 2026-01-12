import { Lens, lens } from '@dhmk/zustand-lens';
import { IInboundChatMessage, IMediaMessage } from '@libs/api/types';
import { IConceptReportEdit } from '@libs/api/types/ai-editing';
import { produce } from 'immer';
import type { IAppStore } from '../store';
import {
  addAssistantMessage,
  agentIsThinking,
  clearConversation,
  clearError,
  handleAiEditingMessage,
  handleError,
  IAiEditingActions,
  initializeListeners,
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

export interface IAssistantMessage
  extends Omit<IInboundChatMessage, 'role' | 'type' | 'content' | 'sessionId'> {
  role: 'assistant';
  content: Partial<IConceptReportEdit> | IConceptReportEdit | string;
}

export type EditMessage = IUserMessage | IAssistantMessage;

export interface IAiEditingState extends IAiEditingActions {
  sessionId?: string;
  messages: EditMessage[];
  currentMessage?: string;

  currentMediaUpload?: File;

  isAucctusThinking: boolean;

  thinkingMessage?: string;

  currentError?: { conceptUuid: string; message: string; code: string };
  hasError: boolean;

  // Prepopulated edit message from external navigation (e.g., Signal Scanning)
  // Cleared after consumption by AiEditingCard
  prepopulatedEditMessage?: string;
}

// Export initial state for use in store and reset functionality
export const initialAiEditingState = {
  sessionId: undefined as string | undefined,
  messages: [] as EditMessage[],
  currentMessage: undefined as string | undefined,
  isAucctusThinking: false,
  thinkingMessage: undefined as string | undefined,
  prepopulatedEditMessage: undefined as string | undefined,
};

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
    isAucctusThinking: false,
    thinkingMessage: undefined,
    currentError: undefined,
    hasError: false,
    prepopulatedEditMessage: undefined,

    sendMessage: sendMessage.bind(actionContext),
    setCurrentMessage: setCurrentMessage.bind(actionContext),
    handleAiEditingMessage: handleAiEditingMessage.bind(actionContext),
    performHandshake: performHandshake.bind(actionContext),
    clearConversation: clearConversation.bind(actionContext),
    addAssistantMessage: addAssistantMessage.bind(actionContext),
    agentIsThinking: agentIsThinking.bind(actionContext),
    initializeListeners: initializeListeners.bind(actionContext),
    handleError: handleError.bind(actionContext),
    clearError: clearError.bind(actionContext),
    setPrepopulatedEditMessage: (message: string | undefined) => {
      set(
        produce((state: IAiEditingState) => {
          state.prepopulatedEditMessage = message;
        }),
      );
    },
    clearPrepopulatedEditMessage: () => {
      set(
        produce((state: IAiEditingState) => {
          state.prepopulatedEditMessage = undefined;
        }),
      );
    },
  };
};

export default lens<IAiEditingState, IAppStore>(aiEditingSlice);
