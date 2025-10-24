import React from 'react';
import SkeletonBlock from './SkeletonBlock';

const TestingSkeleton: React.FC = () => {
  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='space-y-2'>
        <SkeletonBlock className='h-7 w-48' />
        <SkeletonBlock className='h-4 w-72' />
      </div>

      {/* Recommended Test Section */}
      <div className='space-y-3'>
        <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-6 shadow-sm'>
          <div className='mb-6 flex items-start justify-between'>
            <SkeletonBlock className='h-6 w-40 rounded-full' />
            <SkeletonBlock className='h-10 w-28 rounded-md' />
          </div>
          <div className='space-y-3'>
            <SkeletonBlock className='h-6 w-64' />
            <SkeletonBlock className='h-4 w-full' />
            <SkeletonBlock className='h-4 w-5/6' />
          </div>
          <div className='mt-6 space-y-3'>
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className='aucctus-border-secondary aucctus-bg-secondary-hover rounded-lg border p-4'
              >
                <div className='mb-3 flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <SkeletonBlock className='h-6 w-6 rounded-full' />
                    <SkeletonBlock className='h-5 w-32' />
                  </div>
                  <SkeletonBlock className='h-6 w-20 rounded-full' />
                </div>
                <SkeletonBlock className='h-4 w-full' />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Test History Section */}
      <div className='space-y-3'>
        <div className='flex items-center gap-2'>
          <SkeletonBlock className='h-5 w-5 rounded' />
          <SkeletonBlock className='h-5 w-40' />
        </div>
        <div className='space-y-3'>
          {[...Array(2)].map((_, index) => (
            <div
              key={index}
              className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-6 shadow-sm'
            >
              <div className='mb-4 flex items-center justify-between'>
                <SkeletonBlock className='h-5 w-48' />
                <SkeletonBlock className='h-5 w-20' />
              </div>
              <div className='space-y-2'>
                <SkeletonBlock className='h-4 w-full' />
                <SkeletonBlock className='h-4 w-5/6' />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestingSkeleton;
