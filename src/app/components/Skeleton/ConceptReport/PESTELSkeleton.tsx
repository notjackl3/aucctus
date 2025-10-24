import React from 'react';
import SkeletonBlock from './SkeletonBlock';

interface PESTELSkeletonProps {
  count?: number;
}

const PESTELSkeleton: React.FC<PESTELSkeletonProps> = ({ count = 3 }) => {
  return (
    <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className='aucctus-bg-primary aucctus-border-secondary flex h-full flex-col overflow-hidden rounded-lg border shadow-sm'
        >
          <div className='aucctus-bg-secondary-subtle space-y-3 px-6 py-6'>
            <div className='flex items-center gap-3'>
              <SkeletonBlock className='h-5 w-5 rounded-full' />
              <SkeletonBlock className='h-4 w-24' />
            </div>
            <SkeletonBlock className='h-5 w-full' />
            <SkeletonBlock className='h-5 w-4/5' />
          </div>

          <div className='flex flex-1 flex-col justify-between space-y-6 px-6 py-4'>
            <div className='space-y-2'>
              <SkeletonBlock className='h-3 w-28' />
              <SkeletonBlock className='h-4 w-full' />
              <SkeletonBlock className='h-4 w-5/6' />
            </div>
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <SkeletonBlock className='h-4 w-32' />
                <div className='flex gap-2'>
                  <SkeletonBlock className='h-8 w-8 rounded-full' />
                  <SkeletonBlock className='h-8 w-8 rounded-full' />
                </div>
              </div>
              <div className='aucctus-border-secondary space-y-2 rounded-lg border p-4'>
                <SkeletonBlock className='h-4 w-full' />
                <SkeletonBlock className='h-4 w-2/3' />
                <SkeletonBlock className='h-4 w-24 rounded-full' />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PESTELSkeleton;
