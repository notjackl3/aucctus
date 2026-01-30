import { Lens, lens } from '@dhmk/zustand-lens';
import { produce } from 'immer';
import type { IAppStore } from '../store';
import {
  addAssistantMessage,
  agentIsThinking,
  cancelCustomCommandFlow,
  cancelManageCustomCommandsFlow,
  clearConversation,
  clearError,
  close,
  confirmCustomCommand,
  confirmSelection,
  editCustomCommandField,
  goBackCustomCommandStep,
  handleError,
  handleHandshake,
  handleSuggestedQuestions,
  handleEditSuggestions,
  hideSelectionButton,
  initialCustomCommandFlow,
  initialCustomCommandManagementFlow,
  open,
  sendMessage,
  clearEditSuggestions,
  setEditSuggestions,
  setAccountContext,
  setCurrentMessage,
  setQueryClientRef,
  showSelectionButton,
  startCustomCommandFlow,
  startManageCustomCommandsFlow,
  submitCustomCommandStep,
  toggleCustomCommandTool,
} from './actions';

// Re-export setQueryClientRef for use in main app
export { setQueryClientRef };
import {
  ICustomCommandFlow,
  ICustomCommandManagementFlow,
  IOverseerPendingSelection,
  IOverseerPosition,
  IOverseerState,
  IOverseerEditSuggestions,
  OverseerContextType,
  OverseerMessage,
} from './types';

// Re-export types for convenience
export type {
  CustomCommandFlowStep,
  ICustomCommandFlow,
  ICustomCommandManagementFlow,
  IOverseerActions,
  IOverseerAssistantMessage,
  IOverseerPendingSelection,
  IOverseerPosition,
  IOverseerState,
  IOverseerUserMessage,
  OverseerContextType,
  OverseerMessage,
} from './types';

// Export initial state for use in store and reset functionality
export const initialOverseerState = {
  isOpen: false,
  position: { x: 0, y: 0 } as IOverseerPosition,
  showingSelectionButton: false,
  pendingSelection: undefined as IOverseerPendingSelection | undefined,
  selectedText: '',
  expandedText: '',
  pageContext: 'overview',
  contextType: 'concept' as OverseerContextType,
  sessionId: undefined as string | undefined,
  conceptUuid: undefined as string | undefined,
  accountUuid: undefined as string | undefined,
  messages: [] as OverseerMessage[],
  suggestedQuestions: [] as string[],
  currentMessage: '',
  editSuggestions: null as IOverseerEditSuggestions | null,
  isThinking: false,
  thinkingMessage: undefined as string | undefined,
  currentError: undefined as { message: string; code: string } | undefined,
  hasError: false,
  customCommandFlow: initialCustomCommandFlow as ICustomCommandFlow,
  customCommandManagementFlow:
    initialCustomCommandManagementFlow as ICustomCommandManagementFlow,
};

const overseerSlice: Lens<IOverseerState, IAppStore> = (set, get, storeApi) => {
  const actionContext = { set, get, storeApi };

  return {
    // Initial state
    isOpen: false,
    position: { x: 0, y: 0 },
    showingSelectionButton: false,
    pendingSelection: undefined,
    selectedText: '',
    expandedText: '',
    pageContext: 'overview',
    contextType: 'concept' as OverseerContextType,
    sessionId: undefined,
    conceptUuid: undefined,
    accountUuid: undefined,
    messages: [],
    suggestedQuestions: [],
    currentMessage: '',
    editSuggestions: null,
    isThinking: false,
    thinkingMessage: undefined,
    currentError: undefined,
    hasError: false,
    customCommandFlow: initialCustomCommandFlow,
    customCommandManagementFlow: initialCustomCommandManagementFlow,

    // Actions
    showSelectionButton: showSelectionButton.bind(actionContext),
    hideSelectionButton: hideSelectionButton.bind(actionContext),
    confirmSelection: confirmSelection.bind(actionContext),
    open: open.bind(actionContext),
    close: close.bind(actionContext),
    sendMessage: sendMessage.bind(actionContext),
    setCurrentMessage: setCurrentMessage.bind(actionContext),
    handleHandshake: handleHandshake.bind(actionContext),
    addAssistantMessage: addAssistantMessage.bind(actionContext),
    handleSuggestedQuestions: handleSuggestedQuestions.bind(actionContext),
    handleEditSuggestions: handleEditSuggestions.bind(actionContext),
    clearEditSuggestions: clearEditSuggestions.bind(actionContext),
    setEditSuggestions: setEditSuggestions.bind(actionContext),
    agentIsThinking: agentIsThinking.bind(actionContext),
    handleError: handleError.bind(actionContext),
    clearError: clearError.bind(actionContext),
    clearConversation: clearConversation.bind(actionContext),
    setAccountContext: setAccountContext.bind(actionContext),

    // Custom command flow actions
    startCustomCommandFlow: startCustomCommandFlow.bind(actionContext),
    startManageCustomCommandsFlow:
      startManageCustomCommandsFlow.bind(actionContext),
    submitCustomCommandStep: submitCustomCommandStep.bind(actionContext),
    goBackCustomCommandStep: goBackCustomCommandStep.bind(actionContext),
    cancelCustomCommandFlow: cancelCustomCommandFlow.bind(actionContext),
    cancelManageCustomCommandsFlow:
      cancelManageCustomCommandsFlow.bind(actionContext),
    toggleCustomCommandTool: toggleCustomCommandTool.bind(actionContext),
    confirmCustomCommand: confirmCustomCommand.bind(actionContext),
    editCustomCommandField: editCustomCommandField.bind(actionContext),

    // Simple setters
    setPosition: (position: IOverseerPosition) => {
      set(
        produce((state: IOverseerState) => {
          state.position = position;
        }),
      );
    },
  };
};

export default lens<IOverseerState, IAppStore>(overseerSlice);
