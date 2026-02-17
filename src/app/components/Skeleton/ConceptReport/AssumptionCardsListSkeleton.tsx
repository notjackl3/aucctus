import React from 'react';
import SkeletonBlock from './SkeletonBlock';
import { Plus } from 'lucide-react';
/**
 * Skeleton for the assumption cards list only (right column content).
 * Used when switching between categories in the AssumptionsTable.
 */
const AssumptionCardsListSkeleton: React.FC = () => {
  return (
    <>
      {/* Add New Assumption Plus Button (Disabled) */}
      <div className='mb-4 flex justify-end'>
        <button
          disabled
          className='aucctus-bg-primary aspect-square cursor-not-allowed rounded-lg p-1 opacity-50'
          aria-label='Add new assumption'
        >
          <Plus className='aucctus-stroke-brand-primary h-5 w-5' />
        </button>
      </div>

      {/* Assumption Cards */}
      <div className='space-y-4'>
        {/* Assumption Card 1 */}
        <div className='aucctus-bg-primary aucctus-border-primary rounded-lg border p-5 shadow-sm'>
          {/* Header */}
          <div className='mb-3 flex flex-wrap items-start justify-between gap-2'>
            <div className='flex items-center'>
              <SkeletonBlock className='h-5 w-5 rounded' />
              <SkeletonBlock className='ml-2 h-5 w-24' />
            </div>
            <div className='flex items-center gap-2'>
              <SkeletonBlock className='h-6 w-16 rounded' />
              <SkeletonBlock className='h-6 w-20 rounded' />
            </div>
          </div>
          {/* Statement */}
          <div className='mb-4 space-y-2'>
            <SkeletonBlock className='h-4 w-full' />
            <SkeletonBlock className='h-4 w-full' />
            <SkeletonBlock className='h-4 w-5/6' />
          </div>
          {/* Meters */}
          <div className='mt-3 flex flex-wrap gap-2'>
            <SkeletonBlock className='h-8 w-32 rounded' />
            <SkeletonBlock className='h-8 w-28 rounded' />
          </div>
        </div>

        {/* Assumption Card 2 */}
        <div className='aucctus-bg-primary aucctus-border-primary rounded-lg border p-5 shadow-sm'>
          {/* Header */}
          <div className='mb-3 flex flex-wrap items-start justify-between gap-2'>
            <div className='flex items-center'>
              <SkeletonBlock className='h-5 w-5 rounded' />
              <SkeletonBlock className='ml-2 h-5 w-24' />
            </div>
            <div className='flex items-center gap-2'>
              <SkeletonBlock className='h-6 w-16 rounded' />
              <SkeletonBlock className='h-6 w-20 rounded' />
            </div>
          </div>
          {/* Statement */}
          <div className='mb-4 space-y-2'>
            <SkeletonBlock className='h-4 w-full' />
            <SkeletonBlock className='h-4 w-full' />
            <SkeletonBlock className='h-4 w-4/5' />
          </div>
          {/* Meters */}
          <div className='mt-3 flex flex-wrap gap-2'>
            <SkeletonBlock className='h-8 w-32 rounded' />
            <SkeletonBlock className='h-8 w-28 rounded' />
          </div>
        </div>
      </div>
    </>
  );
};

export default AssumptionCardsListSkeleton;
