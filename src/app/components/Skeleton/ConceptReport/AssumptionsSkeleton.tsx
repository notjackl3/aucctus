import React from 'react';
import SkeletonBlock from './SkeletonBlock';
import AssumptionCardsListSkeleton from './AssumptionCardsListSkeleton';
import { Lightbulb } from 'lucide-react';

/**
 * Full assumptions page skeleton used for initial/blocking loads.
 * Shows Executive Summary, Category Cards, and Assumption Cards.
 */
const AssumptionsSkeleton: React.FC = () => {
  return (
    <div className='space-y-6'>
      {/* Executive Summary Banner Skeleton */}
      <div className='aucctus-bg-primary w-full rounded-lg border-b border-l-4 border-r border-t border-gray-light-200 border-l-primary-500 px-6 py-4 shadow-sm dark:border-gray-light-800 dark:border-l-primary-400'>
        <div className='flex items-start gap-3'>
          <Lightbulb
            size={20}
            className='aucctus-stroke-tertiary mt-1 flex-shrink-0'
          />
          <div className='min-w-0 flex-1'>
            <h3 className='aucctus-text-tertiary aucctus-text-sm mb-3 font-medium uppercase tracking-wider'>
              EXECUTIVE SUMMARY
            </h3>
            <SkeletonBlock className='h-12 w-full' />
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className='aucctus-border-primary overflow-hidden rounded-lg border shadow-sm'>
        <div className='flex flex-col md:flex-row'>
          {/* Left Column: Category Cards - takes ~30% of space */}
          <div className='aucctus-bg-primary aucctus-border-primary border-r p-6 md:w-[30%]'>
            {/* Category 1 - Desirability (Selected State) */}
            <div className='aucctus-bg-brand-primary mb-5 cursor-not-allowed rounded-lg border border-l-4 border-primary-500 p-4 opacity-75'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex items-center'>
                  <SkeletonBlock className='mr-2 h-6 w-6 rounded-full' />
                  <SkeletonBlock className='h-6 w-28' />
                </div>
                <SkeletonBlock className='h-6 w-20 rounded' />
              </div>
              <div className='mb-3 space-y-2'>
                <SkeletonBlock className='h-4 w-full' />
                <SkeletonBlock className='h-4 w-4/5' />
              </div>
              <div className='flex items-center gap-4'>
                <div className='flex flex-1 items-center justify-end'>
                  <SkeletonBlock className='h-6 w-32 rounded' />
                </div>
              </div>
            </div>

            {/* Category 2 - Viability */}
            <div className='aucctus-border-tertiary aucctus-bg-primary mb-5 cursor-not-allowed rounded-lg border p-4 opacity-75'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex items-center'>
                  <SkeletonBlock className='mr-2 h-6 w-6 rounded-full' />
                  <SkeletonBlock className='h-6 w-24' />
                </div>
                <SkeletonBlock className='h-6 w-20 rounded' />
              </div>
              <div className='mb-3 space-y-2'>
                <SkeletonBlock className='h-4 w-full' />
                <SkeletonBlock className='h-4 w-3/4' />
              </div>
              <div className='flex items-center gap-4'>
                <div className='flex flex-1 items-center justify-end'>
                  <SkeletonBlock className='h-6 w-32 rounded' />
                </div>
              </div>
            </div>

            {/* Category 3 - Feasibility */}
            <div className='aucctus-border-tertiary aucctus-bg-primary mb-5 cursor-not-allowed rounded-lg border p-4 opacity-75'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex items-center'>
                  <SkeletonBlock className='mr-2 h-6 w-6 rounded-full' />
                  <SkeletonBlock className='h-6 w-28' />
                </div>
                <SkeletonBlock className='h-6 w-20 rounded' />
              </div>
              <div className='mb-3 space-y-2'>
                <SkeletonBlock className='h-4 w-full' />
                <SkeletonBlock className='h-4 w-5/6' />
              </div>
              <div className='flex items-center gap-4'>
                <div className='flex flex-1 items-center justify-end'>
                  <SkeletonBlock className='h-6 w-32 rounded' />
                </div>
              </div>
            </div>

            {/* Category 4 - Adaptability */}
            <div className='aucctus-border-tertiary aucctus-bg-primary mb-5 cursor-not-allowed rounded-lg border p-4 opacity-75'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex items-center'>
                  <SkeletonBlock className='mr-2 h-6 w-6 rounded-full' />
                  <SkeletonBlock className='h-6 w-32' />
                </div>
                <SkeletonBlock className='h-6 w-20 rounded' />
              </div>
              <div className='mb-3 space-y-2'>
                <SkeletonBlock className='h-4 w-full' />
                <SkeletonBlock className='h-4 w-4/5' />
              </div>
              <div className='flex items-center gap-4'>
                <div className='flex flex-1 items-center justify-end'>
                  <SkeletonBlock className='h-6 w-32 rounded' />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Assumption Cards */}
          <div className='flex-1 p-6'>
            <AssumptionCardsListSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssumptionsSkeleton;
