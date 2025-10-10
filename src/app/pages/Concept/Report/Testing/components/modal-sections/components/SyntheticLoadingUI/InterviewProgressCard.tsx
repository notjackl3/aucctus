import React from 'react';
import { IPersonaProgressItem } from './types';
import { PersonaIndicator } from './PersonaIndicator';

interface InterviewProgressCardProps {
  personaProgress: IPersonaProgressItem[];
  quotes: Array<{ text: string; profileUuid: string }>;
}

export const InterviewProgressCard: React.FC<InterviewProgressCardProps> = ({
  personaProgress,
  quotes,
}) => {
  return (
    <div className='aucctus-bg-primary aucctus-border-secondary rounded-xl border shadow-sm'>
      <div className='p-6'>
        <h3 className='aucctus-text-primary mb-6 text-center text-xl font-semibold'>
          Interview Progress
        </h3>

        <div className='flex items-center justify-center gap-8'>
          {personaProgress.map((item, index) => {
            // Filter quotes for this specific profile
            const profileQuotes = quotes.filter(
              (q) => q.profileUuid === item.profile.uuid,
            );

            // Alternate positioning: even indices on top, odd on bottom
            const bubblePosition = index % 2 === 0 ? 'top' : 'bottom';

            return (
              <PersonaIndicator
                key={item.profile.uuid}
                profile={item.profile}
                status={item.status}
                isLast={index === personaProgress.length - 1}
                quotes={profileQuotes}
                bubblePosition={bubblePosition}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
