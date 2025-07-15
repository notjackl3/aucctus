import React from 'react';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import SourceBadgeList from './SourceBadgeList';
import type { ISource } from '@libs/api/types';
import type { IKeyFindingSourceV3 } from '@libs/api/types/concept/marketScan';

interface KeyFindingCardProps {
  finding: {
    text: string;
    source: string;
    type: string;
    direction: 'up' | 'down';
    sources?: IKeyFindingSourceV3[];
  };
}

const KeyFindingCard: React.FC<KeyFindingCardProps> = ({ finding }) => {
  // Adapt sources from API format to ISource format
  const adaptedSources: ISource[] =
    finding.sources?.map((source) => ({
      uuid: source.uuid,
      title: source.title,
      description: source.summary,
      url: source.url,
      classification: source.classification,
    })) || [];

  return (
    <div className='aucctus-bg-primary aucctus-border-secondary h-full rounded-lg border p-4 shadow-sm transition-all duration-200 hover:shadow-md'>
      <div className='flex items-start gap-3'>
        <div
          className={cn({
            'flex-shrink-0 rounded-full border p-1.5': true,
            'aucctus-bg-success-secondary aucctus-border-success':
              finding.direction === 'up',
            'aucctus-bg-error-secondary aucctus-border-error':
              finding.direction === 'down',
          })}
        >
          <Icon
            variant={finding.direction === 'up' ? 'arrowup' : 'arrowdown'}
            className={cn({
              'h-3 w-3': true,
              'aucctus-stroke-success-primary': finding.direction === 'up',
              'aucctus-stroke-error-primary': finding.direction === 'down',
            })}
          />
        </div>
        <div className='min-w-0 flex-1'>
          <p className='aucctus-text-xs aucctus-text-secondary mb-3 leading-relaxed'>
            {finding.text}
          </p>
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
    </div>
  );
};

export default React.memo(KeyFindingCard);
