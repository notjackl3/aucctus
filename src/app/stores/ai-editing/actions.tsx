import api from '@libs/api';
import { IAiEditingHandshakeMessage, IMediaMessage } from '@libs/api/types';
import telemetry from '@libs/telemetry';
import { fileToBase64 } from '@libs/utils/files';
import { produce } from 'immer';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import type { IStoreApi } from '../store';
import { IAiEditingState, IAssistantMessage, IUserMessage } from './store';

export interface IAiEditingActions {
  setCurrentMessage: (message: string) => void;
  sendMessage: () => Promise<void>;
  handleAiEditingMessage: (handshake: IAiEditingHandshakeMessage) => void;
  performHandshake: () => Promise<void>;
  clearConversation: (resetCurrentMessage?: boolean) => void;
  addAssistantMessage: (message: IAssistantMessage) => void;
  agentIsTyping: (value: boolean) => void;
}

export function clearConversation(
  this: IStoreApi<IAiEditingState>,
  resetCurrentMessage?: boolean,
) {
  const { set } = this;

  set(
    produce((state: IAiEditingState) => {
      state.messages = [];
      state.sessionId = undefined;
      state.agentIsTyping(false);
      state.currentMessage = resetCurrentMessage
        ? undefined
        : state.currentMessage;
    }),
  );
}

export async function sendMessage(this: IStoreApi<IAiEditingState>) {
  const { get } = this;
  const { sessionId, currentMessage, performHandshake } = get();

  if (!sessionId) {
    // If the session id is not set, we assume this is the first message and we need to perform a handshake
    await performHandshake();
    return;
  }

  if (!currentMessage) {
    toast.error('No message to send.');

    telemetry.debug('Ai Editing Send Message No Message', {
      currentMessage,
    });
    return;
  }

  // TODO: Handle other logic here...
}

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

export async function performHandshake(this: IStoreApi<IAiEditingState>) {
  const { get, storeApi, set } = this;
  const { currentMessage, currentMediaUpload } = get();

  const conceptUuid = storeApi.getState().conceptReport.conceptUuid;

  if (!conceptUuid) {
    // TODO: Refine this error message
    toast.error('Unable to find Concept to edit.');
    telemetry.debug('Ai Editing Handshake Concept Not Found', {
      conceptUuid,
    });
    return;
  }

  if (!currentMessage) {
    toast.error('No message to send.');
    telemetry.debug('Ai Editing Handshake No Message', {
      currentMessage,
    });
    return;
  }

  // Optionally allow a single file upload ... This should probably be a list of files
  let media: IMediaMessage | undefined = undefined;
  if (currentMediaUpload) {
    const file = await fileToBase64(currentMediaUpload);
    media = {
      mediaData: file.mediaData,
      mimetype: file.mimetype,
      filename: file.filename,
    };
  }

  const message: IUserMessage = {
    uuid: uuidv4(),
    content: currentMessage,
    role: 'user',
    media,
  };

  // Get the concept uuid from the state...
  api.aucctusSocket.send({
    type: 'ai.editing.conversation.start',
    uuid: message.uuid,
    // role: message.role, TODO: Add this to typings
    conceptUuid: conceptUuid,
    content: message.content,
    media: message.media,
  });

  set(
    produce((state: IAiEditingState) => {
      state.messages = [message];
      state.currentMessage = undefined;
    }),
  );
}

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

export function agentIsTyping(
  this: IStoreApi<IAiEditingState>,
  value: boolean,
) {
  const { set } = this;
  set(
    produce((state: IAiEditingState) => {
      state.isAucctusTyping = value;
      state.userInputLocked = value;
    }),
  );
}

export function addAssistantMessage(
  this: IStoreApi<IAiEditingState>,
  message: IAssistantMessage,
) {
  const { set } = this;

  set(
    produce((state: IAiEditingState) => {
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

      // If the message is done, we unlock the user input
      state.userInputLocked = false;
    }),
  );
}
