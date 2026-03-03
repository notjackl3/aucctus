import { Lens, lens } from '@dhmk/zustand-lens';
import { produce } from 'immer';
import type { IAppStore } from '../store';
import {
  addAssistantMessage,
  addImage,
  addMention,
  addToolActivityStep,
  agentIsThinking,
  clearConversation,
  clearEditSuggestions,
  clearError,
  clearFeatures,
  clearImages,
  clearSelectedText,
  clearToolActivitySteps,
  close,
  openToHistory,
  setHighlightedSection,
  confirmSelection,
  finalizeSynthesisStep,
  handleConversationName,
  handleEditSuggestions,
  handleError,
  handleHandshake,
  handleSuggestedQuestions,
  hideSelectionButton,
  loadConversation,
  open,
  openFromSearchBar,
  removeImage,
  removeMention,
  sendMessage,
  setAccountContext,
  setCurrentMessage,
  setDocked,
  setEditSuggestions,
  setHistoryItems,
  setHistoryLoading,
  setShowHistory,
  showSelectionButton,
  toggleFeature,
} from './actions';

import type { IOverseerConversation } from '@libs/api/types/overseer';

import {
  AgentStep,
  IOverseerEditSuggestions,
  IOverseerPendingImage,
  IOverseerPendingSelection,
  IOverseerPosition,
  IOverseerState,
  MentionItem,
  OverseerContextType,
  OverseerFeature,
  OverseerMessage,
} from './types';

// Re-export types for convenience
export type {
  AgentStep,
  IOverseerActions,
  IOverseerAssistantMessage,
  IOverseerEditSuggestionMessage,
  IOverseerPendingSelection,
  IOverseerPosition,
  IOverseerState,
  IOverseerUserMessage,
  MentionItem,
  OverseerContextType,
  OverseerFeature,
  OverseerMessage,
} from './types';

// Export initial state for use in store and reset functionality
export const initialOverseerState = {
  isOpen: false,
  position: { x: 0, y: 0 } as IOverseerPosition,
  isDocked: false,
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
  highlightedSectionId: null as string | null,
  isThinking: false,
  thinkingMessage: undefined as string | undefined,
  currentError: undefined as { message: string; code: string } | undefined,
  hasError: false,
  activeFeatures: new Set<OverseerFeature>(),
  mentions: [] as MentionItem[],
  showHistory: false,
  historyItems: [] as IOverseerConversation[],
  historyLoading: false,
  pendingImages: [] as IOverseerPendingImage[],
  toolActivitySteps: [] as AgentStep[],
};

const overseerSlice: Lens<IOverseerState, IAppStore> = (set, get, storeApi) => {
  const actionContext = { set, get, storeApi };

  return {
    // Initial state
    isOpen: false,
    position: { x: 0, y: 0 },
    isDocked: false,
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
    highlightedSectionId: null,
    isThinking: false,
    thinkingMessage: undefined,
    currentError: undefined,
    hasError: false,
    activeFeatures: new Set<OverseerFeature>(),
    mentions: [],
    showHistory: false,
    historyItems: [],
    historyLoading: false,
    pendingImages: [],
    toolActivitySteps: [],

    // Actions
    showSelectionButton: showSelectionButton.bind(actionContext),
    hideSelectionButton: hideSelectionButton.bind(actionContext),
    confirmSelection: confirmSelection.bind(actionContext),
    open: open.bind(actionContext),
    openFromSearchBar: openFromSearchBar.bind(actionContext),
    openToHistory: openToHistory.bind(actionContext),
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
    clearSelectedText: clearSelectedText.bind(actionContext),

    // Section highlight
    setHighlightedSection: setHighlightedSection.bind(actionContext),

    // Dock actions
    setDocked: setDocked.bind(actionContext),

    // Feature toggle actions
    toggleFeature: toggleFeature.bind(actionContext),
    clearFeatures: clearFeatures.bind(actionContext),

    // Mention actions
    addMention: addMention.bind(actionContext),
    removeMention: removeMention.bind(actionContext),

    // History sidebar
    setShowHistory: setShowHistory.bind(actionContext),
    setHistoryItems: setHistoryItems.bind(actionContext),
    setHistoryLoading: setHistoryLoading.bind(actionContext),
    handleConversationName: handleConversationName.bind(actionContext),
    loadConversation: loadConversation.bind(actionContext),

    // Image actions
    addImage: addImage.bind(actionContext),
    removeImage: removeImage.bind(actionContext),
    clearImages: clearImages.bind(actionContext),

    // Tool activity steps
    addToolActivityStep: addToolActivityStep.bind(actionContext),
    clearToolActivitySteps: clearToolActivitySteps.bind(actionContext),
    finalizeSynthesisStep: finalizeSynthesisStep.bind(actionContext),

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
