import { FunctionComponent } from 'react';
import { Icon } from '@components';
import { IPocPlan } from '@libs/api/types';
import { cn } from '@libs/utils/react';

interface IExecutiveBriefProps {
  pocPlan: IPocPlan;
  onExportPDF?: () => void;
}

const formatCurrency = (amount: number): string => {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
};

const ExecutiveBrief: FunctionComponent<IExecutiveBriefProps> = ({
  pocPlan,
}) => {
  const totalInvestment =
    pocPlan.resources?.reduce((sum, r) => sum + (r.estimatedCost || 0), 0) ?? 0;
  const criticalMetrics =
    pocPlan.successMetrics?.filter((m) => m.isGoNoGoCriteria) ?? [];
  const criticalRisks =
    pocPlan.risks?.filter(
      (r) => r.severity === 'critical' || r.severity === 'high',
    ) ?? [];

  return (
    <div className='flex flex-col gap-6'>
      {/* Key Stats - Cost to Test Focus */}
      <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
        <div
          className={cn(
            'flex flex-col gap-1 rounded-lg p-4',
            'bg-gradient-to-br from-primary-500/10 to-primary-600/5',
            'border border-primary-200 dark:border-primary-800',
          )}
        >
          <span className='aucctus-text-tertiary text-[10px] uppercase tracking-wider'>
            Cost to Test
          </span>
          <span className='aucctus-text-primary aucctus-header-lg-semibold'>
            {formatCurrency(totalInvestment)}
          </span>
        </div>
        <div className='aucctus-bg-secondary flex flex-col gap-1 rounded-lg p-4'>
          <span className='aucctus-text-tertiary text-[10px] uppercase tracking-wider'>
            Duration
          </span>
          <span className='aucctus-text-primary aucctus-header-lg-semibold'>
            {pocPlan.totalWeeks ?? 0} Weeks
          </span>
        </div>
        <div className='aucctus-bg-secondary flex flex-col gap-1 rounded-lg p-4'>
          <span className='aucctus-text-tertiary text-[10px] uppercase tracking-wider'>
            Go/No-Go Metrics
          </span>
          <span className='aucctus-text-primary aucctus-header-lg-semibold'>
            {criticalMetrics.length}
          </span>
        </div>
        <div className='aucctus-bg-secondary flex flex-col gap-1 rounded-lg p-4'>
          <span className='aucctus-text-tertiary text-[10px] uppercase tracking-wider'>
            Key Risks
          </span>
          <span
            className={cn(
              'aucctus-header-lg-semibold',
              criticalRisks.length > 0 ? 'text-error-600' : 'text-success-600',
            )}
          >
            {criticalRisks.length}
          </span>
        </div>
      </div>

      {/* Strategic Rationale - The "Why" */}
      <div
        className={cn(
          'flex flex-col gap-3 rounded-lg p-5',
          'bg-gradient-to-br from-primary-500/5 to-primary-600/5',
          'border border-primary-200 dark:border-primary-800',
        )}
      >
        <div className='flex items-center gap-2'>
          <Icon variant='lightbulb' className='h-5 w-5 stroke-primary-500' />
          <span className='aucctus-text-primary aucctus-text-md-semibold'>
            Strategic Rationale
          </span>
        </div>
        <p className='aucctus-text-secondary aucctus-text-sm leading-relaxed'>
          {pocPlan.executiveSummary?.strategicRationale ?? ''}
        </p>
      </div>

      {/* Two Column Layout */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Go/No-Go Decision Criteria */}
        <div className='aucctus-bg-secondary flex flex-col gap-3 rounded-lg p-5'>
          <div className='flex items-center justify-between'>
            <span className='aucctus-text-primary aucctus-text-md-semibold'>
              Decision Criteria
            </span>
            <span className='aucctus-text-tertiary aucctus-text-xs'>
              {criticalMetrics.length} metrics
            </span>
          </div>
          <div className='flex flex-col gap-2'>
            {criticalMetrics.map((metric) => (
              <div
                key={metric.uuid}
                className='aucctus-bg-primary flex items-center justify-between rounded-lg p-3'
              >
                <div className='flex items-center gap-2'>
                  <div className='h-2 w-2 rounded-full bg-primary-500' />
                  <span className='aucctus-text-primary aucctus-text-sm'>
                    {metric.name}
                  </span>
                </div>
                <span className='aucctus-text-secondary aucctus-text-xs font-medium'>
                  Target: {metric.targetValue}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Risks */}
        <div
          className={cn(
            'flex flex-col gap-3 rounded-lg p-5',
            criticalRisks.length > 0
              ? 'border border-error-200 bg-error-50 dark:border-error-800 dark:bg-error-950'
              : 'aucctus-bg-secondary',
          )}
        >
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Icon
                variant='alert-triangle'
                className={cn(
                  'h-5 w-5',
                  criticalRisks.length > 0
                    ? 'stroke-error-500'
                    : 'aucctus-stroke-tertiary',
                )}
              />
              <span
                className={cn(
                  'aucctus-text-md-semibold',
                  criticalRisks.length > 0
                    ? 'text-error-700 dark:text-error-300'
                    : 'aucctus-text-primary',
                )}
              >
                Key Risks
              </span>
            </div>
            <span
              className={cn(
                'aucctus-text-xs',
                criticalRisks.length > 0
                  ? 'text-error-600 dark:text-error-400'
                  : 'aucctus-text-tertiary',
              )}
            >
              {criticalRisks.length} identified
            </span>
          </div>
          {criticalRisks.length > 0 ? (
            <div className='flex flex-col gap-2'>
              {criticalRisks.slice(0, 4).map((risk) => (
                <div key={risk.uuid} className='flex items-start gap-2'>
                  <div
                    className={cn(
                      'mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full',
                      risk.severity === 'critical'
                        ? 'bg-error-500'
                        : 'bg-orange-500',
                    )}
                  />
                  <span className='aucctus-text-sm text-error-700 dark:text-error-300'>
                    {risk.title}
                  </span>
                </div>
              ))}
              {criticalRisks.length > 4 && (
                <span className='aucctus-text-xs ml-3.5 text-error-600 dark:text-error-400'>
                  +{criticalRisks.length - 4} more risks
                </span>
              )}
            </div>
          ) : (
            <p className='aucctus-text-secondary aucctus-text-sm'>
              No critical or high-severity risks identified.
            </p>
          )}
        </div>
      </div>

      {/* Key Decision Factors */}
      <div className='aucctus-bg-secondary flex flex-col gap-2 rounded-lg p-5'>
        <span className='aucctus-text-tertiary aucctus-text-xs-semibold uppercase tracking-wider'>
          Key Decision Factors
        </span>
        <p className='aucctus-text-primary aucctus-text-sm leading-relaxed'>
          {pocPlan.executiveSummary?.decisionCriteria ?? ''}
        </p>
      </div>
    </div>
  );
};

export default ExecutiveBrief;
