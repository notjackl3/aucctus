import React from 'react';
import SkeletonBlock from './SkeletonBlock';

/**
 * Skeleton loading state for Executive Dashboard carousel cards
 * Mirrors the structure of MarketSizeCard, TrendsDriversCard, etc.
 */
const DashboardCarouselCardSkeleton: React.FC = () => {
  return (
    <div className='aucctus-bg-primary aucctus-border-secondary h-full min-h-[350px] rounded-lg border'>
      <div className='flex h-full flex-col p-6'>
        {/* Progress Bar Skeleton */}
        <div className='mb-6 flex items-center gap-2'>
          {[...Array(6)].map((_, i) => (
            <SkeletonBlock key={i} className='h-1 flex-1 rounded-full' />
          ))}
        </div>

        {/* Header Section Skeleton */}
        <div className='mb-6 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <SkeletonBlock className='h-4 w-4 rounded' />
            <SkeletonBlock className='h-4 w-32' />
          </div>
          <SkeletonBlock className='h-8 w-20 rounded-lg' />
        </div>

        {/* Content Area Skeleton */}
        <div className='grid flex-1 grid-cols-1 gap-4 md:grid-cols-2'>
          {/* Left - Text Content Skeleton */}
          <div className='flex flex-col justify-start space-y-3 px-2 py-2'>
            <SkeletonBlock className='h-4 w-full' />
            <SkeletonBlock className='h-4 w-full' />
            <SkeletonBlock className='h-4 w-5/6' />
            <SkeletonBlock className='h-4 w-full' />
            <SkeletonBlock className='h-4 w-4/5' />
          </div>

          {/* Right - Visualization Skeleton */}
          <div className='flex items-center justify-center'>
            <SkeletonBlock className='h-[200px] w-[200px] rounded-lg' />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCarouselCardSkeleton;
