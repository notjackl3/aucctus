import { FunctionComponent, useMemo } from 'react';
import { Icon } from '@components';
import { IPocPlan } from '@libs/api/types';
import { cn } from '@libs/utils/react';

interface IPocAtAGlanceProps {
  pocPlan: IPocPlan;
}

interface IMetricCardProps {
  icon: IconVariant;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
}

// Health score calculation
const calculateHealthScore = (pocPlan: IPocPlan): number => {
  let score = 100;

  // Risk penalty (30 points max)
  const criticalRisks = pocPlan.risks.filter(
    (r) => r.severity === 'critical',
  ).length;
  const highRisks = pocPlan.risks.filter((r) => r.severity === 'high').length;
  score -= criticalRisks * 15;
  score -= highRisks * 8;

  // Milestone progress (30 points max) - for now use status distribution
  const completedMilestones = pocPlan.milestones.filter(
    (m) => m.status === 'completed',
  ).length;
  const blockedMilestones = pocPlan.milestones.filter(
    (m) => m.status === 'blocked',
  ).length;
  if (pocPlan.milestones.length > 0) {
    const completionBonus =
      (completedMilestones / pocPlan.milestones.length) * 30;
    score += completionBonus - 30; // Start at 0, add based on completion
  }
  score -= blockedMilestones * 10;

  // Resource coverage (20 points max)
  const resourcesWithCost = pocPlan.resources.filter(
    (r) => r.estimatedCost && r.estimatedCost > 0,
  ).length;
  if (pocPlan.resources.length > 0) {
    const resourceCoverage =
      (resourcesWithCost / pocPlan.resources.length) * 20;
    score = score - 10 + resourceCoverage;
  }

  // Metrics defined (20 points max)
  const goNoGoMetrics = pocPlan.successMetrics.filter(
    (m) => m.isGoNoGoCriteria,
  ).length;
  if (goNoGoMetrics >= 3) score += 10;
  else if (goNoGoMetrics >= 2) score += 5;

  return Math.max(0, Math.min(100, Math.round(score)));
};

const getHealthScoreConfig = (
  score: number,
): { label: string; color: string; bgColor: string } => {
  if (score >= 80)
    return {
      label: 'Excellent',
      color: 'text-success-600',
      bgColor: 'bg-success-500',
    };
  if (score >= 60)
    return {
      label: 'On Track',
      color: 'text-success-600',
      bgColor: 'bg-success-500',
    };
  if (score >= 40)
    return {
      label: 'At Risk',
      color: 'text-warning-600',
      bgColor: 'bg-warning-500',
    };
  return {
    label: 'Critical',
    color: 'text-error-600',
    bgColor: 'bg-error-500',
  };
};

const MetricCard: FunctionComponent<IMetricCardProps> = ({
  icon,
  label,
  value,
  subtext,
  color,
}) => (
  <div
    className={cn(
      'flex items-center gap-4 rounded-lg p-4',
      'aucctus-bg-secondary',
    )}
  >
    <div
      className={cn(
        'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg',
        'bg-gradient-to-br',
        color,
      )}
    >
      <Icon variant={icon} className='h-6 w-6 stroke-white' />
    </div>
    <div className='flex flex-col'>
      <span className='aucctus-text-tertiary aucctus-text-xs uppercase tracking-wider'>
        {label}
      </span>
      <span className='aucctus-text-primary aucctus-header-md-semibold'>
        {value}
      </span>
      {subtext && (
        <span className='aucctus-text-secondary aucctus-text-xs'>
          {subtext}
        </span>
      )}
    </div>
  </div>
);

const PocAtAGlance: FunctionComponent<IPocAtAGlanceProps> = ({ pocPlan }) => {
  // Calculate key metrics
  const totalBudget = pocPlan.resources.reduce(
    (sum, r) => sum + (r.estimatedCost || 0),
    0,
  );
  const criticalRisks = pocPlan.risks.filter(
    (r) => r.severity === 'critical' || r.severity === 'high',
  ).length;
  const goNoGoMetrics = pocPlan.successMetrics.filter(
    (m) => m.isGoNoGoCriteria,
  ).length;

  // Calculate health score
  const healthScore = useMemo(() => calculateHealthScore(pocPlan), [pocPlan]);
  const healthConfig = getHealthScoreConfig(healthScore);

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-xl p-6',
        'bg-gradient-to-br from-primary-50 via-white to-primary-50',
        'dark:from-primary-950 dark:via-gray-900 dark:to-primary-950',
        'aucctus-border-secondary border',
        'shadow-sm',
      )}
    >
      {/* Header with Health Score */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Icon
            variant='presentation-chart'
            className='aucctus-stroke-brand-primary h-5 w-5'
          />
          <h3 className='aucctus-text-primary aucctus-text-md-semibold'>
            At A Glance
          </h3>
        </div>
        {/* Health Score Badge */}
        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2'>
            <div className='relative h-10 w-10'>
              <svg className='h-10 w-10 -rotate-90'>
                <circle
                  cx='20'
                  cy='20'
                  r='16'
                  fill='none'
                  strokeWidth='3'
                  className='stroke-gray-200 dark:stroke-gray-700'
                />
                <circle
                  cx='20'
                  cy='20'
                  r='16'
                  fill='none'
                  strokeWidth='3'
                  strokeLinecap='round'
                  className={healthConfig.bgColor.replace('bg-', 'stroke-')}
                  strokeDasharray={`${healthScore * 1.005} 100.5`}
                />
              </svg>
              <span className='aucctus-text-primary absolute inset-0 flex items-center justify-center text-xs font-bold'>
                {healthScore}
              </span>
            </div>
            <div className='flex flex-col'>
              <span className='aucctus-text-tertiary text-[10px] uppercase tracking-wider'>
                Health
              </span>
              <span className={cn('text-xs font-semibold', healthConfig.color)}>
                {healthConfig.label}
              </span>
            </div>
          </div>
          <div className='aucctus-bg-secondary h-8 w-px' />
          <span className='aucctus-text-tertiary aucctus-text-xs'>
            {pocPlan.totalWeeks}-week POC
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
        <MetricCard
          icon='calendar'
          label='Duration'
          value={`${pocPlan.totalWeeks} Weeks`}
          subtext={`${pocPlan.milestones.length} milestones`}
          color='from-blue-500 to-blue-600'
        />
        <MetricCard
          icon='currency-dollar'
          label='Investment'
          value={formatCurrency(totalBudget)}
          subtext={`${pocPlan.resources.length} resources`}
          color='from-emerald-500 to-emerald-600'
        />
        <MetricCard
          icon='target'
          label='Objectives'
          value={pocPlan.objectives.length}
          subtext={`${goNoGoMetrics} go/no-go metrics`}
          color='from-purple-500 to-purple-600'
        />
        <MetricCard
          icon='alert-triangle'
          label='Key Risks'
          value={criticalRisks}
          subtext={`${pocPlan.risks.length} total identified`}
          color={
            criticalRisks > 0
              ? 'from-orange-500 to-orange-600'
              : 'from-success-500 to-success-600'
          }
        />
      </div>

      {/* Quick Summary */}
      <div className='aucctus-bg-primary rounded-lg p-4'>
        <p className='aucctus-text-secondary aucctus-text-sm line-clamp-2 leading-relaxed'>
          {pocPlan.executiveSummary.overview}
        </p>
      </div>
    </div>
  );
};

export default PocAtAGlance;
