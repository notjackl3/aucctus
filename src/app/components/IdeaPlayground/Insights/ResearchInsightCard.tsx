import React, { useRef, useMemo, useState } from 'react';
import { Icon } from '@components';
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

  const isNucleusInsight =
    card.source?.toLowerCase().includes('nucleus report') || false;

  const handleDoubleClick = () => {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    // Don't open modal for Nucleus insights
    if (isNucleusInsight) return;
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
      className={`aucctus-text-white relative min-w-[275px] max-w-[275px] cursor-pointer select-none rounded-lg border p-3 shadow-lg backdrop-blur-md ${
        isLoading
          ? 'scale-95 border-white/30 bg-white/10 opacity-80 hover:z-50'
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

      <div className='mb-2 flex items-start gap-2 px-1 pr-6'>
        <span className='aucctus-text-sm-medium leading-tight'>
          {card.insight}
        </span>
      </div>

      <div className='flex justify-start'>
        <div
          className={cn(
            'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/30 bg-white/10 px-1.5 py-0.5 transition-colors',
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
          <span className='text-[10px] font-normal'>{displayTitle}</span>
        </div>
      </div>
    </div>
  );
};

export default ResearchInsightCard;
