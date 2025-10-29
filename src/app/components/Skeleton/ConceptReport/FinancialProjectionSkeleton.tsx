import React from 'react';
import SkeletonBlock from './SkeletonBlock';
import TabViewSkeleton from './TabViewSkeleton';
import ExecutiveSummarySkeleton from './ExecutiveSummarySkeleton';

const FinancialProjectionSkeleton: React.FC = () => {
  return (
    <div className='flex h-full w-full flex-col items-center self-stretch'>
      {/* Tab Navigation Skeleton */}
      <TabViewSkeleton
        tabs={[
          { textWidth: 'w-32' },
          { textWidth: 'w-28' },
          { textWidth: 'w-36' },
        ]}
        tabGroupClassName='flex flex-row items-start justify-between self-stretch overflow-x-auto overflow-y-hidden py-4'
        includeWrapper={false}
      />

      {/* Tab Content Skeleton */}
      <div className='h-full w-full items-center justify-center'>
        <div className='flex flex-col gap-8 p-4'>
          {/* Executive Summary Banner Skeleton */}
          <ExecutiveSummarySkeleton />

          {/* Two-Column Cards Grid (Business Model + Pricing Strategy) */}
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            {/* Left Card Skeleton */}
            <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-6'>
              <div className='mb-4 flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <SkeletonBlock className='h-6 w-6 rounded' />
                  <SkeletonBlock className='h-6 w-40' />
                </div>
                <SkeletonBlock className='h-8 w-8 rounded' />
              </div>
              <div className='space-y-3'>
                <SkeletonBlock className='h-4 w-full' />
                <SkeletonBlock className='h-4 w-full' />
                <SkeletonBlock className='h-4 w-5/6' />
                <div className='mt-4'>
                  <SkeletonBlock className='h-24 w-full rounded' />
                </div>
              </div>
            </div>

            {/* Right Card Skeleton */}
            <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-6'>
              <div className='mb-4 flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <SkeletonBlock className='h-6 w-6 rounded' />
                  <SkeletonBlock className='h-6 w-36' />
                </div>
                <SkeletonBlock className='h-8 w-8 rounded' />
              </div>
              <div className='space-y-3'>
                <SkeletonBlock className='h-4 w-full' />
                <SkeletonBlock className='h-4 w-full' />
                <SkeletonBlock className='h-4 w-4/5' />
                <div className='mt-4'>
                  <SkeletonBlock className='h-24 w-full rounded' />
                </div>
              </div>
            </div>
          </div>

          {/* Full-Width Section Skeleton (Distribution Channels) */}
          <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-6'>
            <div className='mb-4 flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <SkeletonBlock className='h-6 w-6 rounded' />
                <SkeletonBlock className='h-6 w-48' />
              </div>
              <SkeletonBlock className='h-8 w-24 rounded' />
            </div>
            <div className='space-y-3'>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className='aucctus-bg-secondary flex items-center justify-between rounded-lg p-4'
                >
                  <div className='flex flex-1 items-center gap-3'>
                    <SkeletonBlock className='h-5 w-5 rounded' />
                    <SkeletonBlock className='h-4 w-32' />
                  </div>
                  <SkeletonBlock className='h-4 w-24' />
                </div>
              ))}
            </div>
          </div>

          {/* Full-Width Section Skeleton (Cost Drivers) */}
          <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-6'>
            <div className='mb-4 flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <SkeletonBlock className='h-6 w-6 rounded' />
                <SkeletonBlock className='h-6 w-40' />
              </div>
              <SkeletonBlock className='h-8 w-24 rounded' />
            </div>
            <div className='space-y-3'>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className='aucctus-bg-secondary flex items-center justify-between rounded-lg p-4'
                >
                  <div className='flex flex-1 items-center gap-3'>
                    <SkeletonBlock className='h-5 w-5 rounded' />
                    <SkeletonBlock className='h-4 w-40' />
                  </div>
                  <SkeletonBlock className='h-4 w-32' />
                </div>
              ))}
            </div>
          </div>

          {/* Chart/Table Skeleton (Projections) */}
          <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-6'>
            <div className='mb-4 flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <SkeletonBlock className='h-6 w-6 rounded' />
                <SkeletonBlock className='h-6 w-44' />
              </div>
              <div className='flex gap-2'>
                <SkeletonBlock className='h-8 w-8 rounded' />
                <SkeletonBlock className='h-8 w-8 rounded' />
              </div>
            </div>
            <div className='space-y-4'>
              <SkeletonBlock className='h-64 w-full rounded' />
              <div className='grid grid-cols-3 gap-4'>
                <div className='space-y-2'>
                  <SkeletonBlock className='h-4 w-20' />
                  <SkeletonBlock className='h-8 w-full' />
                </div>
                <div className='space-y-2'>
                  <SkeletonBlock className='h-4 w-20' />
                  <SkeletonBlock className='h-8 w-full' />
                </div>
                <div className='space-y-2'>
                  <SkeletonBlock className='h-4 w-20' />
                  <SkeletonBlock className='h-8 w-full' />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialProjectionSkeleton;
