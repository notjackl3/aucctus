import React from 'react';
import SkeletonBlock from './SkeletonBlock';

const ExecutiveDashboardSkeleton: React.FC = () => {
  return (
    <div className='space-y-8'>
      {/* Gut Check Banner Skeleton */}
      <div className='aucctus-bg-secondary rounded-lg p-6'>
        <div className='flex items-center justify-between'>
          <div className='space-y-2'>
            <SkeletonBlock className='h-6 w-48' />
            <SkeletonBlock className='h-4 w-96' />
          </div>
          <SkeletonBlock className='h-8 w-24 rounded' />
        </div>
      </div>

      {/* Hero Section Skeleton */}
      <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
        {/* Left - Concept Image Skeleton */}
        <div className='flex items-start justify-center'>
          <div className='aucctus-border-primary relative h-[420px] w-full overflow-hidden rounded-xl border'>
            <SkeletonBlock className='h-full w-full' />
            {/* Badge Skeleton */}
            <div className='absolute bottom-4 left-4 right-4'>
              <SkeletonBlock className='h-6 w-32 rounded' />
            </div>
          </div>
        </div>

        {/* Right - Info Cards Skeleton */}
        <div className='space-y-6'>
          {/* What is it Card */}
          <div className='aucctus-bg-secondary rounded-lg p-6'>
            <div className='mb-4 flex items-center gap-3'>
              <SkeletonBlock className='h-6 w-6 rounded' />
              <SkeletonBlock className='h-6 w-32' />
            </div>
            <div className='space-y-2'>
              <SkeletonBlock className='h-4 w-full' />
              <SkeletonBlock className='h-4 w-full' />
              <SkeletonBlock className='h-4 w-3/4' />
            </div>
          </div>

          {/* Value Proposition Card */}
          <div className='aucctus-bg-secondary rounded-lg p-6'>
            <div className='mb-4 flex items-center gap-3'>
              <SkeletonBlock className='h-6 w-6 rounded' />
              <SkeletonBlock className='h-6 w-40' />
            </div>
            <div className='space-y-2'>
              <SkeletonBlock className='h-4 w-full' />
              <SkeletonBlock className='h-4 w-full' />
              <SkeletonBlock className='h-4 w-2/3' />
            </div>
          </div>

          {/* Problem Statement Card */}
          <div className='aucctus-bg-secondary rounded-lg p-6'>
            <div className='mb-4 flex items-center gap-3'>
              <SkeletonBlock className='h-6 w-6 rounded' />
              <SkeletonBlock className='h-6 w-36' />
            </div>
            <div className='space-y-2'>
              <SkeletonBlock className='h-4 w-full' />
              <SkeletonBlock className='h-4 w-full' />
              <SkeletonBlock className='h-4 w-4/5' />
            </div>
          </div>
        </div>
      </div>

      {/* Differentiators and Rights to Win Skeleton */}
      <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
        {/* Differentiators Card */}
        <div className='aucctus-bg-secondary rounded-lg p-6'>
          <div className='mb-4 flex items-center gap-3'>
            <SkeletonBlock className='h-6 w-6 rounded' />
            <SkeletonBlock className='h-6 w-32' />
          </div>
          <div className='space-y-3'>
            {[...Array(3)].map((_, i) => (
              <div key={i} className='flex items-center gap-3'>
                <SkeletonBlock className='h-4 w-4 rounded' />
                <SkeletonBlock className='h-4 w-full' />
              </div>
            ))}
          </div>
        </div>

        {/* Rights to Win Card */}
        <div className='aucctus-bg-secondary rounded-lg p-6'>
          <div className='mb-4 flex items-center gap-3'>
            <SkeletonBlock className='h-6 w-6 rounded' />
            <SkeletonBlock className='h-6 w-28' />
          </div>
          <div className='space-y-3'>
            {[...Array(3)].map((_, i) => (
              <div key={i} className='flex items-center gap-3'>
                <SkeletonBlock className='h-4 w-4 rounded' />
                <SkeletonBlock className='h-4 w-full' />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Card Skeleton */}
      <div className='aucctus-bg-secondary rounded-lg p-8'>
        <div className='mb-6 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <SkeletonBlock className='h-8 w-8 rounded' />
            <SkeletonBlock className='h-8 w-48' />
          </div>
          <div className='flex gap-2'>
            <SkeletonBlock className='h-8 w-8 rounded' />
            <SkeletonBlock className='h-8 w-8 rounded' />
          </div>
        </div>

        {/* Card Content Skeleton */}
        <div className='space-y-4'>
          <SkeletonBlock className='h-6 w-full' />
          <SkeletonBlock className='h-4 w-full' />
          <SkeletonBlock className='h-4 w-3/4' />
          <div className='mt-6'>
            <SkeletonBlock className='h-32 w-full rounded' />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboardSkeleton;
