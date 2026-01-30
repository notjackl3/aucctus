import images from '@assets/img';
import useStore from '@stores/store';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import CustomCommandCreationFlow from './CustomCommandCreationFlow';
import ManageCustomCommandsFlow from './ManageCustomCommandsFlow';
import OverseerChat from './OverseerChat';
import OverseerHeader from './OverseerHeader';
import OverseerInput from './OverseerInput';
import OverseerSelectedContent from './OverseerSelectedContent';
import OverseerSocketWrapper from './OverseerSocketWrapper';
import OverseerSuggestedQuestions from './OverseerSuggestedQuestions';
import { generateHelpText, parseSlashCommand } from './slashCommands';
import { IAiEditingSuggestion, IConceptReportEdit } from '@libs/api/types';
import { v4 as uuidv4 } from 'uuid';
import { useConceptAiEditing } from '@hooks/query/concepts.hook';

// Animation keyframes for the moving background
const ANIMATION_STYLES = `
  @keyframes overseerFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes overseerMoveBackground {
    0% { background-position: 0% 0%; }
    50% { background-position: 60% 100%; }
    100% { background-position: 0% 0%; }
  }
`;

// Panel dimension constants
const DEFAULT_PANEL_WIDTH = 420;
const COMPACT_PANEL_HEIGHT = 500;
const EXPANDED_PANEL_HEIGHT = 500;
const MIN_PANEL_WIDTH = 320;
const MAX_PANEL_WIDTH = 600;
const MIN_PANEL_HEIGHT = 280;
const MAX_PANEL_HEIGHT = 700;
const VIEWPORT_PADDING = 12;

type ResizeDirection = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';

/**
 * Main Overseer popup component
 * Renders as a portal to ensure proper positioning and z-index
 * Features animated background, resize handles, and frosted glass effects
 */
const OverseerPopup: React.FC = () => {
  const isOpen = useStore((state) => state.overseer.isOpen);
  const position = useStore((state) => state.overseer.position);
  const selectedText = useStore((state) => state.overseer.selectedText);
  const expandedText = useStore((state) => state.overseer.expandedText);
  const messages = useStore((state) => state.overseer.messages);
  const suggestedQuestions = useStore(
    (state) => state.overseer.suggestedQuestions,
  );
  const editSuggestions = useStore((state) => state.overseer.editSuggestions);
  const currentMessage = useStore((state) => state.overseer.currentMessage);
  const isThinking = useStore((state) => state.overseer.isThinking);
  const thinkingMessage = useStore((state) => state.overseer.thinkingMessage);
  const hasError = useStore((state) => state.overseer.hasError);
  const conceptUuid = useStore((state) => state.overseer.conceptUuid);
  const sessionId = useStore((state) => state.overseer.sessionId);

  const close = useStore((state) => state.overseer.close);
  const setCurrentMessage = useStore(
    (state) => state.overseer.setCurrentMessage,
  );
  const sendMessage = useStore((state) => state.overseer.sendMessage);
  const setPosition = useStore((state) => state.overseer.setPosition);
  const clearEditSuggestions = useStore(
    (state) => state.overseer.clearEditSuggestions,
  );
  const { mutate: aiEditConcept } = useConceptAiEditing();

  // Custom command flow state and actions
  const customCommandFlow = useStore(
    (state) => state.overseer.customCommandFlow,
  );
  const customCommandManagementFlow = useStore(
    (state) => state.overseer.customCommandManagementFlow,
  );
  const submitCustomCommandStep = useStore(
    (state) => state.overseer.submitCustomCommandStep,
  );
  const goBackCustomCommandStep = useStore(
    (state) => state.overseer.goBackCustomCommandStep,
  );
  const cancelCustomCommandFlow = useStore(
    (state) => state.overseer.cancelCustomCommandFlow,
  );
  const cancelManageCustomCommandsFlow = useStore(
    (state) => state.overseer.cancelManageCustomCommandsFlow,
  );
  const toggleCustomCommandTool = useStore(
    (state) => state.overseer.toggleCustomCommandTool,
  );
  const confirmCustomCommand = useStore(
    (state) => state.overseer.confirmCustomCommand,
  );
  const editCustomCommandField = useStore(
    (state) => state.overseer.editCustomCommandField,
  );
  const startCustomCommandFlow = useStore(
    (state) => state.overseer.startCustomCommandFlow,
  );

  // Panel sizing state
  const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH);
  const [panelHeight, setPanelHeight] = useState(COMPACT_PANEL_HEIGHT);
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hasAutoExpanded, setHasAutoExpanded] = useState(false);

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

  // Track previous selected text to detect new selections
  const prevSelectedTextRef = useRef(selectedText);

  // Reset panel when selected text changes
  useEffect(() => {
    if (prevSelectedTextRef.current !== selectedText) {
      setPanelWidth(DEFAULT_PANEL_WIDTH);
      setPanelHeight(COMPACT_PANEL_HEIGHT);
      setHasAutoExpanded(false);
      prevSelectedTextRef.current = selectedText;
    }
  }, [selectedText]);

  // Clamp position to viewport bounds - NEVER allow popup to escape
  useEffect(() => {
    if (!isOpen) return;

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

    // Clamp on mount and when dimensions change
    clampToViewport();

    // Also clamp on window resize
    window.addEventListener('resize', clampToViewport);
    return () => window.removeEventListener('resize', clampToViewport);
  }, [isOpen, position.x, position.y, panelWidth, panelHeight, setPosition]);

  // Auto-expand panel when first AI response arrives
  useEffect(() => {
    if (messages.length > 0 && !hasAutoExpanded && !isResizing) {
      const viewportHeight = window.innerHeight;
      const newHeight = EXPANDED_PANEL_HEIGHT;

      // Ensure panel stays within viewport
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
    position.x,
    position.y,
    setPosition,
  ]);

  // Handle click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Don't close if clicking inside the popup
      if (popupRef.current?.contains(target)) {
        return;
      }

      // Don't close if clicking on a text selection
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) {
        return;
      }

      close();
    };

    // Small delay to prevent immediate close after opening
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, close]);

  // Global keyboard event listener for Escape key
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
      // Small delay to update state before sending
      setTimeout(() => {
        sendMessage();
      }, 50);
    },
    [setCurrentMessage, sendMessage],
  );

  const handleConfirmEdits = useCallback(
    (selectedEdits: IAiEditingSuggestion[]) => {
      if (!editSuggestions || !conceptUuid || !sessionId) return;

      const payload: IConceptReportEdit = {
        ...editSuggestions,
        edits: selectedEdits,
        uuid: editSuggestions.uuid || uuidv4(),
      } as IConceptReportEdit;

      // Call the API directly
      aiEditConcept(
        {
          concept_uuid: conceptUuid,
          session_id: sessionId,
          edit: payload,
        },
        {
          onSuccess: () => {
            clearEditSuggestions();
            // Add a confirmation message to the chat
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
      clearEditSuggestions,
      aiEditConcept,
    ],
  );

  const handleCancelEdits = useCallback(() => {
    clearEditSuggestions();
  }, [clearEditSuggestions]);

  const handleStartCreateFromManage = useCallback(() => {
    cancelManageCustomCommandsFlow();
    startCustomCommandFlow();
  }, [cancelManageCustomCommandsFlow, startCustomCommandFlow]);

  const handleSubmitMessage = useCallback(() => {
    const [command] = parseSlashCommand(currentMessage, {
      matchPosition: 'any',
    });
    if (command?.frontendOnly && command.command === '/help') {
      const helpText = generateHelpText();
      useStore.getState().overseer.addAssistantMessage({
        uuid: uuidv4(),
        role: 'assistant',
        content: helpText,
        name: 'assistant',
        timestamp: new Date().toISOString(),
      });
      setCurrentMessage('');
      return;
    }

    sendMessage();
  }, [currentMessage, sendMessage, setCurrentMessage]);

  // Drag handlers
  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      dragStartRef.current = {
        x: position.x,
        y: position.y,
        mouseX: e.clientX,
        mouseY: e.clientY,
      };
    },
    [position.x, position.y],
  );

  useEffect(() => {
    if (!isDragging || !dragStartRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current) return;
      const { x, y, mouseX, mouseY } = dragStartRef.current;
      const deltaX = e.clientX - mouseX;
      const deltaY = e.clientY - mouseY;

      // Calculate new position
      let newX = x + deltaX;
      let newY = y + deltaY;

      // Clamp to viewport bounds during drag
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

  // Resize handlers
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, direction: ResizeDirection) => {
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
    [panelWidth, panelHeight, position.x, position.y],
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

      // Handle horizontal resizing
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

      // Handle vertical resizing
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

      // Ensure panel stays within viewport
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

  if (!isOpen) return null;

  const popupContent = (
    <>
      {/* Socket wrapper for handling events */}
      <OverseerSocketWrapper />

      {/* Animation styles */}
      <style>{ANIMATION_STYLES}</style>

      <AnimatePresence>
        <motion.div
          ref={popupRef}
          data-overseer-root='true'
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            height: panelHeight,
          }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{
            duration: 0.2,
            ease: [0.22, 1, 0.36, 1],
            height: { duration: 0.3, ease: 'easeOut' },
          }}
          className='fixed z-[9999]'
          style={{
            left: position.x,
            top: position.y,
            width: panelWidth,
          }}
        >
          {/* Card container with animated background - matches Watchtower/IdeaPlayground */}
          <div
            className='relative flex h-full flex-col overflow-hidden rounded-xl shadow-2xl'
            style={{
              backgroundColor: '#1a1a1a',
              backgroundImage: `url(${images.nucleusBrandGradient})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              animation:
                'overseerFadeIn 0.5s ease-in-out forwards, overseerMoveBackground 40s ease infinite',
            }}
          >
            {/* Header */}
            <OverseerHeader
              onClose={
                customCommandFlow.isActive
                  ? cancelCustomCommandFlow
                  : customCommandManagementFlow.isActive
                    ? cancelManageCustomCommandsFlow
                    : close
              }
              onDragStart={handleDragStart}
            />

            {/* Custom Command Creation Flow */}
            {customCommandManagementFlow.isActive ? (
              <ManageCustomCommandsFlow
                onCancel={cancelManageCustomCommandsFlow}
                onCreate={handleStartCreateFromManage}
              />
            ) : customCommandFlow.isActive ? (
              <CustomCommandCreationFlow
                flow={customCommandFlow}
                currentMessage={currentMessage}
                onMessageChange={setCurrentMessage}
                onSubmitStep={submitCustomCommandStep}
                onGoBack={goBackCustomCommandStep}
                onCancel={cancelCustomCommandFlow}
                onToggleTool={toggleCustomCommandTool}
                onConfirm={confirmCustomCommand}
                onEditField={editCustomCommandField}
              />
            ) : (
              <>
                {/* Selected content */}
                <OverseerSelectedContent
                  selectedText={selectedText}
                  expandedText={expandedText}
                />

                {/* Chat area */}
                <OverseerChat
                  messages={messages}
                  isThinking={isThinking}
                  thinkingMessage={thinkingMessage}
                  className='min-h-[150px] flex-1'
                  editSuggestions={editSuggestions}
                  onConfirmEdits={handleConfirmEdits}
                  onCancelEdits={handleCancelEdits}
                />

                {/* Suggested questions */}
                <OverseerSuggestedQuestions
                  questions={suggestedQuestions}
                  onQuestionClick={handleQuestionClick}
                  disabled={
                    isThinking && !((editSuggestions?.edits?.length ?? 0) > 0)
                  }
                />

                {/* Input - only show after initial loading completes or if there's no thinking */}
                {(messages.length > 0 ||
                  !isThinking ||
                  (editSuggestions?.edits?.length ?? 0) > 0) && (
                  <OverseerInput
                    value={currentMessage}
                    onChange={setCurrentMessage}
                    onSubmit={handleSubmitMessage}
                    onClose={close}
                    disabled={
                      isThinking && !((editSuggestions?.edits?.length ?? 0) > 0)
                    }
                    hasSelection={!!selectedText}
                  />
                )}

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

            {/* Corner resize handles */}
            <div
              className='absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize'
              onMouseDown={(e) => handleResizeStart(e, 'se')}
              style={{ touchAction: 'none' }}
            />
            <div
              className='absolute left-0 top-0 h-4 w-4 cursor-nwse-resize'
              onMouseDown={(e) => handleResizeStart(e, 'nw')}
              style={{ touchAction: 'none' }}
            />
            <div
              className='absolute right-0 top-0 h-4 w-4 cursor-nesw-resize'
              onMouseDown={(e) => handleResizeStart(e, 'ne')}
              style={{ touchAction: 'none' }}
            />
            <div
              className='absolute bottom-0 left-0 h-4 w-4 cursor-nesw-resize'
              onMouseDown={(e) => handleResizeStart(e, 'sw')}
              style={{ touchAction: 'none' }}
            />

            {/* Edge resize handles */}
            <div
              className='absolute left-4 right-4 top-0 h-2 cursor-ns-resize'
              onMouseDown={(e) => handleResizeStart(e, 'n')}
              style={{ touchAction: 'none' }}
            />
            <div
              className='absolute bottom-0 left-4 right-4 h-2 cursor-ns-resize'
              onMouseDown={(e) => handleResizeStart(e, 's')}
              style={{ touchAction: 'none' }}
            />
            <div
              className='absolute bottom-4 left-0 top-4 w-2 cursor-ew-resize'
              onMouseDown={(e) => handleResizeStart(e, 'w')}
              style={{ touchAction: 'none' }}
            />
            <div
              className='absolute bottom-4 right-0 top-4 w-2 cursor-ew-resize'
              onMouseDown={(e) => handleResizeStart(e, 'e')}
              style={{ touchAction: 'none' }}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );

  // Render as portal to body
  return createPortal(popupContent, document.body);
};

export default OverseerPopup;
