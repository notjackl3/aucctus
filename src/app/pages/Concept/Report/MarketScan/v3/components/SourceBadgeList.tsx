import React from 'react';
import { Badge, ComponentTooltip } from '@components';
import { cn } from '@libs/utils/react';
import MultiSourceBadge from '../../components/sources/MultiSourceBadge';
import type { ISource } from '@libs/api/types';

interface SourceBadgeListProps {
  sources: ISource[];
  maxVisibleSources?: number; // Number of sources to show before using MultiSourceBadge
  createSourceDescription: (source: ISource) => React.ReactNode;
}

const SourceBadgeList: React.FC<SourceBadgeListProps> = ({
  sources,
  maxVisibleSources = 3,
  createSourceDescription,
}) => {
  if (sources.length === 0) {
    return null;
  }

  const shouldUseMultiBadge = sources.length > maxVisibleSources;
  const visibleCount = shouldUseMultiBadge
    ? maxVisibleSources - 1
    : sources.length;

  return (
    <div className='mt-1 flex flex-wrap items-center gap-2'>
      {sources.length <= maxVisibleSources ? (
        // Show all sources if <= maxVisibleSources
        sources.map((source) => (
          <Badge.SourceInfo
            key={source.uuid}
            badgeSize='small'
            badgeClassName='aucctus-text-primary whitespace-nowrap'
            source={source}
            onClick={() => window.open(source.url, '_blank')}
            showPublishedDate={false}
            sourceDescription={createSourceDescription(source)}
            hideDelay={0}
          />
        ))
      ) : (
        // Show first (maxVisibleSources - 1) sources + MultiSourceBadge for the rest
        <>
          {sources.slice(0, visibleCount).map((source) => (
            <Badge.SourceInfo
              key={source.uuid}
              badgeSize='small'
              badgeClassName='aucctus-text-primary whitespace-nowrap'
              source={source}
              onClick={() => window.open(source.url, '_blank')}
              showPublishedDate={false}
              sourceDescription={createSourceDescription(source)}
              hideDelay={0}
            />
          ))}

          {/* Remaining sources - MultiSourceBadge with tooltip */}
          <ComponentTooltip
            tip={
              <div
                className='aucctus-bg-primary aucctus-border-secondary max-w-sm overflow-y-auto overscroll-contain rounded-lg border'
                style={{
                  boxShadow:
                    '0 0 15px rgba(0, 0, 0, 0.075), 0 8px 15px rgba(0, 0, 0, 0.15)',
                }}
              >
                {sources.slice(visibleCount).map((source, index) => (
                  <div
                    key={source.uuid}
                    className={cn(
                      'flex cursor-pointer flex-col gap-2 p-3 transition-colors hover:bg-gray-50',
                      index < sources.slice(visibleCount).length - 1 &&
                        'aucctus-border-secondary border-b',
                    )}
                    onClick={() => window.open(source.url, '_blank')}
                  >
                    <div className='pointer-events-none'>
                      <Badge.SourceInfo
                        badgeSize='small'
                        badgeClassName='aucctus-text-primary whitespace-nowrap'
                        source={source}
                        showPublishedDate={false}
                      />
                    </div>
                    <div className='aucctus-text-xs-semibold aucctus-text-primary'>
                      {source.title}
                    </div>
                    {createSourceDescription(source)}
                  </div>
                ))}
              </div>
            }
            hideDelay={300}
          >
            <div className='cursor-pointer'>
              <MultiSourceBadge
                sources={sources.slice(visibleCount)}
                width={80}
              />
            </div>
          </ComponentTooltip>
        </>
      )}
    </div>
  );
};

export default SourceBadgeList;
