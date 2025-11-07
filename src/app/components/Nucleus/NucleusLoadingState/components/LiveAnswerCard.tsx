import React from 'react';
import { cn } from '@libs/utils/react';

export interface LiveAnswer {
  id: string;
  content: string;
  source: string;
}

/**
 * LiveAnswerCard Component
 * Displays a single research finding with source attribution
 */
const LiveAnswerCard: React.FC<{ answer: LiveAnswer }> = ({ answer }) => {
  return (
    <div
      className={cn(
        'w-[221px] rounded-lg px-3 py-2.5',
        'aucctus-bg-primary-alt aucctus-border-secondary border bg-opacity-90',
        'shadow-sm backdrop-blur-sm',
      )}
    >
      <div className='flex-1'>
        <p className='aucctus-text-primary aucctus-text-xs mb-2 line-clamp-3 leading-snug'>
          {answer.content}
        </p>
      </div>
      <div>
        <div className='aucctus-bg-secondary-subtle aucctus-border-tertiary flex w-fit items-center gap-1.5 rounded-full border px-2 py-1 text-[9px] font-medium'>
          <div className='aucctus-bg-brand-solid flex h-3 w-3 items-center justify-center rounded-sm'>
            <span className='aucctus-text-white self-center text-center align-middle text-[8px] font-bold'>
              {answer.source.charAt(0)}
            </span>
          </div>
          <span className='aucctus-text-secondary aucctus-text-2xs align-center max-w-[100px] self-center truncate'>
            {answer.source}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LiveAnswerCard;
