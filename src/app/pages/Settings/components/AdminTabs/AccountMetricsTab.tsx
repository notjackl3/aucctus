import { FunctionComponent, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@components';
import { useAdminMetrics } from '@hooks/query/admin.hook';
import { cn } from '@libs/utils/react';
import { MetricsTimeRange, TopConcept } from '@libs/api/types';

type IconVariant = Parameters<typeof Icon>[0]['variant'];

const TIME_RANGE_OPTIONS: { value: MetricsTimeRange; label: string }[] = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: 'all', label: 'All Time' },
];

/**
 * Format currency values with appropriate suffixes (K, M, B)
 */
const formatCurrency = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '$0';
  if (num >= 1_000_000_000) {
    return `$${(num / 1_000_000_000).toFixed(1)}B`;
  }
  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `$${(num / 1_000).toFixed(1)}K`;
  }
  return `$${num.toLocaleString()}`;
};

/**
 * Props for the MetricCard component
 */
interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: IconVariant;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

/**
 * Reusable metric card component with title, value, and optional trend indicator
 */
const MetricCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  className,
}: MetricCardProps) => (
  <div
    className={cn(
      'rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-sm',
      className,
    )}
  >
    <div className='mb-1 flex items-center justify-between'>
      <p className='aucctus-text-xs aucctus-text-tertiary'>{title}</p>
      {icon && (
        <Icon
          variant={icon}
          className='aucctus-stroke-tertiary h-4 w-4 opacity-50'
        />
      )}
    </div>
    <p className='aucctus-text-2xl-semibold aucctus-text-primary mb-1'>
      {value}
    </p>
    {(subtitle || trend) && (
      <div className='flex items-center gap-2'>
        {trend && (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-medium',
              {
                'bg-green-100 text-green-700': trend === 'up',
                'bg-red-100 text-red-700': trend === 'down',
                'bg-gray-100 text-gray-600': trend === 'neutral',
              },
            )}
          >
            <Icon
              variant={
                trend === 'up'
                  ? 'trending-up'
                  : trend === 'down'
                    ? 'trending-down'
                    : 'stagnating'
              }
              className='h-3 w-3'
            />
            {trendValue}
          </span>
        )}
        {subtitle && (
          <p className='aucctus-text-xs aucctus-text-tertiary'>{subtitle}</p>
        )}
      </div>
    )}
  </div>
);

/**
 * Top Concepts list card with clickable links to concept pages
 */
interface TopConceptsCardProps {
  concepts: TopConcept[];
}

const TopConceptsCard = ({ concepts }: TopConceptsCardProps) => (
  <div className='col-span-1 rounded-lg border border-gray-200 p-4 sm:col-span-2 lg:col-span-3'>
    <div className='mb-3 flex items-center justify-between'>
      <p className='aucctus-text-xs aucctus-text-tertiary'>Top 3 Concepts</p>
      <Icon
        variant='star-01'
        className='aucctus-stroke-tertiary h-4 w-4 opacity-50'
      />
    </div>
    {concepts.length === 0 ? (
      <p className='aucctus-text-sm aucctus-text-tertiary italic'>
        No concepts with priority scores yet
      </p>
    ) : (
      <div className='space-y-3'>
        {concepts.map((concept, index) => (
          <Link
            key={concept.identifier}
            to={`/concept/${concept.identifier}`}
            className='flex items-center justify-between rounded-md border border-gray-100 p-3 transition-colors hover:border-gray-300 hover:bg-gray-50'
          >
            <div className='flex items-center gap-3'>
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
                  {
                    'bg-yellow-100 text-yellow-700': index === 0,
                    'bg-gray-100 text-gray-600': index === 1,
                    'bg-orange-100 text-orange-700': index === 2,
                  },
                )}
              >
                {index + 1}
              </span>
              <div>
                <p className='aucctus-text-sm-medium aucctus-text-primary'>
                  {concept.title}
                </p>
                <p className='aucctus-text-xs aucctus-text-tertiary'>
                  SAM: {concept.sam ? formatCurrency(concept.sam) : 'N/A'}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <span
                className={cn('rounded-full px-2 py-0.5 text-xs font-medium', {
                  'bg-green-100 text-green-700': concept.priorityScore >= 75,
                  'bg-yellow-100 text-yellow-700':
                    concept.priorityScore >= 50 && concept.priorityScore < 75,
                  'bg-gray-100 text-gray-600': concept.priorityScore < 50,
                })}
              >
                {concept.priorityScore}
              </span>
              <Icon
                variant='chevronright'
                className='aucctus-stroke-tertiary h-4 w-4'
              />
            </div>
          </Link>
        ))}
      </div>
    )}
  </div>
);

/**
 * Coming Soon metric card placeholder
 */
interface ComingSoonCardProps {
  title: string;
  icon?: IconVariant;
  description?: string;
}

const ComingSoonCard = ({ title, icon, description }: ComingSoonCardProps) => (
  <div className='rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4'>
    <div className='mb-1 flex items-center justify-between'>
      <p className='aucctus-text-xs aucctus-text-tertiary'>{title}</p>
      {icon && (
        <Icon
          variant={icon}
          className='aucctus-stroke-tertiary h-4 w-4 opacity-40'
        />
      )}
    </div>
    <p className='aucctus-text-lg-semibold aucctus-text-tertiary italic'>
      Coming Soon
    </p>
    {description && (
      <p className='aucctus-text-xs aucctus-text-tertiary mt-1 opacity-70'>
        {description}
      </p>
    )}
  </div>
);

/**
 * Team breakdown labels for display
 */
const TEAM_LABELS: Record<string, string> = {
  innovation: 'Innovation',
  strategy: 'Strategy',
  product: 'Product',
  operations: 'Operations',
  other: 'Other',
};

/**
 * Team color mapping for visual distinction
 */
const TEAM_COLORS: Record<string, string> = {
  innovation: 'bg-purple-500',
  strategy: 'bg-blue-500',
  product: 'bg-green-500',
  operations: 'bg-orange-500',
  other: 'bg-gray-400',
};

/**
 * Users by Team breakdown card with horizontal bar chart
 */
interface UsersByTeamCardProps {
  usersByTeam: Record<string, number>;
}

const UsersByTeamCard = ({ usersByTeam }: UsersByTeamCardProps) => {
  const totalUsers = Object.values(usersByTeam).reduce(
    (sum, count) => sum + count,
    0,
  );
  const sortedTeams = Object.entries(usersByTeam).sort(([, a], [, b]) => b - a);

  return (
    <div className='col-span-1 rounded-lg border border-gray-200 p-4 sm:col-span-2'>
      <div className='mb-3 flex items-center justify-between'>
        <p className='aucctus-text-xs aucctus-text-tertiary'>
          Active Users by Team
        </p>
        <Icon
          variant='users-02'
          className='aucctus-stroke-tertiary h-4 w-4 opacity-50'
        />
      </div>
      <p className='aucctus-text-2xl-semibold aucctus-text-primary mb-3'>
        {totalUsers}{' '}
        <span className='aucctus-text-sm aucctus-text-tertiary font-normal'>
          users
        </span>
      </p>
      {totalUsers === 0 ? (
        <p className='aucctus-text-sm aucctus-text-tertiary italic'>
          No user data available
        </p>
      ) : (
        <div className='space-y-2'>
          {sortedTeams.map(([team, count]) => {
            const percentage = totalUsers > 0 ? (count / totalUsers) * 100 : 0;
            return (
              <div key={team} className='flex items-center gap-2'>
                <span className='aucctus-text-xs aucctus-text-secondary w-20 truncate'>
                  {TEAM_LABELS[team] || team}
                </span>
                <div className='h-2 flex-1 overflow-hidden rounded-full bg-gray-100'>
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      TEAM_COLORS[team] || 'bg-gray-400',
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className='aucctus-text-xs aucctus-text-tertiary w-8 text-right'>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * Progress metric card showing total count with tested/validated percentage
 */
interface ProgressMetricCardProps {
  title: string;
  totalCount: number;
  testedCount: number;
  icon?: IconVariant;
  testedLabel?: string;
}

const ProgressMetricCard = ({
  title,
  totalCount,
  testedCount,
  icon,
  testedLabel = 'tested',
}: ProgressMetricCardProps) => {
  const percentage =
    totalCount > 0 ? Math.round((testedCount / totalCount) * 100) : 0;

  return (
    <div className='rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-sm'>
      <div className='mb-1 flex items-center justify-between'>
        <p className='aucctus-text-xs aucctus-text-tertiary'>{title}</p>
        {icon && (
          <Icon
            variant={icon}
            className='aucctus-stroke-tertiary h-4 w-4 opacity-50'
          />
        )}
      </div>
      <div className='mb-2 flex items-baseline gap-2'>
        <p className='aucctus-text-2xl-semibold aucctus-text-primary'>
          {totalCount}
        </p>
        <span className='aucctus-text-sm aucctus-text-tertiary'>total</span>
      </div>
      {/* Progress bar */}
      <div className='mb-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-100'>
        <div
          className={cn('h-full rounded-full transition-all', {
            'bg-green-500': percentage >= 75,
            'bg-yellow-500': percentage >= 50 && percentage < 75,
            'bg-orange-500': percentage >= 25 && percentage < 50,
            'bg-gray-400': percentage < 25,
          })}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className='aucctus-text-xs aucctus-text-tertiary'>
        {testedCount} {testedLabel} ({percentage}%)
      </p>
    </div>
  );
};

/**
 * Loading skeleton for metric cards
 */
const MetricCardSkeleton = () => (
  <div className='animate-pulse rounded-lg border border-gray-200 p-4'>
    <div className='mb-2 h-4 w-24 rounded bg-gray-200' />
    <div className='mb-1 h-8 w-16 rounded bg-gray-200' />
    <div className='h-3 w-32 rounded bg-gray-200' />
  </div>
);

const AccountMetricsTab: FunctionComponent = () => {
  const [timeRange, setTimeRange] = useState<MetricsTimeRange>('all');
  const {
    metrics,
    isLoading: isMetricsLoading,
    isError: isMetricsError,
    refetch: refetchMetrics,
    isForbidden,
  } = useAdminMetrics(timeRange);

  return (
    <div className='aucctus-bg-primary rounded-lg border border-gray-200 p-6'>
      <div className='mb-6 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Icon
            variant='barchart'
            className='aucctus-stroke-brand-primary h-5 w-5'
          />
          <h4 className='aucctus-text-lg-semibold aucctus-text-primary'>
            Account Metrics
          </h4>
        </div>

        {/* Time Range Selector */}
        <div className='flex items-center gap-2'>
          {TIME_RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeRange(option.value)}
              className={cn(
                'aucctus-text-sm rounded-md px-3 py-1.5 transition-colors',
                timeRange === option.value
                  ? 'aucctus-bg-brand-subtle aucctus-text-brand-primary font-medium'
                  : 'aucctus-text-secondary hover:aucctus-bg-secondary',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {isMetricsError && !isForbidden && (
        <div className='flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8'>
          <Icon
            variant='alert-circle'
            className='aucctus-stroke-error-primary mb-3 h-8 w-8'
          />
          <p className='aucctus-text-sm aucctus-text-error-primary mb-4'>
            Failed to load metrics. Please try again.
          </p>
          <button
            onClick={() => refetchMetrics()}
            className='btn btn-secondary btn-sm inline-flex items-center gap-2'
          >
            <Icon variant='refresh' className='h-4 w-4' />
            Retry
          </button>
        </div>
      )}

      {/* Forbidden State */}
      {isForbidden && (
        <div className='flex flex-col items-center justify-center rounded-lg border border-amber-200 bg-amber-50 p-8'>
          <Icon
            variant='lock'
            className='aucctus-stroke-warning-primary mb-3 h-8 w-8'
          />
          <p className='aucctus-text-sm aucctus-text-warning-primary'>
            Metrics are only available to Aucctus administrators.
          </p>
        </div>
      )}

      {/* Loading State */}
      {isMetricsLoading && !isMetricsError && (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </div>
      )}

      {/* Metrics Display - Flat layout without category labels */}
      {metrics && !isMetricsLoading && !isMetricsError && (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {/* Low-Value Initiatives Stopped Early */}
          <MetricCard
            title='Low-Value Initiatives Stopped Early'
            value={metrics.lowValueInitiativesStopped}
            icon='target'
            subtitle='Concepts deprioritized before excessive investment'
          />

          {/* SAM Identified */}
          <MetricCard
            title='SAM Identified'
            value={formatCurrency(metrics.samIdentified)}
            icon='currency-dollar'
            subtitle='Total serviceable addressable market'
          />

          {/* Faster Development % */}
          <MetricCard
            title='Faster Development %'
            value={`${metrics.fasterDevelopmentPercentage}%`}
            icon='clock-fast-forward'
            subtitle='Baseline: manual concept development'
            trend={
              Number(metrics.fasterDevelopmentPercentage) > 0 ? 'up' : 'neutral'
            }
            trendValue={
              Number(metrics.fasterDevelopmentPercentage) > 0
                ? 'faster'
                : 'baseline'
            }
          />

          {/* High-Priority Concepts (>=75) */}
          <MetricCard
            title='High-Priority Concepts (≥75)'
            value={metrics.highPriorityConceptsCount}
            icon='rocket'
            subtitle='Concepts with priority score 75+'
          />

          {/* Tests from Recommendations */}
          <MetricCard
            title='Tests from Recommendations'
            value={metrics.testsFromRecommendations}
            icon='beaker'
            subtitle='Tests created from AI recommendations'
          />

          {/* Business Cases Developed */}
          <MetricCard
            title='Business Cases Developed'
            value={metrics.businessCasesDeveloped}
            icon='briefcase'
            subtitle='Concepts with complete financial projections'
          />

          {/* Live Tests Launched */}
          <MetricCard
            title='Live Tests Launched'
            value={metrics.liveTestsLaunched}
            icon='beaker'
            subtitle='Tests actively running'
            trend={metrics.liveTestsLaunched > 0 ? 'up' : 'neutral'}
            trendValue={metrics.liveTestsLaunched > 0 ? 'active' : 'none'}
          />

          {/* Pipeline Value (Coming Soon) */}
          <ComingSoonCard
            title='Pipeline Value'
            icon='currency-dollar'
            description='Total projected value in pipeline'
          />

          {/* Hours Saved (Coming Soon) */}
          <ComingSoonCard
            title='Hours Saved'
            icon='clock'
            description='Research time saved by Nucleus'
          />

          {/* Assumptions Mapped & Tested */}
          <ProgressMetricCard
            title='Assumptions Mapped & Tested'
            totalCount={metrics.assumptionsMapped}
            testedCount={metrics.assumptionsTested}
            icon='clipboard-list'
            testedLabel='tested'
          />

          {/* Customer Personas Identified & Tested */}
          <ProgressMetricCard
            title='Customer Personas Identified & Tested'
            totalCount={metrics.personasIdentified}
            testedCount={metrics.personasTested}
            icon='user-group'
            testedLabel='tested'
          />

          {/* Active Users by Team - spans 2 columns */}
          <UsersByTeamCard usersByTeam={metrics.usersByTeam} />

          {/* Top 3 Concepts - spans full width */}
          <TopConceptsCard concepts={metrics.topConcepts} />
        </div>
      )}
    </div>
  );
};

export default AccountMetricsTab;
