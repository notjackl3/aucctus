import React from 'react';
import SkeletonBlock from './SkeletonBlock';
import ExecutiveSummarySkeleton from './ExecutiveSummarySkeleton';
import PriorityInsightsSkeleton from './PriorityInsightsSkeleton';
import PESTELSkeleton from './PESTELSkeleton';
import EcosystemV2Skeleton from './EcosystemV2Skeleton';

interface MarketScanSkeletonProps {
  /**
   * Whether to show the Ecosystem section skeleton
   * @default true
   */
  showEcosystem?: boolean;
  /**
   * Number of PESTEL cards to show
   * @default 3
   */
  pestelCount?: number;
}

/**
 * MarketForcesRadar skeleton - matches the radar chart card in V3
 */
const MarketForcesRadarSkeleton: React.FC = () => (
  <div className='aucctus-bg-primary aucctus-border-secondary flex h-[420px] w-full flex-col gap-4 rounded-lg border p-6 shadow-sm'>
    <div className='flex items-center justify-between'>
      <SkeletonBlock className='h-4 w-48' />
      <div className='flex gap-2'>
        <SkeletonBlock className='h-8 w-8 rounded-full' />
        <SkeletonBlock className='h-8 w-8 rounded-full' />
      </div>
    </div>
    <SkeletonBlock className='h-full w-full rounded-xl' />
  </div>
);

/**
 * Unified skeleton loading state for MarketScan pages.
 * Reusable across V2, V3, and future versions.
 *
 * Composes:
 * - ExecutiveSummarySkeleton
 * - MarketForcesRadarSkeleton (inline)
 * - PriorityInsightsSkeleton
 * - PESTELSkeleton
 * - EcosystemV2Skeleton (optional)
 */
const MarketScanSkeleton: React.FC<MarketScanSkeletonProps> = ({
  showEcosystem = true,
  pestelCount = 3,
}) => {
  return (
    <div className='flex h-full w-full flex-col gap-6'>
      {/* Trends & Drivers Section */}
      <div className='mx-auto flex w-full max-w-[1600px] flex-col gap-8 p-4'>
        {/* Executive Summary */}
        <div className='w-full'>
          <ExecutiveSummarySkeleton />
        </div>

        {/* Market Forces Radar */}
        <MarketForcesRadarSkeleton />

        {/* Priority Insights */}
        <PriorityInsightsSkeleton />

        {/* PESTEL Analysis */}
        <PESTELSkeleton count={pestelCount} />
      </div>

      {/* Ecosystem Section */}
      {showEcosystem && <EcosystemV2Skeleton />}
    </div>
  );
};

export default MarketScanSkeleton;
