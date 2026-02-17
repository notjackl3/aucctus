import { toast } from '@components';
import api from '@libs/api';
import type {
  IPersonaChatHandshakeMessage,
  IPersonaChatStreamEvent,
} from '@libs/api/types/socketMessages/inbound';
import type { IOutboundMention } from '@libs/api/types/socketMessages/outbound';
import telemetry from '@libs/telemetry';
import { produce } from 'immer';
import { v4 as uuidv4 } from 'uuid';
import type { IStoreApi } from '../store';
import {
  IPersonaAssistantMessage,
  IPersonaConversation,
  IPersonaConversationState,
  IPersonaErrorMessage,
  IPersonaUserMessage,
} from './store';

// Debug helper to get current message state
const getMessageSummary = (
  messages: (
    | IPersonaUserMessage
    | IPersonaAssistantMessage
    | IPersonaErrorMessage
  )[],
) =>
  messages.map((m) => ({
    uuid: m.uuid?.slice(0, 8) ?? 'no-uuid',
    role: m.role,
  }));

export interface IPersonaConversationActions {
  setCurrentMessage: (message: string) => void;
  setPersonaUuid: (personaUuid: string) => void;
  sendMessage: (mentions?: IOutboundMention[]) => Promise<void>;
  handleHandshake: (handshake: IPersonaChatHandshakeMessage) => boolean;
  handleStream: (event: IPersonaChatStreamEvent) => void;
  setConversation: (conversation: IPersonaConversation) => void;
  clearConversation: (resetCurrentMessage?: boolean) => void;
  addAssistantMessage: (message: IPersonaAssistantMessage) => void;
  addErrorMessage: (message: IPersonaErrorMessage) => void;
  agentIsThinking: (value: boolean, thinkingMessage?: string) => void;
  addMention: (mention: IOutboundMention) => void;
  clearMentions: () => void;
}

export function clearConversation(
  this: IStoreApi<IPersonaConversationState>,
  resetCurrentMessage?: boolean,
) {
  const { set } = this;

  set(
    produce((state: IPersonaConversationState) => {
      state.messages = [];
      state.sessionId = undefined;
      state.isPersonaTyping = false;
      state.currentStreamingContent = undefined;
      state.currentStreamingUuid = undefined;
      state.currentMessage = resetCurrentMessage
        ? undefined
        : state.currentMessage;
    }),
  );
}

export function setConversation(
  this: IStoreApi<IPersonaConversationState>,
  conversation: IPersonaConversation,
) {
  const { set } = this;

  set(
    produce((state: IPersonaConversationState) => {
      state.messages = conversation.messages ?? [];
      state.sessionId = conversation.uuid;
      state.currentMessage = undefined;
      state.isPersonaTyping = false;
      state.thinkingMessage = undefined;
      state.currentStreamingContent = undefined;
      state.currentStreamingUuid = undefined;
    }),
  );
}

export function setCurrentMessage(
  this: IStoreApi<IPersonaConversationState>,
  message: string,
) {
  const { set } = this;

  set(
    produce((state: IPersonaConversationState) => {
      state.currentMessage = message;
    }),
  );
}

export async function sendMessage(
  this: IStoreApi<IPersonaConversationState>,
  mentions?: IOutboundMention[],
) {
  const { get, set } = this;
  const { sessionId, currentMessage, personaUuid, messages, selectedMentions } =
    get();
  const mentionsToSend =
    mentions ?? (selectedMentions.length > 0 ? selectedMentions : undefined);

  telemetry.debug('[PersonaChat Store] sendMessage called', {
    personaUuid,
    sessionId,
    hasCurrentMessage: !!currentMessage,
    existingMessageCount: messages.length,
    existingMessages: getMessageSummary(messages),
    timestamp: Date.now(),
  });

  // Validate required data
  if (!personaUuid) {
    toast.error(
      'Persona Not Found',
      'Unable to find persona to start conversation.',
    );
    telemetry.debug('Persona Chat Send Message Persona Not Found', {
      personaUuid,
    });
    return;
  }

  if (!currentMessage) {
    toast.error('No Message', 'No message to send.');
    return;
  }

  // Create the message object
  const message: IPersonaUserMessage = {
    uuid: uuidv4(),
    content: currentMessage,
    role: 'user',
    timestamp: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  telemetry.debug('[PersonaChat Store] user message created', {
    messageUuid: message.uuid,
    contentPreview: message.content.slice(0, 50),
    timestamp: Date.now(),
  });

  // Update state with the new message and clear mentions
  set(
    produce((state: IPersonaConversationState) => {
      state.isPersonaTyping = true;
      state.currentMessage = undefined;
      state.messages = [...state.messages, message];
      state.selectedMentions = [];
    }),
  );

  telemetry.debug('[PersonaChat Store] state updated with user message', {
    messageUuid: message.uuid,
    newMessageCount: get().messages.length,
    messages: getMessageSummary(get().messages),
    timestamp: Date.now(),
  });

  // If no sessionId exists yet, initiate a handshake (conversation start)
  if (!sessionId) {
    telemetry.debug('[PersonaChat Store] no sessionId, starting conversation', {
      messageUuid: message.uuid,
      personaUuid,
      timestamp: Date.now(),
    });
    api.aucctusSocket.send({
      type: 'persona.chat.conversation.start',
      uuid: message.uuid,
      personaUuid: personaUuid,
      content: message.content,
      ...(mentionsToSend && { mentions: mentionsToSend }),
    });
    return;
  }

  telemetry.debug('[PersonaChat Store] sending message to existing session', {
    messageUuid: message.uuid,
    sessionId,
    timestamp: Date.now(),
  });

  // Send the message to the server
  api.aucctusSocket.send({
    type: 'persona.chat.message',
    personaUuid: personaUuid,
    session_id: sessionId,
    content: message.content,
    uuid: message.uuid,
    ...(mentionsToSend && { mentions: mentionsToSend }),
  });
}

export function setPersonaUuid(
  this: IStoreApi<IPersonaConversationState>,
  personaUuid: string,
) {
  const { set } = this;

  set(
    produce((state: IPersonaConversationState) => {
      state.personaUuid = personaUuid;
    }),
  );
}

export function handleHandshake(
  this: IStoreApi<IPersonaConversationState>,
  handshake: IPersonaChatHandshakeMessage,
) {
  const { set, get } = this;

  const { personaUuid, messages } = get();

  telemetry.debug('[PersonaChat Store] handleHandshake called', {
    handshakePersonaUuid: handshake.personaUuid,
    handshakeSessionId: handshake.sessionId,
    storePersonaUuid: personaUuid,
    currentMessageCount: messages.length,
    currentMessages: getMessageSummary(messages),
    timestamp: Date.now(),
  });

  if (handshake.personaUuid !== personaUuid) {
    toast.error('Persona Not Found', 'Unable to find persona for chat.');

    telemetry.debug('Persona Chat Handshake Persona Mismatch', {
      handshakePersonaUuid: handshake.personaUuid,
      personaUuid,
    });

    return false;
  }

  set(
    produce((state: IPersonaConversationState) => {
      state.sessionId = handshake.sessionId;
    }),
  );

  telemetry.debug('[PersonaChat Store] sessionId set', {
    sessionId: handshake.sessionId,
    timestamp: Date.now(),
  });

  return true;
}

export function handleStream(
  this: IStoreApi<IPersonaConversationState>,
  event: IPersonaChatStreamEvent,
) {
  const { set, get } = this;

  const { messages } = get();

  telemetry.debug('[PersonaChat Store] handleStream called', {
    messageUuid: event.messageUuid,
    isFinal: event.isFinal,
    contentLength: event.content?.length,
    currentMessageCount: messages.length,
    currentMessages: getMessageSummary(messages),
    timestamp: Date.now(),
  });

  set(
    produce((state: IPersonaConversationState) => {
      state.currentStreamingUuid = event.messageUuid;
      state.currentStreamingContent = event.content;
      state.isPersonaTyping = !event.isFinal;

      if (event.isFinal) {
        state.currentStreamingContent = undefined;
        state.currentStreamingUuid = undefined;
      }
    }),
  );

  if (event.isFinal) {
    telemetry.debug('[PersonaChat Store] stream finalized', {
      messageUuid: event.messageUuid,
      timestamp: Date.now(),
    });
  }
}

export function agentIsThinking(
  this: IStoreApi<IPersonaConversationState>,
  value: boolean,
  thinkingMessage?: string,
) {
  const { set } = this;
  set(
    produce((state: IPersonaConversationState) => {
      state.isPersonaTyping = value;
      state.thinkingMessage = thinkingMessage;
    }),
  );
}

export function addAssistantMessage(
  this: IStoreApi<IPersonaConversationState>,
  message: IPersonaAssistantMessage,
) {
  const { set, get } = this;

  const { messages: messagesBefore } = get();

  // Only look for existing message if UUID is defined (prevents undefined === undefined false matches)
  const existingIndex = message.uuid
    ? messagesBefore.findIndex(
        (msg) => msg.role === 'assistant' && msg.uuid === message.uuid,
      )
    : -1;

  telemetry.debug('[PersonaChat Store] addAssistantMessage called', {
    messageUuid: message.uuid,
    contentPreview: message.content?.slice(0, 50),
    existingIndex,
    isUpdate: existingIndex !== -1,
    messageCountBefore: messagesBefore.length,
    messagesBefore: getMessageSummary(messagesBefore),
    timestamp: Date.now(),
  });

  set(
    produce((state: IPersonaConversationState) => {
      // Only look for existing message if UUID is defined (prevents undefined === undefined false matches)
      const existingMessageIndex = message.uuid
        ? state.messages.findIndex(
            (msg) => msg.role === 'assistant' && msg.uuid === message.uuid,
          )
        : -1;

      if (existingMessageIndex !== -1) {
        state.messages[existingMessageIndex] = message;
      } else {
        state.messages.push(message);
      }

      state.isPersonaTyping = false;
      state.thinkingMessage = undefined;
      state.currentStreamingContent = undefined;
      state.currentStreamingUuid = undefined;
    }),
  );

  const { messages: messagesAfter } = get();
  telemetry.debug('[PersonaChat Store] addAssistantMessage completed', {
    messageUuid: message.uuid,
    messageCountAfter: messagesAfter.length,
    messagesAfter: getMessageSummary(messagesAfter),
    timestamp: Date.now(),
  });
}

export function addErrorMessage(
  this: IStoreApi<IPersonaConversationState>,
  message: IPersonaErrorMessage,
) {
  const { set } = this;

  set(
    produce((state: IPersonaConversationState) => {
      state.messages.push(message);
      state.isPersonaTyping = false;
      state.thinkingMessage = undefined;
      state.currentStreamingContent = undefined;
      state.currentStreamingUuid = undefined;
    }),
  );
}

export function addMention(
  this: IStoreApi<IPersonaConversationState>,
  mention: IOutboundMention,
) {
  const { set } = this;

  set(
    produce((state: IPersonaConversationState) => {
      // Avoid duplicates
      if (!state.selectedMentions.some((m) => m.uuid === mention.uuid)) {
        state.selectedMentions.push(mention);
      }
    }),
  );
}

export function clearMentions(this: IStoreApi<IPersonaConversationState>) {
  const { set } = this;

  set(
    produce((state: IPersonaConversationState) => {
      state.selectedMentions = [];
    }),
  );
}
