import { FunctionComponent, useMemo } from 'react';
import {
  Lightbulb,
  Target,
  TrendingUp,
  Zap,
  ArrowRight,
  ChevronRight,
  Signal,
  Settings,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { cn } from '@libs/utils/react';
import {
  useSignalScanningDashboard,
  useSignalRefresh,
  useUpdateSignalStatus,
  useCreateConceptFromSignal,
  useCreateConceptFromOpportunity,
} from '@hooks/query/signalScanning.hook';
import type { ISignal, SignalStatus } from '@libs/api/types';
import InnovationRadar from './components/visualizations/InnovationRadar';
import { ClusteredFeed } from './components/feed';

import styles from './signal-scanning.module.scss';

// ============================================
// Header Component
// ============================================
interface PageHeaderProps {
  isRefreshing: boolean;
  onRefresh: () => void;
  lastUpdated?: string;
}

const PageHeader: FunctionComponent<PageHeaderProps> = ({
  isRefreshing,
  onRefresh,
  lastUpdated,
}) => {
  const formatLastUpdated = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className='mb-6 flex flex-col gap-2'>
      <div className='flex items-center justify-between'>
        <div className='flex flex-col'>
          <h1 className='aucctus-header-xl-semibold aucctus-text-primary flex items-center gap-2'>
            <Signal className='aucctus-text-brand-primary h-7 w-7' />
            Strategic Foresight
          </h1>
          <p className='aucctus-text-secondary aucctus-text-md mt-1'>
            Monitor market signals, identify opportunities, and feed insights
            into your innovation pipeline.
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <span className='aucctus-text-tertiary aucctus-text-xs'>
            Last updated: {formatLastUpdated(lastUpdated)}
          </span>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 transition-all',
              {
                'aucctus-bg-brand-solid aucctus-text-white': !isRefreshing,
                'aucctus-bg-disabled aucctus-text-disabled cursor-not-allowed':
                  isRefreshing,
              },
            )}
          >
            {isRefreshing ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <RefreshCw className='h-4 w-4' />
            )}
            <span className='aucctus-text-sm-medium'>
              {isRefreshing ? 'Scanning...' : 'Refresh'}
            </span>
          </button>
          <button className='aucctus-bg-primary-hover flex items-center gap-2 rounded-lg px-3 py-2 transition-all'>
            <Settings className='aucctus-stroke-brand-primary h-4 w-4' />
            <span className='aucctus-text-primary aucctus-text-sm-medium'>
              Configure
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// Gut Check Card
// ============================================
interface GutCheckCardProps {
  gutCheck: {
    summary: string;
    keyInsights: string[];
    recommendedActions: string[];
    status: string;
    generatedAt: string;
  } | null;
  isLoading: boolean;
}

const GutCheckCard: FunctionComponent<GutCheckCardProps> = ({
  gutCheck,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className='aucctus-bg-secondary aucctus-border-primary animate-pulse rounded-xl border p-5'>
        <div className='mb-2 flex items-center gap-2'>
          <div className='h-4 w-4 rounded bg-gray-300' />
          <div className='h-3 w-24 rounded bg-gray-300' />
        </div>
        <div className='space-y-2'>
          <div className='h-4 w-full rounded bg-gray-300' />
          <div className='h-4 w-3/4 rounded bg-gray-300' />
        </div>
        <div className='mt-4 flex flex-wrap gap-2'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='h-8 w-32 rounded-lg bg-gray-300' />
          ))}
        </div>
      </div>
    );
  }

  if (!gutCheck) {
    return (
      <div className='aucctus-bg-secondary aucctus-border-primary rounded-xl border p-5'>
        <div className='mb-2 flex items-center gap-2'>
          <Lightbulb className='aucctus-text-warning-primary h-4 w-4' />
          <span className='aucctus-text-tertiary aucctus-text-xs font-medium uppercase tracking-wide'>
            Strategic Summary
          </span>
        </div>
        <p className='aucctus-text-tertiary aucctus-text-md italic leading-relaxed'>
          No strategic summary available yet. Click Refresh to scan for signals
          and generate insights.
        </p>
      </div>
    );
  }

  return (
    <div className='aucctus-bg-secondary aucctus-border-primary rounded-xl border p-5'>
      <div className='mb-2 flex items-center gap-2'>
        <Lightbulb className='aucctus-text-warning-primary h-4 w-4' />
        <span className='aucctus-text-tertiary aucctus-text-xs font-medium uppercase tracking-wide'>
          Strategic Summary
        </span>
        {gutCheck.status === 'generating' && (
          <span className='aucctus-text-brand-primary flex items-center gap-1 text-xs'>
            <Loader2 className='h-3 w-3 animate-spin' />
            Generating...
          </span>
        )}
      </div>
      <p className='aucctus-text-primary aucctus-text-md leading-relaxed'>
        {gutCheck.summary}
      </p>
      <div className='mt-4 flex flex-wrap gap-2'>
        {gutCheck.recommendedActions.slice(0, 3).map((action, i) => (
          <div
            key={i}
            className='aucctus-bg-primary flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs'
          >
            <ChevronRight className='aucctus-text-brand-primary h-3 w-3' />
            <span className='aucctus-text-secondary'>{action}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// Metrics Row
// ============================================
interface MetricsRowProps {
  metrics: {
    activeSignals: number;
    newThisWeek: number;
    quickWins: number;
    pipelineValue: number | null;
  } | null;
  isLoading: boolean;
}

const MetricsRow: FunctionComponent<MetricsRowProps> = ({
  metrics,
  isLoading,
}) => {
  const formatPipelineValue = (value: number | null) => {
    if (value === null) return '--';
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const metricItems = [
    {
      label: 'Active Signals',
      value: metrics?.activeSignals ?? 0,
      icon: Target,
      color: 'aucctus-text-brand-primary',
    },
    {
      label: 'This Week',
      value: `+${metrics?.newThisWeek ?? 0}`,
      icon: TrendingUp,
      color: 'aucctus-text-success-primary',
    },
    {
      label: 'Quick Wins',
      value: metrics?.quickWins ?? 0,
      icon: Zap,
      color: 'aucctus-text-warning-primary',
    },
    {
      label: 'Pipeline Value',
      value: formatPipelineValue(metrics?.pipelineValue ?? null),
      icon: Target,
      color: 'aucctus-text-brand-primary',
    },
  ];

  if (isLoading) {
    return (
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className='aucctus-bg-primary aucctus-border-primary flex animate-pulse items-center gap-3 rounded-xl border p-4'
          >
            <div className='h-10 w-10 rounded-lg bg-gray-300' />
            <div className='flex-1'>
              <div className='mb-1 h-6 w-16 rounded bg-gray-300' />
              <div className='h-3 w-20 rounded bg-gray-300' />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
      {metricItems.map((item) => (
        <div
          key={item.label}
          className='aucctus-bg-primary aucctus-border-primary flex items-center gap-3 rounded-xl border p-4'
        >
          <div className='aucctus-bg-secondary rounded-lg p-2'>
            <item.icon className={cn('h-4 w-4', item.color)} />
          </div>
          <div>
            <p className='aucctus-text-primary text-xl font-semibold'>
              {item.value}
            </p>
            <p className='aucctus-text-tertiary text-xs'>{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================
// Priority Signals Section
// ============================================
interface PrioritySignalsProps {
  signals: ISignal[];
  isLoading: boolean;
}

const PrioritySignals: FunctionComponent<PrioritySignalsProps> = ({
  signals,
  isLoading,
}) => {
  const prioritySignals = useMemo(() => {
    return signals
      .filter((s) => s.impact === 'high' || s.status === 'new')
      .slice(0, 4);
  }, [signals]);

  const stanceCounts = useMemo(() => {
    return {
      bullish: signals.filter((s) => s.stance === 'bullish').length,
      bearish: signals.filter((s) => s.stance === 'bearish').length,
      neutral: signals.filter((s) => s.stance === 'neutral').length,
    };
  }, [signals]);

  if (isLoading) {
    return (
      <div className='aucctus-bg-primary aucctus-border-primary animate-pulse rounded-xl border p-5'>
        <div className='mb-4 flex items-center gap-2'>
          <div className='h-4 w-4 rounded bg-gray-300' />
          <div className='h-4 w-24 rounded bg-gray-300' />
        </div>
        <div className='space-y-2'>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className='h-16 w-full rounded-lg bg-gray-300' />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='aucctus-bg-primary aucctus-border-primary rounded-xl border p-5'>
      <div className='mb-4 flex items-center gap-2'>
        <Zap className='aucctus-text-warning-primary h-4 w-4' />
        <h2 className='aucctus-text-primary aucctus-text-md-semibold'>
          Priority Signals
        </h2>
      </div>

      {prioritySignals.length === 0 ? (
        <p className='aucctus-text-tertiary text-sm italic'>
          No priority signals found. Refresh to scan for new signals.
        </p>
      ) : (
        <div className='space-y-2'>
          {prioritySignals.map((signal) => (
            <div
              key={signal.uuid}
              className='aucctus-bg-secondary group flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-all hover:shadow-sm'
            >
              <div
                className={cn('mt-1 h-2 w-2 flex-shrink-0 rounded-full', {
                  'aucctus-bg-success-solid': signal.stance === 'bullish',
                  'aucctus-bg-error-solid': signal.stance === 'bearish',
                  'aucctus-bg-tertiary': signal.stance === 'neutral',
                })}
              />
              <div className='min-w-0 flex-1'>
                <h4 className='aucctus-text-primary aucctus-text-sm-medium group-hover:aucctus-text-brand-primary truncate transition-colors'>
                  {signal.title}
                </h4>
                <p className='aucctus-text-tertiary mt-0.5 text-xs'>
                  {signal.theme.replace(/_/g, ' ')} · {signal.confidence}%
                  confidence
                </p>
              </div>
              <ArrowRight className='aucctus-text-tertiary h-4 w-4 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100' />
            </div>
          ))}
        </div>
      )}

      {/* Quick stance breakdown */}
      <div className='mt-4 grid grid-cols-3 gap-2 border-t border-gray-100 pt-4 dark:border-gray-800'>
        <div className='text-center'>
          <p className='aucctus-text-primary text-lg font-semibold'>
            {stanceCounts.bullish}
          </p>
          <p className='aucctus-text-tertiary text-[10px]'>Bullish</p>
        </div>
        <div className='text-center'>
          <p className='aucctus-text-primary text-lg font-semibold'>
            {stanceCounts.bearish}
          </p>
          <p className='aucctus-text-tertiary text-[10px]'>Bearish</p>
        </div>
        <div className='text-center'>
          <p className='aucctus-text-primary text-lg font-semibold'>
            {stanceCounts.neutral}
          </p>
          <p className='aucctus-text-tertiary text-[10px]'>Neutral</p>
        </div>
      </div>
    </div>
  );
};

// ============================================
// Main Page Component
// ============================================
const SignalScanningPage: FunctionComponent = () => {
  // Fetch dashboard data
  const {
    gutCheck,
    metrics,
    recentSignals,
    topOpportunities,
    industryIntelligence,
    radarPoints,
    isLoading: isDashboardLoading,
  } = useSignalScanningDashboard();

  // Mutations
  const { refreshSignals, isRefreshing } = useSignalRefresh();
  const { updateStatus, isUpdating: isUpdatingStatus } =
    useUpdateSignalStatus();
  const {
    createConcept: createConceptFromSignal,
    isCreating: isCreatingFromSignal,
  } = useCreateConceptFromSignal();
  const {
    createConcept: createConceptFromOpportunity,
    isCreating: isCreatingFromOpportunity,
  } = useCreateConceptFromOpportunity();

  // Handlers
  const handleCreateConceptFromSignal = (signalUuid: string) => {
    createConceptFromSignal({ signalUuid });
  };

  const handleCreateConceptFromOpportunity = (opportunityUuid: string) => {
    createConceptFromOpportunity(opportunityUuid);
  };

  const handleUpdateSignalStatus = (
    signalUuid: string,
    status: SignalStatus,
  ) => {
    updateStatus({ signalUuid, status });
  };

  // Get last updated time from gut check
  const lastUpdated = gutCheck?.generatedAt;

  return (
    <div className={styles.signalScanningPage}>
      <PageHeader
        isRefreshing={isRefreshing}
        onRefresh={() => refreshSignals()}
        lastUpdated={lastUpdated}
      />

      <div className='space-y-6'>
        {/* Gut Check Summary */}
        <GutCheckCard
          gutCheck={gutCheck ?? null}
          isLoading={isDashboardLoading}
        />

        {/* Metrics */}
        <MetricsRow metrics={metrics ?? null} isLoading={isDashboardLoading} />

        {/* Radar + Priority Signals */}
        <div className='grid gap-6 lg:grid-cols-5'>
          {/* Innovation Radar */}
          <div className='lg:col-span-3'>
            <div className='aucctus-bg-primary aucctus-border-primary rounded-xl border p-6'>
              <div className='mb-4'>
                <h2 className='aucctus-text-primary aucctus-text-lg-semibold'>
                  Innovation Radar
                </h2>
                <p className='aucctus-text-tertiary aucctus-text-xs mt-0.5'>
                  Trends by category and time horizon
                </p>
              </div>
              {isDashboardLoading ? (
                <div className='flex h-64 items-center justify-center'>
                  <Loader2 className='aucctus-text-brand-primary h-8 w-8 animate-spin' />
                </div>
              ) : radarPoints.length === 0 ? (
                <div className='flex h-64 items-center justify-center'>
                  <p className='aucctus-text-tertiary text-sm italic'>
                    No radar data available. Refresh to generate insights.
                  </p>
                </div>
              ) : (
                <InnovationRadar
                  points={radarPoints}
                  onPointClick={() => {
                    // TODO: Implement radar point click handler (e.g., show signal detail modal)
                  }}
                />
              )}
            </div>
          </div>

          {/* Priority Signals */}
          <div className='lg:col-span-2'>
            <PrioritySignals
              signals={recentSignals}
              isLoading={isDashboardLoading}
            />
          </div>
        </div>

        {/* Clustered Priority Feed */}
        <ClusteredFeed
          signals={recentSignals}
          opportunities={topOpportunities}
          intelligence={industryIntelligence}
          isLoading={isDashboardLoading}
          onCreateConceptFromSignal={handleCreateConceptFromSignal}
          onCreateConceptFromOpportunity={handleCreateConceptFromOpportunity}
          onUpdateSignalStatus={handleUpdateSignalStatus}
          isCreatingFromSignal={isCreatingFromSignal}
          isCreatingFromOpportunity={isCreatingFromOpportunity}
          isUpdatingSignalStatus={isUpdatingStatus}
        />
      </div>
    </div>
  );
};

export default SignalScanningPage;
