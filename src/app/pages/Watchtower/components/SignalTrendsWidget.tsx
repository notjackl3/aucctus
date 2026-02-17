import React, { useState, useMemo } from 'react';
import { cn } from '@libs/utils/react';
import type { TimePeriod } from '../types';
import { useWatchtowerTrends } from '@hooks/query/watchtower.hook';
import { TrendingUp } from 'lucide-react';

const periodLabels: Record<TimePeriod, string> = {
  '6mo': '6 Months',
  '12mo': '12 Months',
  '12plus': '12+ Months',
};

/**
 * SignalTrendsWidget - Time-period trend bullets
 */
const SignalTrendsWidget: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('6mo');
  const { trends } = useWatchtowerTrends();

  const bullets = useMemo(() => {
    switch (selectedPeriod) {
      case '6mo':
        return trends.period6mo;
      case '12mo':
        return trends.period12mo;
      case '12plus':
        return trends.period12plus;
      default:
        return [];
    }
  }, [selectedPeriod, trends]);

  return (
    <div className='aucctus-bg-primary aucctus-border-secondary h-full rounded-xl border p-6'>
      <div className='mb-4 flex items-center gap-2'>
        <TrendingUp size={20} className='aucctus-stroke-secondary' />
        <h3 className='aucctus-text-primary aucctus-text-lg-semibold'>
          Trends Over Time
        </h3>
      </div>
      <div className='mb-4 flex flex-wrap gap-1.5'>
        {(Object.keys(periodLabels) as TimePeriod[]).map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
              selectedPeriod === period
                ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900'
                : 'aucctus-bg-secondary aucctus-border-secondary aucctus-text-secondary hover:aucctus-bg-secondary-hover',
            )}
          >
            {periodLabels[period]}
          </button>
        ))}
      </div>
      <div className='aucctus-bg-secondary aucctus-border-secondary rounded-lg border p-4'>
        <ul className='space-y-2.5'>
          {bullets.map((bullet, idx) => (
            <li key={idx} className='flex items-start gap-2 text-sm'>
              <span className='aucctus-text-secondary mt-0.5'>•</span>
              <span className='aucctus-text-secondary leading-relaxed'>
                <span className='aucctus-text-primary font-semibold'>
                  {bullet.highlight}
                </span>{' '}
                {bullet.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default React.memo(SignalTrendsWidget);
