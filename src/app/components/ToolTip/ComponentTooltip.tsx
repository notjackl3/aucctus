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

type PreferredPosition = 'above' | 'below' | 'left' | 'right';

interface ComponentTooltipProps {
  tip: React.ReactNode;
  children: React.ReactNode;
  hideDelay?: number; // Optional delay in milliseconds
  preferredPosition?: PreferredPosition; // Preferred position for the tooltip
}

const ComponentTooltip: FunctionComponent<ComponentTooltipProps> = ({
  tip,
  children,
  hideDelay = 0,
  preferredPosition,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [calculatedMaxHeight, setCalculatedMaxHeight] = useState<
    number | undefined
  >(undefined);
  const childRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout>();

  const updateTooltipPosition = useCallback(() => {
    if (!childRef.current || !tooltipRef.current || !isHovered) return;

    const childRect = childRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const gap = 5; // px gap between tooltip and trigger
    const padding = 10; // px padding from viewport edge

    const spaceAbove = childRect.top - gap - padding;
    const spaceBelow = windowHeight - childRect.bottom - gap - padding;
    const spaceLeft = childRect.left - gap - padding;
    const spaceRight = windowWidth - childRect.right - gap - padding;

    const isHorizontalSide =
      preferredPosition === 'left' || preferredPosition === 'right';

    if (isHorizontalSide) {
      // Side placement: try preferred -> opposite -> below -> above.
      // If none fit, accept the preferred side and overflow rather than clip.
      const candidates: PreferredPosition[] =
        preferredPosition === 'left'
          ? ['left', 'right', 'below', 'above']
          : ['right', 'left', 'below', 'above'];

      const fits = (side: PreferredPosition): boolean => {
        if (side === 'left') return spaceLeft >= tooltipRect.width;
        if (side === 'right') return spaceRight >= tooltipRect.width;
        if (side === 'below')
          return spaceBelow >= Math.min(tooltipRect.height, 500);
        return spaceAbove >= Math.min(tooltipRect.height, 500);
      };

      const chosen = candidates.find(fits) ?? preferredPosition;

      if (chosen === 'left' || chosen === 'right') {
        const left =
          chosen === 'left'
            ? childRect.left - tooltipRect.width - gap
            : childRect.right + gap;
        // Vertically center on trigger, clamped to viewport.
        const maxHeight = Math.min(500, windowHeight - 2 * padding);
        const effectiveHeight = Math.min(tooltipRect.height, maxHeight);
        const centerY =
          childRect.top + (childRect.height - effectiveHeight) / 2;
        const top = Math.max(
          padding,
          Math.min(centerY, windowHeight - effectiveHeight - padding),
        );

        setCalculatedMaxHeight(maxHeight);
        tooltipRef.current.style.left = `${left}px`;
        tooltipRef.current.style.top = `${top}px`;
        return;
      }

      // Axial fallback (above/below) — use the same horizontal-center logic
      // the default branch uses so the tooltip doesn't drift sideways.
      const shouldShowBelow = chosen === 'below';
      const maxHeight = shouldShowBelow
        ? Math.min(500, spaceBelow)
        : Math.min(500, spaceAbove);
      const effectiveHeight = Math.min(tooltipRect.height, maxHeight);

      let centerX = childRect.left + (childRect.width - tooltipRect.width) / 2;
      centerX = Math.max(padding, centerX);
      centerX = Math.min(windowWidth - tooltipRect.width - padding, centerX);

      const top = shouldShowBelow
        ? childRect.bottom + gap
        : childRect.top - effectiveHeight - gap;
      const clampedTop = Math.max(
        padding,
        Math.min(top, windowHeight - effectiveHeight - padding),
      );

      setCalculatedMaxHeight(maxHeight);
      tooltipRef.current.style.left = `${centerX}px`;
      tooltipRef.current.style.top = `${clampedTop}px`;
      return;
    }

    // Default axial behaviour (above/below) — preserved exactly for the ~46
    // existing call-sites that don't opt into side positioning.
    let centerX = childRect.left + (childRect.width - tooltipRect.width) / 2;
    centerX = Math.max(padding, centerX);
    centerX = Math.min(windowWidth - tooltipRect.width - padding, centerX);

    let shouldShowBelow: boolean;
    if (preferredPosition === 'above') {
      shouldShowBelow = spaceAbove < 100 && spaceBelow > spaceAbove;
    } else if (preferredPosition === 'below') {
      shouldShowBelow = spaceBelow >= 100 || spaceBelow > spaceAbove;
    } else {
      const distanceFromTop = childRect.top;
      const distanceFromBottom = windowHeight - childRect.bottom;
      shouldShowBelow = distanceFromTop < distanceFromBottom;
    }

    const maxHeight = shouldShowBelow
      ? Math.min(500, spaceBelow)
      : Math.min(500, spaceAbove);
    const effectiveHeight = Math.min(tooltipRect.height, maxHeight);
    const top = shouldShowBelow
      ? childRect.bottom + gap
      : childRect.top - effectiveHeight - gap;
    const clampedTop = Math.max(
      padding,
      Math.min(top, windowHeight - effectiveHeight - padding),
    );

    setCalculatedMaxHeight(maxHeight);
    tooltipRef.current.style.left = `${centerX}px`;
    tooltipRef.current.style.top = `${clampedTop}px`;
  }, [isHovered, preferredPosition]);

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
            className='z-[10000] animate-fade-in'
            ref={tooltipRef}
            style={{ position: 'fixed' }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {isValidElement(tip) && calculatedMaxHeight !== undefined ? (
              cloneElement(tip, {
                style: {
                  ...((tip.props as any).style || {}),
                  maxHeight: `${calculatedMaxHeight}px`,
                },
              } as any)
            ) : typeof tip === 'string' ? (
              <span className='aucctus-bg-tertiary aucctus-text-secondary rounded-md px-2.5 py-1.5 text-xs shadow-lg'>
                {tip}
              </span>
            ) : (
              tip
            )}
          </div>,
          document.body,
        )}
    </>
  );
};

export default ComponentTooltip;
