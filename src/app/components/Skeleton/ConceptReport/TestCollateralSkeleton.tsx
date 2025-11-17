import React from 'react';
import SkeletonBlock from './SkeletonBlock';

const TestCollateralSkeleton: React.FC = () => {
  return (
    <div className='grid h-full gap-6 lg:grid-cols-[320px_1fr]'>
      {/* Left column - collateral list */}
      <div className='space-y-4'>
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`collateral-skeleton-item-${index}`}
            className='aucctus-border-secondary aucctus-bg-primary rounded-xl border p-4'
          >
            <div className='flex items-center gap-3'>
              <SkeletonBlock className='h-10 w-10 rounded-full' />
              <div className='flex-1 space-y-2'>
                <SkeletonBlock className='h-4 w-3/4' />
                <SkeletonBlock className='h-3 w-1/2' />
              </div>
            </div>
            <div className='mt-3 space-y-2'>
              <SkeletonBlock className='h-3 w-full' />
              <SkeletonBlock className='h-3 w-4/5' />
            </div>
          </div>
        ))}

        {/* Upload request actions */}
        <div className='space-y-4'>
          <SkeletonBlock className='h-12 w-full rounded-lg' />
          <SkeletonBlock className='h-12 w-full rounded-lg' />
        </div>
      </div>

      {/* Right column - collateral detail */}
      <div className='aucctus-border-secondary aucctus-bg-primary flex h-full flex-col rounded-xl border p-6'>
        {/* Header */}
        <div className='flex items-start justify-between gap-4'>
          <div className='flex-1 space-y-2'>
            <SkeletonBlock className='h-6 w-2/3' />
            <SkeletonBlock className='h-4 w-1/2' />
          </div>
          <div className='flex gap-3'>
            <SkeletonBlock className='h-10 w-24 rounded-lg' />
            <SkeletonBlock className='h-10 w-24 rounded-lg' />
          </div>
        </div>

        {/* Content */}
        <div className='mt-6 space-y-3'>
          {Array.from({ length: 8 }).map((_, idx) => (
            <SkeletonBlock
              key={`collateral-content-line-${idx}`}
              className='h-4 w-full'
            />
          ))}
        </div>

        {/* Feedback */}
        <div className='mt-8 space-y-3'>
          <SkeletonBlock className='h-5 w-32' />
          <SkeletonBlock className='h-20 w-full rounded-lg' />
          <div className='flex gap-3'>
            <SkeletonBlock className='h-10 w-24 rounded-lg' />
            <SkeletonBlock className='h-10 w-32 rounded-lg' />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestCollateralSkeleton;
