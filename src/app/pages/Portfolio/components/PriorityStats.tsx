/**
 * Priority Stats Component
 *
 * Shows summary statistics for the prioritized concepts.
 */

import React, { useMemo } from 'react';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import SkeletonBlock from '@components/Skeleton/ConceptReport/SkeletonBlock';

import type { PrioritizedConcept } from '../PortfolioPrioritization';

interface PriorityStatsProps {
  concepts: PrioritizedConcept[];
  isLoading: boolean;
}

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  subtext?: string;
  iconColorClass: string;
  bgColorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  subtext,
  iconColorClass,
  bgColorClass,
}) => (
  <div className='aucctus-bg-primary aucctus-border-secondary flex items-center gap-4 rounded-xl border px-5 py-4'>
    <div
      className={cn(
        'flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
        bgColorClass,
      )}
    >
      <Icon
        variant={icon as any}
        height={22}
        width={22}
        className={iconColorClass}
      />
    </div>
    <div className='min-w-0 flex-1'>
      <p className='aucctus-text-sm aucctus-text-tertiary'>{label}</p>
      <p className='aucctus-header-md-bold aucctus-text-primary'>{value}</p>
      {subtext && (
        <p className='aucctus-text-xs aucctus-text-quaternary truncate'>
          {subtext}
        </p>
      )}
    </div>
  </div>
);

const StatCardSkeleton: React.FC = () => (
  <div className='aucctus-bg-primary aucctus-border-secondary flex items-center gap-4 rounded-xl border px-5 py-4'>
    <SkeletonBlock className='h-12 w-12 shrink-0 rounded-full' />
    <div className='flex-1 space-y-2'>
      <SkeletonBlock className='h-4 w-24' />
      <SkeletonBlock className='h-7 w-12' />
      <SkeletonBlock className='h-3 w-20' />
    </div>
  </div>
);

const PriorityStats: React.FC<PriorityStatsProps> = ({
  concepts,
  isLoading,
}) => {
  const stats = useMemo(() => {
    if (concepts.length === 0) {
      return {
        total: 0,
        highPriority: 0,
        avgScore: 0,
        topConcept: null,
      };
    }

    const highPriority = concepts.filter(
      (c) => c.overallPriorityScore >= 70,
    ).length;
    const avgScore = Math.round(
      concepts.reduce((sum, c) => sum + c.overallPriorityScore, 0) /
        concepts.length,
    );
    const topConcept = concepts.reduce(
      (max, c) => (c.overallPriorityScore > max.overallPriorityScore ? c : max),
      concepts[0],
    );

    return {
      total: concepts.length,
      highPriority,
      avgScore,
      topConcept,
    };
  }, [concepts]);

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      <StatCard
        icon='layers'
        label='Total Prioritized'
        value={stats.total}
        subtext='concepts scored'
        iconColorClass='aucctus-stroke-brand-primary'
        bgColorClass='aucctus-bg-brand-primary-alt'
      />
      <StatCard
        icon='threeStars'
        label='High Priority'
        value={stats.highPriority}
        subtext='score ≥70'
        iconColorClass='aucctus-stroke-success-primary'
        bgColorClass='aucctus-bg-success-subtle'
      />
      <StatCard
        icon='barchart'
        label='Average Score'
        value={stats.avgScore}
        subtext='across all concepts'
        iconColorClass='aucctus-stroke-warning-primary'
        bgColorClass='aucctus-bg-warning-subtle'
      />
      <StatCard
        icon='star-01'
        label='Top Concept'
        value={stats.topConcept?.overallPriorityScore || '-'}
        subtext={
          stats.topConcept?.title
            ? stats.topConcept.title.slice(0, 18) +
              (stats.topConcept.title.length > 18 ? '...' : '')
            : 'No concepts'
        }
        iconColorClass='aucctus-stroke-info-primary'
        bgColorClass='aucctus-bg-info-subtle'
      />
    </div>
  );
};

export default PriorityStats;
