/**
 * Skeleton loading state for PortfolioBalanceWidget
 * Mirrors the structure of the portfolio balance donut chart and insights feed
 */

import React from 'react';
import SkeletonBlock from './SkeletonBlock';

/**
 * Skeleton for the donut chart section
 */
const DonutChartSkeleton: React.FC = () => {
  return (
    <div className='flex flex-1 items-center justify-center gap-4 overflow-hidden px-2 xl:gap-12'>
      {/* Circular chart skeleton */}
      <div className='relative flex shrink-0 items-center justify-center'>
        <SkeletonBlock className='h-[200px] w-[200px] rounded-full xl:h-[280px] xl:w-[280px]' />
        {/* Center hole */}
        <div className='aucctus-bg-primary absolute h-[120px] w-[120px] rounded-full xl:h-[180px] xl:w-[180px]' />
      </div>

      {/* Legend skeleton */}
      <div className='flex w-40 flex-col gap-2'>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className='aucctus-bg-secondary/30 rounded-lg border border-transparent p-2.5'
          >
            <div className='mb-1 flex items-center gap-2'>
              <SkeletonBlock className='h-2.5 w-2.5 rounded-full' />
              <SkeletonBlock className='h-3 w-16' />
            </div>
            <div className='flex items-baseline gap-1.5'>
              <SkeletonBlock className='h-6 w-10' />
              <SkeletonBlock className='h-3 w-16' />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton for the insights feed section
 */
const InsightsFeedSkeleton: React.FC = () => {
  return (
    <div className='aucctus-bg-primary aucctus-border-secondary flex h-[360px] flex-col overflow-hidden rounded-lg border shadow-sm'>
      <div className='aucctus-bg-secondary/30 flex min-h-0 flex-1 flex-col p-4'>
        {/* Header */}
        <div className='mb-4 flex shrink-0 items-center gap-2'>
          <SkeletonBlock className='h-5 w-5 rounded' />
          <SkeletonBlock className='h-6 w-40' />
        </div>

        {/* Insights list skeleton */}
        <div className='flex-1 space-y-3 overflow-hidden'>
          {[...Array(4)].map((_, i) => (
            <div key={i} className='aucctus-bg-secondary/20 rounded-lg p-3'>
              <div className='mb-2 flex items-center gap-2'>
                <SkeletonBlock className='h-4 w-4 rounded' />
                <SkeletonBlock className='h-4 w-24' />
              </div>
              <div className='space-y-1.5'>
                <SkeletonBlock className='h-3 w-full' />
                <SkeletonBlock className='h-3 w-5/6' />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Full Portfolio Balance Widget skeleton with donut chart and insights
 */
const PortfolioBalanceWidgetSkeleton: React.FC = () => {
  return (
    <div className='grid w-full grid-cols-1 gap-6 lg:grid-cols-2'>
      {/* Portfolio Balance Card */}
      <div className='aucctus-bg-primary aucctus-border-secondary flex h-[360px] flex-col rounded-lg border p-4 shadow-sm'>
        <div className='mb-2 flex items-center gap-2'>
          <SkeletonBlock className='h-5 w-5 rounded' />
          <SkeletonBlock className='h-6 w-36' />
        </div>
        <DonutChartSkeleton />
      </div>

      {/* Portfolio Insights Feed */}
      <InsightsFeedSkeleton />
    </div>
  );
};

export default PortfolioBalanceWidgetSkeleton;
