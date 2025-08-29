import { Icon } from '@components';
import React from 'react';
import { AiResearchMetric } from '../NucleusPage/types';

interface AiResearchMetricsProps {
  metrics: AiResearchMetric[];
}

interface AiResearchMetricCardProps {
  metric: AiResearchMetric;
}

const formatMetricValue = (value: number, metricName: string): string => {
  if (metricName === 'Research') {
    if (value >= 1000) {
      const formatted = value / 1000;
      return formatted % 1 === 0
        ? `${formatted}k h`
        : `${formatted.toFixed(1)}k h`;
    }
    return `${value}h`;
  }

  if (value >= 1000) {
    const formatted = value / 1000;
    return formatted % 1 === 0 ? `${formatted}k` : `${formatted.toFixed(1)}k`;
  }

  return `${value}`;
};

const getMetricColorScheme = (metricName: string) => {
  const colorSchemes = {
    Sources: {
      iconBackground: 'aucctus-bg-info-primary',
      iconStroke: 'aucctus-stroke-info-primary',
    },
    Facts: {
      iconBackground: 'aucctus-bg-data-primary',
      iconStroke: 'aucctus-stroke-data-primary',
    },
    Research: {
      iconBackground: 'aucctus-bg-research-primary',
      iconStroke: 'aucctus-stroke-research-primary',
    },
    'Data Points': {
      iconBackground: 'aucctus-bg-analytics-primary',
      iconStroke: 'aucctus-stroke-analytics-primary',
    },
  };

  return (
    colorSchemes[metricName as keyof typeof colorSchemes] || {
      iconBackground: 'aucctus-bg-brand-secondary',
      iconStroke: 'aucctus-stroke-brand-primary',
    }
  );
};

const AiResearchMetricCard: React.FC<AiResearchMetricCardProps> = ({
  metric,
}) => {
  const colorScheme = getMetricColorScheme(metric.name);

  return (
    <div className='aucctus-bg-secondary aucctus-border-primary flex flex-col items-center justify-center rounded-lg border px-4 py-5 text-center shadow-sm'>
      <div className={`${colorScheme.iconBackground} mb-3 rounded-lg p-2`}>
        <Icon
          variant={metric.icon as IconVariant}
          className={`h-6 w-6 ${colorScheme.iconStroke}`}
        />
      </div>
      <p className='aucctus-text-lg-bold aucctus-text-primary'>
        {formatMetricValue(metric.value, metric.name)}
      </p>
      <p className='aucctus-text-xs aucctus-text-secondary leading-tight'>
        {metric.name}
      </p>
    </div>
  );
};

const AiResearchMetrics: React.FC<AiResearchMetricsProps> = ({ metrics }) => {
  return (
    <div className='col-span-3 h-full'>
      <div className='grid h-full grid-cols-2 gap-3'>
        {metrics.map((metric) => (
          <AiResearchMetricCard key={metric.name} metric={metric} />
        ))}
      </div>
    </div>
  );
};

export default AiResearchMetrics;
