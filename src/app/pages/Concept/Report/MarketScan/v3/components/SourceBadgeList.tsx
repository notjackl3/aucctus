import React from 'react';
import { Badge, ComponentTooltip } from '@components';
import { useCitationResolver } from '@hooks/useCitationResolver';
import { cn } from '@libs/utils/react';
import MultiSourceBadge from '../../components/sources/MultiSourceBadge';
import type { ISource } from '@libs/api/types';

interface SourceBadgeListProps {
  sources: ISource[];
  maxVisibleSources?: number;
  createSourceDescription: (source: ISource) => React.ReactNode;
}

/**
 * Click-through wrapper for the multi-source-tooltip rows. The inner
 * Badge.SourceInfo has `pointer-events-none` so the entire row acts as a
 * single click target — the wrapper resolves the source URL and forwards
 * navigation. Behavior is intentionally identical to clicking the badge
 * itself; this wrapper exists only to enlarge the click surface.
 */
const ResolvedSourceRow: React.FC<{
  source: ISource;
  isLast: boolean;
  description: React.ReactNode;
}> = ({ source, isLast, description }) => {
  const resolved = useCitationResolver(source.url);
  const isInteractive = resolved.kind !== 'noop';
  const handleClick = (e: React.MouseEvent) => {
    if (resolved.kind === 'external') {
      window.open(resolved.href, resolved.target, 'noopener,noreferrer');
    } else if (resolved.kind === 'internal') {
      resolved.onClick(e);
    }
  };
  return (
    <div
      className={cn(
        'flex flex-col gap-2 p-3 transition-colors',
        isInteractive && 'cursor-pointer hover:bg-gray-50',
        !isLast && 'aucctus-border-secondary border-b',
      )}
      onClick={isInteractive ? handleClick : undefined}
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
      {description}
    </div>
  );
};

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
          <Badge.SourceInfo
            key={source.uuid}
            badgeSize='small'
            badgeClassName='aucctus-text-primary whitespace-nowrap'
            source={source}
            sourceDescription={createSourceDescription(source)}
            hideDelay={0}
          />
        ))
      ) : (
        <>
          {sources.slice(0, visibleCount).map((source) => (
            <Badge.SourceInfo
              key={source.uuid}
              badgeSize='small'
              badgeClassName='aucctus-text-primary whitespace-nowrap'
              source={source}
              sourceDescription={createSourceDescription(source)}
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
