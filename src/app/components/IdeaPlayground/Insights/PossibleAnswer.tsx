import React, { useState } from 'react';
import { Icon } from '@components';
import { InsightCard as InsightCardType } from '../types';
import {
  useIncludeAnswerLight,
  useExcludeAnswerLight,
} from '@hooks/query/ideaPlayground.hook';
import { AucctusQueryKeys } from '@hooks/query/query-keys';
import { useDebouncedInvalidation } from '@hooks/query/useDebouncedInvalidation';
interface PossibleAnswerProps {
  card: InsightCardType;
  isSelected: boolean;
  seedUuid: string;
  questionUuid: string;
  getSentimentColor: (
    sentiment: InsightCardType['sentiment'],
    source?: string,
  ) => string;
  onSelectionChange: (cardId: string, isSelected: boolean) => void;
}

const PossibleAnswer: React.FC<PossibleAnswerProps> = ({
  card,
  isSelected,
  seedUuid,
  questionUuid,
  getSentimentColor,
  onSelectionChange,
}) => {
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
  return (
    <div
      className={`aucctus-text-white relative min-w-[275px] max-w-[275px] cursor-pointer select-none rounded-xl border p-3 shadow-lg backdrop-blur-md ${
        isLoading
          ? 'scale-95 border-white/30 bg-white/10 opacity-80 hover:z-50'
          : optimisticSelected
            ? 'scale-100 border-white/40 bg-white/20 opacity-100 ring-1 ring-white/30'
            : getSentimentColor(card.sentiment, card.source) +
              ' scale-100 opacity-100'
      }`}
      onClick={handleClick}
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

      <div className='mb-2 flex items-start gap-2'>
        <span className='aucctus-text-sm-medium leading-tight'>
          {card.insight}
        </span>
      </div>

      <div className='flex justify-end'>
        <div className='inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-2 py-1 transition-colors hover:bg-white/15'>
          <span className='aucctus-text-xs-medium'>
            {card.source.replace('.com', '')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PossibleAnswer;
