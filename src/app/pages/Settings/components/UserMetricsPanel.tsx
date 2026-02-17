import { FunctionComponent, useState, useEffect } from 'react';
import {
  useUserMetricsList,
  useUserMetricsDetail,
} from '@hooks/query/admin.hook';
import { cn } from '@libs/utils/react';
import {
  AdminActivitySummary,
  MetricsTimeRange,
  UserMetricsSummary,
} from '@libs/api/types';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Ghost,
  Layers,
  Lock,
  RefreshCw,
  Rocket,
  Target,
  Users,
  X,
} from 'lucide-react';
import { DynamicIcon } from '@libs/utils/iconMap';

const TIME_RANGE_OPTIONS: { value: MetricsTimeRange; label: string }[] = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: 'all', label: 'All Time' },
];

/**
 * Format date for display
 */
const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString();
};

/**
 * Loading skeleton for the table
 */
const TableSkeleton = () => (
  <div className='animate-pulse'>
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className='flex items-center gap-4 border-b border-gray-100 py-4'
      >
        <div className='h-5 w-8 rounded bg-gray-200' />
        <div className='flex-1'>
          <div className='mb-2 h-4 w-48 rounded bg-gray-200' />
          <div className='h-3 w-32 rounded bg-gray-200' />
        </div>
        <div className='h-5 w-16 rounded bg-gray-200' />
        <div className='h-5 w-12 rounded bg-gray-200' />
        <div className='h-5 w-12 rounded bg-gray-200' />
        <div className='h-5 w-12 rounded bg-gray-200' />
        <div className='h-5 w-24 rounded bg-gray-200' />
      </div>
    ))}
  </div>
);

/**
 * Get icon and color for activity summary type
 */
const getActivitySummaryStyle = (
  summaryType: string,
): { iconVariant: string; iconClass: string; bgClass: string } => {
  switch (summaryType) {
    case 'ai_edit':
      return {
        iconVariant: 'stars-02',
        iconClass: 'aucctus-stroke-brand-primary',
        bgClass: 'bg-blue-50',
      };
    case 'test_launch':
      return {
        iconVariant: 'rocket',
        iconClass: 'aucctus-stroke-brand-primary',
        bgClass: 'bg-purple-50',
      };
    case 'test_complete':
      return {
        iconVariant: 'check-circle-broken',
        iconClass: 'text-green-500',
        bgClass: 'bg-green-50',
      };
    case 'session':
      return {
        iconVariant: 'chart-breakout-square',
        iconClass: 'aucctus-stroke-tertiary',
        bgClass: 'bg-gray-50',
      };
    default:
      return {
        iconVariant: 'activity',
        iconClass: 'aucctus-stroke-secondary',
        bgClass: 'bg-gray-50',
      };
  }
};

/**
 * Activity summary card component for the timeline
 */
interface ActivitySummaryCardProps {
  summary: AdminActivitySummary;
}

const ActivitySummaryCard: FunctionComponent<ActivitySummaryCardProps> = ({
  summary,
}) => {
  const style = getActivitySummaryStyle(summary.summaryType);

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg px-3 py-2',
        style.bgClass,
      )}
    >
      <DynamicIcon
        variant={style.iconVariant as any}
        className={cn('mt-0.5 h-4 w-4 flex-shrink-0', style.iconClass)}
      />
      <div className='min-w-0 flex-1'>
        <p className='aucctus-text-sm aucctus-text-primary truncate'>
          {summary.title}
        </p>
        {summary.description && (
          <p className='aucctus-text-xs aucctus-text-tertiary truncate'>
            {summary.description}
          </p>
        )}
      </div>
      <span className='aucctus-text-xs aucctus-text-tertiary flex-shrink-0 whitespace-nowrap'>
        {summary.relativeTime}
      </span>
    </div>
  );
};

/**
 * User detail drawer component
 */
interface UserDetailDrawerProps {
  userUuid: string | null;
  timeRange: MetricsTimeRange;
  isOpen: boolean;
  onClose: () => void;
}

const UserDetailDrawer: FunctionComponent<UserDetailDrawerProps> = ({
  userUuid,
  timeRange,
  isOpen,
  onClose,
}) => {
  const { userDetail, isLoading } = useUserMetricsDetail(userUuid, timeRange);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Mount: Add to DOM first
      setIsVisible(true);
      // Wait for next paint cycle, then trigger animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else if (isVisible) {
      // Unmount: Start exit animation
      setIsAnimating(false);
      // Wait for animation to complete before hiding
      setTimeout(() => {
        setIsVisible(false);
      }, 300);
    }
  }, [isOpen, isVisible]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  if (!isVisible || !userUuid) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`aucctus-bg-overlay fixed inset-0 z-40 backdrop-blur-sm transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Side Panel */}
      <div
        className={`aucctus-bg-primary aucctus-border-primary fixed right-0 top-0 z-50 h-full w-full max-w-lg overflow-y-auto border-l shadow-xl transition-transform duration-300 ease-out ${
          isAnimating ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className='aucctus-border-secondary sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4'>
          <h3 className='aucctus-text-lg-semibold aucctus-text-primary'>
            User Activity Details
          </h3>
          <button
            onClick={handleClose}
            className='rounded-lg p-2 hover:bg-gray-100'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6'>
          {isLoading ? (
            <div className='animate-pulse space-y-4'>
              <div className='h-6 w-48 rounded bg-gray-200' />
              <div className='h-4 w-32 rounded bg-gray-200' />
              <div className='mt-6 grid grid-cols-2 gap-4'>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className='h-20 rounded-lg bg-gray-200' />
                ))}
              </div>
            </div>
          ) : userDetail ? (
            <div className='space-y-6'>
              {/* User Info */}
              <div>
                <h4 className='aucctus-text-xl-semibold aucctus-text-primary'>
                  {userDetail.userFirstName} {userDetail.userLastName}
                </h4>
                <p className='aucctus-text-sm aucctus-text-secondary'>
                  {userDetail.userEmail}
                </p>
                {userDetail.team && (
                  <span className='aucctus-bg-secondary aucctus-text-secondary mt-2 inline-block rounded-full px-2 py-0.5 text-xs'>
                    {userDetail.team}
                  </span>
                )}
              </div>

              {/* Summary Stats */}
              <div className='grid grid-cols-2 gap-3'>
                <div className='rounded-lg border border-gray-200 p-3'>
                  <p className='aucctus-text-xs aucctus-text-tertiary'>Rank</p>
                  <p className='aucctus-text-xl-semibold aucctus-text-primary'>
                    #{userDetail.rank}
                  </p>
                </div>
                <div className='rounded-lg border border-gray-200 p-3'>
                  <p className='aucctus-text-xs aucctus-text-tertiary'>
                    Activity Score
                  </p>
                  <p className='aucctus-text-xl-semibold aucctus-text-primary'>
                    {userDetail.activityScore}
                  </p>
                </div>
                <div className='rounded-lg border border-gray-200 p-3'>
                  <p className='aucctus-text-xs aucctus-text-tertiary'>
                    Days Active
                  </p>
                  <p className='aucctus-text-xl-semibold aucctus-text-primary'>
                    {userDetail.daysActive ?? 0}
                  </p>
                </div>
                <div className='rounded-lg border border-gray-200 p-3'>
                  <p className='aucctus-text-xs aucctus-text-tertiary'>
                    Concepts in Review+
                  </p>
                  <p className='aucctus-text-xl-semibold aucctus-text-primary'>
                    {userDetail.conceptsInReviewPlus ?? 0}
                  </p>
                </div>
              </div>

              {/* AI Edits */}
              <div>
                <h5 className='aucctus-text-sm-semibold aucctus-text-primary mb-2'>
                  AI Editing
                </h5>
                <div className='flex flex-wrap gap-4'>
                  <div className='flex items-center gap-2'>
                    <Check className='h-4 w-4 text-green-500' />
                    <span className='aucctus-text-sm'>
                      {userDetail.aiEditsApplied} applied
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <X className='h-4 w-4 text-red-500' />
                    <span className='aucctus-text-sm'>
                      {userDetail.aiEditsRejected} rejected
                    </span>
                  </div>
                  {userDetail.aiAcceptanceRate && (
                    <div className='flex items-center gap-2'>
                      <Target className='aucctus-stroke-brand-primary h-4 w-4' />
                      <span
                        className={cn('aucctus-text-sm-medium', {
                          'text-green-600':
                            parseFloat(userDetail.aiAcceptanceRate) >= 80,
                          'text-amber-600':
                            parseFloat(userDetail.aiAcceptanceRate) >= 50 &&
                            parseFloat(userDetail.aiAcceptanceRate) < 80,
                          'text-red-500':
                            parseFloat(userDetail.aiAcceptanceRate) < 50,
                        })}
                      >
                        {parseFloat(userDetail.aiAcceptanceRate).toFixed(0)}%
                        acceptance rate
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Concept Activity */}
              <div>
                <h5 className='aucctus-text-sm-semibold aucctus-text-primary mb-2'>
                  Concept Activity
                </h5>
                <div className='grid grid-cols-4 gap-2'>
                  <div className='rounded-lg bg-gray-50 p-2 text-center'>
                    <p className='aucctus-text-lg-semibold'>
                      {userDetail.conceptsCreated}
                    </p>
                    <p className='aucctus-text-xs aucctus-text-tertiary'>
                      Created
                    </p>
                  </div>
                  <div className='rounded-lg bg-gray-50 p-2 text-center'>
                    <p className='aucctus-text-lg-semibold'>
                      {userDetail.conceptsViewed}
                    </p>
                    <p className='aucctus-text-xs aucctus-text-tertiary'>
                      Viewed
                    </p>
                  </div>
                  <div className='rounded-lg bg-gray-50 p-2 text-center'>
                    <p className='aucctus-text-lg-semibold'>
                      {userDetail.conceptsEdited}
                    </p>
                    <p className='aucctus-text-xs aucctus-text-tertiary'>
                      Edited
                    </p>
                  </div>
                  <div className='rounded-lg bg-blue-50 p-2 text-center'>
                    <p className='aucctus-text-lg-semibold text-blue-700'>
                      {userDetail.conceptsInReviewPlus ?? 0}
                    </p>
                    <p className='aucctus-text-xs text-blue-600'>In Review+</p>
                  </div>
                </div>
              </div>

              {/* Testing */}
              <div>
                <h5 className='aucctus-text-sm-semibold aucctus-text-primary mb-2'>
                  Testing
                </h5>
                <div className='flex flex-wrap gap-4'>
                  <div className='flex items-center gap-2'>
                    <Rocket className='aucctus-stroke-brand-primary h-4 w-4' />
                    <span className='aucctus-text-sm'>
                      {userDetail.testsLaunched} launched
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <CheckCircle2 className='h-4 w-4 text-green-500' />
                    <span className='aucctus-text-sm'>
                      {userDetail.testsCompleted} completed
                    </span>
                  </div>
                  {userDetail.testsPerConcept && (
                    <div className='flex items-center gap-2'>
                      <Layers className='aucctus-stroke-tertiary h-4 w-4' />
                      <span className='aucctus-text-sm'>
                        {parseFloat(userDetail.testsPerConcept).toFixed(1)}{' '}
                        tests/concept
                      </span>
                    </div>
                  )}
                  {userDetail.syntheticTestRatio && (
                    <div className='flex items-center gap-2'>
                      <Ghost className='aucctus-stroke-tertiary h-4 w-4' />
                      <span className='aucctus-text-sm aucctus-text-secondary'>
                        {parseFloat(userDetail.syntheticTestRatio).toFixed(0)}%
                        synthetic
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Section Views */}
              {userDetail.sectionViewsTotal > 0 && (
                <div>
                  <h5 className='aucctus-text-sm-semibold aucctus-text-primary mb-2'>
                    Section Views
                    <span className='aucctus-text-tertiary ml-2 font-normal'>
                      ({userDetail.sectionViewsTotal} total)
                    </span>
                  </h5>
                  <div className='grid grid-cols-3 gap-2'>
                    {userDetail.marketScanViews > 0 && (
                      <div className='rounded-lg bg-gray-50 p-2 text-center'>
                        <p className='aucctus-text-lg-semibold'>
                          {userDetail.marketScanViews}
                        </p>
                        <p className='aucctus-text-xs aucctus-text-tertiary'>
                          Market Scan
                        </p>
                      </div>
                    )}
                    {userDetail.customerProfileViews > 0 && (
                      <div className='rounded-lg bg-gray-50 p-2 text-center'>
                        <p className='aucctus-text-lg-semibold'>
                          {userDetail.customerProfileViews}
                        </p>
                        <p className='aucctus-text-xs aucctus-text-tertiary'>
                          Customer Profile
                        </p>
                      </div>
                    )}
                    {userDetail.ecosystemViews > 0 && (
                      <div className='rounded-lg bg-gray-50 p-2 text-center'>
                        <p className='aucctus-text-lg-semibold'>
                          {userDetail.ecosystemViews}
                        </p>
                        <p className='aucctus-text-xs aucctus-text-tertiary'>
                          Ecosystem
                        </p>
                      </div>
                    )}
                    {userDetail.assumptionsViews > 0 && (
                      <div className='rounded-lg bg-gray-50 p-2 text-center'>
                        <p className='aucctus-text-lg-semibold'>
                          {userDetail.assumptionsViews}
                        </p>
                        <p className='aucctus-text-xs aucctus-text-tertiary'>
                          Assumptions
                        </p>
                      </div>
                    )}
                    {userDetail.trendsViews > 0 && (
                      <div className='rounded-lg bg-gray-50 p-2 text-center'>
                        <p className='aucctus-text-lg-semibold'>
                          {userDetail.trendsViews}
                        </p>
                        <p className='aucctus-text-xs aucctus-text-tertiary'>
                          Trends
                        </p>
                      </div>
                    )}
                    {userDetail.financialProjectionViews > 0 && (
                      <div className='rounded-lg bg-gray-50 p-2 text-center'>
                        <p className='aucctus-text-lg-semibold'>
                          {userDetail.financialProjectionViews}
                        </p>
                        <p className='aucctus-text-xs aucctus-text-tertiary'>
                          Financials
                        </p>
                      </div>
                    )}
                    {userDetail.testDetailsViews > 0 && (
                      <div className='rounded-lg bg-gray-50 p-2 text-center'>
                        <p className='aucctus-text-lg-semibold'>
                          {userDetail.testDetailsViews}
                        </p>
                        <p className='aucctus-text-xs aucctus-text-tertiary'>
                          Test Details
                        </p>
                      </div>
                    )}
                    {userDetail.ideaPlaygroundViews > 0 && (
                      <div className='rounded-lg bg-gray-50 p-2 text-center'>
                        <p className='aucctus-text-lg-semibold'>
                          {userDetail.ideaPlaygroundViews}
                        </p>
                        <p className='aucctus-text-xs aucctus-text-tertiary'>
                          Idea Playground
                        </p>
                      </div>
                    )}
                    {userDetail.nucleusViews > 0 && (
                      <div className='rounded-lg bg-gray-50 p-2 text-center'>
                        <p className='aucctus-text-lg-semibold'>
                          {userDetail.nucleusViews}
                        </p>
                        <p className='aucctus-text-xs aucctus-text-tertiary'>
                          Nucleus
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Activity Timeline (Smart Summaries) */}
              {userDetail.activitySummaries &&
                userDetail.activitySummaries.length > 0 && (
                  <div>
                    <h5 className='aucctus-text-sm-semibold aucctus-text-primary mb-2'>
                      Activity Timeline
                    </h5>
                    <div className='max-h-72 space-y-2 overflow-y-auto'>
                      {userDetail.activitySummaries
                        .slice(0, 15)
                        .map((summary: AdminActivitySummary, idx: number) => (
                          <ActivitySummaryCard key={idx} summary={summary} />
                        ))}
                    </div>
                  </div>
                )}
            </div>
          ) : (
            <p className='aucctus-text-sm aucctus-text-tertiary'>
              No data available for this user.
            </p>
          )}
        </div>
      </div>
    </>
  );
};

/**
 * User row component for the leaderboard table
 */
interface UserRowProps {
  user: UserMetricsSummary;
  onClick: () => void;
}

/**
 * Format AI acceptance rate for display
 */
const formatAcceptanceRate = (rate: string | null | undefined): string => {
  if (rate === null || rate === undefined) return '-';
  const numRate = parseFloat(rate);
  return `${numRate.toFixed(0)}%`;
};

const UserRow: FunctionComponent<UserRowProps> = ({ user, onClick }) => (
  <tr
    className='cursor-pointer border-b border-gray-100 transition-colors hover:bg-gray-50'
    onClick={onClick}
  >
    <td className='py-3 pr-4'>
      <span
        className={cn(
          'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
          {
            'bg-yellow-100 text-yellow-700': user.rank === 1,
            'bg-gray-100 text-gray-600': user.rank === 2,
            'bg-orange-100 text-orange-700': user.rank === 3,
            'bg-gray-50 text-gray-500': user.rank > 3,
          },
        )}
      >
        {user.rank}
      </span>
    </td>
    <td className='py-3 pr-4'>
      <div>
        <p className='aucctus-text-sm-medium aucctus-text-primary'>
          {user.userFirstName} {user.userLastName}
        </p>
        <p className='aucctus-text-xs aucctus-text-tertiary'>
          {user.userEmail}
        </p>
      </div>
    </td>
    <td className='py-3 pr-4'>
      {user.team ? (
        <span className='aucctus-bg-secondary aucctus-text-secondary rounded-full px-2 py-0.5 text-xs'>
          {user.team}
        </span>
      ) : (
        <span className='aucctus-text-tertiary text-xs'>-</span>
      )}
    </td>
    <td className='py-3 pr-4 text-right'>
      <span
        className={cn('aucctus-text-sm-medium', {
          'text-green-600': parseFloat(user.activityScore) >= 100,
          'text-blue-600':
            parseFloat(user.activityScore) >= 50 &&
            parseFloat(user.activityScore) < 100,
          'aucctus-text-secondary': parseFloat(user.activityScore) < 50,
        })}
      >
        {user.activityScore}
      </span>
    </td>
    <td className='aucctus-text-sm py-3 pr-4 text-right'>
      {user.aiEditsApplied}
    </td>
    <td className='py-3 pr-4 text-right'>
      <span
        className={cn('aucctus-text-sm', {
          'text-green-600':
            user.aiAcceptanceRate && parseFloat(user.aiAcceptanceRate) >= 80,
          'text-amber-600':
            user.aiAcceptanceRate &&
            parseFloat(user.aiAcceptanceRate) >= 50 &&
            parseFloat(user.aiAcceptanceRate) < 80,
          'text-red-500':
            user.aiAcceptanceRate && parseFloat(user.aiAcceptanceRate) < 50,
          'aucctus-text-tertiary': !user.aiAcceptanceRate,
        })}
      >
        {formatAcceptanceRate(user.aiAcceptanceRate)}
      </span>
    </td>
    <td className='aucctus-text-sm py-3 pr-4 text-right'>
      {user.conceptsCreated}
    </td>
    <td className='aucctus-text-sm py-3 pr-4 text-right'>
      {user.testsLaunched}
    </td>
    <td className='aucctus-text-sm py-3 pr-4 text-right'>
      {user.daysActive ?? 0}
    </td>
    <td className='aucctus-text-xs aucctus-text-tertiary py-3 text-right'>
      {formatDate(user.lastActive)}
    </td>
  </tr>
);

/**
 * User Metrics Panel component for the admin dashboard
 */
const UserMetricsPanel: FunctionComponent = () => {
  const [timeRange, setTimeRange] = useState<MetricsTimeRange>('all');
  const [page, setPage] = useState(1);
  const [selectedUserUuid, setSelectedUserUuid] = useState<string | null>(null);

  const { users, totalCount, isLoading, isError, isForbidden, refetch } =
    useUserMetricsList(timeRange, page);

  const pageSize = 20;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className='aucctus-bg-primary rounded-lg border border-gray-200 p-6'>
      <div className='mb-6 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Users className='aucctus-stroke-brand-primary h-5 w-5' />
          <h4 className='aucctus-text-lg-semibold aucctus-text-primary'>
            User Activity Metrics
          </h4>
          {!isLoading && !isError && (
            <span className='aucctus-text-xs aucctus-text-tertiary'>
              ({totalCount} users)
            </span>
          )}
        </div>

        {/* Time Range Selector */}
        <div className='flex items-center gap-2'>
          {TIME_RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setTimeRange(option.value);
                setPage(1);
              }}
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
      {isError && !isForbidden && (
        <div className='flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8'>
          <AlertCircle className='aucctus-stroke-error-primary mb-3 h-8 w-8' />
          <p className='aucctus-text-sm aucctus-text-error-primary mb-4'>
            Failed to load user metrics. Please try again.
          </p>
          <button
            onClick={() => refetch()}
            className='btn btn-secondary btn-sm inline-flex items-center gap-2'
          >
            <RefreshCw className='h-4 w-4' />
            Retry
          </button>
        </div>
      )}

      {/* Forbidden State */}
      {isForbidden && (
        <div className='flex flex-col items-center justify-center rounded-lg border border-amber-200 bg-amber-50 p-8'>
          <Lock className='aucctus-stroke-warning-primary mb-3 h-8 w-8' />
          <p className='aucctus-text-sm aucctus-text-warning-primary'>
            User metrics are only available to Aucctus administrators.
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !isError && <TableSkeleton />}

      {/* Table */}
      {!isLoading && !isError && users.length > 0 && (
        <>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-gray-200'>
                  <th className='aucctus-text-xs aucctus-text-tertiary pb-3 pr-4 text-left font-medium'>
                    Rank
                  </th>
                  <th className='aucctus-text-xs aucctus-text-tertiary pb-3 pr-4 text-left font-medium'>
                    User
                  </th>
                  <th className='aucctus-text-xs aucctus-text-tertiary pb-3 pr-4 text-left font-medium'>
                    Team
                  </th>
                  <th className='aucctus-text-xs aucctus-text-tertiary pb-3 pr-4 text-right font-medium'>
                    Score
                  </th>
                  <th className='aucctus-text-xs aucctus-text-tertiary pb-3 pr-4 text-right font-medium'>
                    AI Edits
                  </th>
                  <th className='aucctus-text-xs aucctus-text-tertiary pb-3 pr-4 text-right font-medium'>
                    AI Accept %
                  </th>
                  <th className='aucctus-text-xs aucctus-text-tertiary pb-3 pr-4 text-right font-medium'>
                    Concepts
                  </th>
                  <th className='aucctus-text-xs aucctus-text-tertiary pb-3 pr-4 text-right font-medium'>
                    Tests
                  </th>
                  <th className='aucctus-text-xs aucctus-text-tertiary pb-3 pr-4 text-right font-medium'>
                    Days Active
                  </th>
                  <th className='aucctus-text-xs aucctus-text-tertiary pb-3 text-right font-medium'>
                    Last Active
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <UserRow
                    key={user.userUuid}
                    user={user}
                    onClick={() => setSelectedUserUuid(user.userUuid)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='mt-4 flex items-center justify-between'>
              <p className='aucctus-text-xs aucctus-text-tertiary'>
                Showing {(page - 1) * pageSize + 1} to{' '}
                {Math.min(page * pageSize, totalCount)} of {totalCount} users
              </p>
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className={cn(
                    'btn btn-secondary btn-sm',
                    page === 1 && 'cursor-not-allowed opacity-50',
                  )}
                >
                  Previous
                </button>
                <span className='aucctus-text-sm aucctus-text-secondary px-2'>
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className={cn(
                    'btn btn-secondary btn-sm',
                    page === totalPages && 'cursor-not-allowed opacity-50',
                  )}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!isLoading && !isError && users.length === 0 && (
        <div className='flex flex-col items-center justify-center py-12'>
          <Users className='aucctus-stroke-tertiary mb-3 h-12 w-12 opacity-50' />
          <p className='aucctus-text-sm aucctus-text-tertiary'>
            No user activity data available for this time period.
          </p>
        </div>
      )}

      {/* User Detail Drawer */}
      <UserDetailDrawer
        userUuid={selectedUserUuid}
        timeRange={timeRange}
        isOpen={selectedUserUuid !== null}
        onClose={() => setSelectedUserUuid(null)}
      />
    </div>
  );
};

export default UserMetricsPanel;
