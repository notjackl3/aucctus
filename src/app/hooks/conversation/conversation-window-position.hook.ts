import { useCallback } from 'react';

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
 * @returns Motion animation props and window positioning styles
 */
export const useConversationWindowPosition = (
  isOpen: boolean,
  windowPosition: WindowPosition,
  isTransitioning: boolean,
) => {
  // Animation props for AnimatePresence + motion.div
  const motionProps = {
    initial: { opacity: 0, scale: 0.75 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.75 },
    transition: { type: 'spring' as const, stiffness: 280, damping: 20 },
  };

  // Calculate window positioning styles
  const getWindowPositionStyle = useCallback(() => {
    return {
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
  }, [windowPosition, isTransitioning]);

  return { isOpen, motionProps, getWindowPositionStyle };
};
