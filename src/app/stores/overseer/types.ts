import { IAiEditingSuggestion } from '@libs/api/types';
import type {
  IOverseerConversation,
  IOverseerConversationDetail,
} from '@libs/api/types/overseer';

/**
 * Image attached to an Overseer message (display only, stored as data URL)
 */
export interface IOverseerImageAttachment {
  dataUrl: string;
  filename?: string;
}

/**
 * Pending image before sending (includes File for conversion)
 */
export interface IOverseerPendingImage {
  id: string;
  file: File;
  dataUrl: string;
}

/**
 * User message in Overseer conversation
 */
export interface IOverseerUserMessage {
  uuid: string;
  content: string;
  role: 'user';
  timestamp: string;
  images?: IOverseerImageAttachment[];
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
  toolActivitySteps?: AgentStep[];
  sources?: Array<{ name: string; url: string }>;
}

/**
 * Historical edit suggestion message (read-only snapshot)
 */
export interface IOverseerEditSuggestionMessage {
  uuid: string;
  role: 'edit_suggestion';
  editSuggestions: IOverseerEditSuggestions;
  timestamp: string;
}

export type OverseerMessage =
  | IOverseerUserMessage
  | IOverseerAssistantMessage
  | IOverseerEditSuggestionMessage;

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
 * Feature toggle identifiers
 */
export type OverseerFeature = 'web' | 'nucleus' | 'aiEdit';

/**
 * Agent thinking step (from tool activity events)
 */
export interface AgentStep {
  id: string;
  label: string;
  detail?: string;
  status: 'pending' | 'active' | 'done';
  icon?: 'search' | 'scan' | 'analyze' | 'synthesize';
}

/**
 * Mention item for @mentions
 */
export interface MentionItem {
  id: string;
  name: string;
  type: 'persona' | 'concept';
  segment?: string;
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
    conceptUuid: string;
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
  clearSelectedText: () => void;
  // Dock actions
  setDocked: (value: boolean) => void;
  // Feature toggle actions
  toggleFeature: (feature: OverseerFeature) => void;
  clearFeatures: () => void;
  // Mention actions
  addMention: (item: MentionItem) => void;
  removeMention: (id: string) => void;
  // Section highlight
  setHighlightedSection: (sectionId: string | null) => void;
  // History sidebar
  setShowHistory: (value: boolean) => void;
  setHistoryItems: (items: IOverseerConversation[]) => void;
  setHistoryLoading: (value: boolean) => void;
  handleConversationName: (params: { sessionId: string; name: string }) => void;
  loadConversation: (conversation: IOverseerConversationDetail) => void;
  // Image actions
  addImage: (file: File) => void;
  removeImage: (id: string) => void;
  clearImages: () => void;
  // Tool activity steps
  addToolActivityStep: (
    activityMessage: string,
    detail?: string,
    icon?: AgentStep['icon'],
  ) => void;
  clearToolActivitySteps: () => void;
  finalizeSynthesisStep: () => void;
}

/**
 * Overseer state interface
 */
export interface IOverseerState extends IOverseerActions {
  // UI state
  isOpen: boolean;
  position: IOverseerPosition;
  isDocked: boolean;

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

  // Section highlight state
  highlightedSectionId: string | null;

  // Loading state
  isThinking: boolean;
  thinkingMessage?: string;

  // Error state
  currentError?: { message: string; code: string };
  hasError: boolean;

  // Feature toggles
  activeFeatures: Set<OverseerFeature>;

  // Mentions
  mentions: MentionItem[];

  // Chat history sidebar
  showHistory: boolean;
  historyItems: IOverseerConversation[];
  historyLoading: boolean;

  // Pending image attachments
  pendingImages: IOverseerPendingImage[];

  // Tool activity steps (agent thinking)
  toolActivitySteps: AgentStep[];
}
