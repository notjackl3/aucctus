import React from 'react';
import SkeletonBlock from './SkeletonBlock';

const ProfileConversationSkeleton: React.FC = () => {
  return (
    <div className='aucctus-bg-primary aucctus-border-secondary flex w-full flex-col gap-4 rounded-lg border p-6 shadow-sm'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <SkeletonBlock className='h-5 w-5 rounded-full' />
          <SkeletonBlock className='h-4 w-48' />
        </div>
        <div className='flex gap-2'>
          <SkeletonBlock className='h-8 w-8 rounded' />
          <SkeletonBlock className='h-8 w-8 rounded' />
          <SkeletonBlock className='h-8 w-8 rounded' />
        </div>
      </div>

      <div className='flex flex-1 flex-col gap-4'>
        <div className='flex gap-3'>
          <SkeletonBlock className='h-8 w-8 rounded-full' />
          <div className='flex-1 space-y-2'>
            <SkeletonBlock className='h-4 w-full' />
            <SkeletonBlock className='h-4 w-2/3' />
          </div>
        </div>
        <div className='flex flex-row-reverse gap-3'>
          <SkeletonBlock className='h-8 w-8 rounded-full' />
          <div className='flex-1 space-y-2'>
            <SkeletonBlock className='h-4 w-full' />
            <SkeletonBlock className='h-4 w-1/2' />
          </div>
        </div>
        <div className='flex gap-3'>
          <SkeletonBlock className='h-8 w-8 rounded-full' />
          <div className='flex-1 space-y-2'>
            <SkeletonBlock className='h-4 w-3/4' />
            <SkeletonBlock className='h-4 w-1/2' />
          </div>
        </div>
      </div>

      <div className='flex items-center gap-2'>
        <SkeletonBlock className='h-10 flex-1 rounded-full' />
        <SkeletonBlock className='h-10 w-10 rounded-full' />
      </div>
    </div>
  );
};

export default ProfileConversationSkeleton;
