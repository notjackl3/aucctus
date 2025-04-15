import api from '@libs/api';
import { IAiEditingHandshakeMessage } from '@libs/api/types';
import telemetry from '@libs/telemetry';
import { processMediaMessage } from '@libs/utils/files';
import { produce } from 'immer';
import { toast } from '@components';
import { v4 as uuidv4 } from 'uuid';
import type { IStoreApi } from '../store';
import { IAiEditingState, IAssistantMessage, IUserMessage } from './store';

/**
 * Actions for AI editing conversation management
 */
export interface IAiEditingActions {
  setCurrentMessage: (message: string) => void;
  sendMessage: () => Promise<void>;
  handleAiEditingMessage: (handshake: IAiEditingHandshakeMessage) => void;
  performHandshake: (message: IUserMessage) => Promise<void>;
  clearConversation: (resetCurrentMessage?: boolean) => void;
  addAssistantMessage: (message: IAssistantMessage) => void;
  agentIsThinking: (value: boolean, thinkingMessage?: string) => void;
}

/**
 * Clears the entire conversation and resets state
 */
export function clearConversation(
  this: IStoreApi<IAiEditingState>,
  resetCurrentMessage?: boolean,
) {
  const { set } = this;

  set(
    produce((state: IAiEditingState) => {
      state.messages = [];
      state.sessionId = undefined;
      state.isAucctusThinking = false;
      state.thinkingMessage = undefined;
      state.currentMessage = resetCurrentMessage
        ? undefined
        : state.currentMessage;
    }),
  );
}

/**
 * Updates the current draft message
 */
export function setCurrentMessage(
  this: IStoreApi<IAiEditingState>,
  message: string,
) {
  const { set } = this;

  set(
    produce((state: IAiEditingState) => {
      state.currentMessage = message;
    }),
  );
}

/**
 * Updates the thinking state of the AI assistant
 */
export function agentIsThinking(
  this: IStoreApi<IAiEditingState>,
  value: boolean,
  thinkingMessage?: string,
) {
  const { set } = this;

  set(
    produce((state: IAiEditingState) => {
      state.isAucctusThinking = value;
      state.thinkingMessage = thinkingMessage;
    }),
  );
}

/**
 * Adds or updates an assistant message in the conversation
 */
export function addAssistantMessage(
  this: IStoreApi<IAiEditingState>,
  message: IAssistantMessage,
) {
  const { set, get } = this;
  const { messages } = get();

  let msgs = [...messages];
  const existingMessageIndex = msgs.findIndex(
    (msg) => msg.role === 'assistant' && msg.uuid === message.uuid,
  );

  if (existingMessageIndex !== -1) {
    // Update existing message
    msgs[existingMessageIndex] = message;
  } else {
    // Add new message
    msgs.push(message);
  }

  set(
    produce((state: IAiEditingState) => {
      state.messages = msgs;
      // If the message is done, we unlock the user input
      state.isAucctusThinking = false;
      state.thinkingMessage = undefined;
    }),
  );
}

/**
 * Handles the initial handshake response from the server
 */
export function handleAiEditingMessage(
  this: IStoreApi<IAiEditingState>,
  handshake: IAiEditingHandshakeMessage,
) {
  const { set, storeApi } = this;
  const conceptUuid = storeApi.getState().conceptReport.conceptUuid;

  if (handshake.conceptUuid !== conceptUuid) {
    toast.error('Unable to find Concept to edit.');
    telemetry.debug('Ai Editing Handshake Concept Mismatch', {
      handshakeConceptUuid: handshake.conceptUuid,
      conceptUuid,
    });
    return;
  }

  set(
    produce((state: IAiEditingState) => {
      state.sessionId = handshake.sessionId;
    }),
  );
}

/**
 * Initiates a new conversation session with the AI
 */
export async function performHandshake(
  this: IStoreApi<IAiEditingState>,
  message: IUserMessage,
) {
  const { storeApi, set } = this;
  const conceptUuid = storeApi.getState().conceptReport.conceptUuid;

  // Start a new conversation session
  api.aucctusSocket.send({
    type: 'ai.editing.conversation.start',
    uuid: message.uuid,
    conceptUuid: conceptUuid!,
    content: message.content,
    media: message.media,
  });

  set(
    produce((state: IAiEditingState) => {
      state.messages = [message];
      state.currentMessage = undefined;
      state.isAucctusThinking = true;
    }),
  );
}

/**
 * Sends a user message to the AI assistant
 */
export async function sendMessage(this: IStoreApi<IAiEditingState>) {
  const { get, set, storeApi } = this;
  const { sessionId, currentMessage, performHandshake, currentMediaUpload } =
    get();
  const conceptUuid = storeApi.getState().conceptReport.conceptUuid;

  // Validate required data
  let error = false;
  if (!conceptUuid) {
    toast.error('Unable to find Concept to edit.');
    telemetry.debug('Ai Editing Send Message Concept Not Found', {
      conceptUuid,
    });
    error = true;
  }

  if (!currentMessage && !currentMediaUpload) {
    toast.error('No message to send.');
    telemetry.debug('Ai Editing Send Message No Message', {
      currentMessage,
      currentMediaUpload,
    });
    error = true;
  }

  if (error) {
    set(
      produce((state: IAiEditingState) => {
        state.isAucctusThinking = false;
      }),
    );
    return;
  }

  // Process any media attachments
  const media = await processMediaMessage(currentMediaUpload);

  // Create the message object
  const message: IUserMessage = {
    uuid: uuidv4(),
    content: currentMessage || '',
    role: 'user',
    media: media,
  };

  // Update state with the new message
  set(
    produce((state: IAiEditingState) => {
      state.isAucctusThinking = true;
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
    type: 'ai.editing.message',
    uuid: message.uuid,
    conceptUuid: conceptUuid!,
    session_id: sessionId,
    content: message.content,
    media: message.media,
  });
}
