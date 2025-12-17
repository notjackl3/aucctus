import React, { useMemo, useState } from 'react';
import { Icon, ComponentTooltip } from '@components';
import type { ISavedResearchInsight } from '@libs/api/types';
import { getBaseUrl, getLogoUrl } from '@libs/utils/source';
import { cn } from '@libs/utils/react';
import images from '@assets/img';

interface InsightBadgeProps {
  insight: ISavedResearchInsight;
}

/**
 * InsightBadge - Displays a research insight with source info
 * Clean, modern card design with hover effects
 */
export const InsightBadge: React.FC<InsightBadgeProps> = ({ insight }) => {
  const [showDetails, setShowDetails] = useState(false);

  const sourceBaseUrl = useMemo(() => {
    if (insight.source?.url) {
      return getBaseUrl(insight.source.url);
    }
    return null;
  }, [insight.source?.url]);

  const displayTitle = useMemo(() => {
    const title = insight.source?.title || sourceBaseUrl || 'Source';
    if (title.length > 25) {
      return `${title.slice(0, 25)}...`;
    }
    return title;
  }, [insight.source?.title, sourceBaseUrl]);

  const handleSourceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (insight.source?.url) {
      window.open(insight.source.url, '_blank', 'noopener,noreferrer');
    }
  };

  const renderSourceLogo = () => {
    if (!sourceBaseUrl && !insight.source?.url) {
      return (
        <Icon
          variant='link'
          className='aucctus-stroke-tertiary'
          height={16}
          width={16}
        />
      );
    }

    return (
      <img
        className='h-full w-full object-contain'
        alt='source-logo'
        src={getLogoUrl(sourceBaseUrl || '')}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = images.link;
        }}
      />
    );
  };

  const renderTooltipContent = () => (
    <div
      className='aucctus-bg-primary aucctus-border-secondary max-w-xs overflow-y-auto overscroll-contain rounded-xl border p-4 shadow-lg'
      style={{
        boxShadow:
          '0 0 15px rgba(0, 0, 0, 0.075), 0 8px 15px rgba(0, 0, 0, 0.15)',
      }}
    >
      {/* Top row with circular icon */}
      <div className='mb-3 flex items-start'>
        <div className='aucctus-bg-secondary rounded-full border border-transparent p-1'>
          <div className='flex h-6 w-6 items-center justify-center overflow-hidden rounded-full'>
            {renderSourceLogo()}
          </div>
        </div>
      </div>

      <div className='aucctus-text-sm-semibold aucctus-text-primary mb-2'>
        {insight.source?.title || displayTitle}
      </div>
      <div className='aucctus-text-xs aucctus-text-secondary'>
        {sourceBaseUrl || 'Source'}
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        'group relative rounded-lg border transition-all duration-200',
        'aucctus-bg-secondary aucctus-border-secondary',
        'hover:aucctus-bg-tertiary hover:shadow-sm',
      )}
    >
      <div className='p-3.5'>
        {/* Insight text */}
        <p className='aucctus-text-sm aucctus-text-primary mb-3 leading-relaxed'>
          {insight.insight}
        </p>

        {/* Footer with source info */}
        <div className='flex items-center justify-between gap-3'>
          {/* Source badge with tooltip */}
          <ComponentTooltip tip={renderTooltipContent()}>
            <button
              onClick={handleSourceClick}
              disabled={!insight.source?.url}
              className={cn(
                'aucctus-border-primary flex items-center gap-2 rounded-full border p-1 transition-all duration-200',
                {
                  'aucctus-bg-primary-hover cursor-pointer':
                    insight.source?.url,
                  'cursor-default': !insight.source?.url,
                },
              )}
            >
              {/* Source logo */}
              <div className='flex h-4 w-4 items-center justify-center overflow-hidden rounded-full border border-transparent'>
                {renderSourceLogo()}
              </div>
              <span className='aucctus-text-xs pr-2 font-medium'>
                {displayTitle}
              </span>
            </button>
          </ComponentTooltip>

          {/* Right side: expand button */}
          <div className='flex items-center gap-2'>
            {/* Expand button for more details */}
            {insight.moreDetails && (
              <button
                onClick={() => setShowDetails(!showDetails)}
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-lg transition-all duration-200',
                  'aucctus-bg-tertiary hover:aucctus-bg-quaternary',
                  {
                    'rotate-180': showDetails,
                  },
                )}
                aria-label={showDetails ? 'Hide details' : 'Show details'}
              >
                <Icon
                  variant='chevrondown'
                  className='aucctus-stroke-brand-primary'
                  height={12}
                  width={12}
                />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expandable details section */}
      {insight.moreDetails && (
        <div
          className={cn(
            'grid transition-all duration-300 ease-in-out',
            showDetails ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          )}
        >
          <div className='overflow-hidden'>
            <div className='aucctus-border-tertiary border-t px-3.5 pb-3.5 pt-3'>
              <p className='aucctus-text-xs aucctus-text-secondary leading-relaxed'>
                {insight.moreDetails}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
