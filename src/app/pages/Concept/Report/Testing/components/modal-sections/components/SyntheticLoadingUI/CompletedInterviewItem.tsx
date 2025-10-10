import { Icon } from '@components';
import { ICustomerProfile } from '@libs/api/types/concept/concepts';
import React from 'react';

interface CompletedInterviewItemProps {
  profile: ICustomerProfile;
  completedCount: number;
}

export const CompletedInterviewItem: React.FC<CompletedInterviewItemProps> = ({
  profile,
  completedCount,
}) => {
  return (
    <div className='aucctus-bg-secondary-subtle rounded-lg p-4'>
      <div className='flex items-center gap-3'>
        {/* Avatar with checkmark */}
        <div className='relative'>
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className='h-12 w-12 rounded-full object-cover'
            />
          ) : (
            <div className='aucctus-bg-secondary flex h-12 w-12 items-center justify-center rounded-full'>
              <Icon
                variant='user-square'
                className='aucctus-stroke-secondary h-6 w-6'
              />
            </div>
          )}

          <div className='absolute -bottom-1 -right-1 rounded-full bg-green-500 p-1'>
            <Icon variant='check' className='h-3 w-3 stroke-white stroke-2' />
          </div>
        </div>

        {/* Profile Info */}
        <div className='flex-1'>
          <div className='aucctus-text-primary aucctus-text-md font-semibold'>
            {profile.segment}
          </div>
          <div className='aucctus-text-secondary aucctus-text-sm'>
            {profile.name}
          </div>
        </div>

        {/* Completed Count */}
        <div className='text-right'>
          <div className='aucctus-text-primary text-2xl font-bold text-green-600'>
            {completedCount}
          </div>
          <div className='aucctus-text-secondary aucctus-text-xs'>
            completed
          </div>
        </div>
      </div>
    </div>
  );
};
