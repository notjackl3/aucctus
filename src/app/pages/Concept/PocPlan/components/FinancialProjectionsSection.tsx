import { FunctionComponent, useMemo } from 'react';
import { Icon } from '@components';
import { IPocPlan } from '@libs/api/types';
import { cn } from '@libs/utils/react';

interface IFinancialProjectionsSectionProps {
  pocPlan: IPocPlan;
}

// Calculate cost breakdown
const calculateCosts = (pocPlan: IPocPlan) => {
  const totalInvestment = pocPlan.resources.reduce(
    (sum, r) => sum + (r.estimatedCost || 0),
    0,
  );

  const personnelCosts = pocPlan.resources
    .filter((r) => r.category === 'personnel')
    .reduce((sum, r) => sum + (r.estimatedCost || 0), 0);
  const techCosts = pocPlan.resources
    .filter((r) => r.category === 'technology')
    .reduce((sum, r) => sum + (r.estimatedCost || 0), 0);
  const externalCosts = pocPlan.resources
    .filter((r) => r.category === 'external')
    .reduce((sum, r) => sum + (r.estimatedCost || 0), 0);
  const budgetCosts = pocPlan.resources
    .filter((r) => r.category === 'budget')
    .reduce((sum, r) => sum + (r.estimatedCost || 0), 0);

  return {
    totalInvestment,
    personnelCosts,
    techCosts,
    externalCosts,
    budgetCosts,
    weeklyBurn: totalInvestment / pocPlan.totalWeeks,
  };
};

const formatCurrency = (amount: number): string => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toFixed(0)}`;
};

const formatFullCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const FinancialProjectionsSection: FunctionComponent<
  IFinancialProjectionsSectionProps
> = ({ pocPlan }) => {
  const costs = useMemo(() => calculateCosts(pocPlan), [pocPlan]);

  const costBreakdown = [
    {
      label: 'Personnel',
      value: costs.personnelCosts,
      color: 'bg-blue-500',
    },
    {
      label: 'Technology',
      value: costs.techCosts,
      color: 'bg-purple-500',
    },
    {
      label: 'External',
      value: costs.externalCosts,
      color: 'bg-orange-500',
    },
    { label: 'Other', value: costs.budgetCosts, color: 'bg-emerald-500' },
  ].filter((item) => item.value > 0);

  return (
    <div
      className={cn(
        'flex flex-col gap-6 rounded-xl p-6',
        'aucctus-bg-primary',
        'aucctus-border-primary border',
        'shadow-sm',
      )}
    >
      {/* Section Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg',
              'bg-gradient-to-br from-emerald-500 to-emerald-600',
            )}
          >
            <Icon variant='currency-dollar' className='h-5 w-5 stroke-white' />
          </div>
          <div className='flex flex-col'>
            <h2 className='aucctus-text-primary aucctus-header-md-semibold'>
              Cost to Test
            </h2>
            <span className='aucctus-text-tertiary aucctus-text-sm'>
              POC investment breakdown
            </span>
          </div>
        </div>

        {/* Total Investment Badge */}
        <div
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2',
            'bg-gradient-to-r from-emerald-500 to-emerald-600',
            'shadow-md',
          )}
        >
          <span className='text-sm font-medium text-white/80'>Total</span>
          <span className='text-lg font-bold text-white'>
            {formatCurrency(costs.totalInvestment)}
          </span>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className='flex flex-col gap-3'>
        <span className='aucctus-text-tertiary aucctus-text-xs-semibold uppercase tracking-wider'>
          Cost Breakdown
        </span>

        {/* Stacked Bar */}
        <div className='aucctus-bg-secondary flex h-4 overflow-hidden rounded-full'>
          {costBreakdown.map((item) => {
            const percentage = (item.value / costs.totalInvestment) * 100;
            return (
              <div
                key={item.label}
                className={cn(item.color, 'transition-all duration-500')}
                style={{ width: `${percentage}%` }}
                title={`${item.label}: ${formatCurrency(item.value)} (${percentage.toFixed(1)}%)`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className='flex flex-wrap gap-4'>
          {costBreakdown.map((item) => {
            const percentage = (item.value / costs.totalInvestment) * 100;
            return (
              <div key={item.label} className='flex items-center gap-2'>
                <div className={cn('h-3 w-3 rounded', item.color)} />
                <span className='aucctus-text-secondary aucctus-text-sm'>
                  {item.label}
                </span>
                <span className='aucctus-text-primary aucctus-text-sm-semibold'>
                  {formatCurrency(item.value)}
                </span>
                <span className='aucctus-text-tertiary aucctus-text-xs'>
                  ({percentage.toFixed(0)}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Burn Rate */}
      <div
        className={cn(
          'flex items-center justify-between rounded-lg p-4',
          'aucctus-bg-secondary',
        )}
      >
        <div className='flex items-center gap-3'>
          <Icon variant='clock' className='aucctus-stroke-tertiary h-5 w-5' />
          <div className='flex flex-col'>
            <span className='aucctus-text-secondary aucctus-text-sm'>
              Weekly Burn Rate
            </span>
            <span className='aucctus-text-tertiary aucctus-text-xs'>
              Average weekly spend over {pocPlan.totalWeeks} weeks
            </span>
          </div>
        </div>
        <span className='aucctus-text-primary aucctus-header-sm-semibold'>
          {formatCurrency(costs.weeklyBurn)}/week
        </span>
      </div>

      {/* Full Amount */}
      <p className='aucctus-text-tertiary aucctus-text-xs'>
        Total investment: {formatFullCurrency(costs.totalInvestment)}
      </p>
    </div>
  );
};

export default FinancialProjectionsSection;
