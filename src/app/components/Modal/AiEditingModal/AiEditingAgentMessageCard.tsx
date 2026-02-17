import AiFrostedCard from '@components/AiInteraction/AiFrostedCard';
import { IAiEditingSuggestion, IConceptReportEdit } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { DynamicIcon } from '@libs/utils/iconMap';

const CONCEPT_AI_EDITING_NOTE =
  'AI editing can make mistakes. Additional sections may be impacted. This process will take up to 10 minutes.';

const MAX_VISIBLE_EDITS = 2;

const sectionToIconMap: Record<string, string> = {
  overview: 'eye',
  market_scan: 'compass-03',
  assumptions: 'lightbulb',
  customer_profiles: 'user-square',
  key_assumptions: 'lightbulb', // key_assumptions or assumptions are the same
  financial_projection: 'line-chart-up',
};

interface AiEditingAgentMessageCardProps {
  message: IConceptReportEdit | Partial<IConceptReportEdit>;
  onConfirmation?: (
    editedMessage: IConceptReportEdit | Partial<IConceptReportEdit>,
  ) => void;
  onRejection?: () => void;
  className?: string;
}

const AiEditingAgentMessageCard: React.FC<AiEditingAgentMessageCardProps> = ({
  message,
  className = '',
  onConfirmation,
  onRejection,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const edits = useMemo(() => message.edits ?? [], [message.edits]);

  // Track selected edits by their index - all selected by default
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    () => new Set(edits.map((_, index) => index)),
  );

  // Update selection when edits change (reset to all selected)
  useEffect(() => {
    setSelectedIndices(new Set(edits.map((_, index) => index)));
  }, [edits]);

  const hasEdits = edits.length > 0;
  const hasMoreEdits = edits.length > MAX_VISIBLE_EDITS;
  const hiddenCount = edits.length - MAX_VISIBLE_EDITS;
  const hasSelectedEdits = selectedIndices.size > 0;

  const toggleEditSelection = useCallback((index: number) => {
    setSelectedIndices((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const handleConfirmation = useCallback(() => {
    if (!onConfirmation || !hasSelectedEdits) return;

    // Filter edits to only include selected ones
    const selectedEdits: IAiEditingSuggestion[] = edits.filter((_, index) =>
      selectedIndices.has(index),
    );

    const editedMessage: IConceptReportEdit | Partial<IConceptReportEdit> = {
      ...message,
      edits: selectedEdits,
    };

    onConfirmation(editedMessage);
  }, [onConfirmation, hasSelectedEdits, edits, selectedIndices, message]);

  // Track visible edits with their original indices
  const visibleEditsWithIndices = useMemo(() => {
    const editsWithIndices = edits.map((edit, index) => ({ edit, index }));
    if (isExpanded) return editsWithIndices;
    return editsWithIndices.slice(0, MAX_VISIBLE_EDITS);
  }, [edits, isExpanded]);

  return (
    <>
      <AiFrostedCard
        message={message.reply || ''}
        className={cn('transition-all', className)}
        variant='dark'
      >
        <div className='flex flex-col gap-4'>
          <span className='aucctus-text-sm text-gray-light-200'>
            {message.reply || ''}
          </span>
          <div
            className={cn('flex flex-col gap-4', {
              'max-h-[400px] overflow-y-auto': isExpanded && hasMoreEdits,
            })}
          >
            {visibleEditsWithIndices.map(({ edit, index }) => {
              const isSelected = selectedIndices.has(index);
              return (
                <button
                  key={index}
                  type='button'
                  onClick={() => toggleEditSelection(index)}
                  className={cn(
                    'w-full cursor-pointer rounded-lg text-left transition-all duration-200',
                    'ring-2 ring-offset-2 ring-offset-transparent',
                    {
                      'ring-brand-primary-500': isSelected,
                      'opacity-50 ring-transparent hover:opacity-75':
                        !isSelected,
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
              <DynamicIcon
                variant={isExpanded ? 'chevronup' : 'chevrondown'}
                className='h-4 w-4 stroke-gray-light-300'
              />
              {isExpanded
                ? 'Show less'
                : `Show ${hiddenCount} more edit${hiddenCount > 1 ? 's' : ''}`}
            </button>
          )}
        </div>
        {hasEdits && (
          <>
            <span className='aucctus-text-sm flex-1 break-words text-gray-light-200'>
              {CONCEPT_AI_EDITING_NOTE}
            </span>
            <div className='mt-2 flex flex-1 flex-row items-center gap-2'>
              <span className='flex-1' />
              <span className='aucctus-text-sm text-gray-light-300'>
                {selectedIndices.size}/{edits.length} selected
              </span>
              <button
                className={cn('btn btn-light', {
                  'btn-disabled cursor-not-allowed opacity-50':
                    !hasSelectedEdits,
                })}
                onClick={handleConfirmation}
                disabled={!hasSelectedEdits}
              >
                Make Changes
              </button>
              <button className='btn btn-light' onClick={onRejection}>
                Cancel
              </button>
            </div>
          </>
        )}
      </AiFrostedCard>
      <div className='flex flex-1' />
    </>
  );
};

export default AiEditingAgentMessageCard;
