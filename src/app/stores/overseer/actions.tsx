import api from '@libs/api';
import { AucctusQueryKeys } from '@hooks/query/query-keys';
import telemetry from '@libs/telemetry';
import { produce } from 'immer';
import { QueryClient } from 'react-query';
import { v4 as uuidv4 } from 'uuid';
import type { IStoreApi } from '../store';
import {
  CustomCommandFlowStep,
  ICustomCommandFlow,
  IOverseerAssistantMessage,
  IOverseerEditSuggestions,
  IOverseerPosition,
  IOverseerState,
  IOverseerUserMessage,
  OverseerContextType,
} from './types';

// Query client reference for invalidating queries
// This will be set by the main app when the query client is created
let queryClientRef: QueryClient | null = null;

export function setQueryClientRef(client: QueryClient) {
  queryClientRef = client;
}

/**
 * Initial state for custom command flow
 */
export const initialCustomCommandFlow: ICustomCommandFlow = {
  isActive: false,
  currentStep: 'name',
  data: {
    name: '',
    label: '',
    description: '',
    promptModifier: '',
    enableWebSearch: false,
    enableNucleusSearch: false,
  },
  error: undefined,
  isSubmitting: false,
};

export const initialCustomCommandManagementFlow = {
  isActive: false,
};

/**
 * Custom command flow step configuration
 */
const CUSTOM_COMMAND_STEPS: CustomCommandFlowStep[] = [
  'name',
  'label',
  'description',
  'promptModifier',
  'tools',
  'confirm',
];

/**
 * Reserved command names that cannot be used
 */
const RESERVED_NAMES = [
  'edit',
  'web',
  'nucleus',
  'summarize',
  'help',
  'search',
  'find',
  'ask',
  'chat',
  'query',
];

/**
 * Account-level page contexts that don't require a concept UUID
 */
const ACCOUNT_LEVEL_PAGES = new Set([
  'nucleus',
  'nucleus_categories',
  'nucleus_data_uploads',
  'watchtower',
  'watchtower_signals',
  'watchtower_predictions',
  'watchtower_trends',
  'portfolio',
]);

/**
 * Check if a page context is an account-level page (Nucleus/Watchtower)
 */
function isAccountLevelPage(pageContext: string): boolean {
  return ACCOUNT_LEVEL_PAGES.has(pageContext);
}

/**
 * Show the selection button when text is selected
 */
export function showSelectionButton(
  this: IStoreApi<IOverseerState>,
  params: {
    selectedText: string;
    expandedText: string;
    pageContext: string;
    buttonPosition: IOverseerPosition;
    popupPosition: IOverseerPosition;
  },
) {
  const { set } = this;

  set(
    produce((state: IOverseerState) => {
      state.showingSelectionButton = true;
      state.pendingSelection = {
        selectedText: params.selectedText,
        expandedText: params.expandedText,
        pageContext: params.pageContext,
        buttonPosition: params.buttonPosition,
        popupPosition: params.popupPosition,
      };
    }),
  );
}

/**
 * Hide the selection button
 */
export function hideSelectionButton(this: IStoreApi<IOverseerState>) {
  const { set } = this;

  set(
    produce((state: IOverseerState) => {
      state.showingSelectionButton = false;
      state.pendingSelection = undefined;
    }),
  );
}

/**
 * Confirm the selection and open the Overseer popup
 */
export function confirmSelection(this: IStoreApi<IOverseerState>) {
  const { get, storeApi } = this;
  const { pendingSelection } = get();

  if (!pendingSelection) {
    return;
  }

  // Hide the button first
  const { hideSelectionButton: hide, open: openOverseer } =
    storeApi.getState().overseer;
  hide();

  // Open the Overseer popup with the pending selection
  openOverseer({
    selectedText: pendingSelection.selectedText,
    expandedText: pendingSelection.expandedText,
    pageContext: pendingSelection.pageContext,
    position: pendingSelection.popupPosition,
  });
}

/**
 * Open the Overseer popup with selected text
 *
 * Supports two modes:
 * 1. Concept mode (default): For concept report pages - uses conceptUuid from conceptReport store
 * 2. Account mode: For Nucleus/Watchtower pages - uses accountUuid passed in params or from auth store
 */
export function open(
  this: IStoreApi<IOverseerState>,
  params: {
    selectedText: string;
    expandedText: string;
    pageContext: string;
    position: IOverseerPosition;
    contextType?: OverseerContextType;
    conceptUuid?: string;
    accountUuid?: string;
  },
) {
  const { set, storeApi } = this;

  // Determine context type based on page context or explicit param
  const contextType: OverseerContextType =
    params.contextType ||
    (isAccountLevelPage(params.pageContext) ? 'account' : 'concept');

  let conceptUuid: string | undefined;
  let accountUuid: string | undefined;

  if (contextType === 'account') {
    // Account mode - get accountUuid from params or auth store
    accountUuid = params.accountUuid || storeApi.getState().auth.account?.uuid;

    if (!accountUuid) {
      telemetry.error(
        'Overseer: Cannot open in account mode without account UUID',
      );
      return;
    }
  } else {
    // Concept mode - get conceptUuid from params or conceptReport store
    conceptUuid =
      params.conceptUuid || storeApi.getState().conceptReport.conceptUuid;

    if (!conceptUuid) {
      telemetry.error(
        'Overseer: Cannot open in concept mode without concept UUID',
      );
      return;
    }

    // Also get accountUuid for concept mode (needed for some operations)
    accountUuid = storeApi.getState().auth.account?.uuid;
  }

  set(
    produce((state: IOverseerState) => {
      state.isOpen = true;
      state.selectedText = params.selectedText;
      state.expandedText = params.expandedText;
      state.pageContext = params.pageContext;
      state.position = params.position;
      state.contextType = contextType;
      state.conceptUuid = conceptUuid;
      state.accountUuid = accountUuid;
      // Reset conversation state
      state.sessionId = undefined;
      state.messages = [];
      state.suggestedQuestions = [];
      state.currentMessage = '';
      state.editSuggestions = null;
      state.isThinking = false;
      state.thinkingMessage = undefined;
      state.currentError = undefined;
      state.hasError = false;
    }),
  );
}

/**
 * Close the Overseer popup
 */
export function close(this: IStoreApi<IOverseerState>) {
  const { set, get } = this;
  const { sessionId, conceptUuid, accountUuid, contextType, pageContext } =
    get();

  // Get the identifier based on context type
  const identifier = contextType === 'account' ? accountUuid : conceptUuid;

  // Send cancel message if we have an active session
  if (sessionId && identifier) {
    try {
      api.aucctusSocket.send({
        type: 'overseer.cancel',
        conceptUuid: contextType === 'concept' ? conceptUuid : undefined,
        accountUuid: contextType === 'account' ? accountUuid : undefined,
        pageContext: pageContext,
      });
      telemetry.debug('Overseer: Cancel event dispatched', {
        identifier,
        contextType,
      });
    } catch (error) {
      telemetry.error('Overseer: Failed to dispatch cancel event', {
        identifier,
        contextType,
        error,
      });
    }
  }

  set(
    produce((state: IOverseerState) => {
      state.isOpen = false;
      state.sessionId = undefined;
      state.messages = [];
      state.suggestedQuestions = [];
      state.currentMessage = '';
      state.editSuggestions = null;
      state.isThinking = false;
      state.thinkingMessage = undefined;
      state.currentError = undefined;
      state.hasError = false;
    }),
  );
}

/**
 * Send a message to the Overseer agent
 */
export async function sendMessage(this: IStoreApi<IOverseerState>) {
  const { get, set } = this;
  const {
    sessionId,
    currentMessage,
    selectedText,
    expandedText,
    pageContext,
    contextType,
    conceptUuid,
    accountUuid,
  } = get();

  // For initial message, we don't need currentMessage
  const isInitialMessage = !sessionId;

  // Validate required data based on context type
  const identifier = contextType === 'account' ? accountUuid : conceptUuid;
  if (!identifier) {
    telemetry.error(
      `Overseer: No ${contextType === 'account' ? 'account' : 'concept'} UUID`,
    );
    return;
  }

  // Require message content
  if (!currentMessage?.trim()) {
    telemetry.debug('Overseer: No message to send');
    return;
  }

  // Create the message object
  const messageUuid = uuidv4();
  const messageContent = currentMessage;

  const userMessage: IOverseerUserMessage = {
    uuid: messageUuid,
    content: messageContent,
    role: 'user',
    timestamp: new Date().toISOString(),
  };

  // Update state with the new message
  set(
    produce((state: IOverseerState) => {
      state.isThinking = true;
      state.currentMessage = '';
      state.messages = [...state.messages, userMessage];
      state.suggestedQuestions = []; // Clear suggestions when sending
      state.editSuggestions = null; // Clear edit suggestions when sending
    }),
  );

  // Build the message payload based on context type
  const basePayload = {
    uuid: messageUuid,
    pageContext: pageContext,
    content: messageContent,
    // Include both UUIDs, backend will use the appropriate one based on page context
    conceptUuid: contextType === 'concept' ? conceptUuid : undefined,
    accountUuid: contextType === 'account' ? accountUuid : undefined,
  };

  // Send the appropriate message type
  if (isInitialMessage) {
    // Start new conversation
    api.aucctusSocket.send({
      type: 'overseer.conversation.start',
      ...basePayload,
      selectedText: selectedText,
      expandedText: expandedText,
    });
    telemetry.debug('Overseer: Started conversation', {
      identifier,
      contextType,
    });
  } else {
    // Follow-up message
    api.aucctusSocket.send({
      type: 'overseer.message',
      ...basePayload,
      sessionId: sessionId!,
    });
    telemetry.debug('Overseer: Sent follow-up message', {
      identifier,
      contextType,
    });
  }
}

/**
 * Update the current draft message
 */
export function setCurrentMessage(
  this: IStoreApi<IOverseerState>,
  message: string,
) {
  const { set } = this;

  set(
    produce((state: IOverseerState) => {
      state.currentMessage = message;
    }),
  );
}

/**
 * Handle the handshake response from the server
 */
export function handleHandshake(
  this: IStoreApi<IOverseerState>,
  handshake: { sessionId: string; conceptUuid: string },
) {
  const { set, get } = this;
  const { conceptUuid, accountUuid, contextType } = get();

  // The handshake.conceptUuid is used as an identifier for both concept and account modes
  const expectedIdentifier =
    contextType === 'account' ? accountUuid : conceptUuid;

  if (handshake.conceptUuid !== expectedIdentifier) {
    telemetry.debug('Overseer: Handshake identifier mismatch', {
      handshakeIdentifier: handshake.conceptUuid,
      expectedIdentifier,
      contextType,
    });
    return;
  }

  set(
    produce((state: IOverseerState) => {
      state.sessionId = handshake.sessionId;
    }),
  );
}

/**
 * Add or update an assistant message
 */
export function addAssistantMessage(
  this: IStoreApi<IOverseerState>,
  message: IOverseerAssistantMessage,
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
    produce((state: IOverseerState) => {
      state.messages = msgs;
      state.isThinking = false;
      state.thinkingMessage = undefined;
    }),
  );
}

/**
 * Handle suggested questions from the agent
 */
export function handleSuggestedQuestions(
  this: IStoreApi<IOverseerState>,
  questions: string[],
) {
  const { set } = this;

  set(
    produce((state: IOverseerState) => {
      state.suggestedQuestions = questions;
    }),
  );
}

/**
 * Store edit suggestions from the /edit command
 */
export function handleEditSuggestions(
  this: IStoreApi<IOverseerState>,
  suggestions: IOverseerEditSuggestions,
) {
  const { set } = this;

  set(
    produce((state: IOverseerState) => {
      // Always stop thinking when suggestions arrive
      state.isThinking = false;
      state.thinkingMessage = undefined;

      if (suggestions.edits && suggestions.edits.length > 0) {
        state.editSuggestions = suggestions;
      } else if (suggestions.reply) {
        // If no edits but we have a reply (e.g. vague request), show as message
        state.messages.push({
          uuid: suggestions.uuid || uuidv4(),
          content: suggestions.reply,
          role: 'assistant',
          name: 'Overseer',
          timestamp: new Date().toISOString(),
        });
        state.editSuggestions = null;
      }
    }),
  );
}

/**
 * Clear edit suggestions
 */
export function clearEditSuggestions(this: IStoreApi<IOverseerState>) {
  const { set } = this;

  set(
    produce((state: IOverseerState) => {
      state.editSuggestions = null;
    }),
  );
}

/**
 * Replace edit suggestions (used for direct state control)
 */
export function setEditSuggestions(
  this: IStoreApi<IOverseerState>,
  suggestions: IOverseerEditSuggestions | null,
) {
  const { set } = this;

  set(
    produce((state: IOverseerState) => {
      state.editSuggestions = suggestions;
    }),
  );
}

/**
 * Update the thinking state
 */
export function agentIsThinking(
  this: IStoreApi<IOverseerState>,
  value: boolean,
  thinkingMessage?: string,
) {
  const { set } = this;

  set(
    produce((state: IOverseerState) => {
      state.isThinking = value;
      state.thinkingMessage = thinkingMessage;
    }),
  );
}

/**
 * Handle error from the agent
 */
export function handleError(
  this: IStoreApi<IOverseerState>,
  error: { message: string; code: string },
) {
  const { set, get } = this;
  const { conceptUuid } = get();

  telemetry.error('Overseer: Error received', { error, conceptUuid });

  set(
    produce((state: IOverseerState) => {
      state.isThinking = false;
      state.thinkingMessage = undefined;
      state.currentError = error;
      state.hasError = true;
    }),
  );
}

/**
 * Clear error state
 */
export function clearError(this: IStoreApi<IOverseerState>) {
  const { set } = this;

  set(
    produce((state: IOverseerState) => {
      state.currentError = undefined;
      state.hasError = false;
    }),
  );
}

/**
 * Clear the conversation (for reset)
 */
export function clearConversation(this: IStoreApi<IOverseerState>) {
  const { set } = this;

  set(
    produce((state: IOverseerState) => {
      state.sessionId = undefined;
      state.messages = [];
      state.suggestedQuestions = [];
      state.currentMessage = '';
      state.editSuggestions = null;
      state.isThinking = false;
      state.thinkingMessage = undefined;
      state.currentError = undefined;
      state.hasError = false;
    }),
  );
}

/**
 * Set the account context for account-level pages (Nucleus/Watchtower)
 * This should be called when navigating to account-level pages
 */
export function setAccountContext(
  this: IStoreApi<IOverseerState>,
  accountUuid: string,
) {
  const { set } = this;

  set(
    produce((state: IOverseerState) => {
      state.accountUuid = accountUuid;
    }),
  );
}

// =============================================================================
// Custom Command Flow Actions
// =============================================================================

/**
 * Start the custom command creation flow
 */
export function startCustomCommandFlow(this: IStoreApi<IOverseerState>) {
  const { set } = this;

  set(
    produce((state: IOverseerState) => {
      state.customCommandFlow = {
        isActive: true,
        currentStep: 'name',
        data: {
          name: '',
          label: '',
          description: '',
          promptModifier: '',
          enableWebSearch: false,
          enableNucleusSearch: false,
        },
        error: undefined,
        isSubmitting: false,
      };
      state.customCommandManagementFlow = {
        ...initialCustomCommandManagementFlow,
      };
      // Clear any existing messages/state
      state.messages = [];
      state.suggestedQuestions = [];
      state.currentMessage = '';
      state.isThinking = false;
    }),
  );
}

/**
 * Start the custom command management flow
 */
export function startManageCustomCommandsFlow(this: IStoreApi<IOverseerState>) {
  const { set } = this;

  set(
    produce((state: IOverseerState) => {
      state.customCommandManagementFlow = { isActive: true };
      state.customCommandFlow = { ...initialCustomCommandFlow };
      // Clear any existing messages/state
      state.messages = [];
      state.suggestedQuestions = [];
      state.currentMessage = '';
      state.isThinking = false;
    }),
  );
}

/**
 * Validate the current step value
 */
function validateStepValue(
  step: CustomCommandFlowStep,
  value: string,
): string | undefined {
  switch (step) {
    case 'name': {
      if (!value) return 'Command name is required';
      if (value.length < 3) return 'Name must be at least 3 characters';
      if (value.length > 32) return 'Name must be 32 characters or less';
      if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]{1,2}$/.test(value)) {
        return 'Only lowercase letters, numbers, and hyphens allowed';
      }
      if (value.includes('--')) return 'Cannot contain consecutive hyphens';
      if (RESERVED_NAMES.includes(value))
        return `"${value}" is a reserved name`;
      return undefined;
    }
    case 'label': {
      if (!value || value.length < 2) {
        return 'Label must be at least 2 characters';
      }
      return undefined;
    }
    case 'description': {
      if (!value || value.length < 10) {
        return 'Description must be at least 10 characters';
      }
      return undefined;
    }
    case 'promptModifier': {
      if (!value || value.length < 10) {
        return 'Prompt must be at least 10 characters';
      }
      if (value.length > 2000) {
        return 'Prompt must be 2000 characters or less';
      }
      return undefined;
    }
    default:
      return undefined;
  }
}

/**
 * Submit a value for the current step and advance
 */
export function submitCustomCommandStep(
  this: IStoreApi<IOverseerState>,
  value: string,
) {
  const { set, get } = this;
  const { customCommandFlow } = get();

  if (!customCommandFlow.isActive) return;

  const { currentStep } = customCommandFlow;

  // For tools step, we handle it differently (via toggle)
  if (currentStep === 'tools' || currentStep === 'confirm') {
    // Just advance to next step
    const currentIndex = CUSTOM_COMMAND_STEPS.indexOf(currentStep);
    if (currentIndex < CUSTOM_COMMAND_STEPS.length - 1) {
      set(
        produce((state: IOverseerState) => {
          state.customCommandFlow.currentStep =
            CUSTOM_COMMAND_STEPS[currentIndex + 1];
          state.customCommandFlow.error = undefined;
        }),
      );
    }
    return;
  }

  // Validate the value
  const error = validateStepValue(currentStep, value);
  if (error) {
    set(
      produce((state: IOverseerState) => {
        state.customCommandFlow.error = error;
      }),
    );
    return;
  }

  // Store the value and advance to next step
  const currentIndex = CUSTOM_COMMAND_STEPS.indexOf(currentStep);
  const nextStep =
    currentIndex < CUSTOM_COMMAND_STEPS.length - 1
      ? CUSTOM_COMMAND_STEPS[currentIndex + 1]
      : currentStep;

  set(
    produce((state: IOverseerState) => {
      // Store the value
      if (currentStep === 'name') {
        state.customCommandFlow.data.name = value
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, '');
      } else if (currentStep === 'label') {
        state.customCommandFlow.data.label = value;
      } else if (currentStep === 'description') {
        state.customCommandFlow.data.description = value;
      } else if (currentStep === 'promptModifier') {
        state.customCommandFlow.data.promptModifier = value;
      }

      state.customCommandFlow.currentStep = nextStep;
      state.customCommandFlow.error = undefined;
      // Clear the current message for the next step
      state.currentMessage = '';
    }),
  );
}

/**
 * Go back to the previous step
 */
export function goBackCustomCommandStep(this: IStoreApi<IOverseerState>) {
  const { set, get } = this;
  const { customCommandFlow } = get();

  if (!customCommandFlow.isActive) return;

  const currentIndex = CUSTOM_COMMAND_STEPS.indexOf(
    customCommandFlow.currentStep,
  );
  if (currentIndex > 0) {
    set(
      produce((state: IOverseerState) => {
        state.customCommandFlow.currentStep =
          CUSTOM_COMMAND_STEPS[currentIndex - 1];
        state.customCommandFlow.error = undefined;
      }),
    );
  }
}

/**
 * Cancel the custom command flow
 */
export function cancelCustomCommandFlow(this: IStoreApi<IOverseerState>) {
  const { set } = this;

  set(
    produce((state: IOverseerState) => {
      state.customCommandFlow = { ...initialCustomCommandFlow };
    }),
  );
}

/**
 * Cancel the custom command management flow
 */
export function cancelManageCustomCommandsFlow(
  this: IStoreApi<IOverseerState>,
) {
  const { set } = this;

  set(
    produce((state: IOverseerState) => {
      state.customCommandManagementFlow = {
        ...initialCustomCommandManagementFlow,
      };
    }),
  );
}

/**
 * Toggle a tool option (web search or nucleus search)
 */
export function toggleCustomCommandTool(
  this: IStoreApi<IOverseerState>,
  tool: 'webSearch' | 'nucleusSearch',
) {
  const { set, get } = this;
  const { customCommandFlow } = get();

  if (!customCommandFlow.isActive) return;

  set(
    produce((state: IOverseerState) => {
      if (tool === 'webSearch') {
        state.customCommandFlow.data.enableWebSearch =
          !state.customCommandFlow.data.enableWebSearch;
      } else {
        state.customCommandFlow.data.enableNucleusSearch =
          !state.customCommandFlow.data.enableNucleusSearch;
      }
    }),
  );
}

/**
 * Edit a specific field (go back to that step)
 */
export function editCustomCommandField(
  this: IStoreApi<IOverseerState>,
  step: CustomCommandFlowStep,
) {
  const { set, get } = this;
  const { customCommandFlow } = get();

  if (!customCommandFlow.isActive) return;

  // Get the existing value for pre-population
  let existingValue = '';
  switch (step) {
    case 'name':
      existingValue = customCommandFlow.data.name;
      break;
    case 'label':
      existingValue = customCommandFlow.data.label;
      break;
    case 'description':
      existingValue = customCommandFlow.data.description;
      break;
    case 'promptModifier':
      existingValue = customCommandFlow.data.promptModifier;
      break;
  }

  set(
    produce((state: IOverseerState) => {
      state.customCommandFlow.currentStep = step;
      state.customCommandFlow.error = undefined;
      // Pre-populate the input with the existing value
      state.currentMessage = existingValue;
    }),
  );
}

/**
 * Confirm and create the custom command
 */
export async function confirmCustomCommand(this: IStoreApi<IOverseerState>) {
  const { set, get } = this;
  const { customCommandFlow } = get();

  if (!customCommandFlow.isActive || customCommandFlow.isSubmitting) return;

  // Set submitting state
  set(
    produce((state: IOverseerState) => {
      state.customCommandFlow.isSubmitting = true;
      state.customCommandFlow.error = undefined;
    }),
  );

  try {
    await api.customCommands.createCustomCommand({
      name: customCommandFlow.data.name,
      label: customCommandFlow.data.label,
      description: customCommandFlow.data.description,
      promptModifier: customCommandFlow.data.promptModifier,
      enableWebSearch: customCommandFlow.data.enableWebSearch,
      enableNucleusSearch: customCommandFlow.data.enableNucleusSearch,
      icon: 'terminal',
    });

    const commandName = customCommandFlow.data.name;

    // Success - reset the flow and add success message
    set(
      produce((state: IOverseerState) => {
        state.customCommandFlow = { ...initialCustomCommandFlow };
        // Add a success message to the chat
        state.messages = [
          {
            uuid: uuidv4(),
            role: 'assistant',
            content: `Your custom command **/${commandName}** has been created successfully! You can now use it by typing \`/${commandName}\` in the chat.`,
            name: 'Overseer',
            timestamp: new Date().toISOString(),
          },
        ];
      }),
    );

    // Invalidate custom commands queries to refresh the list
    if (queryClientRef) {
      queryClientRef.invalidateQueries([AucctusQueryKeys.customCommands]);
      queryClientRef.invalidateQueries([
        AucctusQueryKeys.customCommandsForPicker,
      ]);
    }

    telemetry.debug('Custom command created via conversational flow', {
      name: commandName,
    });
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.detail ||
      error?.response?.data?.message ||
      'Failed to create custom command';

    set(
      produce((state: IOverseerState) => {
        state.customCommandFlow.isSubmitting = false;
        state.customCommandFlow.error = errorMessage;
      }),
    );
  }
}
