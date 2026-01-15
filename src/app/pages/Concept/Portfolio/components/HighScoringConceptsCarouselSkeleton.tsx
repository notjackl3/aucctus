/**
 * Skeleton loading state for HighScoringConceptsCarousel
 * Mirrors the structure of the concept cards in the carousel
 */

import React from 'react';
import { SkeletonBlock } from '@components/Skeleton/ConceptReport';

/**
 * Skeleton for individual concept card
 */
const ConceptCardSkeleton: React.FC = () => {
  return (
    <div className='aucctus-bg-primary aucctus-border-secondary flex h-[420px] w-[340px] flex-shrink-0 flex-col overflow-hidden rounded-xl border shadow-sm'>
      {/* Image placeholder */}
      <div className='relative h-40 shrink-0 overflow-hidden'>
        <SkeletonBlock className='h-full w-full rounded-none' />
        {/* Score rail skeleton */}
        <div className='absolute right-0 top-0 h-full w-10'>
          <SkeletonBlock className='h-full w-full rounded-none' />
        </div>
        {/* Strategic pillar skeleton */}
        <div className='absolute bottom-3 left-3'>
          <SkeletonBlock className='h-6 w-20 rounded-full' />
        </div>
      </div>

      {/* Content */}
      <div className='flex min-h-0 flex-1 flex-col space-y-3 p-4'>
        {/* Title skeleton */}
        <SkeletonBlock className='h-5 w-4/5' />
        <SkeletonBlock className='h-5 w-3/5' />

        {/* Description skeleton */}
        <div className='flex-1 space-y-2'>
          <SkeletonBlock className='h-3 w-full' />
          <SkeletonBlock className='h-3 w-full' />
          <SkeletonBlock className='h-3 w-5/6' />
          <SkeletonBlock className='h-3 w-full' />
          <SkeletonBlock className='h-3 w-4/5' />
          <SkeletonBlock className='h-3 w-3/4' />
        </div>

        {/* Owner and stage skeleton */}
        <div className='mt-auto flex items-center gap-2'>
          <SkeletonBlock className='h-6 w-6 rounded-full' />
          <SkeletonBlock className='h-3 w-20' />
          <SkeletonBlock className='h-5 w-16 rounded' />
        </div>
      </div>
    </div>
  );
};

/**
 * Full carousel skeleton with header and cards
 */
const HighScoringConceptsCarouselSkeleton: React.FC = () => {
  return (
    <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border shadow-sm'>
      <div className='aucctus-bg-secondary/30 p-6'>
        {/* Header */}
        <div className='mb-6 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <SkeletonBlock className='h-5 w-5 rounded' />
            <SkeletonBlock className='h-6 w-48' />
          </div>
          {/* Navigation buttons skeleton */}
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-1'>
              <SkeletonBlock className='h-8 w-8 rounded-full' />
              <SkeletonBlock className='h-8 w-8 rounded-full' />
            </div>
            <SkeletonBlock className='h-4 w-16' />
          </div>
        </div>

        {/* Cards row */}
        <div className='flex gap-4 overflow-hidden'>
          {[...Array(4)].map((_, i) => (
            <ConceptCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HighScoringConceptsCarouselSkeleton;
