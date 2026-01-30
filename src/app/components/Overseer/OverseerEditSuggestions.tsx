import AiFrostedCard from '@components/AiInteraction/AiFrostedCard';
import { Icon } from '@components';
import { IAiEditingSuggestion } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import React, { useMemo, useState, useCallback, useEffect } from 'react';

const MAX_VISIBLE_EDITS = 2;

const sectionToIconMap: Record<string, IconVariant> = {
  overview: 'eye',
  market_scan: 'compass-03',
  assumptions: 'lightbulb',
  customer_profiles: 'user-square',
  key_assumptions: 'lightbulb',
  financial_projection: 'line-chart-up',
};

interface OverseerEditSuggestionsProps {
  reply?: string;
  edits: IAiEditingSuggestion[];
  onConfirm: (selectedEdits: IAiEditingSuggestion[]) => void;
  onCancel: () => void;
  className?: string;
}

const OverseerEditSuggestions: React.FC<OverseerEditSuggestionsProps> = ({
  reply,
  edits,
  onConfirm,
  onCancel,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    () => new Set(edits.map((_, index) => index)),
  );

  useEffect(() => {
    setSelectedIndices(new Set(edits.map((_, index) => index)));
  }, [edits]);

  const hasEdits = edits.length > 0;
  const hasMoreEdits = edits.length > MAX_VISIBLE_EDITS;
  const hiddenCount = edits.length - MAX_VISIBLE_EDITS;
  const hasSelectedEdits = selectedIndices.size > 0;

  const toggleEditSelection = useCallback((index: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (!hasSelectedEdits) return;
    const selected = edits.filter((_, index) => selectedIndices.has(index));
    onConfirm(selected);
  }, [edits, selectedIndices, hasSelectedEdits, onConfirm]);

  const visibleEditsWithIndices = useMemo(() => {
    const editsWithIndices = edits.map((edit, index) => ({ edit, index }));
    if (isExpanded) return editsWithIndices;
    return editsWithIndices.slice(0, MAX_VISIBLE_EDITS);
  }, [edits, isExpanded]);

  if (!hasEdits) {
    return null;
  }

  return (
    <AiFrostedCard
      className={cn('border border-white/10 bg-black/30', className)}
      variant='dark'
    >
      <div className='flex flex-col gap-4'>
        {reply && (
          <span className='aucctus-text-sm text-gray-light-200'>{reply}</span>
        )}
        <div
          className={cn('flex flex-col gap-4', {
            'max-h-[320px] overflow-y-auto': isExpanded && hasMoreEdits,
          })}
        >
          {visibleEditsWithIndices.map(({ edit, index }) => {
            const isSelected = selectedIndices.has(index);
            return (
              <button
                key={`${edit.section}-${index}`}
                type='button'
                onClick={() => toggleEditSelection(index)}
                className={cn(
                  'w-full cursor-pointer rounded-lg text-left transition-all duration-200',
                  'ring-2 ring-offset-2 ring-offset-transparent',
                  {
                    'ring-brand-primary-500': isSelected,
                    'opacity-50 ring-transparent hover:opacity-75': !isSelected,
                  },
                )}
              >
                <AiFrostedCard
                  title={edit.title}
                  message={edit.description}
                  variant='dark'
                  leadingIcon={
                    sectionToIconMap[edit.section] ?? edit.icon ?? ''
                  }
                />
              </button>
            );
          })}
        </div>
        {hasMoreEdits && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className='flex items-center gap-1 text-sm text-gray-light-300 transition-colors hover:text-white'
          >
            <Icon
              variant={isExpanded ? 'chevronup' : 'chevrondown'}
              className='h-4 w-4 stroke-gray-light-300'
            />
            {isExpanded
              ? 'Show less'
              : `Show ${hiddenCount} more edit${hiddenCount > 1 ? 's' : ''}`}
          </button>
        )}
        <div className='mt-2 flex flex-1 flex-row items-center gap-2'>
          <span className='flex-1' />
          <span className='aucctus-text-sm text-gray-light-300'>
            {selectedIndices.size}/{edits.length} selected
          </span>
          <button
            className={cn('btn btn-light', {
              'btn-disabled cursor-not-allowed opacity-50': !hasSelectedEdits,
            })}
            onClick={handleConfirm}
            disabled={!hasSelectedEdits}
          >
            Apply Changes
          </button>
          <button className='btn btn-light' onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </AiFrostedCard>
  );
};

export default OverseerEditSuggestions;
