import React from 'react';
import SkeletonBlock from './SkeletonBlock';

interface PriorityInsightsSkeletonProps {
  count?: number;
}

const PriorityInsightsSkeleton: React.FC<PriorityInsightsSkeletonProps> = ({
  count = 3,
}) => {
  return (
    <div className='flex flex-col gap-6'>
      <div className='mt-4 space-y-2'>
        <div className='flex items-center gap-2'>
          <SkeletonBlock className='h-5 w-5 rounded-full' />
          <SkeletonBlock className='h-4 w-48' />
        </div>
        <SkeletonBlock className='h-3 w-64' />
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className='aucctus-bg-primary aucctus-border-secondary flex flex-col gap-4 rounded-lg border p-6 shadow-sm'
          >
            <div className='flex items-start justify-between gap-4'>
              <SkeletonBlock className='h-5 w-2/3' />
              <SkeletonBlock className='h-10 w-10 rounded-full' />
            </div>
            <div className='space-y-2'>
              <SkeletonBlock className='h-3 w-24' />
              <SkeletonBlock className='h-4 w-full' />
              <SkeletonBlock className='h-4 w-5/6' />
            </div>
            <div className='flex flex-wrap gap-2'>
              <SkeletonBlock className='h-8 w-24 rounded-full' />
              <SkeletonBlock className='h-8 w-28 rounded-full' />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriorityInsightsSkeleton;
