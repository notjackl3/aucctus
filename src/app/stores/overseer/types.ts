import { IAiEditingSuggestion } from '@libs/api/types';

/**
 * User message in Overseer conversation
 */
export interface IOverseerUserMessage {
  uuid: string;
  content: string;
  role: 'user';
  timestamp: string;
}

/**
 * Assistant message in Overseer conversation
 */
export interface IOverseerAssistantMessage {
  uuid: string;
  content: string;
  role: 'assistant';
  name?: string;
  timestamp: string;
}

export type OverseerMessage = IOverseerUserMessage | IOverseerAssistantMessage;

export interface IOverseerEditSuggestions {
  reply?: string;
  edits: IAiEditingSuggestion[];
  uuid?: string;
}

/**
 * Position for the Overseer popup
 */
export interface IOverseerPosition {
  x: number;
  y: number;
}

/**
 * Context type for Overseer - determines which agent builder to use
 * - 'concept': For concept report pages (uses ConceptAgentBuilder)
 * - 'account': For Nucleus/Watchtower pages (uses OverseerGeminiAgentBuilder)
 */
export type OverseerContextType = 'concept' | 'account';

/**
 * Pending selection data before user confirms opening Overseer
 */
export interface IOverseerPendingSelection {
  selectedText: string;
  expandedText: string;
  pageContext: string;
  buttonPosition: IOverseerPosition;
  popupPosition: IOverseerPosition;
}

/**
 * Actions interface for Overseer store
 */
export interface IOverseerActions {
  showSelectionButton: (params: {
    selectedText: string;
    expandedText: string;
    pageContext: string;
    buttonPosition: IOverseerPosition;
    popupPosition: IOverseerPosition;
  }) => void;
  hideSelectionButton: () => void;
  confirmSelection: () => void;
  open: (params: {
    selectedText: string;
    expandedText: string;
    pageContext: string;
    position: IOverseerPosition;
    contextType?: OverseerContextType;
    conceptUuid?: string;
    accountUuid?: string;
  }) => void;
  close: () => void;
  sendMessage: () => Promise<void>;
  setCurrentMessage: (message: string) => void;
  handleHandshake: (handshake: {
    sessionId: string;
    conceptUuid: string; // Used as identifier for both concept and account modes
  }) => void;
  addAssistantMessage: (message: IOverseerAssistantMessage) => void;
  handleSuggestedQuestions: (questions: string[]) => void;
  handleEditSuggestions: (suggestions: IOverseerEditSuggestions) => void;
  clearEditSuggestions: () => void;
  setEditSuggestions: (suggestions: IOverseerEditSuggestions | null) => void;
  agentIsThinking: (value: boolean, thinkingMessage?: string) => void;
  handleError: (error: { message: string; code: string }) => void;
  clearError: () => void;
  clearConversation: () => void;
  setPosition: (position: IOverseerPosition) => void;
  setAccountContext: (accountUuid: string) => void;
  // Custom command flow actions
  startCustomCommandFlow: () => void;
  startManageCustomCommandsFlow: () => void;
  submitCustomCommandStep: (value: string) => void;
  goBackCustomCommandStep: () => void;
  cancelCustomCommandFlow: () => void;
  cancelManageCustomCommandsFlow: () => void;
  toggleCustomCommandTool: (tool: 'webSearch' | 'nucleusSearch') => void;
  confirmCustomCommand: () => Promise<void>;
  editCustomCommandField: (step: CustomCommandFlowStep) => void;
}

/**
 * Custom command creation flow step
 */
export type CustomCommandFlowStep =
  | 'name'
  | 'label'
  | 'description'
  | 'promptModifier'
  | 'tools'
  | 'confirm';

/**
 * Custom command creation flow data
 */
export interface ICustomCommandFlowData {
  name: string;
  label: string;
  description: string;
  promptModifier: string;
  enableWebSearch: boolean;
  enableNucleusSearch: boolean;
}

/**
 * Custom command creation flow state
 */
export interface ICustomCommandFlow {
  isActive: boolean;
  currentStep: CustomCommandFlowStep;
  data: ICustomCommandFlowData;
  error?: string;
  isSubmitting: boolean;
}

/**
 * Custom command management flow state
 */
export interface ICustomCommandManagementFlow {
  isActive: boolean;
}

/**
 * Overseer state interface
 */
export interface IOverseerState extends IOverseerActions {
  // UI state
  isOpen: boolean;
  position: IOverseerPosition;

  // Selection button state (shown before opening chat)
  showingSelectionButton: boolean;
  pendingSelection?: IOverseerPendingSelection;

  // Selection context
  selectedText: string;
  expandedText: string;
  pageContext: string;

  // Context type (concept vs account)
  contextType: OverseerContextType;

  // Session state
  sessionId?: string;
  conceptUuid?: string;
  accountUuid?: string;

  // Conversation state
  messages: OverseerMessage[];
  suggestedQuestions: string[];
  currentMessage: string;

  // Edit suggestions state
  editSuggestions: IOverseerEditSuggestions | null;

  // Loading state
  isThinking: boolean;
  thinkingMessage?: string;

  // Error state
  currentError?: { message: string; code: string };
  hasError: boolean;

  // Custom command creation flow
  customCommandFlow: ICustomCommandFlow;
  customCommandManagementFlow: ICustomCommandManagementFlow;
}
