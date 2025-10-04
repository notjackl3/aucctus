import {
  FunctionComponent,
  useCallback,
  useRef,
  useState,
  useEffect,
  cloneElement,
  isValidElement,
} from 'react';
import { createPortal } from 'react-dom';

interface ComponentTooltipProps {
  tip: React.ReactNode;
  children: React.ReactNode;
  hideDelay?: number; // Optional delay in milliseconds
}

const ComponentTooltip: FunctionComponent<ComponentTooltipProps> = ({
  tip,
  children,
  hideDelay = 0,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [calculatedMaxHeight, setCalculatedMaxHeight] = useState<
    number | undefined
  >(undefined);
  const childRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout>();

  const updateTooltipPosition = useCallback(() => {
    if (childRef.current && tooltipRef.current && isHovered) {
      const childRect = childRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // Calculate the centered position
      let centerX = childRect.left + (childRect.width - tooltipRect.width) / 2;

      // Ensure tooltip doesn't go off the left side
      centerX = Math.max(10, centerX);
      // Ensure tooltip doesn't go off the right side
      centerX = Math.min(windowWidth - tooltipRect.width - 10, centerX);

      // Determine if cursor is closer to top or bottom of viewport
      const distanceFromTop = childRect.top;
      const distanceFromBottom = windowHeight - childRect.bottom;
      const shouldShowBelow = distanceFromTop < distanceFromBottom;

      // Calculate available space and max height
      const gap = 5; // 5px gap between tooltip and trigger
      const padding = 10; // padding from viewport edge
      const maxHeightAbove = childRect.top - gap - padding;
      const maxHeightBelow = windowHeight - childRect.bottom - gap - padding;

      // Set max height based on position (min of 500px or available space)
      const maxHeight = shouldShowBelow
        ? Math.min(500, maxHeightBelow)
        : Math.min(500, maxHeightAbove);

      // Store calculated max height in state to pass to tip element
      setCalculatedMaxHeight(maxHeight);

      // Use the constrained height (maxHeight or actual height, whichever is smaller)
      const effectiveHeight = Math.min(tooltipRect.height, maxHeight);

      // Position tooltip using the effective (constrained) height
      const topPositionAbove = childRect.top - effectiveHeight - gap;
      const topPositionBelow = childRect.bottom + gap;

      const finalTopPosition = shouldShowBelow
        ? topPositionBelow
        : topPositionAbove;

      // Ensure tooltip doesn't go past viewport edges
      const clampedTopPosition = Math.max(
        padding,
        Math.min(finalTopPosition, windowHeight - effectiveHeight - padding),
      );

      tooltipRef.current.style.left = `${centerX}px`;
      tooltipRef.current.style.top = `${clampedTopPosition}px`;
    }
  }, [isHovered]);

  const handleMouseEnter = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hideDelay) {
      hideTimeoutRef.current = setTimeout(() => {
        setIsHovered(false);
      }, hideDelay);
    } else {
      setIsHovered(false);
    }
  }, [hideDelay]);

  useEffect(() => {
    if (isHovered) {
      updateTooltipPosition();
      window.addEventListener('resize', updateTooltipPosition);
      window.addEventListener('scroll', updateTooltipPosition, true);
    }
    return () => {
      window.removeEventListener('resize', updateTooltipPosition);
      window.removeEventListener('scroll', updateTooltipPosition, true);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [isHovered, updateTooltipPosition]);

  return (
    <>
      <div
        ref={childRef}
        className='cursor-pointer'
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      {isHovered &&
        createPortal(
          <div
            className='z-50 animate-fade-in'
            ref={tooltipRef}
            style={{ position: 'fixed' }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {isValidElement(tip) && calculatedMaxHeight !== undefined
              ? cloneElement(tip, {
                  style: {
                    ...((tip.props as any).style || {}),
                    maxHeight: `${calculatedMaxHeight}px`,
                  },
                } as any)
              : tip}
          </div>,
          document.body,
        )}
    </>
  );
};

export default ComponentTooltip;
