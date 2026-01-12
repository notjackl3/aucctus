import { FunctionComponent } from 'react';
import { Icon } from '@components';
import { IPocSuccessMetric } from '@libs/api/types';
import { cn } from '@libs/utils/react';

interface ISuccessMetricsSectionProps {
  metrics: IPocSuccessMetric[];
}

const FREQUENCY_CONFIG: Record<
  IPocSuccessMetric['frequency'],
  { label: string; color: string }
> = {
  daily: { label: 'Daily', color: 'text-blue-500' },
  weekly: { label: 'Weekly', color: 'text-purple-500' },
  biweekly: { label: 'Bi-weekly', color: 'text-indigo-500' },
  monthly: { label: 'Monthly', color: 'text-cyan-500' },
  milestone: { label: 'At Milestones', color: 'text-orange-500' },
  end_of_poc: { label: 'End of POC', color: 'text-emerald-500' },
};

interface IMetricRowProps {
  metric: IPocSuccessMetric;
  index: number;
  isGoNoGo?: boolean;
}

const MetricRow: FunctionComponent<IMetricRowProps> = ({
  metric,
  index,
  isGoNoGo,
}) => {
  const frequencyConfig = FREQUENCY_CONFIG[metric.frequency];

  return (
    <tr className='hover:aucctus-bg-secondary group transition-colors'>
      {/* Number */}
      <td className='w-12 py-3 pl-4'>
        <div
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold',
            isGoNoGo
              ? 'bg-primary-500 text-white'
              : 'aucctus-bg-tertiary aucctus-text-secondary',
          )}
        >
          {String(index + 1).padStart(2, '0')}
        </div>
      </td>

      {/* Metric Name & Description */}
      <td className='py-3'>
        <div className='flex flex-col gap-0.5'>
          <div className='flex items-center gap-2'>
            <span className='aucctus-text-primary aucctus-text-sm-semibold'>
              {metric.name}
            </span>
            {isGoNoGo && (
              <span className='rounded bg-primary-100 px-1.5 py-0.5 text-[10px] font-medium text-primary-700 dark:bg-primary-900 dark:text-primary-300'>
                Go/No-Go
              </span>
            )}
          </div>
          <span className='aucctus-text-tertiary aucctus-text-xs line-clamp-1'>
            {metric.description}
          </span>
        </div>
      </td>

      {/* Target */}
      <td className='w-32 py-3 text-center'>
        <span className='aucctus-text-primary aucctus-text-sm-semibold'>
          {metric.targetValue}
          {metric.unit && (
            <span className='aucctus-text-tertiary ml-0.5 text-xs'>
              {metric.unit}
            </span>
          )}
        </span>
      </td>

      {/* Frequency */}
      <td className='w-28 py-3 pr-4 text-right'>
        <span className={cn('text-xs font-medium', frequencyConfig.color)}>
          {frequencyConfig.label}
        </span>
      </td>
    </tr>
  );
};

const SuccessMetricsSection: FunctionComponent<ISuccessMetricsSectionProps> = ({
  metrics,
}) => {
  const goNoGoMetrics = metrics.filter((m) => m.isGoNoGoCriteria);
  const otherMetrics = metrics.filter((m) => !m.isGoNoGoCriteria);

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-xl',
        'aucctus-bg-primary',
        'aucctus-border-primary border',
        'shadow-sm',
        'overflow-hidden',
      )}
    >
      {/* Header */}
      <div className='flex items-center justify-between px-6 pt-6'>
        <div className='flex items-center gap-3'>
          <div
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg',
              'bg-gradient-to-br from-purple-500 to-purple-600',
            )}
          >
            <Icon variant='barchart' className='h-4 w-4 stroke-white' />
          </div>
          <div className='flex flex-col'>
            <h2 className='aucctus-text-primary aucctus-header-sm-semibold'>
              Success Metrics
            </h2>
            <span className='aucctus-text-tertiary aucctus-text-xs'>
              {metrics.length} metrics defined • {goNoGoMetrics.length} critical
            </span>
          </div>
        </div>
      </div>

      {/* Decision Criteria Table */}
      {goNoGoMetrics.length > 0 && (
        <div className='flex flex-col'>
          <div className='flex items-center gap-2 px-6 pb-2'>
            <Icon variant='target' className='h-3.5 w-3.5 stroke-primary-500' />
            <span className='text-[10px] font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400'>
              Decision Criteria
            </span>
            <span className='aucctus-text-tertiary text-[10px]'>
              ({goNoGoMetrics.length})
            </span>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='aucctus-border-secondary border-y bg-primary-50/50 dark:bg-primary-950/30'>
                  <th className='py-2 pl-4 text-left'>
                    <span className='aucctus-text-tertiary text-[10px] font-semibold uppercase tracking-wider'>
                      #
                    </span>
                  </th>
                  <th className='py-2 text-left'>
                    <span className='aucctus-text-tertiary text-[10px] font-semibold uppercase tracking-wider'>
                      Metric
                    </span>
                  </th>
                  <th className='py-2 text-center'>
                    <span className='aucctus-text-tertiary text-[10px] font-semibold uppercase tracking-wider'>
                      Target
                    </span>
                  </th>
                  <th className='py-2 pr-4 text-right'>
                    <span className='aucctus-text-tertiary text-[10px] font-semibold uppercase tracking-wider'>
                      Frequency
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className='aucctus-border-secondary divide-y'>
                {goNoGoMetrics.map((metric, index) => (
                  <MetricRow
                    key={metric.uuid}
                    metric={metric}
                    index={index}
                    isGoNoGo
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Supporting Metrics Table */}
      {otherMetrics.length > 0 && (
        <div className='flex flex-col pb-4'>
          <div className='flex items-center gap-2 px-6 pb-2 pt-2'>
            <Icon
              variant='barchart'
              className='aucctus-stroke-tertiary h-3.5 w-3.5'
            />
            <span className='aucctus-text-tertiary text-[10px] font-semibold uppercase tracking-wider'>
              Supporting Metrics
            </span>
            <span className='aucctus-text-tertiary text-[10px]'>
              ({otherMetrics.length})
            </span>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='aucctus-border-secondary border-y'>
                  <th className='py-2 pl-4 text-left'>
                    <span className='aucctus-text-tertiary text-[10px] font-semibold uppercase tracking-wider'>
                      #
                    </span>
                  </th>
                  <th className='py-2 text-left'>
                    <span className='aucctus-text-tertiary text-[10px] font-semibold uppercase tracking-wider'>
                      Metric
                    </span>
                  </th>
                  <th className='py-2 text-center'>
                    <span className='aucctus-text-tertiary text-[10px] font-semibold uppercase tracking-wider'>
                      Target
                    </span>
                  </th>
                  <th className='py-2 pr-4 text-right'>
                    <span className='aucctus-text-tertiary text-[10px] font-semibold uppercase tracking-wider'>
                      Frequency
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className='aucctus-border-secondary divide-y'>
                {otherMetrics.map((metric, index) => (
                  <MetricRow
                    key={metric.uuid}
                    metric={metric}
                    index={goNoGoMetrics.length + index}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuccessMetricsSection;
