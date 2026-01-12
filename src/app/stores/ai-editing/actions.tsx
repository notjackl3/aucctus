import { toast } from '@components';
import api from '@libs/api';
import { IAiEditingHandshakeMessage } from '@libs/api/types';
import telemetry from '@libs/telemetry';
import { processMediaMessage } from '@libs/utils/files';
import { produce } from 'immer';
import { v4 as uuidv4 } from 'uuid';
import type { IStoreApi } from '../store';
import { IAiEditingState, IAssistantMessage, IUserMessage } from './store';

// Constants
const SYSTEM_ERROR_MESSAGE_NAME = 'system_error';

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
  initializeListeners: () => (() => void) | undefined;
  handleError: (error: {
    conceptUuid: string;
    message: string;
    code: string;
  }) => void;
  clearError: () => void;
  setPrepopulatedEditMessage: (message: string | undefined) => void;
  clearPrepopulatedEditMessage: () => void;
}

/**
 * Clears the entire conversation and resets state
 */
export function clearConversation(
  this: IStoreApi<IAiEditingState>,
  resetCurrentMessage?: boolean,
) {
  const { set, storeApi } = this;
  const conceptUuid = storeApi.getState().conceptReport.conceptUuid;

  // Dispatch cancel event to backend if we have a conceptUuid
  if (conceptUuid) {
    try {
      api.aucctusSocket.send({
        type: 'ai.editing.cancel',
        conceptUuid: conceptUuid,
      });
      telemetry.debug('AI Editing: Cancel event dispatched', {
        conceptUuid,
      });
    } catch (error) {
      telemetry.error('AI Editing: Failed to dispatch cancel event', {
        conceptUuid,
        error,
      });
    }
  }

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
    toast.error('Concept Not Found', 'Unable to find Concept to edit.');
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
    toast.error('Concept Not Found', 'Unable to find Concept to edit.');
    telemetry.debug('Ai Editing Send Message Concept Not Found', {
      conceptUuid,
    });
    error = true;
  }

  if (!currentMessage && !currentMediaUpload) {
    toast.error('No Message', 'No message to send.');
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

/**
 * Initializes store listeners for auto-clearing conversation
 * Returns a cleanup function to remove the listeners
 */
export function initializeListeners(
  this: IStoreApi<IAiEditingState>,
): (() => void) | undefined {
  const { storeApi } = this;

  if (!storeApi.subscribe) {
    return undefined;
  }

  // Track previous values to detect changes
  let previousAccess = storeApi.getState().auth.access;
  let previousConceptUuid = storeApi.getState().conceptReport.conceptUuid;
  let isClearing = false; // Flag to prevent recursive calls

  // Subscribe to store changes
  const unsubscribe = storeApi.subscribe((state) => {
    // Prevent recursive calls during clearing
    if (isClearing) return;

    const currentAccess = state.auth.access;
    const currentConceptUuid = state.conceptReport.conceptUuid;

    // Check for logout (access token was removed)
    if (previousAccess && !currentAccess) {
      telemetry.debug('AI Editing: Clearing conversation due to logout');
      isClearing = true;

      // Use clearConversation function to ensure cancel event is dispatched
      const aiEditingStore = storeApi.getState().aiEditing;
      if (aiEditingStore.clearConversation) {
        aiEditingStore.clearConversation(true);
      }

      isClearing = false;
    }

    // Check for concept change (concept UUID changed to a different non-undefined value)
    if (
      previousConceptUuid !== currentConceptUuid &&
      currentConceptUuid !== undefined &&
      previousConceptUuid !== undefined
    ) {
      telemetry.debug(
        'AI Editing: Clearing conversation due to concept change',
        {
          previousConceptUuid,
          currentConceptUuid,
        },
      );
      isClearing = true;

      const aiEditingStore = storeApi.getState().aiEditing;
      if (aiEditingStore.clearConversation) {
        aiEditingStore.clearConversation(false);
      }

      isClearing = false;
    }

    // Update previous values
    previousAccess = currentAccess;
    previousConceptUuid = currentConceptUuid;
  });

  return unsubscribe;
}

/**
 * Handles AI editing errors from backend
 */
export function handleError(
  this: IStoreApi<IAiEditingState>,
  error: { conceptUuid: string; message: string; code: string },
) {
  const { set, storeApi, get } = this;
  const conceptUuid = storeApi.getState().conceptReport.conceptUuid;

  // Validate the incoming error.conceptUuid matches the UUID of the currently open concept
  if (error.conceptUuid !== conceptUuid) {
    // If it does not match, do not alter UI state. Still log at debug level
    telemetry.debug('AI Editing: Error concept UUID mismatch', {
      errorConceptUuid: error.conceptUuid,
      currentConceptUuid: conceptUuid,
    });
    return;
  }

  // Determine the message to display
  let displayMessage = error.message;
  if (!displayMessage || displayMessage.trim() === '') {
    // Fall back based on code
    switch (error.code) {
      case 'ACCOUNT_NOT_FOUND':
        displayMessage = 'Account not found';
        break;
      case 'UNKNOWN':
      default:
        displayMessage = 'Something went wrong';
        break;
    }
  }

  // Convert the error into an assistant chat message and append it to conversation history
  const errorMessage: IAssistantMessage = {
    uuid: uuidv4(),
    role: 'assistant',
    name: SYSTEM_ERROR_MESSAGE_NAME,
    content: displayMessage,
    timestamp: new Date().toISOString(),
    // Note: Metadata preserved in error state, not in message due to type constraints
  };

  const { messages } = get();
  const updatedMessages = [...messages, errorMessage];

  set(
    produce((state: IAiEditingState) => {
      // Stop the "thinking" state
      state.isAucctusThinking = false;
      state.thinkingMessage = undefined;

      // Update error state
      state.currentError = error;
      state.hasError = true;

      // Add error message to conversation history
      state.messages = updatedMessages;
    }),
  );
}

/**
 * Clears error state only
 */
export function clearError(this: IStoreApi<IAiEditingState>) {
  const { set } = this;

  set(
    produce((state: IAiEditingState) => {
      state.currentError = undefined;
      state.hasError = false;
      // Do not remove the previously appended error message from history
    }),
  );
}
