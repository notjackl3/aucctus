import { Badge, Card, ComponentTooltip } from '@components';
import { cn } from '@libs/utils/react';
import { debounce } from '@libs/utils/source';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ISource } from '@libs/api/types';

// Shared source card rendering function
const renderSourceCard = (
  source: ISource,
  cardClassName?: string,
  onClick?: () => void,
  showPublishedDate: boolean = true,
) => {
  const renderSourceHeader = () => (
    <div className='flex w-full'>
      <Badge.SourceInfo
        source={source}
        onClick={() => window.open(source.url, '_blank')}
        showPublishedDate={showPublishedDate}
      />
    </div>
  );

  const renderSourceContent = () => (
    <div className='mx-2 mb-2 flex w-full flex-col gap-4 break-words px-2 pb-2'>
      <div className='aucctus-text-brand-primary aucctus-text-md-medium'>
        {source.title}
      </div>
      <div className='aucctus-text-secondary aucctus-text-sm'>
        {source.description}
      </div>
    </div>
  );

  return (
    <div className='flex max-w-[500px] flex-col' onClick={onClick}>
      <Card.Detail
        key={source.uuid}
        cardClassName={cn('w-full', cardClassName)}
        headerClassName='border-none !px-2'
        title={''}
        isHideFooter={true}
        headerAction={renderSourceHeader()}
      >
        {renderSourceContent()}
      </Card.Detail>
    </div>
  );
};

interface SourceBadgeFooterProps {
  parentContainerRef: React.RefObject<HTMLDivElement>;
  sources: ISource[];
  className?: string;
  showPublishedDate?: boolean;
}

interface SourceBadgesProps {
  sources: ISource[];
  showPublishedDate?: boolean;
}

const SourceBadges: FunctionComponent<SourceBadgesProps> = ({
  sources,
  showPublishedDate = true,
}) => {
  return (
    <>
      {sources.map((source) => (
        <ComponentTooltip
          tip={renderSourceCard(
            source,
            undefined,
            undefined,
            showPublishedDate,
          )}
          key={source.uuid}
          hideDelay={300}
        >
          <Badge.SourceInfo
            badgeSize='small'
            badgeClassName='aucctus-text-primary whitespace-nowrap'
            source={source}
            onClick={() => window.open(source.url, '_blank')}
          />
        </ComponentTooltip>
      ))}
    </>
  );
};

const SourceBadgeFooter: FunctionComponent<SourceBadgeFooterProps> = ({
  sources,
  className = '',
  showPublishedDate = true,
}) => {
  const footerRef = useRef<HTMLDivElement>(null);
  const badgesRef = useRef<HTMLDivElement>(null);
  const [overflowIndex, setOverflowIndex] = useState(3);

  // Memoized computed values
  const { visibleSources } = useMemo(
    () => ({
      visibleSources: sources.slice(0, overflowIndex),
    }),
    [sources, overflowIndex],
  );

  // Simplified overflow handling
  const handleOverflow = useCallback(() => {
    if (footerRef.current && badgesRef.current) {
      const footerRect = footerRef.current.getBoundingClientRect();
      const badgesRect = badgesRef.current.getBoundingClientRect();
      const isOverflowing = badgesRect.right > footerRect.right;

      if (isOverflowing && overflowIndex > 1) {
        setOverflowIndex((prev) => prev - 1);
      }
    }
  }, [overflowIndex]);

  // Debounced resize handler
  const debouncedHandleResize = useMemo(
    () =>
      debounce(() => {
        // Reset to default on window resize, then check for overflow
        setOverflowIndex(3);
        setTimeout(handleOverflow, 0); // Allow DOM to update
      }, 300),
    [handleOverflow],
  );

  // Single effect for resize handling
  useEffect(() => {
    window.addEventListener('resize', debouncedHandleResize);
    return () => window.removeEventListener('resize', debouncedHandleResize);
  }, [debouncedHandleResize]);

  // Single effect for mutation observation
  useEffect(() => {
    if (badgesRef.current) {
      const observer = new MutationObserver(handleOverflow);
      observer.observe(badgesRef.current, {
        childList: true,
        subtree: true,
        characterData: true,
      });

      return () => observer.disconnect();
    }
  }, [handleOverflow]);

  return (
    <div
      className={`${className} animate-fade-in opacity-0 duration-300`}
      ref={footerRef}
    >
      <div ref={badgesRef} className='flex flex-row gap-2'>
        <SourceBadges
          sources={visibleSources}
          showPublishedDate={showPublishedDate}
        />
        {/* {overflowingSources.length > 0 && (
          <ComponentTooltip
            hideDelay={300}
            tip={renderMultiSourceList(overflowingSources)}
          >
            <MultiSourceBadge sources={overflowingSources} />
          </ComponentTooltip>
        )} */}
      </div>
    </div>
  );
};

export default SourceBadgeFooter;
