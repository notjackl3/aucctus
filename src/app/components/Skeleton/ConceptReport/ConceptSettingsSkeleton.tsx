import React from 'react';
import SkeletonBlock from './SkeletonBlock';

interface ConceptSettingsSkeletonProps {
  ignitionCount?: number;
  clarifyingCount?: number;
}

/**
 * Skeleton component for ConceptSettings page.
 * Mirrors the structure of the ConceptSettings component with ignition and clarifying questions.
 */
const ConceptSettingsSkeleton: React.FC<ConceptSettingsSkeletonProps> = ({
  ignitionCount = 3,
  clarifyingCount = 3,
}) => {
  return (
    <div className='h-full w-full'>
      <div className='mx-0 max-w-3xl'>
        <div className='no-scrollbar mt-4 flex flex-1 flex-col gap-6'>
          {/* Initial Questions Section */}
          <div className='flex items-center justify-between'>
            <SkeletonBlock className='h-6 w-40' />
            {/* Clone Concept Seed Button Skeleton */}
            <SkeletonBlock className='h-8 w-44 rounded' />
          </div>

          {/* Ignition Questions List */}
          <div className='no-scrollbar flex flex-1 flex-col gap-3'>
            {Array.from({ length: ignitionCount }).map((_, index) => (
              <div key={`ignition-skeleton-${index}`} className='pb-3'>
                {/* Question Header with Icon */}
                <div className='ease flex flex-row items-center gap-3 pb-3'>
                  <SkeletonBlock className='h-12 w-12 rounded-lg' />
                  <SkeletonBlock className='h-5 w-64' />
                </div>

                {/* Answer Box */}
                <div className='aucctus-border-secondary aucctus-bg-tertiary flex flex-col gap-3 rounded-lg border-2 p-1'>
                  <div className='aucctus-bg-tertiary rounded-md px-2 py-1'>
                    <SkeletonBlock className='h-8 w-full' />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Clarifying Questions Section */}
          <SkeletonBlock className='ml-1 h-6 w-48' />

          {/* Clarifying Questions List */}
          <div className='no-scrollbar flex flex-1 flex-col gap-3'>
            {Array.from({ length: clarifyingCount }).map((_, index) => (
              <div key={`clarifying-skeleton-${index}`} className='pb-3'>
                {/* Question Header with Icon and Text */}
                <div className='ease flex flex-row items-center gap-2 pb-3'>
                  <span className='aucctus-bg-primary aucctus-border-secondary mr-2 flex h-8 w-8 items-center justify-center self-center justify-self-center rounded-lg border-2'>
                    <SkeletonBlock className='h-5 w-5 rounded-lg' />
                  </span>

                  <div className='flex flex-col gap-1'>
                    <SkeletonBlock className='h-4 w-48' />
                    <SkeletonBlock className='h-3 w-64' />
                  </div>
                </div>

                {/* Answer Box */}
                <div className='aucctus-border-secondary aucctus-bg-tertiary flex flex-col gap-3 rounded-lg border-2 p-1'>
                  <div className='aucctus-bg-tertiary rounded-md px-2 py-1'>
                    <SkeletonBlock className='h-8 w-full' />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConceptSettingsSkeleton;
