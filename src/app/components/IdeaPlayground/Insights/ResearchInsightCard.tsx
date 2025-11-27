import React, { useRef, useMemo, useState } from 'react';
import { Icon, ComponentTooltip } from '@components';
import { InsightCard as InsightCardType } from '../types';
import { getBaseUrl } from '@libs/utils/source';
import { cn } from '@libs/utils/react';
import {
  useIncludeAnswerLight,
  useExcludeAnswerLight,
} from '@hooks/query/ideaPlayground.hook';
import { AucctusQueryKeys } from '@hooks/query/query-keys';
import { useDebouncedInvalidation } from '@hooks/query/useDebouncedInvalidation';
import AucctusLogo from '@assets/aucctus_logo.png';
interface ResearchInsightCardProps {
  card: InsightCardType;
  isSelected: boolean;
  seedUuid: string;
  questionUuid: string;
  getSentimentColor: (
    sentiment: InsightCardType['sentiment'],
    source?: string,
  ) => string;
  getSentimentIcon: (
    sentiment: InsightCardType['sentiment'],
  ) => React.ReactNode;
  getSentimentDescription: (sentiment: InsightCardType['sentiment']) => string;
  onSelectionChange: (cardId: string, isSelected: boolean) => void;
  onDoubleClick: () => void;
}

const ResearchInsightCard: React.FC<ResearchInsightCardProps> = ({
  card,
  isSelected,
  seedUuid,
  questionUuid,
  getSentimentColor,
  getSentimentIcon,
  onSelectionChange,
  onDoubleClick,
}) => {
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [optimisticSelected, setOptimisticSelected] = useState(isSelected);

  // Update optimistic state when external selection changes
  React.useEffect(() => {
    setOptimisticSelected(isSelected);
  }, [isSelected]);

  const { debouncedInvalidate } = useDebouncedInvalidation();

  const { includeAnswer } = useIncludeAnswerLight(() => {
    debouncedInvalidate([AucctusQueryKeys.ideaPlaygroundQuestions, seedUuid]);
  });
  const { excludeAnswer } = useExcludeAnswerLight(() => {
    debouncedInvalidate([AucctusQueryKeys.ideaPlaygroundQuestions, seedUuid]);
  });

  const handleClick = () => {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }
    clickTimerRef.current = setTimeout(() => {
      handleToggleSelection();
      clickTimerRef.current = null;
    }, 200);
  };

  const handleToggleSelection = () => {
    if (isLoading) return; // Prevent clicking while loading

    const newSelectionState = !optimisticSelected;

    // Optimistic UI update
    setOptimisticSelected(newSelectionState);
    setIsLoading(true);

    // Call appropriate mutation
    const mutation = newSelectionState ? includeAnswer : excludeAnswer;

    mutation(
      {
        seedUuid,
        questionUuid,
        answerUuid: card.id,
      },
      {
        onSuccess: () => {
          // Notify parent of successful change
          onSelectionChange(card.id, newSelectionState);
          setIsLoading(false);
        },
        onError: () => {
          // Revert optimistic update on error
          setOptimisticSelected(isSelected);
          setIsLoading(false);
        },
      },
    );
  };

  const handleDoubleClick = () => {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    onDoubleClick();
  };

  const handleSourceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    if (card.url) {
      window.open(card.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Determine citation validation status
  const getCitationStatus = () => {
    if (card.moreDetails === null) {
      return {
        icon: 'beaker' as const,
        color: 'aucctus-stroke-quaternary',
        tooltip: 'Researching and validating...',
        animate: true,
      };
    } else if (card.moreDetails) {
      return {
        icon: 'check-circle-broken' as const,
        color: 'aucctus-stroke-success-primary',
        tooltip: 'Citation validated - Double click for details',
        animate: false,
      };
    } else {
      return {
        icon: 'closeX' as const,
        color: 'aucctus-stroke-error-primary',
        tooltip: 'Citation validation failed',
        animate: false,
      };
    }
  };

  const citationStatus = getCitationStatus();

  // Render source logo similar to SourceInfoBadge
  const renderSourceLogo = useMemo(() => {
    const isNucleus = card.source?.toLowerCase().includes('nucleus') || false;

    if (isNucleus) {
      return (
        <div
          className={cn(
            'flex items-center justify-center overflow-hidden rounded-full border border-transparent bg-white',
            'h-4 w-4',
          )}
        >
          <img
            src={AucctusLogo}
            alt='Aucctus Nucleus'
            className='h-full w-full object-contain p-0.5'
          />
        </div>
      );
    }

    const sourceBaseUrl = card.url ? getBaseUrl(card.url) : null;
    return (
      <div
        className={cn(
          'flex items-center justify-center overflow-hidden rounded-full border border-transparent',
          'h-4 w-4',
        )}
      >
        {sourceBaseUrl ? (
          <img
            className='h-full w-full object-contain'
            alt='source-logo'
            src={`https://logo.clearbit.com/${sourceBaseUrl}`}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"%3E%3Cpath d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/%3E%3Cpath d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/%3E%3C/svg%3E';
            }}
          />
        ) : (
          <Icon
            variant='link'
            className='aucctus-stroke-white'
            height={12}
            width={12}
          />
        )}
      </div>
    );
  }, [card.url, card.source]);

  const displayTitle = useMemo(() => {
    let title = card.source;
    if (title && title.length > 20) {
      return `${title.slice(0, 20)}...`;
    }
    return title || 'Unknown Source';
  }, [card.source]);

  return (
    <div
      className={`aucctus-text-white relative min-w-[250px] max-w-[350px] cursor-pointer select-none rounded-xl border p-3 shadow-lg backdrop-blur-md ${
        isLoading
          ? 'scale-95 border-white/30 bg-white/10 opacity-80'
          : optimisticSelected
            ? 'scale-100 border-white/40 bg-white/20 opacity-100 ring-1 ring-white/30'
            : getSentimentColor(card.sentiment, card.source) +
              ' scale-100 opacity-100'
      }`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      style={{
        transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Citation validation status icon - top right */}
      <div className='absolute right-2 top-2'>
        <ComponentTooltip
          tip={
            <div
              className='aucctus-bg-primary aucctus-border-secondary aucctus-text-primary max-w-xs rounded-lg border px-3 py-2 shadow-lg'
              style={{
                boxShadow:
                  '0 0 15px rgba(0, 0, 0, 0.075), 0 8px 15px rgba(0, 0, 0, 0.15)',
              }}
            >
              <span className='aucctus-text-xs'>{citationStatus.tooltip}</span>
            </div>
          }
          preferredPosition='below'
        >
          <Icon
            variant={citationStatus.icon}
            className={`${citationStatus.color} ${citationStatus.animate ? 'animate-pulse' : ''}`}
            height={16}
            width={16}
          />
        </ComponentTooltip>
      </div>

      {/* Selected indicator or loading spinner */}
      {optimisticSelected || isLoading ? (
        <div
          className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 ${
            isLoading
              ? 'aucctus-bg-secondary animate-pulse'
              : 'aucctus-bg-success-solid'
          }`}
        >
          {isLoading ? (
            <Icon
              variant='loading-02'
              className='aucctus-stroke-quaternary animate-spin'
              height={12}
              width={12}
            />
          ) : (
            <Icon
              variant='check'
              className='aucctus-stroke-white'
              height={10}
              width={10}
              strokeWidth={3}
            />
          )}
        </div>
      ) : null}

      <div className='mb-2 flex items-start gap-2 pr-6'>
        <Icon
          variant='search-md'
          className='aucctus-stroke-info-primary mt-0.5 flex-shrink-0'
          height={16}
          width={16}
        />
        <span className='aucctus-text-sm-medium leading-tight'>
          {card.insight}
        </span>
      </div>

      <div className='flex justify-end'>
        <div
          className={cn(
            'inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-2 py-1 transition-colors',
            card.source?.includes('Nucleus')
              ? 'cursor-default'
              : 'cursor-pointer hover:bg-white/15',
          )}
          onClick={handleSourceClick}
          onDoubleClick={handleSourceClick}
          title={card.url ? `Open ${card.source}` : undefined}
        >
          {getSentimentIcon(card.sentiment)}

          {renderSourceLogo}
          <span className='aucctus-text-xs font-normal'>{displayTitle}</span>
          {card.url && !card.source?.includes('Nucleus') && (
            <Icon
              variant='link-external'
              className='aucctus-stroke-white opacity-70'
              height={12}
              width={12}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ResearchInsightCard;
