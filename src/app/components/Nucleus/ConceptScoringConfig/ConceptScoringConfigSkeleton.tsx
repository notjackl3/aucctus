import React from 'react';
import SkeletonBlock from '../../Skeleton/ConceptReport/SkeletonBlock';

/**
 * Skeleton loading component for ConceptScoringConfig.
 * Mirrors the two-panel layout: categories sidebar + questions panel.
 */
const ConceptScoringConfigSkeleton: React.FC = () => {
  return (
    <div className='flex h-[500px]'>
      {/* Left Sidebar - Categories */}
      <div className='aucctus-border-secondary aucctus-bg-secondary/30 w-72 border-r'>
        <div className='p-4'>
          {/* Sidebar Header */}
          <div className='mb-3 flex items-center justify-between'>
            <SkeletonBlock className='h-3 w-28' />
            <SkeletonBlock className='h-5 w-20 rounded' />
          </div>

          {/* Category Items */}
          <div className='space-y-1'>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${
                  i === 0
                    ? 'aucctus-bg-primary aucctus-border-secondary border shadow-sm'
                    : ''
                }`}
              >
                <SkeletonBlock className='h-7 w-7 flex-shrink-0 rounded-md' />
                <div className='min-w-0 flex-1 space-y-1.5'>
                  <SkeletonBlock
                    className={`h-4 ${i === 0 ? 'w-28' : i === 1 ? 'w-24' : i === 2 ? 'w-32' : 'w-20'}`}
                  />
                  <SkeletonBlock className='h-3 w-16' />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Questions */}
      <div className='flex-1 p-6'>
        <div className='flex h-full flex-col'>
          {/* Questions Header */}
          <div className='mb-4 flex items-center justify-between'>
            <SkeletonBlock className='h-6 w-24' />
            <SkeletonBlock className='h-8 w-32 rounded-md' />
          </div>

          {/* Question Cards */}
          <div className='space-y-2'>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-3 shadow-sm'
              >
                <div className='flex items-start gap-3'>
                  {/* Drag Handle */}
                  <SkeletonBlock className='mt-1 h-4 w-3 rounded' />

                  {/* Question Content */}
                  <div className='min-w-0 flex-1 space-y-2'>
                    <SkeletonBlock
                      className={`h-4 ${i === 0 ? 'w-full' : i === 1 ? 'w-5/6' : 'w-4/5'}`}
                    />
                    {/* Importance Badge */}
                    <div className='flex items-center gap-2'>
                      <SkeletonBlock className='h-3 w-16' />
                      <SkeletonBlock className='h-7 w-20 rounded-md' />
                    </div>
                  </div>

                  {/* Delete Button */}
                  <SkeletonBlock className='h-6 w-6 rounded' />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConceptScoringConfigSkeleton;
