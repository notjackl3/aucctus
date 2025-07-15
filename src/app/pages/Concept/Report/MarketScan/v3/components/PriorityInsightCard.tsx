import React from 'react';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import type { IPriorityInsightV3 } from '@libs/api/types/concept/marketScan';
import type { ISource } from '@libs/api/types';
import SourceBadgeList from './SourceBadgeList';

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
  }>;
}

interface PriorityInsightCardProps {
  insight: ExtendedPriorityInsight;
  index: number;
}

const PriorityInsightCard: React.FC<PriorityInsightCardProps> = ({
  insight,
  index,
}) => {
  // Determine direction based on insight data
  const direction: 'up' | 'down' =
    insight.direction === 'up' || insight.direction === 'tailwind'
      ? 'up'
      : 'down';

  // Adapt sources from API format to ISource format expected by SourceBadgeList
  const adaptedSources: ISource[] =
    insight.sources?.map((source) => ({
      uuid: source.uuid || '',
      title: source.title || source.url || 'Unknown',
      description: source.summary || '',
      url: source.url || '',
      classification: source.classification || '',
    })) || [];

  return (
    <div
      key={insight.uuid || index}
      className='aucctus-bg-primary aucctus-border-secondary group overflow-hidden rounded-xl border shadow-sm transition-all duration-300 hover:-translate-y-1'
    >
      {/* Top colored bar indicating direction */}
      <div
        className={cn({
          'h-1': true,
          'bg-gradient-to-r from-green-400 to-emerald-500': direction === 'up',
          'bg-gradient-to-r from-red-400 to-rose-500': direction === 'down',
        })}
      />

      <div className='p-6'>
        {/* Title & Direction icon */}
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

        {/* Explanation */}
        <div className='mb-4'>
          <p className='aucctus-text-xs-semibold aucctus-text-brand-tertiary mb-2 tracking-wide'>
            WHY IT MATTERS?
          </p>
          <p className='aucctus-text-sm aucctus-text-secondary leading-relaxed'>
            {insight.explanation || insight.description}
          </p>
        </div>

        {/* Source badges that wrap naturally */}
        {adaptedSources.length > 0 && (
          <SourceBadgeList
            sources={adaptedSources}
            className='mt-1'
            showPublishedDate={false}
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(PriorityInsightCard);
