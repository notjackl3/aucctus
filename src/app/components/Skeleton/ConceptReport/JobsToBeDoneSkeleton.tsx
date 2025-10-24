import React from 'react';
import SkeletonBlock from './SkeletonBlock';

const JobsToBeDoneSkeleton: React.FC = () => {
  return (
    <div className='aucctus-bg-primary aucctus-border-secondary flex h-full flex-1 flex-col gap-4 rounded-lg border p-4 shadow-sm'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <SkeletonBlock className='h-5 w-5 rounded-full' />
          <SkeletonBlock className='h-4 w-40' />
        </div>
        <SkeletonBlock className='h-8 w-8 rounded-full' />
      </div>
      <SkeletonBlock className='h-3 w-48' />
      <div className='flex gap-3'>
        <SkeletonBlock className='h-48 w-1 rounded-full' />
        <div className='flex-1 space-y-3'>
          {[...Array(4)].map((_, index) => (
            <SkeletonBlock key={index} className='h-10 w-full rounded-md' />
          ))}
        </div>
      </div>
      <div className='space-y-2 border-t pt-2'>
        <SkeletonBlock className='h-3 w-32' />
        <SkeletonBlock className='h-4 w-full' />
        <SkeletonBlock className='h-4 w-3/4' />
      </div>
    </div>
  );
};

export default JobsToBeDoneSkeleton;
