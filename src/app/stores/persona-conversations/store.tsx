import { Lens, lens } from '@dhmk/zustand-lens';
import { IBaseMessage, IInboundChatMessage } from '@libs/api/types';
import type { IOutboundMention } from '@libs/api/types/socketMessages/outbound';
import type { IAppStore } from '../store';
import {
  IPersonaConversationActions,
  addAssistantMessage,
  addErrorMessage,
  agentIsThinking,
  clearConversation,
  handleHandshake,
  handleStream,
  sendMessage,
  setCurrentMessage,
  setConversation,
  setPersonaUuid,
  addMention,
  clearMentions,
} from './actions';

export interface IPersonaUserMessage extends Omit<IBaseMessage, 'role'> {
  role: 'user';
}

export interface IPersonaAssistantMessage
  extends Omit<IInboundChatMessage, 'role' | 'type' | 'content' | 'sessionId'> {
  role: 'assistant';
  content: string;
}

export interface IPersonaErrorMessage extends Omit<IBaseMessage, 'role'> {
  role: 'error';
  content: string;
  code?: string;
}

export type PersonaConversationMessage =
  | IPersonaUserMessage
  | IPersonaAssistantMessage
  | IPersonaErrorMessage;

export interface IPersonaConversation {
  uuid: string;
  summary?: string;
  createdAt: string;
  messages?: PersonaConversationMessage[];
}

export interface IPersonaConversationState extends IPersonaConversationActions {
  sessionId?: string;
  personaUuid?: string;
  messages: PersonaConversationMessage[];
  currentMessage?: string;
  currentStreamingContent?: string;
  currentStreamingUuid?: string;
  isPersonaTyping: boolean;
  thinkingMessage?: string;
  selectedMentions: IOutboundMention[];
}

export const initialPersonaConversationState = {
  sessionId: undefined as string | undefined,
  personaUuid: undefined as string | undefined,
  messages: [] as PersonaConversationMessage[],
  currentMessage: undefined as string | undefined,
  currentStreamingContent: undefined as string | undefined,
  currentStreamingUuid: undefined as string | undefined,
  isPersonaTyping: false,
  thinkingMessage: undefined as string | undefined,
  selectedMentions: [] as IOutboundMention[],
};

const personaConversationSlice: Lens<IPersonaConversationState, IAppStore> = (
  set,
  get,
  storeApi,
) => {
  const actionContext = { set, get, storeApi };

  return {
    ...initialPersonaConversationState,
    sendMessage: sendMessage.bind(actionContext),
    setCurrentMessage: setCurrentMessage.bind(actionContext),
    setPersonaUuid: setPersonaUuid.bind(actionContext),
    handleHandshake: handleHandshake.bind(actionContext),
    handleStream: handleStream.bind(actionContext),
    setConversation: setConversation.bind(actionContext),
    clearConversation: clearConversation.bind(actionContext),
    addAssistantMessage: addAssistantMessage.bind(actionContext),
    addErrorMessage: addErrorMessage.bind(actionContext),
    agentIsThinking: agentIsThinking.bind(actionContext),
    addMention: addMention.bind(actionContext),
    clearMentions: clearMentions.bind(actionContext),
  };
};

export default lens<IPersonaConversationState, IAppStore>(
  personaConversationSlice,
);
