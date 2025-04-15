import AiFrostedCard from '@components/AiInteraction/AiFrostedCard';
import { IConceptReportEdit } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import React from 'react';

const CONCEPT_AI_EDITING_NOTE =
  'AI editing can make mistakes. Additional sections may be impacted. This process will take up to 10 minutes.';

const sectionToIconMap: Record<string, IconVariant> = {
  overview: 'eye',
  market_scan: 'compass-03',
  assumptions: 'lightbulb',
  customer_profiles: 'users-03',
  financial_projection: 'line-chart-up',
};

interface AiEditingAgentMessageCardProps {
  message: IConceptReportEdit | Partial<IConceptReportEdit>;
  isActiveAiEditMessage?: boolean;
  onConfirmation?: () => void;
  onRejection?: () => void;
  className?: string;
}

const AiEditingAgentMessageCard: React.FC<AiEditingAgentMessageCardProps> = ({
  message,
  className = '',
  isActiveAiEditMessage = false,
  onConfirmation,
  onRejection,
}) => {
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
          {(message.edits ?? []).map((edit, index) => (
            <AiFrostedCard
              key={index}
              title={edit.title}
              message={edit.description}
              variant='dark'
              leadingIcon={sectionToIconMap[edit.section]}
            />
          ))}
        </div>
        {isActiveAiEditMessage && (
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
