import api from '@libs/api';
import { IAiEditingSuggestion, IConceptReportEdit } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import useStore from '@stores/store';
import { MentionItem, OverseerFeature } from '@stores/overseer/types';
import {
  markConceptSectionsPending,
  useConceptAiEditing,
  useConcepts,
} from '@hooks/query/concepts.hook';
import { useOverseerConversations } from '@hooks/query/overseerHistory.hook';
import { AnimatePresence, motion } from 'framer-motion';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { v4 as uuidv4 } from 'uuid';
import OverseerChat from './OverseerChat';
import OverseerInput from './OverseerInput';
import OverseerSocketWrapper from './OverseerSocketWrapper';
import OverseerSuggestedQuestions from './OverseerSuggestedQuestions';
import {
  ArrowRight,
  ChevronLeft,
  ClockArrowDown,
  Columns3,
  Expand,
  Plus,
  X,
} from 'lucide-react';
import { DynamicIcon } from '@libs/utils/iconMap';

// Panel dimension constants
const DEFAULT_PANEL_WIDTH = 400;
const DOCKED_PANEL_WIDTH = 400;
const COMPACT_PANEL_HEIGHT = 500;
const EXPANDED_PANEL_HEIGHT = 500;
const MIN_PANEL_WIDTH = 320;
const MAX_PANEL_WIDTH = 600;
const MIN_PANEL_HEIGHT = 280;
const MAX_PANEL_HEIGHT = 700;
const VIEWPORT_PADDING = 12;

type ResizeDirection = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';

/**
 * Feature toggle button config
 */
const FEATURE_BUTTONS: {
  key: OverseerFeature;
  label: string;
  icon: string;
}[] = [
  { key: 'web', label: 'Web Search', icon: 'globe' },
  { key: 'nucleus', label: 'Nucleus', icon: 'compass-03' },
  { key: 'aiEdit', label: 'AI Edit', icon: 'edit' },
];

const formatHistoryDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Main Overseer popup component
 * Features dock/undock, feature toggles, chat history (full-panel takeover)
 */
const OverseerPopup: React.FC = () => {
  const isOpen = useStore((state) => state.overseer.isOpen);
  const position = useStore((state) => state.overseer.position);
  const isDocked = useStore((state) => state.overseer.isDocked);
  const selectedText = useStore((state) => state.overseer.selectedText);
  const messages = useStore((state) => state.overseer.messages);
  const suggestedQuestions = useStore(
    (state) => state.overseer.suggestedQuestions,
  );
  const editSuggestions = useStore((state) => state.overseer.editSuggestions);
  const currentMessage = useStore((state) => state.overseer.currentMessage);
  const isThinking = useStore((state) => state.overseer.isThinking);
  const hasError = useStore((state) => state.overseer.hasError);
  const conceptUuid = useStore((state) => state.overseer.conceptUuid);
  const sessionId = useStore((state) => state.overseer.sessionId);
  const activeFeatures = useStore((state) => state.overseer.activeFeatures);
  const mentions = useStore((state) => state.overseer.mentions);
  const showHistory = useStore((state) => state.overseer.showHistory);
  const historyItems = useStore((state) => state.overseer.historyItems);
  const contextType = useStore((state) => state.overseer.contextType);
  const accountUuid = useStore((state) => state.overseer.accountUuid);
  const toolActivitySteps = useStore(
    (state) => state.overseer.toolActivitySteps,
  );

  const close = useStore((state) => state.overseer.close);
  const setCurrentMessage = useStore(
    (state) => state.overseer.setCurrentMessage,
  );
  const sendMessage = useStore((state) => state.overseer.sendMessage);
  const setPosition = useStore((state) => state.overseer.setPosition);
  const clearEditSuggestions = useStore(
    (state) => state.overseer.clearEditSuggestions,
  );
  const setDocked = useStore((state) => state.overseer.setDocked);
  const toggleFeature = useStore((state) => state.overseer.toggleFeature);
  const setShowHistory = useStore((state) => state.overseer.setShowHistory);
  const loadConversation = useStore((state) => state.overseer.loadConversation);
  const addMention = useStore((state) => state.overseer.addMention);
  const removeMention = useStore((state) => state.overseer.removeMention);
  const pendingImages = useStore((state) => state.overseer.pendingImages);
  const addImage = useStore((state) => state.overseer.addImage);
  const removeImage = useStore((state) => state.overseer.removeImage);
  const clearSelectedText = useStore(
    (state) => state.overseer.clearSelectedText,
  );
  const clearConversation = useStore(
    (state) => state.overseer.clearConversation,
  );
  const setHighlightedSection = useStore(
    (state) => state.overseer.setHighlightedSection,
  );

  const queryClient = useQueryClient();
  const { id: conceptIdentifier } = useParams();

  const { mutate: aiEditConcept, isLoading: isApplyingEdits } =
    useConceptAiEditing();

  // Fetch conversation history scoped to current context
  const { data: fetchedHistory, isLoading: historyLoading } =
    useOverseerConversations({
      conceptUuid:
        contextType === 'concept' ? (conceptUuid ?? undefined) : undefined,
      accountUuid:
        contextType === 'account' ? (accountUuid ?? undefined) : undefined,
      enabled: isOpen,
    });

  // Merge React Query data with store placeholders (new conversations not yet in API)
  const mergedHistory = useMemo(() => {
    const apiItems = fetchedHistory ?? [];
    // Keep only placeholders that aren't already in the API response
    const newPlaceholders = historyItems.filter(
      (item) => !apiItems.some((api) => api.uuid === item.uuid),
    );
    return [...newPlaceholders, ...apiItems];
  }, [fetchedHistory, historyItems]);

  // Fetch all non-archived concepts for @mention menu
  const { data: conceptPage } = useConcepts({
    page: 1,
    pageSize: 199,
  });
  const conceptItems: MentionItem[] = useMemo(() => {
    if (!conceptPage?.results) return [];
    return conceptPage.results
      .filter((c) => c.uuid !== conceptUuid) // Exclude current concept
      .map((c) => ({
        id: c.uuid,
        name: c.title,
        type: 'concept' as const,
      }));
  }, [conceptPage?.results, conceptUuid]);

  // Panel sizing state
  const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH);
  const [panelHeight, setPanelHeight] = useState(COMPACT_PANEL_HEIGHT);
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hasAutoExpanded, setHasAutoExpanded] = useState(false);
  const [contentExpanded, setContentExpanded] = useState(true);

  const popupRef = useRef<HTMLDivElement>(null);
  const resizeStartRef = useRef<{
    width: number;
    height: number;
    x: number;
    y: number;
    mouseX: number;
    mouseY: number;
    direction: ResizeDirection;
  } | null>(null);
  const dragStartRef = useRef<{
    x: number;
    y: number;
    mouseX: number;
    mouseY: number;
  } | null>(null);

  const prevSelectedTextRef = useRef(selectedText);

  // Reset panel when selected text changes
  useEffect(() => {
    if (prevSelectedTextRef.current !== selectedText) {
      setPanelWidth(DEFAULT_PANEL_WIDTH);
      setPanelHeight(COMPACT_PANEL_HEIGHT);
      setHasAutoExpanded(false);
      setContentExpanded(true);
      prevSelectedTextRef.current = selectedText;
    }
  }, [selectedText]);

  // Clamp position to viewport bounds (only in floating mode)
  useEffect(() => {
    if (!isOpen || isDocked) return;

    const clampToViewport = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const maxX = viewportWidth - panelWidth - VIEWPORT_PADDING;
      const maxY = viewportHeight - panelHeight - VIEWPORT_PADDING;

      const clampedX = Math.max(VIEWPORT_PADDING, Math.min(position.x, maxX));
      const clampedY = Math.max(VIEWPORT_PADDING, Math.min(position.y, maxY));

      if (clampedX !== position.x || clampedY !== position.y) {
        setPosition({ x: clampedX, y: clampedY });
      }
    };

    clampToViewport();
    window.addEventListener('resize', clampToViewport);
    return () => window.removeEventListener('resize', clampToViewport);
  }, [
    isOpen,
    isDocked,
    position.x,
    position.y,
    panelWidth,
    panelHeight,
    setPosition,
  ]);

  // Auto-expand panel when first AI response arrives
  useEffect(() => {
    if (messages.length > 0 && !hasAutoExpanded && !isResizing && !isDocked) {
      const viewportHeight = window.innerHeight;
      const newHeight = EXPANDED_PANEL_HEIGHT;

      const newY = Math.min(
        position.y,
        viewportHeight - newHeight - VIEWPORT_PADDING,
      );

      if (newY !== position.y) {
        setPosition({ x: position.x, y: Math.max(VIEWPORT_PADDING, newY) });
      }

      setPanelHeight(newHeight);
      setHasAutoExpanded(true);
    }
  }, [
    messages.length,
    hasAutoExpanded,
    isResizing,
    isDocked,
    position.x,
    position.y,
    setPosition,
  ]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        close();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown, true);
    };
  }, [isOpen, close]);

  // Handle suggested question click
  const handleQuestionClick = useCallback(
    (question: string) => {
      setCurrentMessage(question);
      setTimeout(() => sendMessage(), 50);
    },
    [setCurrentMessage, sendMessage],
  );

  const handleConfirmEdits = useCallback(
    (selectedEdits: IAiEditingSuggestion[]) => {
      if (!editSuggestions || !conceptUuid || !sessionId || isApplyingEdits)
        return;

      const payload: IConceptReportEdit = {
        ...editSuggestions,
        edits: selectedEdits,
        uuid: editSuggestions.uuid || uuidv4(),
      } as IConceptReportEdit;

      aiEditConcept(
        {
          concept_uuid: conceptUuid,
          session_id: sessionId,
          edit: payload,
        },
        {
          onSuccess: () => {
            // Mark affected sections as pending → triggers skeleton loading
            if (conceptIdentifier) {
              const sectionKeys = selectedEdits.map((e) => e.section);
              markConceptSectionsPending(
                queryClient,
                conceptIdentifier,
                sectionKeys,
              );
            }

            setHighlightedSection(null);
            clearEditSuggestions();
            useStore.getState().overseer.addAssistantMessage({
              uuid: uuidv4(),
              role: 'assistant',
              content:
                'Great! I have started applying those edits for you. You will see the changes reflected in the report shortly.',
              name: 'assistant',
              timestamp: new Date().toISOString(),
            });
          },
        },
      );
    },
    [
      editSuggestions,
      conceptUuid,
      sessionId,
      isApplyingEdits,
      clearEditSuggestions,
      setHighlightedSection,
      aiEditConcept,
      queryClient,
      conceptIdentifier,
    ],
  );

  const handleActiveEditChange = useCallback(
    (edit: IAiEditingSuggestion) => {
      setHighlightedSection(edit.section);
    },
    [setHighlightedSection],
  );

  const handleCancelEdits = useCallback(() => {
    setHighlightedSection(null);
    clearEditSuggestions();
  }, [clearEditSuggestions, setHighlightedSection]);

  const handleSubmitMessage = useCallback(() => {
    sendMessage();
  }, [sendMessage]);

  const hasEditSuggestions = (editSuggestions?.edits?.length ?? 0) > 0;

  // Drag handlers
  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      if (isDocked) return;
      e.preventDefault();
      setIsDragging(true);
      dragStartRef.current = {
        x: position.x,
        y: position.y,
        mouseX: e.clientX,
        mouseY: e.clientY,
      };
    },
    [isDocked, position.x, position.y],
  );

  useEffect(() => {
    if (!isDragging || !dragStartRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current) return;
      const { x, y, mouseX, mouseY } = dragStartRef.current;
      const deltaX = e.clientX - mouseX;
      const deltaY = e.clientY - mouseY;

      let newX = x + deltaX;
      let newY = y + deltaY;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const maxX = viewportWidth - panelWidth - VIEWPORT_PADDING;
      const maxY = viewportHeight - panelHeight - VIEWPORT_PADDING;

      newX = Math.max(VIEWPORT_PADDING, Math.min(newX, maxX));
      newY = Math.max(VIEWPORT_PADDING, Math.min(newY, maxY));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, setPosition, panelWidth, panelHeight]);

  // Resize handlers (only in floating mode)
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, direction: ResizeDirection) => {
      if (isDocked) return;
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      resizeStartRef.current = {
        width: panelWidth,
        height: panelHeight,
        x: position.x,
        y: position.y,
        mouseX: e.clientX,
        mouseY: e.clientY,
        direction,
      };
    },
    [isDocked, panelWidth, panelHeight, position.x, position.y],
  );

  useEffect(() => {
    if (!isResizing || !resizeStartRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeStartRef.current) return;

      const { direction, width, height, x, y, mouseX, mouseY } =
        resizeStartRef.current;
      const deltaX = e.clientX - mouseX;
      const deltaY = e.clientY - mouseY;

      let newWidth = width;
      let newHeight = height;
      let newX = x;
      let newY = y;

      if (direction.includes('e')) {
        newWidth = Math.min(
          Math.max(width + deltaX, MIN_PANEL_WIDTH),
          MAX_PANEL_WIDTH,
        );
      } else if (direction.includes('w')) {
        const widthDelta =
          Math.min(Math.max(width - deltaX, MIN_PANEL_WIDTH), MAX_PANEL_WIDTH) -
          width;
        newWidth = width + widthDelta;
        newX = x - widthDelta;
      }

      if (direction.includes('s')) {
        newHeight = Math.min(
          Math.max(height + deltaY, MIN_PANEL_HEIGHT),
          MAX_PANEL_HEIGHT,
        );
      } else if (direction.includes('n')) {
        const heightDelta =
          Math.min(
            Math.max(height - deltaY, MIN_PANEL_HEIGHT),
            MAX_PANEL_HEIGHT,
          ) - height;
        newHeight = height + heightDelta;
        newY = y - heightDelta;
      }

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      newX = Math.max(VIEWPORT_PADDING, newX);
      newY = Math.max(VIEWPORT_PADDING, newY);

      if (newX + newWidth > viewportWidth - VIEWPORT_PADDING) {
        newWidth = viewportWidth - newX - VIEWPORT_PADDING;
        newWidth = Math.max(newWidth, MIN_PANEL_WIDTH);
      }

      if (newY + newHeight > viewportHeight - VIEWPORT_PADDING) {
        newHeight = viewportHeight - newY - VIEWPORT_PADDING;
        newHeight = Math.max(newHeight, MIN_PANEL_HEIGHT);
      }

      setPanelWidth(newWidth);
      setPanelHeight(newHeight);
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      resizeStartRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, setPosition]);

  // Clamp to viewport helper for undock repositioning
  const clampToViewport = useCallback(
    (x: number, y: number) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      return {
        x: Math.max(
          VIEWPORT_PADDING,
          Math.min(x, vw - panelWidth - VIEWPORT_PADDING),
        ),
        y: Math.max(
          VIEWPORT_PADDING,
          Math.min(y, vh - panelHeight - VIEWPORT_PADDING),
        ),
      };
    },
    [panelWidth, panelHeight],
  );

  // Group history items by date
  const groupedHistory = useMemo(() => {
    const grouped: Record<
      string,
      { uuid: string; name: string | null; createdAt: string }[]
    > = {};
    for (const item of mergedHistory) {
      const label = formatHistoryDate(item.createdAt);
      if (!grouped[label]) grouped[label] = [];
      grouped[label].push(item);
    }
    return grouped;
  }, [mergedHistory]);

  if (!isOpen) return null;

  const popupContent = (
    <>
      <OverseerSocketWrapper />

      <AnimatePresence>
        <motion.div
          ref={popupRef}
          data-overseer-root='true'
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{
            duration: 0.2,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={cn(
            'fixed z-[9999]',
            isDocked ? 'right-0 top-0 h-full rounded-none' : '',
          )}
          style={
            isDocked
              ? { width: DOCKED_PANEL_WIDTH }
              : {
                  left: position.x,
                  top: position.y,
                  width: panelWidth,
                  height: panelHeight,
                }
          }
        >
          {/* Resize handles (only when floating) */}
          {!isDocked && (
            <>
              <div
                onMouseDown={(e) => handleResizeStart(e, 'w')}
                className='absolute bottom-2 left-0 top-2 z-20 w-1.5 cursor-ew-resize rounded-full transition-colors hover:bg-white/10'
              />
              <div
                onMouseDown={(e) => handleResizeStart(e, 'e')}
                className='absolute bottom-2 right-0 top-2 z-20 w-1.5 cursor-ew-resize rounded-full transition-colors hover:bg-white/10'
              />
              <div
                onMouseDown={(e) => handleResizeStart(e, 'n')}
                className='absolute left-2 right-2 top-0 z-20 h-1.5 cursor-ns-resize rounded-full transition-colors hover:bg-white/10'
              />
              <div
                onMouseDown={(e) => handleResizeStart(e, 's')}
                className='absolute bottom-0 left-2 right-2 z-20 h-1.5 cursor-ns-resize rounded-full transition-colors hover:bg-white/10'
              />
              <div
                onMouseDown={(e) => handleResizeStart(e, 'nw')}
                className='absolute left-0 top-0 z-30 h-3 w-3 cursor-nwse-resize'
              />
              <div
                onMouseDown={(e) => handleResizeStart(e, 'ne')}
                className='absolute right-0 top-0 z-30 h-3 w-3 cursor-nesw-resize'
              />
              <div
                onMouseDown={(e) => handleResizeStart(e, 'sw')}
                className='absolute bottom-0 left-0 z-30 h-3 w-3 cursor-nesw-resize'
              />
              <div
                onMouseDown={(e) => handleResizeStart(e, 'se')}
                className='absolute bottom-0 right-0 z-30 h-3 w-3 cursor-nwse-resize'
              />
            </>
          )}

          {/* Glass Shell — rim area is draggable */}
          <div
            className={cn(
              'liquid-glass-modal-shell h-full',
              isDocked && 'rounded-none',
              !isDocked && 'cursor-grab active:cursor-grabbing',
            )}
            onMouseDown={handleDragStart}
          >
            {/* Animated Overseer Rim with floating gradient orbs */}
            <div
              className={cn(
                'liquid-glass-modal-rim liquid-glass-modal-rim-overseer',
                isDocked && 'rounded-none',
              )}
              aria-hidden='true'
            >
              <div className='overseer-rim-orb overseer-rim-orb-1' />
              <div className='overseer-rim-orb overseer-rim-orb-2' />
            </div>

            {/* Dark gradient surface — stop propagation so clicks inside don't trigger shell drag */}
            <div
              className={cn(
                'overseer-panel-surface h-full',
                isDocked && '!rounded-none',
              )}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className='relative z-10 flex h-full flex-col overflow-hidden'>
                {showHistory ? (
                  /* ======== History full-panel takeover (Lovable pattern) ======== */
                  <div
                    className='flex flex-1 flex-col overflow-hidden'
                    style={{ background: 'rgba(18,18,18,0.95)' }}
                  >
                    {/* History header */}
                    <div
                      className='flex items-center justify-between px-3 py-1.5'
                      style={{ background: 'rgba(255,255,255,0.04)' }}
                    >
                      <button
                        onClick={() => setShowHistory(false)}
                        className='rounded-lg p-1.5 text-white/30 transition-all hover:bg-white/10 hover:text-white'
                        title='Back to chat'
                      >
                        <ChevronLeft size={14} className='stroke-current' />
                      </button>
                      <div
                        className={cn(
                          'h-3 flex-1',
                          !isDocked && 'cursor-grab active:cursor-grabbing',
                        )}
                        onMouseDown={handleDragStart}
                      />
                      <div className='flex items-center'>
                        {isDocked ? (
                          <button
                            onClick={() => {
                              setDocked(false);
                              const pos = clampToViewport(
                                window.innerWidth - DEFAULT_PANEL_WIDTH - 40,
                                40,
                              );
                              setPosition(pos);
                            }}
                            className='rounded-lg p-1.5 text-white/30 transition-all hover:bg-white/10 hover:text-white'
                            title='Undock panel'
                          >
                            <Expand size={14} className='stroke-current' />
                          </button>
                        ) : (
                          <button
                            onClick={() => setDocked(true)}
                            className='rounded-lg p-1.5 text-white/30 transition-all hover:bg-white/10 hover:text-white'
                            title='Anchor to side panel'
                          >
                            <Columns3 size={14} className='stroke-current' />
                          </button>
                        )}
                        <button
                          onClick={close}
                          className='rounded-lg p-1.5 text-white/30 transition-all hover:bg-white/10 hover:text-white'
                          title='Close panel'
                        >
                          <X size={14} className='stroke-current' />
                        </button>
                      </div>
                    </div>

                    {/* History list */}
                    <div className='flex-1 overflow-y-auto px-2 py-2'>
                      {historyLoading && mergedHistory.length === 0 ? (
                        /* Loading skeleton */
                        <div className='space-y-2 px-3 py-2'>
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className='h-5 animate-pulse rounded bg-white/[0.06]'
                            />
                          ))}
                        </div>
                      ) : Object.keys(groupedHistory).length === 0 ? (
                        <div className='px-3 py-6 text-center text-[11px] text-white/20'>
                          No conversations yet
                        </div>
                      ) : (
                        Object.entries(groupedHistory).map(
                          ([dateLabel, chats], groupIdx) => (
                            <div key={dateLabel}>
                              {groupIdx > 0 && (
                                <div className='mx-2 my-2 border-t border-white/[0.06]' />
                              )}
                              <div className='mb-1 px-3 pt-1 text-[10px] font-medium uppercase tracking-widest text-white/20'>
                                {dateLabel}
                              </div>
                              {chats.map((chat, chatIdx) => (
                                <div key={chat.uuid}>
                                  {chatIdx > 0 && (
                                    <div className='mx-3 border-t border-white/[0.04]' />
                                  )}
                                  <button
                                    onClick={async () => {
                                      try {
                                        const detail =
                                          await api.overseer.getConversation(
                                            chat.uuid,
                                          );
                                        loadConversation(detail);
                                      } catch {
                                        setShowHistory(false);
                                      }
                                    }}
                                    className='w-full truncate px-3 py-2.5 text-left text-[12px] font-light text-white/50 transition-all duration-200 hover:bg-white/[0.05] hover:text-white/85'
                                  >
                                    {chat.name === null ? (
                                      <span className='inline-flex items-center gap-1 text-white/30'>
                                        <span className='inline-block h-1 w-1 animate-pulse rounded-full bg-white/40' />
                                        <span className='inline-block h-1 w-1 animate-pulse rounded-full bg-white/40 [animation-delay:0.2s]' />
                                        <span className='inline-block h-1 w-1 animate-pulse rounded-full bg-white/40 [animation-delay:0.4s]' />
                                      </span>
                                    ) : (
                                      chat.name
                                    )}
                                  </button>
                                </div>
                              ))}
                            </div>
                          ),
                        )
                      )}
                    </div>
                  </div>
                ) : (
                  /* ======== Main chat view ======== */
                  <>
                    {/* Header — matches Lovable: history (left), drag area (center), dock (right) */}
                    <div className='flex items-center justify-between px-3 py-1.5'>
                      <div className='flex items-center'>
                        <button
                          onClick={() => setShowHistory(true)}
                          className='rounded-lg p-1.5 text-white/30 transition-all hover:bg-white/10 hover:text-white'
                          title='Chat history'
                        >
                          <ClockArrowDown
                            size={14}
                            className='stroke-current'
                          />
                        </button>
                        {messages.length > 0 && (
                          <button
                            onClick={clearConversation}
                            className='rounded-lg p-1.5 text-white/30 transition-all hover:bg-white/10 hover:text-white'
                            title='New chat'
                          >
                            <Plus size={14} className='stroke-current' />
                          </button>
                        )}
                      </div>

                      {/* Drag handle area — invisible, full width */}
                      <div
                        className={cn(
                          'h-3 flex-1',
                          !isDocked && 'cursor-grab active:cursor-grabbing',
                        )}
                        onMouseDown={handleDragStart}
                      />

                      <div className='flex items-center'>
                        {isDocked ? (
                          <button
                            onClick={() => {
                              setDocked(false);
                              const pos = clampToViewport(
                                window.innerWidth - DEFAULT_PANEL_WIDTH - 40,
                                40,
                              );
                              setPosition(pos);
                            }}
                            className='rounded-lg p-1.5 text-white/30 transition-all hover:bg-white/10 hover:text-white'
                            title='Undock panel'
                          >
                            <Expand size={14} className='stroke-current' />
                          </button>
                        ) : (
                          <button
                            onClick={() => setDocked(true)}
                            className='rounded-lg p-1.5 text-white/30 transition-all hover:bg-white/10 hover:text-white'
                            title='Anchor to side panel'
                          >
                            <Columns3 size={14} className='stroke-current' />
                          </button>
                        )}
                        <button
                          onClick={close}
                          className='rounded-lg p-1.5 text-white/30 transition-all hover:bg-white/10 hover:text-white'
                          title='Close panel'
                        >
                          <X size={14} className='stroke-current' />
                        </button>
                      </div>
                    </div>

                    {/* Messages */}
                    <OverseerChat
                      messages={messages}
                      className='min-h-[120px] flex-1'
                      editSuggestions={editSuggestions}
                      onConfirmEdits={handleConfirmEdits}
                      onCancelEdits={handleCancelEdits}
                      isApplyingEdits={isApplyingEdits}
                      isThinking={isThinking}
                      toolActivitySteps={toolActivitySteps}
                      onActiveEditChange={handleActiveEditChange}
                    />

                    {/* Follow-up suggestions */}
                    <OverseerSuggestedQuestions
                      questions={suggestedQuestions}
                      onQuestionClick={handleQuestionClick}
                      disabled={isThinking && !hasEditSuggestions}
                    />

                    {/* Referenced text chip (above input) — Lovable blue style */}
                    {selectedText &&
                      selectedText.trim().length > 0 &&
                      contentExpanded && (
                        <div className='px-4 pt-2'>
                          <div className='flex items-center gap-2 rounded-lg border border-blue-400/25 bg-blue-500/10 px-2.5 py-2'>
                            <ArrowRight
                              size={12}
                              className='shrink-0 stroke-white/60'
                            />
                            <p className='min-w-0 flex-1 truncate text-[11px] text-white/70'>
                              {selectedText}
                            </p>
                            <button
                              onClick={() => {
                                setContentExpanded(false);
                                clearSelectedText();
                              }}
                              className='shrink-0 rounded p-0.5 text-white/30 transition-all hover:bg-white/10 hover:text-white'
                            >
                              <X size={12} className='stroke-current' />
                            </button>
                          </div>
                        </div>
                      )}

                    {/* Input area with mention menu */}
                    <OverseerInput
                      value={currentMessage}
                      onChange={setCurrentMessage}
                      onSubmit={handleSubmitMessage}
                      disabled={isThinking && !hasEditSuggestions}
                      mentions={mentions}
                      onMentionSelect={addMention}
                      onMentionRemove={removeMention}
                      pendingImages={pendingImages}
                      onImageAdd={addImage}
                      onImageRemove={removeImage}
                      conceptItems={conceptItems}
                    />

                    {/* Feature toggle buttons (no border-t — matches Lovable) */}
                    <div className='flex items-center gap-1.5 px-4 py-2'>
                      {FEATURE_BUTTONS.map((feat) => (
                        <button
                          key={feat.key}
                          onClick={() => toggleFeature(feat.key)}
                          className={cn(
                            'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors',
                            activeFeatures.has(feat.key)
                              ? 'border-blue-400/40 bg-blue-500/20 text-blue-300'
                              : 'border-white/10 text-white/40 hover:bg-white/[0.08] hover:text-white/80',
                          )}
                          title={feat.label}
                        >
                          <DynamicIcon
                            variant={feat.icon as 'globe'}
                            width={12}
                            height={12}
                            className='stroke-current'
                          />
                          <span>{feat.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Error display */}
                    {hasError && (
                      <div className='border-t border-red-500/30 bg-red-900/20 px-4 py-2'>
                        <p className='text-xs text-red-400'>
                          Something went wrong. Please try again.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );

  return createPortal(popupContent, document.body);
};

export default OverseerPopup;
