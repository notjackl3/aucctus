import { useCallback } from 'react';
import { useTransition } from 'react-spring';

// Constants
const CHAT_WINDOW_HEIGHT = 500;
const BUTTON_WINDOW_SPACING = 16;
const POSITION_TRANSITION_MS = 300;

export interface WindowPosition {
  direction: 'above' | 'below';
  right: number;
  buttonBottom: number;
  buttonTop: number;
}

/**
 * Custom hook to manage conversation window positioning and animations
 * @param isOpen Whether the conversation window is open
 * @param windowPosition Current window position data
 * @param isTransitioning Whether the window is transitioning between positions
 * @returns Animation transitions and window positioning styles
 */
export const useConversationWindowPosition = (
  isOpen: boolean,
  windowPosition: WindowPosition,
  isTransitioning: boolean,
) => {
  // Animation for fade in/out
  const transitions = useTransition(isOpen ? [isOpen] : [], {
    from: { opacity: 0, scale: 0.75 },
    enter: { opacity: 1, scale: 1 },
    leave: { opacity: 0, scale: 0.75 },
    config: { tension: 280, friction: 20 },
  });

  // Calculate window positioning styles
  const getWindowPositionStyle = useCallback(
    (style: any) => {
      return {
        ...style,
        right: `${windowPosition.right}px`,
        top:
          windowPosition.direction === 'below'
            ? `${windowPosition.buttonBottom}px`
            : `${windowPosition.buttonTop}px`,
        transform:
          windowPosition.direction === 'below'
            ? `translateY(${BUTTON_WINDOW_SPACING}px)`
            : `translateY(-${CHAT_WINDOW_HEIGHT + BUTTON_WINDOW_SPACING}px)`,
        transitionDuration: isTransitioning
          ? `${POSITION_TRANSITION_MS}ms`
          : '0ms',
      };
    },
    [windowPosition, isTransitioning],
  );

  return { transitions, getWindowPositionStyle };
};
