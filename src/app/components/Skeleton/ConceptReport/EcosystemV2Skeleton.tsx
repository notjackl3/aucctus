import React from 'react';
import SkeletonBlock from './SkeletonBlock';

/**
 * Skeleton loading state for the EcosystemV2 component.
 * Mirrors the exact structure and layout of the real component.
 */
const EcosystemV2Skeleton: React.FC = () => {
  return (
    <div className='min-h-screen'>
      <div className='max-w-7xl space-y-8'>
        {/* Crowdedness Gauge & Headwinds/Tailwinds Grid Skeleton */}
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          {/* Crowdedness Gauge Skeleton */}
          <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-4'>
            <div className='pb-2'>
              <div className='flex items-center gap-2'>
                <SkeletonBlock className='h-5 w-5 rounded' />
                <SkeletonBlock className='h-6 w-32' />
              </div>
            </div>
            <div className='pt-2'>
              {/* Dial gauge placeholder */}
              <div className='flex flex-col items-center justify-center py-8'>
                <SkeletonBlock className='h-32 w-32 rounded-full' />
                <div className='mt-4 space-y-2'>
                  <SkeletonBlock className='h-4 w-40' />
                  <SkeletonBlock className='h-3 w-32' />
                </div>
              </div>
            </div>
          </div>

          {/* Headwinds Skeleton */}
          <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-4'>
            <div className='flex flex-row items-center gap-2 pb-3'>
              <SkeletonBlock className='h-5 w-5 rounded' />
              <SkeletonBlock className='h-6 w-24' />
            </div>
            <div className='space-y-2'>
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className='aucctus-border-secondary rounded-lg border p-3'
                >
                  <div className='flex items-center gap-2'>
                    <SkeletonBlock className='h-5 w-5 flex-shrink-0 rounded-full' />
                    <SkeletonBlock className='h-4 w-full' />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tailwinds Skeleton */}
          <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-4'>
            <div className='flex flex-row items-center gap-2 pb-3'>
              <SkeletonBlock className='h-5 w-5 rounded' />
              <SkeletonBlock className='h-6 w-24' />
            </div>
            <div className='space-y-2'>
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className='aucctus-border-secondary rounded-lg border p-3'
                >
                  <div className='flex items-center gap-2'>
                    <SkeletonBlock className='h-5 w-5 flex-shrink-0 rounded-full' />
                    <SkeletonBlock className='h-4 w-full' />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Ecosystem Map Section Skeleton */}
        <div className='space-y-4'>
          {/* Card Header Skeleton */}
          <div className='px-0 pb-4'>
            <div className='flex items-center justify-between'>
              <div className='flex-1 space-y-2'>
                <div className='flex items-center gap-2'>
                  <SkeletonBlock className='h-5 w-5 rounded' />
                  <SkeletonBlock className='h-6 w-40' />
                </div>
                <SkeletonBlock className='h-4 w-64' />
              </div>
              {/* Tab Navigation Skeleton */}
              <div className='flex items-center gap-2'>
                <SkeletonBlock className='h-10 w-24 rounded-lg' />
                <SkeletonBlock className='h-10 w-28 rounded-lg' />
                <SkeletonBlock className='h-10 w-32 rounded-lg' />
              </div>
            </div>
          </div>

          {/* Map/List View Skeleton */}
          <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border'>
            <div className='grid h-[500px] grid-cols-7'>
              {/* Left Panel - Company List Skeleton */}
              <div className='aucctus-border-secondary col-span-2 overflow-hidden border-r p-4'>
                <div className='space-y-3'>
                  {[...Array(6)].map((_, index) => (
                    <div
                      key={index}
                      className='aucctus-border-secondary rounded-lg border p-3'
                    >
                      <div className='flex items-center gap-3'>
                        <SkeletonBlock className='h-10 w-10 flex-shrink-0 rounded' />
                        <div className='flex-1 space-y-2'>
                          <SkeletonBlock className='h-4 w-full' />
                          <SkeletonBlock className='h-3 w-3/4' />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Right Panel - Company Details Skeleton */}
              <div className='col-span-5 overflow-hidden p-6'>
                <div className='space-y-6'>
                  {/* Company header */}
                  <div className='flex items-start gap-4'>
                    <SkeletonBlock className='h-16 w-16 flex-shrink-0 rounded' />
                    <div className='flex-1 space-y-2'>
                      <SkeletonBlock className='h-6 w-48' />
                      <SkeletonBlock className='h-4 w-32' />
                      <SkeletonBlock className='h-4 w-40' />
                    </div>
                  </div>
                  {/* Description */}
                  <div className='space-y-2'>
                    <SkeletonBlock className='h-4 w-full' />
                    <SkeletonBlock className='h-4 w-full' />
                    <SkeletonBlock className='h-4 w-3/4' />
                  </div>
                  {/* Sections */}
                  <div className='space-y-4'>
                    <div className='space-y-2'>
                      <SkeletonBlock className='h-5 w-40' />
                      <SkeletonBlock className='h-4 w-full' />
                      <SkeletonBlock className='h-4 w-5/6' />
                    </div>
                    <div className='space-y-2'>
                      <SkeletonBlock className='h-5 w-32' />
                      <SkeletonBlock className='h-4 w-full' />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Carousel Skeleton */}
        <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-6'>
          <div className='mb-4 flex items-center gap-2'>
            <SkeletonBlock className='h-5 w-5 rounded' />
            <SkeletonBlock className='h-6 w-40' />
          </div>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className='aucctus-border-secondary rounded-lg border p-4'
              >
                <SkeletonBlock className='mb-3 h-32 w-full rounded' />
                <div className='space-y-2'>
                  <SkeletonBlock className='h-4 w-full' />
                  <SkeletonBlock className='h-3 w-3/4' />
                  <SkeletonBlock className='h-3 w-1/2' />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Future Predictions Skeleton */}
        <div className='aucctus-border-secondary aucctus-bg-primary rounded-lg border px-4 py-4'>
          <div className='mb-4 flex items-center gap-2'>
            <SkeletonBlock className='h-5 w-5 rounded' />
            <SkeletonBlock className='h-6 w-48' />
          </div>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className='aucctus-border-secondary rounded-lg border p-4'
              >
                <div className='mb-3 flex items-center gap-2'>
                  <SkeletonBlock className='h-5 w-5 rounded' />
                  <SkeletonBlock className='h-5 w-32' />
                </div>
                <div className='space-y-2'>
                  <SkeletonBlock className='h-4 w-full' />
                  <SkeletonBlock className='h-4 w-full' />
                  <SkeletonBlock className='h-4 w-4/5' />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EcosystemV2Skeleton;
