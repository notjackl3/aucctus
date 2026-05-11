import React from 'react';
import { ComponentTooltip } from '@components';
import { SourceBadge, adaptISource } from '@components/SourceBadge';
import ResolvedSourceRow from '@components/SourceBadge/ResolvedSourceRow';
import MultiSourceBadge from '../../components/sources/MultiSourceBadge';
import type { ISource } from '@libs/api/types';

interface SourceBadgeListProps {
  sources: ISource[];
  maxVisibleSources?: number;
  createSourceDescription: (source: ISource) => React.ReactNode;
}

/**
 * Build a styled tooltip node for a source badge. When the caller's
 * `createSourceDescription` returns content, wrap it in the standard
 * tooltip container with the source title. When it returns null, return
 * undefined so SourceBadge falls back to its built-in tooltip.
 */
function buildTooltip(
  source: ISource,
  descriptionContent: React.ReactNode,
): React.ReactNode | undefined {
  if (!descriptionContent) return undefined;
  return (
    <div
      className='aucctus-bg-primary aucctus-border-secondary max-w-xs overflow-y-auto overscroll-contain rounded-xl border p-4 shadow-lg'
      style={{
        boxShadow:
          '0 0 15px rgba(0, 0, 0, 0.075), 0 8px 15px rgba(0, 0, 0, 0.15)',
      }}
    >
      {source.title && (
        <div className='aucctus-text-sm-semibold aucctus-text-primary mb-2 break-words'>
          {source.title}
        </div>
      )}
      {descriptionContent}
    </div>
  );
}

const SourceBadgeList: React.FC<SourceBadgeListProps> = ({
  sources,
  maxVisibleSources = 3,
  createSourceDescription,
}) => {
  if (sources.length === 0) return null;

  const shouldUseMultiBadge = sources.length > maxVisibleSources;
  const visibleCount = shouldUseMultiBadge
    ? maxVisibleSources - 1
    : sources.length;

  return (
    <div className='mt-1 flex flex-wrap items-center gap-2'>
      {sources.length <= maxVisibleSources ? (
        sources.map((source) => (
          <SourceBadge
            key={source.uuid}
            citation={adaptISource(source)}
            variant='standard'
            size='sm'
            className='aucctus-text-primary whitespace-nowrap'
            tooltip={buildTooltip(source, createSourceDescription(source))}
            hideDelay={0}
          />
        ))
      ) : (
        <>
          {sources.slice(0, visibleCount).map((source) => (
            <SourceBadge
              key={source.uuid}
              citation={adaptISource(source)}
              variant='standard'
              size='sm'
              className='aucctus-text-primary whitespace-nowrap'
              tooltip={buildTooltip(source, createSourceDescription(source))}
              hideDelay={0}
            />
          ))}
          <ComponentTooltip
            tip={
              <div
                className='aucctus-bg-primary aucctus-border-secondary max-w-sm overflow-y-auto overscroll-contain rounded-lg border'
                style={{
                  boxShadow:
                    '0 0 15px rgba(0, 0, 0, 0.075), 0 8px 15px rgba(0, 0, 0, 0.15)',
                }}
              >
                {sources.slice(visibleCount).map((source, index, arr) => (
                  <ResolvedSourceRow
                    key={source.uuid}
                    source={source}
                    isLast={index === arr.length - 1}
                    description={createSourceDescription(source)}
                  />
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
