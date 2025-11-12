import { easings, useSpring, SpringConfig } from 'react-spring';
import { useTransition } from 'react-spring';

/**
 * Configuration options for the floating animation
 */
export interface FloatingAnimationOptions {
  /** Vertical movement distance in pixels (default: 3) */
  amplitude?: number;
  /** Animation duration in milliseconds (default: 1500) */
  duration?: number;
  /** Easing function to use (default: easeInOutSine) */
  easing?: (t: number) => number;
  /** Delay before animation starts in milliseconds (default: 0) */
  delay?: number;
  /** Custom spring configuration (overrides duration and easing if provided) */
  config?: SpringConfig;
  /** Custom loop configuration (default: { reverse: true }) */
  loop?: boolean | { reverse: boolean };
  /** Direction of the animation (default: 'y' for vertical) */
  direction?: 'x' | 'y';
}

/**
 * Hook for creating a floating animation effect
 * @param options - Configuration options for the animation
 * @returns Animation spring object that can be applied to an animated component
 */
export const useFloatingAnimation = (
  options: FloatingAnimationOptions = {},
) => {
  const {
    amplitude = 3,
    duration = 1500,
    easing = easings.easeInOutSine,
    delay = 0,
    config,
    loop = { reverse: true },
    direction = 'y',
  } = options;

  const property = direction === 'x' ? 'translateX' : 'translateY';

  return useSpring({
    from: { transform: `${property}(${amplitude}px)` },
    to: { transform: `${property}(-${amplitude}px)` },
    config: config || {
      duration,
      easing,
    },
    delay,
    loop,
  });
};

/**
 * Hook for creating a pulsing/echo animation effect
 * @param options - Configuration options for the animation
 * @returns Animation spring object that can be applied to an animated component
 */
export const usePulseAnimation = (
  options: {
    startScale?: number;
    endScale?: number;
    startOpacity?: number;
    endOpacity?: number;
    duration?: number;
    delay?: number;
    easing?: (t: number) => number;
    loop?: boolean | object;
  } = {},
) => {
  const {
    startScale = 1,
    endScale = 2,
    startOpacity = 0.3,
    endOpacity = 0,
    duration = 1000,
    delay = 0,
    easing = easings.easeInOutSine,
    loop = true,
  } = options;

  return useSpring({
    from: { transform: `scale(${startScale})`, opacity: startOpacity },
    to: { transform: `scale(${endScale})`, opacity: endOpacity },
    config: {
      duration,
      easing,
    },
    delay,
    loop,
  });
};

/**
 * Configuration options for the expand/collapse animation
 */
export interface ExpandCollapseOptions {
  /** Whether the element is expanded (default: false) */
  isExpanded?: boolean;
  /** Maximum height when expanded in pixels (default: 'auto') */
  maxHeight?: number | 'auto';
  /** Duration of the animation in milliseconds (default: 300) */
  duration?: number;
  /** Easing function to use (default: easeOutCubic) */
  easing?: (t: number) => number;
  /** Delay before animation starts in milliseconds (default: 0) */
  delay?: number;
  /** Custom spring configuration (overrides duration and easing if provided) */
  config?: SpringConfig;
  /** Whether to include opacity transition (default: true) */
  withOpacity?: boolean;
  /** Initial height when collapsed (default: 0) */
  collapsedHeight?: number;
  /** Overflow value while expanded (default: 'hidden') */
  expandedOverflow?: 'visible' | 'hidden' | 'auto';
}

/**
 * Hook for creating expand/collapse transition animations
 * @param options - Configuration options for the animation
 * @returns Animation spring object and ref to be applied to an animated component
 */
export const useExpandCollapseTransition = (
  options: ExpandCollapseOptions = {},
) => {
  const {
    isExpanded = false,
    maxHeight = 1000,
    duration = 300,
    easing = undefined,
    delay = 0,
    config,
    withOpacity = true,
    collapsedHeight = 0,
    expandedOverflow = 'hidden',
  } = options;

  // Use transition to handle mount/unmount animations
  const transitions = useTransition(isExpanded, {
    from: {
      maxHeight: collapsedHeight,
      opacity: withOpacity ? 0 : 1,
      overflow: 'hidden',
    },
    enter: {
      maxHeight: maxHeight, // Use a large value for 'auto'
      opacity: 1,
      overflow: expandedOverflow,
    },
    leave: {
      maxHeight: collapsedHeight,
      opacity: withOpacity ? 0 : 1,
      overflow: 'hidden',
    },
    config: config || {
      tension: 100, // Default tension value
      friction: 26, // Default friction value
      mass: 0.6, // Default mass value
      // Only use duration and easing if specifically provided
      ...(duration && { duration }),
      ...(easing && { easing }),
    },
    delay,
  });

  return transitions;
};
