import AiFrostedCard from '@components/Card/ConceptGeneration/AiExploration/AiFrostedCard';
import { IConceptReportEdit } from '@libs/api/types';
import React from 'react';

const CONCEPT_AI_EDITING_NOTE =
  'Note that AI editing is not perfect, some other sections may also be changed in the process. This process will take around 10 minutes.';

const sectionToIconMap: Record<string, IconVariant> = {
  overview: 'eye',
  market_scan: 'compass-03',
  assumptions: 'lightbulb',
  customer_profiles: 'users-03',
  financial_projection: 'line-chart-up',
};

interface AgentMessageCardProps {
  message: IConceptReportEdit | Partial<IConceptReportEdit>;
  isActiveAiEditMessage?: boolean;
  onConfirmation?: () => void;
  onRejection?: () => void;
}

const AgentMessageCard: React.FC<AgentMessageCardProps> = ({
  message,
  isActiveAiEditMessage = false,
  onConfirmation,
  onRejection,
}) => {
  return (
    <>
      <AiFrostedCard
        message={message.response || ''}
        className='mx-4'
        variant='dark'
      >
        <div className='flex flex-col gap-4'>
          <span className='aucctus-text-sm text-gray-light-200'>
            {message.response || ''}
          </span>
          {(message.edits ?? []).map((edit, index) => (
            <AiFrostedCard
              key={index}
              title={edit.title}
              message={edit.content}
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

export default AgentMessageCard;
