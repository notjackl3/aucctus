import { toast } from '@components';
import api from '@libs/api';
import { ICustomerProfileHandshakeMessage } from '@libs/api/types';
import telemetry from '@libs/telemetry';
import { produce } from 'immer';
import { v4 as uuidv4 } from 'uuid';
import type { IStoreApi } from '../store';
import {
  IAssistantMessage,
  ICustomerProfileConversation,
  ICustomerProfileConversationState,
  IErrorMessage,
  IUserMessage,
} from './store';

export interface ICustomerProfileConversationActions {
  setCurrentMessage: (message: string) => void;
  setCustomerProfileUuid: (customerProfileUuid: string) => void;
  sendMessage: () => Promise<void>;
  handleMessage: (handshake: ICustomerProfileHandshakeMessage) => boolean;
  performHandshake: (message: IUserMessage) => Promise<void>;
  setConversation: (conversation: ICustomerProfileConversation) => void;
  clearConversation: (resetCurrentMessage?: boolean) => void;
  addAssistantMessage: (message: IAssistantMessage) => void;
  addErrorMessage: (message: IErrorMessage) => void;
  agentIsThinking: (value: boolean, thinkingMessage?: string) => void;
}

export function clearConversation(
  this: IStoreApi<ICustomerProfileConversationState>,
  resetCurrentMessage?: boolean,
) {
  const { set } = this;

  set(
    produce((state: ICustomerProfileConversationState) => {
      state.messages = [];
      state.sessionId = undefined;
      state.isAucctusTyping = false;
      state.currentMessage = resetCurrentMessage
        ? undefined
        : state.currentMessage;
    }),
  );
}

export function setConversation(
  this: IStoreApi<ICustomerProfileConversationState>,
  conversation: ICustomerProfileConversation,
) {
  const { set } = this;

  set(
    produce((state: ICustomerProfileConversationState) => {
      state.messages = conversation.messages ?? [];
      state.sessionId = conversation.uuid;
      state.currentMessage = undefined;
      state.isAucctusTyping = false;
      state.thinkingMessage = undefined;
    }),
  );
}

export function setCurrentMessage(
  this: IStoreApi<ICustomerProfileConversationState>,
  message: string,
) {
  const { set } = this;

  set(
    produce((state: ICustomerProfileConversationState) => {
      state.currentMessage = message;
    }),
  );
}

export async function sendMessage(
  this: IStoreApi<ICustomerProfileConversationState>,
) {
  const { get, set, storeApi } = this;
  const { sessionId, currentMessage, performHandshake, currentMediaUpload } =
    get();
  const conceptUuid = storeApi.getState().conceptReport.conceptUuid;
  const customerProfileUuid = get().customerProfileUuid;

  // Validate required data
  let error = false;

  if (!customerProfileUuid) {
    toast.error(
      'Customer Profile Not Found',
      'Unable to find Customer Profile to start conversation.',
    );
    telemetry.debug('Customer Profile Send Message Profile Not Found', {
      customerProfileUuid,
    });
    error = true;
  }

  if (!conceptUuid) {
    toast.error(
      'Concept Not Found',
      'Unable to find Concept associated with this profile.',
    );
    telemetry.debug('Customer Profile Send Message Concept Not Found', {
      conceptUuid,
    });
    error = true;
  }

  if (!currentMessage && !currentMediaUpload) {
    toast.error('No Message', 'No message to send.');
    telemetry.debug('Customer Profile Send Message No Message', {
      currentMessage,
      currentMediaUpload,
    });
    error = true;
  }

  if (error) {
    set(
      produce((state: ICustomerProfileConversationState) => {
        state.isAucctusTyping = false;
        state.thinkingMessage = undefined;
      }),
    );
    return;
  }

  // Create the message object
  const message: IUserMessage = {
    uuid: uuidv4(),
    content: currentMessage || '',
    role: 'user',
    timestamp: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  // Update state with the new message
  set(
    produce((state: ICustomerProfileConversationState) => {
      state.isAucctusTyping = true;
      state.currentMessage = undefined;
      state.messages = [...state.messages, message];
    }),
  );

  // If no sessionId exists yet, initiate a handshake
  if (!sessionId) {
    await performHandshake(message);
    return;
  }

  // Send the message to the server
  api.aucctusSocket.send({
    type: 'customer.profile.message',
    uuid: message.uuid,
    conceptUuid: conceptUuid!,
    customerProfileUuid: customerProfileUuid!,
    session_id: sessionId,
    content: message.content,
    media: message.media,
  });
}

export function setCustomerProfileUuid(
  this: IStoreApi<ICustomerProfileConversationState>,
  customerProfileUuid: string,
) {
  const { set } = this;

  set(
    produce((state: ICustomerProfileConversationState) => {
      state.customerProfileUuid = customerProfileUuid;
    }),
  );
}

export async function performHandshake(
  this: IStoreApi<ICustomerProfileConversationState>,
  message: IUserMessage,
) {
  const { storeApi, set, get } = this;

  const customerProfileUuid = get().customerProfileUuid;
  const conceptUuid = storeApi.getState().conceptReport.conceptUuid;

  // Get the concept uuid from the state...
  api.aucctusSocket.send({
    type: 'customer.profile.conversation.start',
    uuid: message.uuid,
    customerProfileUuid: customerProfileUuid!,
    conceptUuid: conceptUuid!,
    content: message.content,
    media: message.media,
  });

  set(
    produce((state: ICustomerProfileConversationState) => {
      state.messages = [message];
      state.currentMessage = undefined;
    }),
  );
}

export function handleMessage(
  this: IStoreApi<ICustomerProfileConversationState>,
  handshake: ICustomerProfileHandshakeMessage,
) {
  const { set, storeApi } = this;

  const conceptUuid = storeApi.getState().conceptReport.conceptUuid;

  if (handshake.conceptUuid !== conceptUuid) {
    toast.error('Concept Not Found', 'Unable to find Concept to edit.');

    telemetry.debug(
      'Customer Profile Conversation Handshake Concept Mismatch',
      {
        handshakeConceptUuid: handshake.conceptUuid,
        conceptUuid,
      },
    );

    return false;
  }

  set(
    produce((state: ICustomerProfileConversationState) => {
      state.sessionId = handshake.sessionId;
    }),
  );

  return true;
}

export function agentIsThinking(
  this: IStoreApi<ICustomerProfileConversationState>,
  value: boolean,
  thinkingMessage?: string,
) {
  const { set } = this;
  set(
    produce((state: ICustomerProfileConversationState) => {
      state.isAucctusTyping = value;
      state.thinkingMessage = thinkingMessage;
    }),
  );
}

export function addAssistantMessage(
  this: IStoreApi<ICustomerProfileConversationState>,
  message: IAssistantMessage,
) {
  const { set } = this;

  set(
    produce((state: ICustomerProfileConversationState) => {
      const existingMessageIndex = state.messages.findIndex(
        (msg) => msg.role === 'assistant' && msg.uuid === message.uuid,
      );

      if (existingMessageIndex !== -1) {
        // Update existing message
        state.messages[existingMessageIndex] = message;
      } else {
        // Add new message
        state.messages.push(message);
      }

      state.isAucctusTyping = false;
      state.thinkingMessage = undefined;
    }),
  );
}

export function addErrorMessage(
  this: IStoreApi<ICustomerProfileConversationState>,
  message: IErrorMessage,
) {
  const { set } = this;

  set(
    produce((state: ICustomerProfileConversationState) => {
      state.messages.push(message);
      state.isAucctusTyping = false;
      state.thinkingMessage = undefined;
    }),
  );
}
