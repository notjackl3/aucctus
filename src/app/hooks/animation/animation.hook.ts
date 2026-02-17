import React from 'react';
import { AnimatePresence, motion, type Transition } from 'framer-motion';

/**
 * Configuration options for the floating animation
 */
export interface FloatingAnimationOptions {
  /** Vertical movement distance in pixels (default: 3) */
  amplitude?: number;
  /** Animation duration in seconds (default: 1.5) */
  duration?: number;
  /** Delay before animation starts in seconds (default: 0) */
  delay?: number;
  /** Direction of the animation (default: 'y' for vertical) */
  direction?: 'x' | 'y';
}

/**
 * Hook for creating a floating animation effect
 * Returns framer-motion props to spread onto a motion component
 */
export const useFloatingAnimation = (
  options: FloatingAnimationOptions = {},
) => {
  const { amplitude = 3, duration = 1.5, delay = 0, direction = 'y' } = options;

  return {
    animate: { [direction]: [-amplitude, amplitude] },
    transition: {
      [direction]: {
        duration,
        delay,
        repeat: Infinity,
        repeatType: 'reverse' as const,
        ease: 'easeInOut',
      },
    },
  };
};

/**
 * Hook for creating a pulsing/echo animation effect
 * Returns framer-motion props to spread onto a motion component
 */
export const usePulseAnimation = (
  options: {
    startScale?: number;
    endScale?: number;
    startOpacity?: number;
    endOpacity?: number;
    duration?: number;
    delay?: number;
  } = {},
) => {
  const {
    startScale = 1,
    endScale = 2,
    startOpacity = 0.3,
    endOpacity = 0,
    duration = 1,
    delay = 0,
  } = options;

  return {
    initial: { scale: startScale, opacity: startOpacity },
    animate: { scale: endScale, opacity: endOpacity },
    transition: {
      duration,
      delay,
      repeat: Infinity,
      repeatDelay: delay,
      ease: 'easeInOut' as const,
    },
  };
};

/**
 * Configuration options for the ExpandCollapse component
 */
export interface ExpandCollapseProps {
  /** Whether the element is expanded */
  isExpanded: boolean;
  /** Maximum height when expanded in pixels (default: 1000) */
  maxHeight?: number;
  /** Duration of the animation in seconds (default: 0.3) */
  duration?: number;
  /** Whether to include opacity transition (default: true) */
  withOpacity?: boolean;
  /** Initial height when collapsed (default: 0) */
  collapsedHeight?: number;
  /** Overflow value while expanded (default: 'hidden') */
  expandedOverflow?: 'visible' | 'hidden' | 'auto';
  /** Additional className for the animated wrapper */
  className?: string;
  /** Content to render inside */
  children: React.ReactNode;
}

/**
 * ExpandCollapse component using AnimatePresence + motion.div
 * Replaces the old useExpandCollapseTransition render-prop pattern
 */
export const ExpandCollapse: React.FC<ExpandCollapseProps> = ({
  isExpanded,
  maxHeight = 1000,
  duration = 0.3,
  withOpacity = true,
  collapsedHeight = 0,
  expandedOverflow = 'hidden',
  className,
  children,
}) => {
  const transition: Transition = {
    type: 'spring',
    stiffness: 100,
    damping: 26,
    mass: 0.6,
    ...(duration ? { duration } : {}),
  };

  return React.createElement(
    AnimatePresence,
    null,
    isExpanded
      ? React.createElement(
          motion.div,
          {
            key: 'expand-collapse',
            initial: {
              maxHeight: collapsedHeight,
              opacity: withOpacity ? 0 : 1,
              overflow: 'hidden',
            },
            animate: {
              maxHeight,
              opacity: 1,
              overflow: expandedOverflow,
            },
            exit: {
              maxHeight: collapsedHeight,
              opacity: withOpacity ? 0 : 1,
              overflow: 'hidden',
            },
            transition,
            className,
          },
          children,
        )
      : null,
  );
};
