import React, {
  FunctionComponent,
  useEffect,
  useRef,
  useMemo,
  useState,
  useCallback,
} from 'react';
import { ISource } from '@libs/api/types';
import { Badge, Card, ComponentTooltip } from '@components';
import MultiSourceBadge from './MultiSourceBadge';
import ComponentList from './ComponentList';
import { cn } from '@libs/utils/react';

const renderSourceHeader = (source: ISource) => (
  <div className='flex w-full'>
    <Badge.SourceInfo
      source={source}
      onClick={() => window.open(source.url, '_blank')}
      showPublishedDate={true}
    />
  </div>
);

const renderSourceContent = (source: ISource) => (
  <div className='mx-2 mb-2 flex flex-col gap-4 px-2 pb-2'>
    <div className='aucctus-text-brand-primary aucctus-text-md-medium'>
      {source.title}
    </div>
    <div className='aucctus-text-secondary aucctus-text-sm'>
      {source.description}
    </div>
  </div>
);

const renderSourceCard = (
  source: ISource,
  cardClassName?: string,
  onClick?: () => void,
) => {
  return (
    <div className='flex max-w-[500px] flex-col' onClick={onClick}>
      <Card.Detail
        key={`${source.uuid}`}
        cardClassName={cn('w-full', cardClassName)}
        headerClassName='border-none !px-2'
        title={''}
        isHideFooter={true}
        headerAction={renderSourceHeader(source)}
      >
        {renderSourceContent(source)}
      </Card.Detail>
    </div>
  );
};

interface SourceBadgeFooterProps {
  parentContainerRef: React.RefObject<HTMLDivElement>;
  sources: ISource[];
  className?: string;
}

interface SourceBadgesProps {
  sources: ISource[];
}

const SourceBadges: FunctionComponent<SourceBadgesProps> = ({ sources }) => {
  return (
    <>
      {sources.map((source) => (
        <ComponentTooltip
          tip={renderSourceCard(source)}
          key={source.uuid + Math.random()}
        >
          <Badge.SourceInfo
            badgeSize='small'
            badgeClassName='aucctus-text-primary whitespace-nowrap'
            source={source}
            key={source.url + Math.random()}
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
}) => {
  const footerRef = useRef<HTMLDivElement>(null);
  const badgesRef = useRef<HTMLDivElement>(null);
  const prevWindowWidth = useRef(window.innerWidth);

  const [overflowIndex, setOverflowIndex] = useState(3);

  const visibleSources = useMemo(
    () => sources.slice(0, overflowIndex),
    [sources, overflowIndex],
  );
  const overflowingSources = useMemo(
    () => sources.slice(overflowIndex),
    [sources, overflowIndex],
  );

  const debounce = <T extends (...args: any[]) => void>(
    func: T,
    delay: number,
  ): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const handleOverflow = useCallback(() => {
    if (footerRef.current && badgesRef.current) {
      const footerRect = footerRef.current.getBoundingClientRect();
      const badgesRect = badgesRef.current.getBoundingClientRect();
      const isOverflowing = badgesRect.right > footerRect.right;

      if (isOverflowing && overflowIndex > 1) {
        setOverflowIndex(overflowIndex - 1);
      }
    }
  }, [overflowIndex]);

  const debouncedHandleOverflow = useMemo(
    () =>
      debounce(() => {
        const currentWidth = window.innerWidth;
        const isWindowShrinking = currentWidth < prevWindowWidth.current;
        prevWindowWidth.current = currentWidth;

        if (isWindowShrinking) {
          handleOverflow();
        } else {
          setOverflowIndex(3);
        }
      }, 300),
    [handleOverflow],
  );

  useEffect(() => {
    window.addEventListener('resize', debouncedHandleOverflow);
    return () => window.removeEventListener('resize', debouncedHandleOverflow);
  }, [debouncedHandleOverflow]);

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

  const renderMultiSourceList = useCallback(
    (sources: ISource[]) => (
      <ComponentList className='max-h-[50vh] max-w-[500px] overflow-y-auto overscroll-contain py-4 shadow-lg'>
        <div className='flex flex-col'>
          {sources.map((source) =>
            renderSourceCard(
              source,
              'cursor-pointer aucctus-bg-primary-hover !border-none !shadow-none !rounded-none',
              () => window.open(source.url, '_blank'),
            ),
          )}
        </div>
      </ComponentList>
    ),
    [],
  );

  return (
    <div
      className={`${className} animate-fade-in opacity-0 duration-300`}
      ref={footerRef}
    >
      <div ref={badgesRef} className='flex flex-row gap-2'>
        <SourceBadges sources={visibleSources} />
        {overflowingSources.length > 0 && (
          <ComponentTooltip
            hideDelay={300}
            tip={renderMultiSourceList(overflowingSources)}
          >
            <MultiSourceBadge sources={overflowingSources} />
          </ComponentTooltip>
        )}
      </div>
    </div>
  );
};

export default SourceBadgeFooter;
