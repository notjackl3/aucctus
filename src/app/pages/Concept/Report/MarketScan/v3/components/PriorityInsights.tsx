import React from 'react';
import { Icon, Badge, Loading } from '@components';
import { cn } from '@libs/utils/react';
import type { IPriorityInsightV3 } from '@libs/api/types/concept/marketScan';
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
    title?: string;
    url?: string;
  }>;
}

const PriorityInsights: React.FC<PriorityInsightsProps> = ({
  conceptUuid,
  insights,
}) => {
  const { isLoading, error } = useMarketScanPriorityInsightsV3(conceptUuid);

  // Helper function to determine direction based on priority level
  const getDirection = (insight: ExtendedPriorityInsight): 'up' | 'down' => {
    // Use the direction property from the data if available
    return insight.direction === 'up' || insight.direction === 'tailwind'
      ? 'up'
      : 'down';
  };

  // Helper function to get sources from insight
  const getSources = (insight: ExtendedPriorityInsight) => {
    // Return actual sources if available
    if (insight.sources && insight.sources.length > 0) {
      return insight.sources.map((source) => ({
        name: source.title || source.url || 'Unknown',
        count: 1,
      }));
    }

    // Fallback to category if no sources
    return [
      {
        name: insight.insightCategory || insight.category || 'Unknown',
        count: insight.sourcesCount || 1,
      },
    ];
  };

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
        {insights.map((insightData, index) => {
          // Cast to extended type
          const insight = insightData as ExtendedPriorityInsight;
          const direction = getDirection(insight);
          const sources = getSources(insight);

          return (
            <div
              key={insight.uuid || index}
              className='aucctus-bg-primary aucctus-border-secondary group overflow-hidden rounded-xl border shadow-sm transition-all duration-300 hover:-translate-y-1'
            >
              <div
                className={cn({
                  'h-1': true,
                  'bg-gradient-to-r from-green-400 to-emerald-500':
                    direction === 'up',
                  'bg-gradient-to-r from-red-400 to-rose-500':
                    direction === 'down',
                })}
              />

              <div className='p-6'>
                <div className='mb-4 flex items-start justify-between'>
                  <h3 className='aucctus-text-md-semibold aucctus-text-primary pr-4 leading-tight'>
                    {insight.title}
                  </h3>
                  <div
                    className={cn({
                      'rounded-full border p-2': true,
                      'aucctus-bg-success-secondary aucctus-border-success':
                        direction === 'up',
                      'aucctus-bg-error-secondary aucctus-border-error':
                        direction === 'down',
                    })}
                  >
                    <Icon
                      variant={direction === 'up' ? 'arrowup' : 'arrowdown'}
                      className={cn({
                        'h-4 w-4': true,
                        'aucctus-stroke-success-primary': direction === 'up',
                        'aucctus-stroke-error-primary': direction === 'down',
                      })}
                    />
                  </div>
                </div>

                <div className='mb-4'>
                  <p className='aucctus-text-xs-semibold aucctus-text-brand-tertiary mb-2 tracking-wide'>
                    WHY IT MATTERS?
                  </p>
                  <p className='aucctus-text-sm aucctus-text-secondary leading-relaxed'>
                    {insight.explanation || insight.description}
                  </p>
                </div>

                <div className='flex flex-wrap items-center gap-2'>
                  {sources.map((source, sourceIndex) => (
                    <div key={sourceIndex} className='flex items-center'>
                      <div className='aucctus-bg-tertiary aucctus-text-primary aucctus-border-secondary aucctus-text-xs-semibold flex items-center gap-2 rounded-full border px-3 py-1.5'>
                        <div className='aucctus-bg-primary-solid flex h-4 w-4 items-center justify-center rounded-sm'>
                          <span className='aucctus-text-white aucctus-text-xs-bold'>
                            {(source.name && source.name.charAt(0)) || '?'}
                          </span>
                        </div>
                        <span className='aucctus-text-xs-semibold'>
                          {source.name || 'Unknown'}
                        </span>
                        {source.count > 1 && (
                          <Badge.Default
                            value={`+${source.count - 1}`}
                            classNameBadge='aucctus-bg-secondary'
                            classNameLabel='aucctus-text-tertiary aucctus-text-xs'
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PriorityInsights;
