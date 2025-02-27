import {
  FunctionComponent,
  useCallback,
  useRef,
  useState,
  useEffect,
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
  const childRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout>();

  const updateTooltipPosition = useCallback(() => {
    if (childRef.current && tooltipRef.current && isHovered) {
      const childRect = childRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;

      // Calculate the centered position
      let centerX = childRect.left + (childRect.width - tooltipRect.width) / 2;

      // Ensure tooltip doesn't go off the left side
      centerX = Math.max(10, centerX);
      // Ensure tooltip doesn't go off the right side
      centerX = Math.min(windowWidth - tooltipRect.width - 10, centerX);

      const topPositionAbove = childRect.top - tooltipRect.height - 5; // 5px gap
      const topPositionBelow = childRect.bottom + 5; // 5px gap

      const shouldShowBelow = topPositionAbove < 0;
      const finalTopPosition = shouldShowBelow
        ? topPositionBelow
        : topPositionAbove;

      tooltipRef.current.style.left = `${centerX}px`;
      tooltipRef.current.style.top = `${finalTopPosition}px`;
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
      window.addEventListener('scroll', updateTooltipPosition);
    }
    return () => {
      window.removeEventListener('resize', updateTooltipPosition);
      window.removeEventListener('scroll', updateTooltipPosition);
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
            {tip}
          </div>,
          document.body,
        )}
    </>
  );
};

export default ComponentTooltip;
