import React, { useMemo } from 'react';
import ConceptDetailCard from '../../Cards/ConceptDetailCard';
import Icon from '../../Icons/Icon/Icon';
import { IFinancialProjection, IMarketSizeMetric } from '../../../../libs/api/types';
import MarketChart from '../../Charts/MarketChart/MarketChart';
import { Legend } from '@components';

export interface IMetricSizes {
  TAM: IMarketSizeMetric;
  SAM: IMarketSizeMetric;
  SOM: IMarketSizeMetric;
}

interface IFinancialProjectsCardProps {
  projection: IFinancialProjection | undefined;
  onViewClick: React.MouseEventHandler<HTMLButtonElement> | undefined;
}

const FinancialProjectsCard: React.FC<IFinancialProjectsCardProps> = ({ projection, onViewClick }) => {
  /**
   * Calculates and returns the market size metrics based on the overview and financial projection data.
   *
   * @returns The market size metrics object containing TAM, SAM, and SOM.
   */
  const marketSizeMetrics = useMemo(() => {
    if (!projection) {
      return undefined;
    }

    const marketSizes = projection.marketSizeMetrics.reduce((acc: Partial<IMetricSizes>, metric) => {
      acc[metric.metricType] = metric;
      return acc;
    }, {});

    if (!marketSizes.TAM || !marketSizes.SAM || !marketSizes.SOM) {
      return undefined;
    }

    return marketSizes as IMetricSizes;
  }, [projection]);

  return (
    <ConceptDetailCard
      title='Financial Projection'
      subtitle='Market size estimate based on initial hypothesis'
      headerClassName='min-h-[92px]'
      contentClassName='h-[360px]'
      cardClassName=''
      footerAction={
        <button className='btn btn-light' onClick={onViewClick} aria-label='View Financial Projection'>
          <span>{<Icon variant='line-chart-up' width={16} height={16} stroke='#626BA3' />}</span>
          View Projections
        </button>
      }
    >
      <div className='inline-flex h-full w-full flex-col items-center justify-between p-6'>
        {marketSizeMetrics ? (
          <>
            <MarketChart
              className={'h-44 w-44'}
              tam={marketSizeMetrics.TAM.value}
              sam={marketSizeMetrics.SAM.value}
              som={marketSizeMetrics.SOM.value}
            />

            <Legend.MarketLegend
              tam={marketSizeMetrics.TAM.value}
              sam={marketSizeMetrics.SAM.value}
              som={marketSizeMetrics.SOM.value}
            />
          </>
        ) : (
          'No financial projection data available'
        )}
      </div>
    </ConceptDetailCard>
  );
};

export default FinancialProjectsCard;
