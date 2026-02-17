import { ICustomerProfile } from '@libs/api/types/concept/concepts';
import React from 'react';
import { Check, UserSquare } from 'lucide-react';

interface CompletedInterviewItemProps {
  profile: ICustomerProfile;
  completedCount: number;
}

export const CompletedInterviewItem: React.FC<CompletedInterviewItemProps> = ({
  profile,
  completedCount,
}) => {
  return (
    <div className='aucctus-bg-success-subtle aucctus-border-success-subtle flex items-center gap-4 rounded-lg border p-4'>
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
            <UserSquare className='aucctus-stroke-secondary h-6 w-6' />
          </div>
        )}

        {/* Green checkmark at top-right */}
        <div className='absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500'>
          <Check className='h-3 w-3 stroke-white stroke-2' />
        </div>
      </div>

      {/* Profile Info */}
      <div className='flex-1'>
        <div className='aucctus-text-primary font-medium'>
          {profile.segment}
        </div>
        <div className='aucctus-text-secondary aucctus-text-sm'>
          {profile.name}
        </div>
      </div>

      {/* Completed Count */}
      <div className='text-right'>
        <div className='text-lg font-bold text-green-600'>{completedCount}</div>
        <div className='aucctus-text-secondary aucctus-text-xs'>completed</div>
      </div>
    </div>
  );
};
