import { Loading } from '@components';
import React, { useRef, useState, useEffect, useCallback } from 'react';

interface ConceptTableCardProps {
  footer?: React.ReactNode;
  isLoading: boolean;
  children:
    | React.ReactNode
    | ((hasHorizontalScroll: boolean) => React.ReactNode);
}

const ConceptTableCard: React.FC<ConceptTableCardProps> = ({
  footer,
  children,
  isLoading,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hasHorizontalScroll, setHasHorizontalScroll] = useState(false);

  const checkOverflow = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const hasOverflow = container.scrollWidth > container.clientWidth;
      setHasHorizontalScroll(hasOverflow);
    }
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || isLoading) return;

    // Delay initial check to ensure table has rendered
    const timeoutId = setTimeout(checkOverflow, 100);

    // Watch for resize changes
    const resizeObserver = new ResizeObserver(() => {
      // Debounce resize checks
      setTimeout(checkOverflow, 50);
    });
    resizeObserver.observe(container);

    // Also watch window resize
    window.addEventListener('resize', checkOverflow);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', checkOverflow);
    };
  }, [isLoading, checkOverflow]);

  return (
    <div className='aucctus-border-secondary aucctus-bg-primary inline-flex h-auto min-h-24 w-full flex-col items-start justify-between rounded-lg border'>
      <div className='inline-flex w-full flex-col items-start justify-start'>
        {/* Content */}
        {isLoading ? (
          // Loading Indicator
          <div className='flex h-full w-full items-center justify-center self-stretch align-middle'>
            <Loading />
          </div>
        ) : (
          // Table - scrollable both horizontally and vertically
          <div
            ref={scrollContainerRef}
            className='max-h-[calc(100vh-360px)] w-full overflow-auto'
          >
            {typeof children === 'function'
              ? children(hasHorizontalScroll)
              : children}
          </div>
        )}
      </div>
      {/* Footer */}
      <div className='aucctus-border-secondary w-full border-t'>{footer}</div>
    </div>
  );
};

export default ConceptTableCard;
