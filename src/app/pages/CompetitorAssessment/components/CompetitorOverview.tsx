import React, { useMemo } from 'react';
import { cn } from '@libs/utils/react';
import { motion } from 'framer-motion';
import type {
  ICompetitor,
  IWhiteSpaceOpportunity,
  ICompetitorAssessmentMetrics,
} from '@libs/api/types/competitorAssessment';
import CompetitorConfidenceChart from './CompetitorConfidenceChart';
import WhiteSpaceDistributionChart from './WhiteSpaceDistributionChart';
import ConfidenceRing from './ConfidenceRing';
import { ArrowRight, Building, Sparkles } from 'lucide-react';
import { DynamicIcon } from '@libs/utils/iconMap';

interface CompetitorOverviewProps {
  competitors: ICompetitor[];
  whiteSpaces: IWhiteSpaceOpportunity[];
  metrics: ICompetitorAssessmentMetrics | null;
  lastRefreshedAt: string | null | undefined;
  onViewWhiteSpaces: () => void;
}

interface KpiCardProps {
  icon: string;
  iconColor: string;
  label: string;
  value: string | number;
  subtitle?: string;
  index: number;
}

const KpiCard: React.FC<KpiCardProps> = ({
  icon,
  iconColor,
  label,
  value,
  subtitle,
  index,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
    className='aucctus-bg-secondary aucctus-border-secondary rounded-xl border p-4'
  >
    <div className='mb-3 flex items-center gap-2'>
      <div
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-lg',
          iconColor,
        )}
      >
        <DynamicIcon
          variant={icon as any}
          height={16}
          width={16}
          className='stroke-current'
        />
      </div>
      <span className='aucctus-text-secondary text-xs font-medium'>
        {label}
      </span>
    </div>
    <p className='aucctus-text-primary text-2xl font-bold'>{value}</p>
    {subtitle && (
      <p className='aucctus-text-tertiary mt-0.5 text-[10px]'>{subtitle}</p>
    )}
  </motion.div>
);

const CompetitorOverview: React.FC<CompetitorOverviewProps> = ({
  competitors,
  whiteSpaces,
  metrics,
  lastRefreshedAt,
  onViewWhiteSpaces,
}) => {
  const avgConfidence = useMemo(() => {
    const withAssessment = competitors.filter((c) => c.assessment);
    if (withAssessment.length === 0) return 0;
    return Math.round(
      withAssessment.reduce(
        (sum, c) => sum + (c.assessment?.confidenceScore || 0),
        0,
      ) / withAssessment.length,
    );
  }, [competitors]);

  const lastScanLabel = useMemo(() => {
    if (!lastRefreshedAt) return 'Never';
    const d = new Date(lastRefreshedAt);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, [lastRefreshedAt]);

  const topWhiteSpaces = useMemo(() => {
    return [...whiteSpaces]
      .sort((a, b) => b.opportunityScore - a.opportunityScore)
      .slice(0, 3);
  }, [whiteSpaces]);

  const confidenceColor = useMemo(() => {
    if (avgConfidence >= 70) return 'text-green-400';
    if (avgConfidence >= 40) return 'text-amber-400';
    return 'text-red-400';
  }, [avgConfidence]);

  return (
    <div className='space-y-6'>
      {/* KPI Row */}
      <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
        <KpiCard
          icon='swords'
          iconColor='bg-purple-500/15 text-purple-400'
          label='Active Competitors'
          value={metrics?.activeCompetitors ?? 0}
          subtitle={`${metrics?.totalCompetitors ?? 0} total discovered`}
          index={0}
        />
        <KpiCard
          icon='sparkles'
          iconColor='bg-amber-500/15 text-amber-400'
          label='White Spaces'
          value={metrics?.whiteSpacesFound ?? 0}
          subtitle='Market opportunities'
          index={1}
        />
        <KpiCard
          icon='shield-dollar'
          iconColor='bg-green-500/15 text-green-400'
          label='Avg Confidence'
          value={`${avgConfidence}%`}
          subtitle={
            avgConfidence >= 70
              ? 'High quality data'
              : avgConfidence >= 40
                ? 'Moderate data'
                : 'Limited data'
          }
          index={2}
        />
        <KpiCard
          icon='clock'
          iconColor='bg-blue-500/15 text-blue-400'
          label='Last Scanned'
          value={lastScanLabel}
          index={3}
        />
      </div>

      {/* Charts Row */}
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        <CompetitorConfidenceChart competitors={competitors} />
        <WhiteSpaceDistributionChart whiteSpaces={whiteSpaces} />
      </div>

      {/* Top White Space Opportunities */}
      {topWhiteSpaces.length > 0 && (
        <div>
          <div className='mb-4 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Sparkles size={16} className='stroke-amber-500' />
              <h3 className='aucctus-text-primary text-sm font-semibold'>
                Top Opportunities
              </h3>
            </div>
            <button
              onClick={onViewWhiteSpaces}
              className='aucctus-text-tertiary flex items-center gap-1 text-xs transition-colors hover:text-white/70'
            >
              View all
              <ArrowRight size={12} className='stroke-current' />
            </button>
          </div>

          <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
            {topWhiteSpaces.map((ws, index) => {
              const urgencyColors: Record<string, string> = {
                immediate: 'border-l-red-500',
                strategic: 'border-l-amber-500',
                exploratory: 'border-l-blue-500',
              };

              return (
                <motion.div
                  key={ws.uuid}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + index * 0.06 }}
                  className={cn(
                    'aucctus-bg-secondary aucctus-border-secondary rounded-xl border border-l-4 p-4',
                    urgencyColors[ws.urgency] || 'border-l-gray-500',
                  )}
                >
                  <div className='mb-2 flex items-start justify-between'>
                    <h4 className='aucctus-text-primary line-clamp-1 text-sm font-medium'>
                      {ws.title}
                    </h4>
                    <ConfidenceRing
                      score={ws.opportunityScore}
                      size={32}
                      strokeWidth={3}
                    />
                  </div>
                  <p className='aucctus-text-secondary line-clamp-2 text-xs'>
                    {ws.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Competitor Quick Glance */}
      {competitors.length > 0 && (
        <div>
          <h3 className='aucctus-text-primary mb-3 text-sm font-semibold'>
            Competitor Landscape
          </h3>
          <div className='aucctus-bg-secondary aucctus-border-secondary rounded-xl border p-4'>
            <div className='flex flex-wrap gap-3'>
              {competitors
                .filter((c) => c.assessment)
                .sort(
                  (a, b) =>
                    (b.assessment?.confidenceScore || 0) -
                    (a.assessment?.confidenceScore || 0),
                )
                .map((c) => (
                  <div
                    key={c.uuid}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg px-3 py-2',
                      c.isYourCompany ? 'bg-amber-500/10' : 'bg-white/[0.03]',
                    )}
                  >
                    {c.logoUrl ? (
                      <img
                        src={c.logoUrl}
                        alt={c.name}
                        className='h-6 w-6 rounded object-contain'
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className='aucctus-bg-primary flex h-6 w-6 items-center justify-center rounded'>
                        <Building
                          size={12}
                          className='aucctus-stroke-tertiary'
                        />
                      </div>
                    )}
                    <span
                      className={cn(
                        'text-xs font-medium',
                        c.isYourCompany
                          ? 'text-amber-400'
                          : 'aucctus-text-primary',
                      )}
                    >
                      {c.name}
                    </span>
                    <span
                      className={cn('text-[10px] font-medium', confidenceColor)}
                    >
                      {c.assessment?.confidenceScore}%
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetitorOverview;
