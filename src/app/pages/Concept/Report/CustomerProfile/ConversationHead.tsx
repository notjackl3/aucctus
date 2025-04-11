import defaultAvatar from '@assets/img/avatar.png';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@libs/utils/react';
import { ICustomerProfile } from '@libs/api/types';
import ConversationWindow from './ConversationWindow';
import { animated } from 'react-spring';
import { createPortal } from 'react-dom';
import {
  useConversationWindowPosition,
  WindowPosition,
} from './window-position.hook';
import CustomerConversationSocketWrapper from './CustomerConversationSocketWrapper';

// Constants
const CHAT_WINDOW_HEIGHT = 500;
const BUTTON_WINDOW_SPACING = 16;
const CLICK_THRESHOLD_MS = 300;
const DRAG_THRESHOLD_PX = 10;
const POSITION_TRANSITION_MS = 300;

interface ConversationHeadProps {
  profile: ICustomerProfile;
  className?: string;
}

interface Position {
  x: number;
  y: number;
}

const ConversationHead: React.FC<ConversationHeadProps> = ({
  profile,
  className,
}) => {
  // UI State
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Position State
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [windowPosition, setWindowPosition] = useState<WindowPosition>({
    direction: 'above',
    right: 0,
    buttonBottom: 0,
    buttonTop: 0,
  });
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Use the custom animation hook
  const { transitions, getWindowPositionStyle } = useConversationWindowPosition(
    isOpen,
    windowPosition,
    isTransitioning,
  );

  // Refs
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dragStartRef = useRef<Position>({ x: 0, y: 0 });
  const positionRef = useRef<Position>({ x: 0, y: 0 });
  const mouseDownStartTimeRef = useRef(0);

  // Window positioning logic
  const calculateWindowPosition = useCallback(() => {
    if (!buttonRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const right = window.innerWidth - buttonRect.right;
    const potentialTopEdge =
      buttonRect.top - CHAT_WINDOW_HEIGHT - BUTTON_WINDOW_SPACING;

    // Get current direction before updating
    const currentDirection = windowPosition.direction;
    const newDirection = potentialTopEdge < 0 ? 'below' : 'above';

    // Check if direction is changing
    if (isOpen && currentDirection !== newDirection) {
      setIsTransitioning(true);

      // Reset transition after animation completes
      setTimeout(() => {
        setIsTransitioning(false);
      }, POSITION_TRANSITION_MS);
    }

    // Check if window would go off-screen if placed above button
    if (potentialTopEdge < 0) {
      // Place window below the button
      setWindowPosition({
        direction: 'below',
        right,
        buttonBottom: buttonRect.bottom,
        buttonTop: buttonRect.top,
      });
    } else {
      // Place window above the button
      setWindowPosition({
        direction: 'above',
        right,
        buttonBottom: buttonRect.bottom,
        buttonTop: buttonRect.top,
      });
    }
  }, [windowPosition.direction, isOpen]);

  // Handle cursor style during dragging
  useEffect(() => {
    document.body.style.cursor = isDragging ? 'pointer' : '';
    return () => {
      document.body.style.cursor = '';
    };
  }, [isDragging]);

  // Recalculate window position on resize and position changes
  useEffect(() => {
    calculateWindowPosition();
    window.addEventListener('resize', calculateWindowPosition);
    return () => window.removeEventListener('resize', calculateWindowPosition);
  }, [calculateWindowPosition, position]);

  // Dragging handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      positionRef.current = { ...position };
      mouseDownStartTimeRef.current = Date.now();
    },
    [position],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;

      setPosition({
        x: positionRef.current.x + deltaX,
        y: positionRef.current.y + deltaY,
      });
    },
    [isDragging],
  );

  const handleMouseUp = useCallback((e: MouseEvent | React.MouseEvent) => {
    setIsDragging(false);

    // Only toggle if it was a short click and didn't move far
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    const dragDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const isQuickClick =
      Date.now() - mouseDownStartTimeRef.current < CLICK_THRESHOLD_MS;

    if (isQuickClick && dragDistance < DRAG_THRESHOLD_PX) {
      setIsOpen((prev) => !prev);
    }
  }, []);

  // Add/remove event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const closeConversation = useCallback(() => setIsOpen(false), []);

  // Render conversation window portal
  const renderConversationPortal = useCallback(
    (style: any) =>
      createPortal(
        <>
          <div
            onClick={closeConversation}
            className='aucctus-bg-secondary fixed bottom-0 right-0 z-50 h-full w-full opacity-25'
            aria-hidden='true'
          />
          <animated.div
            className={cn(
              'aucctus-bg-primary fixed z-50 rounded-lg shadow-lg',
              { 'transition-all ease-in-out': isTransitioning },
            )}
            style={getWindowPositionStyle(style)}
          >
            <ConversationWindow
              height={CHAT_WINDOW_HEIGHT}
              profile={profile}
              onClose={closeConversation}
            />
            <CustomerConversationSocketWrapper />
          </animated.div>
        </>,
        document.body,
      ),
    [closeConversation, profile, getWindowPositionStyle, isTransitioning],
  );

  return (
    <div
      className={cn('fixed bottom-6 right-12 animate-fade-in', className)}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        zIndex: isOpen ? 1000 : undefined,
      }}
    >
      {/* Conversation Window Portal */}
      {transitions((style, item) => item && renderConversationPortal(style))}

      {/* Chat Button */}
      <button
        ref={buttonRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        className={cn(
          'aucctus-bg-secondary-hover relative z-50 flex items-center justify-center',
          'aucctus-border-primary rounded-full border shadow-md transition-all',
          '!hover:aucctus-border-brand object-cover hover:scale-110 active:scale-95',
          {
            '!aucctus-border-brand': isOpen,
          },
        )}
        aria-label={isOpen ? 'Close conversation' : 'Open conversation'}
      >
        <img
          className='flex aspect-square w-16 items-center justify-center rounded-full border border-white'
          alt='avatar'
          src={profile.avatarUrl || defaultAvatar}
          onError={(e) => (e.currentTarget.src = defaultAvatar)}
        />
      </button>
    </div>
  );
};

export default ConversationHead;
