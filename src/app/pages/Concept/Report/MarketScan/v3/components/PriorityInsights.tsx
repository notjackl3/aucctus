import React from 'react';
import { Icon, Loading } from '@components';
import type { IPriorityInsightV3 } from '@libs/api/types/concept/marketScan';
import PriorityInsightCard from './PriorityInsightCard';
import { useMarketScanPriorityInsightsV3 } from '@hooks/query/concepts.hook';

interface PriorityInsightsProps {
  conceptUuid: string;
  insights: IPriorityInsightV3[];
}

// Extend the IPriorityInsightV3 interface with the fields we're using from the API
interface ExtendedPriorityInsight extends IPriorityInsightV3 {
  explanation?: string;
  direction?: string;
  insightCategory?: string;
  sourcesCount?: number;
  sources?: Array<{
    uuid?: string;
    title?: string;
    url?: string;
    summary?: string;
    classification?: string;
    citations?: string[];
  }>;
}

const PriorityInsights: React.FC<PriorityInsightsProps> = ({
  conceptUuid,
  insights,
}) => {
  const { isLoading, error } = useMarketScanPriorityInsightsV3(conceptUuid);

  // No longer needed in parent (handled in child component)

  if (isLoading) {
    return (
      <div className='flex flex-col gap-6'>
        {/* Section Header */}
        <div className='mt-4'>
          <div className='mb-2 flex items-center gap-2'>
            <Icon
              variant='trendup'
              className='aucctus-stroke-brand-primary h-5 w-5'
            />
            <h2 className='aucctus-text-xl-semibold aucctus-text-primary'>
              Priority Insights
            </h2>
          </div>
          <p className='aucctus-text-sm aucctus-text-secondary'>
            These are the strongest forces impacting your concept
          </p>
        </div>

        {/* Loading State */}
        <div className='flex h-64 items-center justify-center'>
          <Loading />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col gap-6'>
        {/* Section Header */}
        <div className='mt-4'>
          <div className='mb-2 flex items-center gap-2'>
            <Icon
              variant='trendup'
              className='aucctus-stroke-brand-primary h-5 w-5'
            />
            <h2 className='aucctus-text-xl-semibold aucctus-text-primary'>
              Priority Insights
            </h2>
          </div>
          <p className='aucctus-text-sm aucctus-text-secondary'>
            These are the strongest forces impacting your concept
          </p>
        </div>

        {/* Error State */}
        <div className='flex h-64 items-center justify-center'>
          <p className='aucctus-text-error-primary'>
            Error loading priority insights data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* Section Header */}
      <div className='mt-4'>
        <div className='mb-2 flex items-center gap-2'>
          <Icon
            variant='trendup'
            className='aucctus-stroke-brand-primary h-5 w-5'
          />
          <h2 className='aucctus-text-xl-semibold aucctus-text-primary'>
            Priority Insights
          </h2>
        </div>
        <p className='aucctus-text-sm aucctus-text-secondary'>
          These are the strongest forces impacting your concept
        </p>
      </div>

      {/* Cards Grid */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        {insights.map((insightData, index) => (
          <PriorityInsightCard
            key={insightData.uuid || index}
            insight={insightData as ExtendedPriorityInsight}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default PriorityInsights;
