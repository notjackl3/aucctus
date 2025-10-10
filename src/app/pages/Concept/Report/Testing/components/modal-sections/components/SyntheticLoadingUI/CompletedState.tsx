import { Icon } from '@components';
import { ICustomerProfile } from '@libs/api/types/concept/concepts';
import React from 'react';
import { CompletedInterviewItem } from './CompletedInterviewItem';

interface CompletedStateProps {
  profiles: ICustomerProfile[];
  resultsCount?: number;
  onViewResults?: () => void;
}

export const CompletedState: React.FC<CompletedStateProps> = ({
  profiles,
  resultsCount,
  onViewResults,
}) => {
  return (
    <div className='space-y-6'>
      {/* Success Card */}
      <div className='aucctus-bg-primary aucctus-border-secondary overflow-hidden rounded-xl border shadow-sm'>
        <div className='border-l-4 border-l-green-500'>
          <div className='p-8 text-center'>
            <h2 className='aucctus-text-primary mb-2 text-3xl font-bold'>
              Synthetic Test Complete!
            </h2>
            <p className='aucctus-text-secondary aucctus-text-lg mb-6'>
              Successfully interviewed {profiles.length} synthetic participants
            </p>

            <button
              className='btn btn-primary btn-lg inline-flex items-center gap-2'
              onClick={onViewResults}
            >
              <Icon
                variant='file-attachment'
                className='aucctus-stroke-white h-5 w-5'
              />
              View Results
            </button>
          </div>
        </div>
      </div>

      {/* Completed Interviews Grid */}
      <div className='aucctus-bg-primary aucctus-border-secondary rounded-xl border shadow-sm'>
        <div className='p-6'>
          <h3 className='aucctus-text-primary mb-6 text-xl font-semibold'>
            Completed Interviews
          </h3>

          <div className='grid grid-cols-2 gap-4'>
            {profiles.map((profile, index) => {
              // For synthetic interviews, we typically run 1 interview per profile
              // If resultsCount is available, distribute evenly across profiles
              // Otherwise, assume 1 interview per profile (standard synthetic test)
              const totalResults = resultsCount || profiles.length;
              const interviewsPerProfile =
                profiles.length > 0
                  ? Math.floor(totalResults / profiles.length)
                  : 0;
              const remainderInterviews =
                profiles.length > 0 ? totalResults % profiles.length : 0;
              // Distribute remainder interviews to first profiles
              const profileInterviews =
                interviewsPerProfile + (index < remainderInterviews ? 1 : 0);

              return (
                <CompletedInterviewItem
                  key={profile.uuid}
                  profile={profile}
                  completedCount={profileInterviews}
                />
              );
            })}
          </div>

          {/* Summary Stats */}
          <div className='mt-8 grid grid-cols-3 gap-6'>
            <div className='text-center'>
              <div className='aucctus-text-primary text-4xl font-bold'>
                {profiles.length}
              </div>
              <div className='aucctus-text-secondary aucctus-text-sm'>
                Participants
              </div>
            </div>
            <div className='text-center'>
              <div className='aucctus-text-primary text-4xl font-bold'>
                {resultsCount || profiles.length}
              </div>
              <div className='aucctus-text-secondary aucctus-text-sm'>
                Responses
              </div>
            </div>
            <div className='text-center'>
              <div className='aucctus-text-primary text-4xl font-bold'>
                100%
              </div>
              <div className='aucctus-text-secondary aucctus-text-sm'>
                Complete
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
