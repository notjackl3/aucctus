import AiFrostedCard from '@components/AiInteraction/AiFrostedCard';
import { Icon } from '@components';
import { IConceptReportEdit } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import React, { useMemo, useState } from 'react';

const CONCEPT_AI_EDITING_NOTE =
  'AI editing can make mistakes. Additional sections may be impacted. This process will take up to 10 minutes.';

const MAX_VISIBLE_EDITS = 2;

const sectionToIconMap: Record<string, IconVariant> = {
  overview: 'eye',
  market_scan: 'compass-03',
  assumptions: 'lightbulb',
  customer_profiles: 'user-square',
  key_assumptions: 'lightbulb', // key_assumptions or assumptions are the same
  financial_projection: 'line-chart-up',
};

interface AiEditingAgentMessageCardProps {
  message: IConceptReportEdit | Partial<IConceptReportEdit>;
  onConfirmation?: () => void;
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
  const hasEdits = edits.length > 0;
  const hasMoreEdits = edits.length > MAX_VISIBLE_EDITS;
  const hiddenCount = edits.length - MAX_VISIBLE_EDITS;

  const visibleEdits = useMemo(() => {
    if (isExpanded) return edits;
    return edits.slice(0, MAX_VISIBLE_EDITS);
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
              'max-h-[400px] overflow-y-auto overscroll-contain':
                isExpanded && hasMoreEdits,
            })}
          >
            {visibleEdits.map((edit, index) => (
              <AiFrostedCard
                key={index}
                title={edit.title}
                message={edit.description}
                variant='dark'
                leadingIcon={sectionToIconMap[edit.section] ?? edit.icon ?? ''}
              />
            ))}
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
        </div>
        {hasEdits && (
          <>
            <span className='aucctus-text-sm flex-1 break-words text-gray-light-200'>
              {CONCEPT_AI_EDITING_NOTE}
            </span>
            <div className='mt-2 flex flex-1 flex-row gap-2'>
              <span className='flex-1' />
              <button className='btn btn-light' onClick={onConfirmation}>
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
