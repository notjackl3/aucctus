import api from '@libs/api';
import type {
  IMediaMessage,
  IOverseerConversationStartMessage,
  IOverseerOutboundChatMessage,
} from '@libs/api/types';
import type { Mimetype } from '@libs/api/types/osiris';
import type { IOverseerPageMetadata } from '@libs/api/types/socketMessages/outbound';
import type {
  IOverseerConversation,
  IOverseerConversationDetail,
} from '@libs/api/types/overseer';
import telemetry from '@libs/telemetry';
import { produce } from 'immer';
import { v4 as uuidv4 } from 'uuid';
import type { IStoreApi } from '../store';
import {
  AgentStep,
  IOverseerAssistantMessage,
  IOverseerEditSuggestionMessage,
  IOverseerEditSuggestions,
  IOverseerNavigateSuggestion,
  IOverseerPendingImage,
  IOverseerPosition,
  IOverseerState,
  IOverseerUserMessage,
  MentionItem,
  OverseerMessage,
  OverseerContextType,
  OverseerFeature,
} from './types';

import { ACCOUNT_LEVEL_PAGE_CONTEXTS } from '@components/Overseer/overseerRouteConfig';

/**
 * Auto-process the next queued message if the queue is non-empty.
 * Called after each run completes (success, edit, navigate, or error).
 */
function tryProcessNextQueued(
  get: () => IOverseerState,
  storeApi: IStoreApi<IOverseerState>['storeApi'],
) {
  const { messageQueue } = get();
  if (messageQueue.length > 0) {
    setTimeout(() => {
      storeApi.getState().overseer.processQueuedMessage();
    }, 200);
  }
}

/**
 * Check if a page context is an account-level page (Nucleus/Watchtower/Portfolio/etc.)
 * Derived from the central Overseer route registry.
 */
function isAccountLevelPage(pageContext: string): boolean {
  return ACCOUNT_LEVEL_PAGE_CONTEXTS.has(pageContext);
}

/**
 * Build the optional `pageMetadata` payload for outbound Overseer messages.
 *
 * Reads the JTBD active-view Zustand slice when the current page context is
 * `jtbd`. Returns undefined when no metadata is populated so the wire payload
 * stays clean for non-JTBD pages (or JTBD pages where nothing is selected).
 */
function buildPageMetadata(
  pageContext: string,
  storeApi: IStoreApi<IOverseerState>['storeApi'],
): IOverseerPageMetadata | undefined {
  if (pageContext !== 'jtbd') return undefined;

  // Defensive: the JTBD slice may not be initialized if something imports this
  // module before the store has hydrated.
  const jtbdActive = storeApi.getState().jtbdActive;
  if (!jtbdActive) return undefined;

  const { activeConfigUuid, selectedScanUuids, selectedJobUuid } = jtbdActive;

  const metadata: IOverseerPageMetadata = {};
  if (activeConfigUuid) metadata.activeConfigUuid = activeConfigUuid;
  if (selectedScanUuids && selectedScanUuids.length > 0) {
    metadata.selectedScanUuids = selectedScanUuids;
  }
  if (selectedJobUuid) metadata.selectedJobUuid = selectedJobUuid;

  return Object.keys(metadata).length > 0 ? metadata : undefined;
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
    accountUuid = params.accountUuid || storeApi.getState().auth.account?.uuid;

    if (!accountUuid) {
      telemetry.error(
        'Overseer: Cannot open in account mode without account UUID',
      );
      return;
    }
  } else {
    conceptUuid =
      params.conceptUuid || storeApi.getState().conceptReport.conceptUuid;

    if (!conceptUuid) {
      telemetry.error(
        'Overseer: Cannot open in concept mode without concept UUID',
      );
      return;
    }

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
      state.navigateSuggestion = null;
      state.highlightedSectionId = null;
      state.isThinking = false;
      state.thinkingMessage = undefined;
      state.currentError = undefined;
      state.hasError = false;
      state.activeFeatures = new Set();
      state.mentions = [];
      state.toolActivitySteps = [];
      state.historyItems = [];
      state.showHistory = false;
      state.pendingImages = [];
      state.messageQueue = [];
      state.isQueuePaused = false;
      state.isCancelling = false;
    }),
  );
}

/**
 * Open the Overseer panel from the floating search bar.
 * Opens docked, with no text selection, and pre-loads the search query.
 * Falls back to account-level context when no concept UUID is available.
 */
export function openFromSearchBar(
  this: IStoreApi<IOverseerState>,
  params: {
    message: string;
    pageContext: string;
    contextType?: OverseerContextType;
    conceptUuid?: string;
    accountUuid?: string;
    images?: IOverseerPendingImage[];
    mentions?: MentionItem[];
  },
) {
  const { set, storeApi } = this;

  let contextType: OverseerContextType =
    params.contextType ||
    (isAccountLevelPage(params.pageContext) ? 'account' : 'concept');

  const conceptUuid: string | undefined =
    params.conceptUuid || storeApi.getState().conceptReport.conceptUuid;
  const accountUuid: string | undefined =
    params.accountUuid || storeApi.getState().auth.account?.uuid;

  // Fall back to account mode if concept mode was desired but no conceptUuid is available
  if (contextType === 'concept' && !conceptUuid) {
    contextType = 'account';
  }

  if (contextType === 'account' && !accountUuid) {
    telemetry.error('Overseer: Cannot open search bar without account UUID');
    return;
  }

  set(
    produce((state: IOverseerState) => {
      state.isOpen = true;
      state.isDocked = true;
      state.selectedText = '';
      state.expandedText = '';
      state.pageContext = params.pageContext;
      state.position = { x: 0, y: 0 };
      state.contextType = contextType;
      state.conceptUuid = conceptUuid;
      state.accountUuid = accountUuid;
      state.currentMessage = params.message;
      // Reset conversation state
      state.sessionId = undefined;
      state.messages = [];
      state.suggestedQuestions = [];
      state.editSuggestions = null;
      state.navigateSuggestion = null;
      state.highlightedSectionId = null;
      state.isThinking = false;
      state.thinkingMessage = undefined;
      state.currentError = undefined;
      state.hasError = false;
      state.activeFeatures = new Set();
      state.mentions = params.mentions ?? [];
      state.toolActivitySteps = [];
      state.historyItems = [];
      state.showHistory = false;
      state.pendingImages = params.images ?? [];
      state.messageQueue = [];
      state.isQueuePaused = false;
      state.isCancelling = false;
    }),
  );
}

/**
 * Open the Overseer panel with a pre-filled message and an optional mention.
 * Used by per-widget/per-job "Refine" and "Re-assess" buttons in the JTBD canvas
 * to seed the conversation with a targeted prompt without invoking the floating
 * search bar. Opens docked so the target UI remains visible.
 */
export function openWithPrefill(
  this: IStoreApi<IOverseerState>,
  params: {
    message: string;
    pageContext: string;
    mention?: MentionItem;
    contextType?: OverseerContextType;
    conceptUuid?: string;
    accountUuid?: string;
  },
) {
  const { set, storeApi } = this;

  let contextType: OverseerContextType =
    params.contextType ||
    (isAccountLevelPage(params.pageContext) ? 'account' : 'concept');

  const conceptUuid: string | undefined =
    params.conceptUuid || storeApi.getState().conceptReport.conceptUuid;
  const accountUuid: string | undefined =
    params.accountUuid || storeApi.getState().auth.account?.uuid;

  // Fall back to account mode if concept mode was desired but no conceptUuid is available
  if (contextType === 'concept' && !conceptUuid) {
    contextType = 'account';
  }

  if (contextType === 'account' && !accountUuid) {
    telemetry.error('Overseer: Cannot open prefill without account UUID');
    return;
  }

  set(
    produce((state: IOverseerState) => {
      state.isOpen = true;
      state.isDocked = true;
      state.selectedText = '';
      state.expandedText = '';
      state.pageContext = params.pageContext;
      state.position = { x: 0, y: 0 };
      state.contextType = contextType;
      state.conceptUuid = conceptUuid;
      state.accountUuid = accountUuid;
      state.currentMessage = params.message;
      // Reset conversation state
      state.sessionId = undefined;
      state.messages = [];
      state.suggestedQuestions = [];
      state.editSuggestions = null;
      state.navigateSuggestion = null;
      state.highlightedSectionId = null;
      state.isThinking = false;
      state.thinkingMessage = undefined;
      state.currentError = undefined;
      state.hasError = false;
      state.activeFeatures = new Set();
      state.mentions = params.mention ? [params.mention] : [];
      state.toolActivitySteps = [];
      state.historyItems = [];
      state.showHistory = false;
      state.pendingImages = [];
      state.messageQueue = [];
      state.isQueuePaused = false;
      state.isCancelling = false;
      // Bump the nonce so the textarea moves the caret to the end of
      // the freshly-prefilled message instead of leaving it at index 0.
      state.prefillNonce = state.prefillNonce + 1;
    }),
  );
}

/**
 * Open the Overseer panel docked with history view visible.
 * Used by the floating search bar's history button.
 */
export function openToHistory(this: IStoreApi<IOverseerState>) {
  const { set, storeApi } = this;

  const currentPageContext =
    storeApi.getState().overseer.pageContext || 'general';
  const conceptUuid: string | undefined = isAccountLevelPage(currentPageContext)
    ? undefined
    : storeApi.getState().conceptReport.conceptUuid;
  const accountUuid: string | undefined =
    storeApi.getState().auth.account?.uuid;

  const contextType: OverseerContextType =
    isAccountLevelPage(currentPageContext) || !conceptUuid
      ? 'account'
      : 'concept';

  if (contextType === 'account' && !accountUuid) {
    telemetry.error('Overseer: Cannot open history without account UUID');
    return;
  }

  set(
    produce((state: IOverseerState) => {
      state.isOpen = true;
      state.isDocked = true;
      state.showHistory = true;
      state.selectedText = '';
      state.expandedText = '';
      state.pageContext = currentPageContext;
      state.position = { x: 0, y: 0 };
      state.contextType = contextType;
      state.conceptUuid = conceptUuid;
      state.accountUuid = accountUuid;
      // Reset conversation state
      state.sessionId = undefined;
      state.messages = [];
      state.suggestedQuestions = [];
      state.currentMessage = '';
      state.editSuggestions = null;
      state.navigateSuggestion = null;
      state.highlightedSectionId = null;
      state.isThinking = false;
      state.thinkingMessage = undefined;
      state.currentError = undefined;
      state.hasError = false;
      state.activeFeatures = new Set();
      state.mentions = [];
      state.toolActivitySteps = [];
      state.pendingImages = [];
      state.messageQueue = [];
      state.isQueuePaused = false;
      state.isCancelling = false;
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

  const identifier = contextType === 'account' ? accountUuid : conceptUuid;

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
      state.navigateSuggestion = null;
      state.highlightedSectionId = null;
      state.isThinking = false;
      state.thinkingMessage = undefined;
      state.currentError = undefined;
      state.hasError = false;
      state.activeFeatures = new Set();
      state.mentions = [];
      state.showHistory = false;
      state.historyItems = [];
      state.historyLoading = false;
      state.toolActivitySteps = [];
      state.pendingImages = [];
      state.messageQueue = [];
      state.isQueuePaused = false;
      state.isCancelling = false;
    }),
  );
}

/**
 * Cancel the current agent run without closing the popup.
 * Sends overseer.cancel via WebSocket and optimistically resets thinking state.
 */
export function cancelCurrentRun(this: IStoreApi<IOverseerState>) {
  const { set, get } = this;
  const { sessionId, conceptUuid, accountUuid, contextType, pageContext } =
    get();

  const identifier = contextType === 'account' ? accountUuid : conceptUuid;

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
      state.isThinking = false;
      state.isCancelling = true;
      state.thinkingMessage = undefined;
      state.toolActivitySteps = [];
    }),
  );
}

/**
 * Process the next queued message — shifts the first item from the queue and sends it.
 * Respects isQueuePaused — does nothing when paused.
 */
export function processQueuedMessage(this: IStoreApi<IOverseerState>) {
  const { get, set, storeApi } = this;
  const {
    messageQueue,
    isQueuePaused,
    isThinking,
    sessionId,
    selectedText,
    expandedText,
    pageContext,
    contextType,
    conceptUuid,
    accountUuid,
  } = get();

  if (messageQueue.length === 0 || isQueuePaused || isThinking) return;

  const nextMessage = messageQueue[0];
  const identifier = contextType === 'account' ? accountUuid : conceptUuid;
  if (!identifier) return;

  const messageUuid = uuidv4();
  const messageContent = nextMessage.content?.trim()
    ? nextMessage.content
    : nextMessage.images.length > 0
      ? 'Please analyze the attached image(s).'
      : '';

  // Prepend slash command based on active features
  let effectiveContent = messageContent;
  if (nextMessage.activeFeatures.has('aiEdit')) {
    effectiveContent = `/edit ${messageContent}`;
  } else if (nextMessage.activeFeatures.has('navigate')) {
    effectiveContent = `/navigate ${messageContent}`;
  } else if (nextMessage.activeFeatures.has('web')) {
    effectiveContent = `/web ${messageContent}`;
  } else if (nextMessage.activeFeatures.has('nucleus')) {
    effectiveContent = `/nucleus ${messageContent}`;
  }

  // Convert images
  const imageAttachments =
    nextMessage.images.length > 0
      ? nextMessage.images.map((img) => ({
          dataUrl: img.dataUrl,
          filename: img.file.name,
        }))
      : undefined;

  const mediaMessages: IMediaMessage[] | undefined =
    nextMessage.images.length > 0
      ? nextMessage.images.map((img) => ({
          mediaData: img.dataUrl,
          mimetype: img.file.type as unknown as Mimetype,
          filename: img.file.name,
        }))
      : undefined;

  // Build mention payload
  const mentionPayload = nextMessage.mentions.map((m) => ({
    uuid: m.id,
    name: m.name,
    type: m.type,
  }));

  const userMessage: IOverseerUserMessage = {
    uuid: messageUuid,
    content: messageContent,
    role: 'user',
    timestamp: new Date().toISOString(),
    images: imageAttachments,
  };

  const isInitialMessage = !sessionId;

  set(
    produce((state: IOverseerState) => {
      state.isThinking = true;
      // Remove the first item from the queue
      state.messageQueue = state.messageQueue.slice(1);
      state.messages = [...state.messages, userMessage];
      state.suggestedQuestions = [];
      state.editSuggestions = null;
      state.navigateSuggestion = null;
      state.highlightedSectionId = null;
      state.toolActivitySteps = [];
    }),
  );

  const pageMetadata = buildPageMetadata(pageContext, storeApi);

  if (isInitialMessage) {
    api.aucctusSocket.send({
      type: 'overseer.conversation.start',
      uuid: messageUuid,
      pageContext,
      content: effectiveContent,
      conceptUuid: contextType === 'concept' ? conceptUuid : undefined,
      accountUuid: contextType === 'account' ? accountUuid : undefined,
      selectedText: selectedText,
      expandedText: expandedText,
      images: mediaMessages,
      mentions: mentionPayload.length > 0 ? mentionPayload : undefined,
      pageMetadata,
    } as IOverseerConversationStartMessage);
  } else {
    api.aucctusSocket.send({
      type: 'overseer.message',
      uuid: messageUuid,
      pageContext,
      content: effectiveContent,
      conceptUuid: contextType === 'concept' ? conceptUuid : undefined,
      accountUuid: contextType === 'account' ? accountUuid : undefined,
      sessionId: sessionId!,
      images: mediaMessages,
      selectedText: selectedText,
      mentions: mentionPayload.length > 0 ? mentionPayload : undefined,
      pageMetadata,
    } as IOverseerOutboundChatMessage);
  }
}

/**
 * Clear the entire message queue without sending.
 */
export function clearMessageQueue(this: IStoreApi<IOverseerState>) {
  const { set } = this;

  set(
    produce((state: IOverseerState) => {
      state.messageQueue = [];
      state.isQueuePaused = false;
    }),
  );
}

/**
 * Toggle the queue paused state.
 */
export function toggleQueuePaused(this: IStoreApi<IOverseerState>) {
  const { set, get, storeApi } = this;
  const { isQueuePaused, isThinking } = get();

  set(
    produce((state: IOverseerState) => {
      state.isQueuePaused = !isQueuePaused;
    }),
  );

  // If unpausing and not currently thinking, process the next queued message
  if (isQueuePaused && !isThinking) {
    const { messageQueue } = get();
    if (messageQueue.length > 0) {
      setTimeout(() => {
        storeApi.getState().overseer.processQueuedMessage();
      }, 100);
    }
  }
}

/**
 * Send a message to the Overseer agent
 */
export async function sendMessage(this: IStoreApi<IOverseerState>) {
  const { get, set, storeApi } = this;
  const {
    sessionId,
    currentMessage,
    selectedText,
    expandedText,
    pageContext,
    contextType,
    conceptUuid,
    accountUuid,
    activeFeatures,
    pendingImages,
    mentions: storeMentions,
    isThinking,
    messageQueue,
  } = get();

  const identifier = contextType === 'account' ? accountUuid : conceptUuid;
  if (!identifier) {
    telemetry.error(
      `Overseer: No ${contextType === 'account' ? 'account' : 'concept'} UUID`,
    );
    return;
  }

  // --- Queue / cancel-then-send logic ---
  if (isThinking) {
    const hasNewText = currentMessage?.trim();
    const hasNewImages = pendingImages.length > 0;

    if (!hasNewText && !hasNewImages) {
      // Empty input + Enter while thinking: cancel current run and process queue
      if (messageQueue.length > 0) {
        storeApi.getState().overseer.cancelCurrentRun();
        setTimeout(() => {
          storeApi.getState().overseer.processQueuedMessage();
        }, 100);
      }
      return;
    }

    // Has text/images: append to the queue
    set(
      produce((state: IOverseerState) => {
        state.messageQueue = [
          ...state.messageQueue,
          {
            uuid: uuidv4(),
            content: currentMessage,
            images: [...pendingImages],
            mentions: [...storeMentions],
            activeFeatures: new Set(activeFeatures),
          },
        ];
        state.currentMessage = '';
        state.pendingImages = [];
        state.mentions = [];
      }),
    );
    return;
  }

  // --- Normal send (not thinking) ---

  const isInitialMessage = !sessionId;

  if (!currentMessage?.trim() && pendingImages.length === 0) {
    telemetry.debug('Overseer: No message to send');
    return;
  }

  const messageUuid = uuidv4();
  const messageContent = currentMessage?.trim()
    ? currentMessage
    : pendingImages.length > 0
      ? 'Please analyze the attached image(s).'
      : '';

  // Prepend slash command based on active feature toggle (priority: aiEdit > navigate > web > nucleus)
  // The backend parses slash commands from the message content to enable tools
  let effectiveContent = messageContent;
  if (activeFeatures.has('aiEdit')) {
    effectiveContent = `/edit ${messageContent}`;
  } else if (activeFeatures.has('navigate')) {
    effectiveContent = `/navigate ${messageContent}`;
  } else if (activeFeatures.has('web')) {
    effectiveContent = `/web ${messageContent}`;
  } else if (activeFeatures.has('nucleus')) {
    effectiveContent = `/nucleus ${messageContent}`;
  }

  // Convert pending images to IMediaMessage[] for WebSocket and display data
  const imageAttachments =
    pendingImages.length > 0
      ? pendingImages.map((img) => ({
          dataUrl: img.dataUrl,
          filename: img.file.name,
        }))
      : undefined;

  const mediaMessages: IMediaMessage[] | undefined =
    pendingImages.length > 0
      ? pendingImages.map((img) => ({
          mediaData: img.dataUrl,
          mimetype: img.file.type as unknown as Mimetype,
          filename: img.file.name,
        }))
      : undefined;

  // Build mention payload for WebSocket
  const mentionPayload = storeMentions.map((m) => ({
    uuid: m.id,
    name: m.name,
    type: m.type,
  }));

  const userMessage: IOverseerUserMessage = {
    uuid: messageUuid,
    content: messageContent,
    role: 'user',
    timestamp: new Date().toISOString(),
    images: imageAttachments,
  };

  set(
    produce((state: IOverseerState) => {
      state.isThinking = true;
      state.currentMessage = '';

      // Snapshot current edit suggestions as a read-only history message
      if (state.editSuggestions && state.editSuggestions.edits.length > 0) {
        state.messages.push({
          uuid: state.editSuggestions.uuid || uuidv4(),
          role: 'edit_suggestion',
          editSuggestions: { ...state.editSuggestions },
          timestamp: new Date().toISOString(),
        });
      }

      state.messages = [...state.messages, userMessage];
      state.suggestedQuestions = [];
      state.editSuggestions = null;
      state.navigateSuggestion = null;
      state.highlightedSectionId = null;
      state.toolActivitySteps = [];
      state.pendingImages = [];
    }),
  );

  const pageMetadata = buildPageMetadata(pageContext, storeApi);

  if (isInitialMessage) {
    api.aucctusSocket.send({
      type: 'overseer.conversation.start',
      uuid: messageUuid,
      pageContext,
      content: effectiveContent,
      conceptUuid: contextType === 'concept' ? conceptUuid : undefined,
      accountUuid: contextType === 'account' ? accountUuid : undefined,
      selectedText: selectedText,
      expandedText: expandedText,
      images: mediaMessages,
      mentions: mentionPayload.length > 0 ? mentionPayload : undefined,
      pageMetadata,
    } as IOverseerConversationStartMessage);
    telemetry.debug('Overseer: Started conversation', {
      identifier,
      contextType,
    });
  } else {
    api.aucctusSocket.send({
      type: 'overseer.message',
      uuid: messageUuid,
      pageContext,
      content: effectiveContent,
      conceptUuid: contextType === 'concept' ? conceptUuid : undefined,
      accountUuid: contextType === 'account' ? accountUuid : undefined,
      sessionId: sessionId!,
      images: mediaMessages,
      selectedText: selectedText,
      mentions: mentionPayload.length > 0 ? mentionPayload : undefined,
      pageMetadata,
    } as IOverseerOutboundChatMessage);
    telemetry.debug('Overseer: Sent follow-up message', {
      identifier,
      contextType,
    });
  }
}

/**
 * Update the current draft message
 */
export function syncPageContext(
  this: IStoreApi<IOverseerState>,
  pageContext: string,
) {
  const { set } = this;

  set(
    produce((state: IOverseerState) => {
      if (!state.sessionId) {
        state.pageContext = pageContext;
        state.contextType = isAccountLevelPage(pageContext)
          ? 'account'
          : 'concept';
      }
    }),
  );
}

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

  const { pageContext, contextType: ctxType } = get();

  set(
    produce((state: IOverseerState) => {
      state.sessionId = handshake.sessionId;

      // Add a placeholder history item (name will arrive via WebSocket)
      const placeholder: IOverseerConversation = {
        uuid: handshake.sessionId,
        name: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pageContext,
        contextType: ctxType,
      };
      state.historyItems = [placeholder, ...state.historyItems];
    }),
  );
}

/**
 * Add or update an assistant message.
 * Snapshots current toolActivitySteps onto the message and clears them from global state.
 */
export function addAssistantMessage(
  this: IStoreApi<IOverseerState>,
  message: IOverseerAssistantMessage,
) {
  const { set, get, storeApi } = this;
  const { messages, toolActivitySteps } = get();

  // Attach completed tool activity steps to the message
  const messageWithSteps: IOverseerAssistantMessage = {
    ...message,
    toolActivitySteps:
      toolActivitySteps.length > 0 ? toolActivitySteps : undefined,
  };

  const msgs = [...messages];
  const existingMessageIndex = msgs.findIndex(
    (msg) => msg.role === 'assistant' && msg.uuid === message.uuid,
  );

  if (existingMessageIndex !== -1) {
    msgs[existingMessageIndex] = messageWithSteps;
  } else {
    msgs.push(messageWithSteps);
  }

  set(
    produce((state: IOverseerState) => {
      state.messages = msgs;
      state.isThinking = false;
      state.isCancelling = false;
      state.thinkingMessage = undefined;
      // Clear global steps since they're now attached to the message
      state.toolActivitySteps = [];
    }),
  );

  tryProcessNextQueued(get, storeApi);
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
  const { set, get, storeApi } = this;

  set(
    produce((state: IOverseerState) => {
      state.isThinking = false;
      state.isCancelling = false;
      state.thinkingMessage = undefined;
      // Clear tool activity steps — they've been shown during the edit pipeline
      state.toolActivitySteps = [];

      if (suggestions.edits && suggestions.edits.length > 0) {
        state.editSuggestions = suggestions;
        state.highlightedSectionId = suggestions.edits[0].section;
        state.isDocked = true;
      } else if (suggestions.reply) {
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

  tryProcessNextQueued(get, storeApi);
}

/**
 * Clear edit suggestions
 */
export function clearEditSuggestions(this: IStoreApi<IOverseerState>) {
  const { set } = this;

  set(
    produce((state: IOverseerState) => {
      state.editSuggestions = null;
      state.highlightedSectionId = null;
    }),
  );
}

/**
 * Store navigate suggestion from the /navigate command
 */
export function handleNavigateSuggestion(
  this: IStoreApi<IOverseerState>,
  suggestion: IOverseerNavigateSuggestion,
) {
  const { set, get, storeApi } = this;

  set(
    produce((state: IOverseerState) => {
      state.isThinking = false;
      state.isCancelling = false;
      state.thinkingMessage = undefined;
      state.toolActivitySteps = [];
      state.navigateSuggestion = suggestion;
      state.highlightedSectionId = suggestion.sectionId;
      state.isDocked = true;

      // Push the explanation as an assistant message so it persists in the conversation
      const assistantMessage: IOverseerAssistantMessage = {
        uuid: uuidv4(),
        role: 'assistant',
        content: suggestion.explanation,
        timestamp: new Date().toISOString(),
        isNavigateResponse: true,
      };
      state.messages.push(assistantMessage);
    }),
  );

  tryProcessNextQueued(get, storeApi);
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
  const { set, get, storeApi } = this;
  const { conceptUuid } = get();

  telemetry.error('Overseer: Error received', { error, conceptUuid });

  set(
    produce((state: IOverseerState) => {
      state.isThinking = false;
      state.isCancelling = false;
      state.thinkingMessage = undefined;
      state.currentError = error;
      state.hasError = true;
    }),
  );

  tryProcessNextQueued(get, storeApi);
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
      state.navigateSuggestion = null;
      state.highlightedSectionId = null;
      state.isThinking = false;
      state.thinkingMessage = undefined;
      state.currentError = undefined;
      state.hasError = false;
      state.toolActivitySteps = [];
      state.pendingImages = [];
      state.messageQueue = [];
      state.isQueuePaused = false;
      state.isCancelling = false;
    }),
  );
}

/**
 * Set the account context for account-level pages (Nucleus/Watchtower)
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

/**
 * Clear selected text (switch to Q&A / full-context mode)
 */
export function clearSelectedText(this: IStoreApi<IOverseerState>) {
  const { set } = this;

  set(
    produce((state: IOverseerState) => {
      state.selectedText = '';
      state.expandedText = '';
    }),
  );
}

// =============================================================================
// Section Highlight Actions
// =============================================================================

/**
 * Set the highlighted section ID for the overlay
 */
export function setHighlightedSection(
  this: IStoreApi<IOverseerState>,
  sectionId: string | null,
) {
  const { set } = this;

  set(
    produce((state: IOverseerState) => {
      state.highlightedSectionId = sectionId;
    }),
  );
}

// =============================================================================
// Dock Actions
// =============================================================================

/**
 * Set the docked state
 */
export function setDocked(this: IStoreApi<IOverseerState>, value: boolean) {
  const { set } = this;

  set(
    produce((state: IOverseerState) => {
      state.isDocked = value;
    }),
  );
}

// =============================================================================
// Feature Toggle Actions
// =============================================================================

/**
 * Toggle a feature (web search, nucleus, aiEdit)
 */
export function toggleFeature(
  this: IStoreApi<IOverseerState>,
  feature: OverseerFeature,
) {
  const { set, get } = this;
  const { activeFeatures } = get();

  set(
    produce((state: IOverseerState) => {
      const newFeatures = new Set(activeFeatures);
      if (newFeatures.has(feature)) {
        newFeatures.delete(feature);
      } else {
        newFeatures.add(feature);
      }
      state.activeFeatures = newFeatures;
    }),
  );
}

/**
 * Clear all active features
 */
export function clearFeatures(this: IStoreApi<IOverseerState>) {
  const { set } = this;

  set(
    produce((state: IOverseerState) => {
      state.activeFeatures = new Set();
    }),
  );
}

// =============================================================================
// Mention Actions
// =============================================================================

/**
 * Add a mention to the current message
 */
export function addMention(this: IStoreApi<IOverseerState>, item: MentionItem) {
  const { set, get } = this;
  const { mentions } = get();

  // Don't add duplicate mentions
  if (mentions.some((m) => m.id === item.id)) return;

  set(
    produce((state: IOverseerState) => {
      state.mentions = [...state.mentions, item];
    }),
  );
}

/**
 * Remove a mention by id
 */
export function removeMention(this: IStoreApi<IOverseerState>, id: string) {
  const { set, get } = this;
  const { mentions } = get();

  set(
    produce((state: IOverseerState) => {
      state.mentions = mentions.filter((m) => m.id !== id);
    }),
  );
}

// =============================================================================
// History Sidebar Actions
// =============================================================================

/**
 * Toggle the chat history sidebar
 */
export function setShowHistory(
  this: IStoreApi<IOverseerState>,
  value: boolean,
) {
  const { set } = this;

  set(
    produce((state: IOverseerState) => {
      state.showHistory = value;
    }),
  );
}

// =============================================================================
// History Data Actions
// =============================================================================

/**
 * Set history items from API response
 */
export function setHistoryItems(
  this: IStoreApi<IOverseerState>,
  items: IOverseerConversation[],
) {
  const { set } = this;

  set(
    produce((state: IOverseerState) => {
      state.historyItems = items;
    }),
  );
}

/**
 * Set history loading state
 */
export function setHistoryLoading(
  this: IStoreApi<IOverseerState>,
  value: boolean,
) {
  const { set } = this;

  set(
    produce((state: IOverseerState) => {
      state.historyLoading = value;
    }),
  );
}

/**
 * Handle conversation name arriving via WebSocket.
 * Finds the placeholder item by sessionId and updates its name.
 */
export function handleConversationName(
  this: IStoreApi<IOverseerState>,
  params: { sessionId: string; name: string },
) {
  const { set, get } = this;
  const { historyItems } = get();

  const updated = historyItems.map((item) =>
    item.uuid === params.sessionId ? { ...item, name: params.name } : item,
  );

  set(
    produce((state: IOverseerState) => {
      state.historyItems = updated;
    }),
  );
}

/**
 * Load a conversation from the API response into the chat view.
 */
export function loadConversation(
  this: IStoreApi<IOverseerState>,
  conversation: IOverseerConversationDetail,
) {
  const { set } = this;

  set(
    produce((state: IOverseerState) => {
      state.sessionId = conversation.uuid;
      // Don't show the selected text chip for loaded conversations
      state.selectedText = '';
      state.expandedText = '';
      state.pageContext = conversation.pageContext ?? 'overview';
      state.contextType =
        (conversation.contextType as OverseerContextType) ?? 'concept';
      state.conceptUuid = conversation.conceptUuid ?? undefined;
      state.accountUuid = conversation.accountUuid ?? undefined;
      const lastMessageIndex = conversation.messages.length - 1;

      // Accumulates through the map — after iterating all messages, only the
      // most recent navigate suggestion is restored as the active chip.
      let lastNavigateSuggestion: IOverseerNavigateSuggestion | null = null;
      let restoredEditSuggestions: IOverseerEditSuggestions | null = null;
      let restoredHighlightedSectionId: string | null = null;

      state.messages = conversation.messages.flatMap<OverseerMessage>(
        (msg, index) => {
          let content =
            typeof msg.content === 'string'
              ? msg.content
              : JSON.stringify(msg.content);

          // The first user message is stored with internal context prefixes
          // e.g. "[Selected Text]: ...\n[Full Sentence]: ...\n[User Message]: hello"
          // Extract just the actual user message for display.
          if (msg.role === 'user' && content.includes('[User Message]:')) {
            const match = content.match(/\[User Message\]:\s*([\s\S]*)$/);
            if (match) {
              content = match[1].trim();
            }
          }

          // Strip "[User attached N image(s)]" text annotation (images stored in metadata)
          content = content
            .replace(/\n?\[User attached \d+ image\(s\)\]/, '')
            .trim();

          const images =
            msg.role === 'user' && msg.metadata?.images
              ? (msg.metadata.images as Array<{
                  dataUrl: string;
                  filename?: string;
                }>)
              : undefined;

          // Edit suggestions stored as assistant + metadata flag — restore as edit_suggestion role
          // Backend stores as overseer_edit_suggestion, CamelCaseMiddleware converts to overseerEditSuggestion
          if (
            msg.role === 'assistant' &&
            msg.metadata?.overseerEditSuggestion === true
          ) {
            try {
              const parsed =
                typeof msg.content === 'string'
                  ? JSON.parse(msg.content)
                  : msg.content;
              const editSuggestions: IOverseerEditSuggestions = {
                uuid: parsed.uuid,
                reply: parsed.reply,
                edits: Array.isArray(parsed.edits) ? parsed.edits : [],
              };
              const resolution: IOverseerEditSuggestionMessage['resolution'] =
                msg.metadata?.applied === true
                  ? 'applied'
                  : msg.metadata?.declined === true ||
                      msg.metadata?.rejected === true
                    ? 'declined'
                    : undefined;
              const canRestoreAsLiveSuggestion =
                !resolution &&
                index === lastMessageIndex &&
                editSuggestions.edits.length > 0;

              if (canRestoreAsLiveSuggestion) {
                restoredEditSuggestions = editSuggestions;
                restoredHighlightedSectionId = editSuggestions.edits[0].section;
                return [];
              }

              const editResolutions = msg.metadata?.editResolutions as
                | Record<number, 'accepted' | 'rejected'>
                | undefined;
              return [
                {
                  uuid: msg.uuid,
                  role: 'edit_suggestion' as const,
                  editSuggestions,
                  timestamp: msg.createdAt,
                  applied: resolution === 'applied',
                  resolution,
                  editResolutions,
                } as IOverseerEditSuggestionMessage,
              ];
            } catch {
              return [
                {
                  uuid: msg.uuid,
                  content,
                  role: 'assistant' as const,
                  name: msg.name,
                  timestamp: msg.createdAt,
                },
              ];
            }
          }

          // Navigate suggestions stored as assistant + metadata flag — restore NavigateChip state
          if (
            msg.role === 'assistant' &&
            msg.metadata?.overseerNavigateSuggestion === true
          ) {
            let explanation = content;
            let sectionId = msg.metadata?.navigateSectionId as
              | string
              | undefined;
            let sectionName = msg.metadata?.navigateSectionName as
              | string
              | undefined;
            const suggestedQuestions =
              (msg.metadata?.suggestedQuestions as string[]) ?? [];

            // Old format: full JSON stored as content — parse it out
            if (!sectionId) {
              try {
                const parsed =
                  typeof msg.content === 'string'
                    ? JSON.parse(msg.content)
                    : msg.content;
                if (
                  parsed &&
                  typeof parsed === 'object' &&
                  'explanation' in parsed
                ) {
                  explanation = parsed.explanation;
                  sectionId = parsed.sectionId ?? parsed.section_id;
                  sectionName = parsed.sectionName ?? parsed.section_name;
                }
              } catch {
                // Content is already plain text — use as-is
              }
            }

            if (sectionId) {
              lastNavigateSuggestion = {
                explanation,
                sectionId,
                sectionName: sectionName ?? '',
                suggestedQuestions,
              };
            }

            return [
              {
                uuid: msg.uuid,
                content: explanation,
                role: 'assistant' as const,
                name: msg.name,
                timestamp: msg.createdAt,
                isNavigateResponse: true,
              },
            ];
          }

          const sources =
            msg.role === 'assistant' &&
            msg.metadata?.sources &&
            Array.isArray(msg.metadata.sources)
              ? (
                  msg.metadata.sources as Array<{ name: string; url: string }>
                ).filter(
                  (s) =>
                    typeof s === 'object' &&
                    s !== null &&
                    'name' in s &&
                    'url' in s,
                )
              : undefined;

          return [
            {
              uuid: msg.uuid,
              content,
              role: msg.role,
              name: msg.name,
              timestamp: msg.createdAt,
              ...(images && { images }),
              ...(sources && { sources }),
            },
          ];
        },
      );

      state.suggestedQuestions = [];
      state.editSuggestions = restoredEditSuggestions;
      state.navigateSuggestion = lastNavigateSuggestion;
      state.highlightedSectionId = restoredHighlightedSectionId;
      state.isThinking = false;
      state.thinkingMessage = undefined;
      state.currentError = undefined;
      state.hasError = false;
      state.toolActivitySteps = [];
      state.showHistory = false;
      state.messageQueue = [];
      state.isQueuePaused = false;
      state.isCancelling = false;
    }),
  );
}

// =============================================================================
// Image Actions
// =============================================================================

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]);
const MAX_IMAGES = 4;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Add an image to pending attachments
 */
export function addImage(this: IStoreApi<IOverseerState>, file: File) {
  const { set, get } = this;
  const { pendingImages } = get();

  if (pendingImages.length >= MAX_IMAGES) {
    telemetry.debug('Overseer: Maximum images reached');
    return;
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    telemetry.debug('Overseer: Unsupported image type', { type: file.type });
    return;
  }

  if (file.size > MAX_IMAGE_SIZE) {
    telemetry.debug('Overseer: Image too large', { size: file.size });
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result as string;
    const image: IOverseerPendingImage = {
      id: uuidv4(),
      file,
      dataUrl,
    };
    set(
      produce((state: IOverseerState) => {
        state.pendingImages = [...state.pendingImages, image];
      }),
    );
  };
  reader.readAsDataURL(file);
}

/**
 * Remove a pending image by id
 */
export function removeImage(this: IStoreApi<IOverseerState>, id: string) {
  const { set, get } = this;
  const { pendingImages } = get();

  set(
    produce((state: IOverseerState) => {
      state.pendingImages = pendingImages.filter((img) => img.id !== id);
    }),
  );
}

/**
 * Clear all pending images
 */
export function clearImages(this: IStoreApi<IOverseerState>) {
  const { set } = this;

  set(
    produce((state: IOverseerState) => {
      state.pendingImages = [];
    }),
  );
}

// =============================================================================
// Tool Activity Step Actions
// =============================================================================

/**
 * Add a tool activity step. Marks previous active steps as done.
 */
export function addToolActivityStep(
  this: IStoreApi<IOverseerState>,
  activityMessage: string,
  detail?: string,
  icon?: AgentStep['icon'],
) {
  const { set, get } = this;
  const { toolActivitySteps } = get();

  // Use backend icon when provided, fall back to keyword matching
  let resolvedIcon: AgentStep['icon'] = icon ?? 'search';
  if (!icon) {
    const lower = activityMessage.toLowerCase();
    if (lower.includes('web') || lower.includes('browsing')) {
      resolvedIcon = 'search';
    } else if (lower.includes('nucleus') || lower.includes('scan')) {
      resolvedIcon = 'scan';
    } else if (lower.includes('analy')) {
      resolvedIcon = 'analyze';
    } else if (lower.includes('synth') || lower.includes('generat')) {
      resolvedIcon = 'synthesize';
    }
  }

  // Dedup: if a step with the same label already exists, reuse it
  const existingIndex = toolActivitySteps.findIndex(
    (s) => s.label === activityMessage,
  );

  if (existingIndex !== -1) {
    // Reuse existing step: mark all active as done, reset the matched step to active
    const updatedSteps = toolActivitySteps.map((step, i) => {
      if (i === existingIndex) {
        return {
          ...step,
          status: 'active' as const,
          detail,
          icon: resolvedIcon,
        };
      }
      return step.status === 'active'
        ? { ...step, status: 'done' as const }
        : step;
    });

    set(
      produce((state: IOverseerState) => {
        state.toolActivitySteps = updatedSteps;
      }),
    );
    return;
  }

  const newStep: AgentStep = {
    id: uuidv4(),
    label: activityMessage,
    detail,
    status: 'active',
    icon: resolvedIcon,
  };

  // Mark all existing active steps as done
  const updatedSteps = toolActivitySteps.map((step) =>
    step.status === 'active' ? { ...step, status: 'done' as const } : step,
  );

  set(
    produce((state: IOverseerState) => {
      state.toolActivitySteps = [...updatedSteps, newStep];
    }),
  );
}

/**
 * Start synthesis phase (when response arrives but before showing it).
 * Adds a "Synthesizing findings" step as active, marks all prior steps as done.
 */
export function clearToolActivitySteps(this: IStoreApi<IOverseerState>) {
  const { set, get } = this;
  const { toolActivitySteps } = get();

  if (toolActivitySteps.length === 0) return;

  // Mark all existing steps as done
  const doneSteps = toolActivitySteps.map((step) =>
    step.status !== 'done' ? { ...step, status: 'done' as const } : step,
  );

  // Add synthesis step as active (will show spinner for 2 seconds)
  const stepsWithSynthesis: AgentStep[] = [
    ...doneSteps,
    {
      id: uuidv4(),
      label: 'Synthesizing findings',
      status: 'active' as const,
      icon: 'synthesize' as const,
    },
  ];

  set(
    produce((state: IOverseerState) => {
      state.toolActivitySteps = stepsWithSynthesis;
    }),
  );
}

/**
 * Finalize the synthesis step by marking it as done.
 * Called after the 2-second synthesis delay, right before showing the response.
 */
export function finalizeSynthesisStep(this: IStoreApi<IOverseerState>) {
  const { set, get } = this;
  const { toolActivitySteps } = get();

  if (toolActivitySteps.length === 0) return;

  const finalSteps = toolActivitySteps.map((step) =>
    step.status !== 'done' ? { ...step, status: 'done' as const } : step,
  );

  set(
    produce((state: IOverseerState) => {
      state.toolActivitySteps = finalSteps;
    }),
  );
}
