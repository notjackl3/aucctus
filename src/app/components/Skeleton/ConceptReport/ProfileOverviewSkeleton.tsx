import React from 'react';
import SkeletonBlock from './SkeletonBlock';

const ProfileOverviewSkeleton: React.FC = () => {
  return (
    <div className='aucctus-bg-primary aucctus-border-secondary flex w-full flex-col gap-4 rounded-lg border p-6 shadow-sm'>
      <div className='flex items-center gap-4'>
        <SkeletonBlock className='h-20 w-20 rounded-full' />
        <div className='flex-1 space-y-2'>
          <SkeletonBlock className='h-5 w-40' />
          <SkeletonBlock className='h-4 w-32' />
        </div>
      </div>
      <div className='space-y-2'>
        <SkeletonBlock className='h-3 w-24' />
        <SkeletonBlock className='h-4 w-full' />
        <SkeletonBlock className='h-4 w-5/6' />
        <SkeletonBlock className='h-4 w-4/6' />
      </div>
      <div className='space-y-3'>
        <SkeletonBlock className='h-3 w-32' />
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <SkeletonBlock className='h-4 w-24' />
            <SkeletonBlock className='h-4 w-32' />
          </div>
          <div className='flex items-center justify-between'>
            <SkeletonBlock className='h-4 w-28' />
            <SkeletonBlock className='h-4 w-36' />
          </div>
          <div className='flex items-center justify-between'>
            <SkeletonBlock className='h-4 w-24' />
            <SkeletonBlock className='h-4 w-24' />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileOverviewSkeleton;
