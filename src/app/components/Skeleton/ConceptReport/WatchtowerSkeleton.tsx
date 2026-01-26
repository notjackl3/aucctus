import React from 'react';
import SkeletonBlock from './SkeletonBlock';
import AgentProgressBar from '../../Progress/AgentProgressBar';
import Icon from '../../Icon';

interface WatchtowerSkeletonProps {
  /** Message to display about the current scan progress */
  progressMessage?: string;
  /** Progress percentage (0-100) */
  progressPercent?: number;
  /** Start time for progress calculation */
  startTime?: number;
}

/**
 * Skeleton loading component for Watchtower dashboard.
 * Shows skeleton versions of all widgets below the radar section.
 * Used during first-time initialization scanning.
 */
const WatchtowerSkeleton: React.FC<WatchtowerSkeletonProps> = ({
  progressMessage = 'Discovering signals...',
  progressPercent = 0,
  startTime,
}) => {
  return (
    <div className='p-6'>
      {/* Progress indicator using AgentProgressBar */}
      <div className='mb-6'>
        <div className='aucctus-bg-secondary aucctus-border-secondary rounded-xl border p-6'>
          <div className='mb-4 flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-red-500/20'>
              <Icon
                variant='signal-02'
                height={20}
                width={20}
                className='stroke-amber-500'
              />
            </div>
            <div>
              <h3 className='aucctus-text-primary aucctus-text-md-semibold'>
                Initializing Watchtower
              </h3>
              <p className='aucctus-text-secondary text-sm'>
                {progressMessage}
              </p>
            </div>
          </div>
          <AgentProgressBar
            agentName='WatchtowerScan'
            progress={progressPercent}
            fallbackEstimatedSeconds={300}
            showPercentage={true}
            showTimeRemaining={true}
            size='md'
            theme='warning'
            startTime={startTime}
          />
        </div>
      </div>

      {/* Future Predictions and Signal Trends widgets - side by side */}
      <div className='mb-6 grid grid-cols-2 gap-6'>
        {/* Future Predictions Widget Skeleton */}
        <FuturePredictionsWidgetSkeleton />
        {/* Signal Trends Widget Skeleton */}
        <SignalTrendsWidgetSkeleton />
      </div>

      {/* Future Domains and Concept Opportunities widgets - side by side */}
      <div className='grid grid-cols-2 gap-6'>
        {/* Future Domains Widget Skeleton */}
        <FutureDomainsWidgetSkeleton />
        {/* Concept Opportunities Widget Skeleton */}
        <ConceptOpportunitiesWidgetSkeleton />
      </div>
    </div>
  );
};

/**
 * Skeleton for Future Predictions Widget
 */
const FuturePredictionsWidgetSkeleton: React.FC = () => {
  return (
    <div className='aucctus-bg-primary aucctus-border-secondary flex h-full flex-col rounded-xl border p-6'>
      {/* Header */}
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <SkeletonBlock className='h-5 w-5 rounded' />
          <SkeletonBlock className='h-5 w-36' />
        </div>
        <div className='flex gap-2'>
          <SkeletonBlock className='h-8 w-8 rounded-lg' />
          <SkeletonBlock className='h-8 w-8 rounded-lg' />
        </div>
      </div>

      {/* Carousel Cards Skeleton */}
      <div className='flex flex-1 gap-4 overflow-hidden'>
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className='aucctus-bg-primary aucctus-border-secondary flex-shrink-0 overflow-hidden rounded-xl border shadow-sm'
            style={{ width: '70%' }}
          >
            <div className='flex h-full flex-col p-5'>
              <div className='flex-1 space-y-3'>
                <SkeletonBlock className='h-5 w-4/5' />
                <div className='space-y-2'>
                  <SkeletonBlock className='h-4 w-full' />
                  <SkeletonBlock className='h-4 w-full' />
                  <SkeletonBlock className='h-4 w-3/4' />
                </div>
              </div>
              <div className='mt-4 flex flex-wrap items-center gap-1.5'>
                {[...Array(3)].map((_, j) => (
                  <SkeletonBlock key={j} className='h-5 w-16 rounded-full' />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton for Signal Trends Widget
 */
const SignalTrendsWidgetSkeleton: React.FC = () => {
  return (
    <div className='aucctus-bg-primary aucctus-border-secondary h-full rounded-xl border p-6'>
      {/* Header */}
      <div className='mb-4 flex items-center gap-2'>
        <SkeletonBlock className='h-5 w-5 rounded' />
        <SkeletonBlock className='h-5 w-32' />
      </div>

      {/* Period Pills */}
      <div className='mb-4 flex flex-wrap gap-1.5'>
        <SkeletonBlock className='h-8 w-24 rounded-full' />
        <SkeletonBlock className='h-8 w-24 rounded-full' />
        <SkeletonBlock className='h-8 w-28 rounded-full' />
      </div>

      {/* Trends List */}
      <div className='aucctus-bg-secondary aucctus-border-secondary rounded-lg border p-4'>
        <div className='space-y-2.5'>
          {[...Array(5)].map((_, i) => (
            <div key={i} className='flex items-start gap-2'>
              <SkeletonBlock className='mt-1.5 h-1.5 w-1.5 rounded-full' />
              <div className='flex-1 space-y-1'>
                <SkeletonBlock className='h-4 w-full' />
                <SkeletonBlock className='h-4 w-4/5' />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton for Future Domains Widget
 */
const FutureDomainsWidgetSkeleton: React.FC = () => {
  return (
    <div className='aucctus-bg-primary aucctus-border-secondary flex h-[480px] flex-col rounded-xl border p-6'>
      {/* Header */}
      <div className='mb-4 flex items-center gap-2'>
        <SkeletonBlock className='h-5 w-5 rounded' />
        <SkeletonBlock className='h-5 w-32' />
        <SkeletonBlock className='h-5 w-20 rounded-full' />
      </div>

      {/* Description */}
      <SkeletonBlock className='mb-4 h-4 w-3/4' />

      {/* Domain Cards */}
      <div className='flex-1 space-y-3 overflow-hidden pr-1'>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-4'
          >
            <div className='mb-2 flex items-start justify-between gap-3'>
              <SkeletonBlock className='h-4 w-3/4' />
              <SkeletonBlock className='h-3 w-16' />
            </div>
            <div className='mb-2 space-y-1'>
              <SkeletonBlock className='h-3 w-full' />
              <SkeletonBlock className='h-3 w-5/6' />
            </div>
            <div className='mb-3 space-y-1'>
              <SkeletonBlock className='h-3 w-full' />
              <SkeletonBlock className='h-3 w-2/3' />
            </div>
            <div className='flex flex-wrap items-center gap-1.5'>
              {[...Array(3)].map((_, j) => (
                <SkeletonBlock key={j} className='h-5 w-16 rounded' />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton for Concept Opportunities Widget
 */
const ConceptOpportunitiesWidgetSkeleton: React.FC = () => {
  return (
    <div className='aucctus-bg-primary aucctus-border-secondary flex h-[480px] flex-col rounded-xl border p-6'>
      {/* Header */}
      <div className='mb-4 flex items-center gap-2'>
        <SkeletonBlock className='h-5 w-5 rounded' />
        <SkeletonBlock className='h-5 w-40' />
        <SkeletonBlock className='h-5 w-24 rounded-full' />
      </div>

      {/* Description */}
      <SkeletonBlock className='mb-4 h-4 w-4/5' />

      {/* Opportunity Cards - Horizontal Scroll */}
      <div className='flex gap-3 overflow-hidden pb-2'>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className='aucctus-bg-primary aucctus-border-secondary flex h-[340px] w-[260px] flex-shrink-0 flex-col overflow-hidden rounded-lg border'
          >
            {/* Image Header Skeleton */}
            <SkeletonBlock className='h-28 w-full flex-shrink-0' />

            <div className='flex flex-1 flex-col p-3'>
              {/* Title */}
              <div className='mb-2 space-y-1'>
                <SkeletonBlock className='h-4 w-full' />
                <SkeletonBlock className='h-4 w-3/4' />
              </div>

              {/* Description */}
              <div className='mt-2 space-y-1'>
                <SkeletonBlock className='h-3 w-full' />
                <SkeletonBlock className='h-3 w-full' />
                <SkeletonBlock className='h-3 w-2/3' />
              </div>

              {/* Tags Section */}
              <div className='aucctus-border-secondary mt-2 space-y-1.5 border-t pt-2'>
                <SkeletonBlock className='h-5 w-24 rounded' />
                <SkeletonBlock className='h-3 w-32' />
              </div>

              {/* Button */}
              <SkeletonBlock className='mt-auto h-8 w-full rounded-md' />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WatchtowerSkeleton;
