import images from '@assets/img';
import { ComponentTooltip, Icon } from '@components';
import {
  useCompanyInfo,
  usePublishedDatesQuery,
} from '@hooks/query/articles.hook';
import type { ISource } from '@libs/api/types';
import { getBaseUrl, formatRelativeDate, getLogoUrl } from '@libs/utils/source';
import { cn } from '@libs/utils/react';
import React, { useMemo } from 'react';
import ClassificationBadge from '../../pages/Concept/Report/MarketScan/v3/components/ClassificationBadge';

interface SourceInfoBadgeProps {
  source: ISource;
  onClick?: () => void;
  showPublishedDate?: boolean;
  badgeClassName?: string;
  badgeSize?: 'small' | 'medium';
  sourceDescription?: React.ReactNode;
  hideDelay?: number;
}

const SourceInfoBadge: React.FC<SourceInfoBadgeProps> = ({
  source,
  onClick,
  badgeClassName = '',
  badgeSize = 'medium',
  showPublishedDate = false,
  sourceDescription,
  hideDelay = 0,
}) => {
  const publishedDatesQuery = usePublishedDatesQuery(source, showPublishedDate);
  const companyInfoQuery = useCompanyInfo(source.url);

  // Check if this is an AI-generated source (AI Reasoning or AI Synthesis)
  const isAIGenerated =
    source.title?.toLowerCase().includes('ai reasoning') ||
    source.title?.toLowerCase().includes('ai synthesis') ||
    (!source.url && source.description);

  // Memoized computed values to reduce re-renders
  const { sourceTitle, publishedDate, logoSizeClass, fontSizeClass } =
    useMemo(() => {
      const logoSizeClass = badgeSize === 'small' ? 'h-4 w-4' : 'h-6 w-6';
      const fontSizeClass =
        badgeSize === 'small' ? 'text-xs font-normal' : 'text-sm font-medium';

      let sourceTitle = 'loading...';
      // Handle AI-generated sources first
      if (isAIGenerated) {
        // Determine if it's AI Reasoning or AI Synthesis based on title
        if (source.title?.toLowerCase().includes('ai synthesis')) {
          sourceTitle = 'AI Synthesis';
        } else {
          sourceTitle = 'AI Reasoning';
        }
      } else if (!!source?.nucleusFileSource?.title) {
        sourceTitle = source.nucleusFileSource.title;
      } else if (companyInfoQuery.data?.[0]?.name) {
        sourceTitle = companyInfoQuery.data[0].name;
      } else {
        sourceTitle = getBaseUrl(source.url);
      }
      let publishedDate = '';
      if (publishedDatesQuery.data && showPublishedDate) {
        publishedDate = formatRelativeDate(
          publishedDatesQuery.data.publishedDate,
        );
      }

      return { sourceTitle, publishedDate, logoSizeClass, fontSizeClass };
    }, [
      badgeSize,
      companyInfoQuery.data,
      publishedDatesQuery.data,
      showPublishedDate,
      source.url,
      source.nucleusFileSource,
      source.title,
      isAIGenerated,
    ]);

  const renderSourceLogo = () => {
    // Show lightbulb icon for AI-generated sources
    if (isAIGenerated) {
      return (
        <div
          className={cn(
            'aucctus-border-primary flex h-fit w-fit items-center justify-center overflow-hidden rounded-full',
          )}
        >
          <Icon
            variant='lightbulb'
            className={cn('aucctus-stroke-quaternary', logoSizeClass)}
          />
        </div>
      );
    }

    const sourceBaseUrl = source.url ? getBaseUrl(source.url) : null;

    return (
      <div
        className={cn(
          'flex items-center justify-center overflow-hidden rounded-full border border-transparent',
          logoSizeClass,
        )}
      >
        {sourceBaseUrl ? (
          <img
            className='h-full w-full object-contain'
            alt='source-logo'
            src={getLogoUrl(sourceBaseUrl)}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = images.link;
            }}
          />
        ) : (
          // Show document icon for nucleus file sources (user uploaded files)
          <img
            className='h-full w-full object-contain'
            alt='document-icon'
            src={images.link} // or use a document-specific icon if available
          />
        )}
      </div>
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
      {/* Top row with circular icon and classification badge */}
      <div className='mb-3 flex items-start justify-between'>
        {/* Circular icon at top left */}
        <div className='aucctus-bg-secondary rounded-full border border-transparent p-1'>
          {renderSourceLogo()}
        </div>

        {/* Classification badge in top right */}
        {source.classification && (
          <ClassificationBadge
            classification={source.classification}
            size='small'
          />
        )}
      </div>

      <div className='aucctus-text-sm-semibold aucctus-text-primary mb-2'>
        {source.title}
      </div>
      <div className='aucctus-text-xs aucctus-text-secondary'>
        {sourceDescription ||
          source.description ||
          (source.url ? getBaseUrl(source.url) : 'User uploaded document')}
      </div>
    </div>
  );

  const displayTitle =
    sourceTitle && sourceTitle.length > 25
      ? `${sourceTitle.slice(0, 25)}...`
      : sourceTitle || 'Unknown Source';

  return (
    <ComponentTooltip tip={renderTooltipContent()} hideDelay={hideDelay}>
      <div className='flex flex-row items-center gap-2'>
        <div
          onClick={!isAIGenerated ? onClick : undefined}
          className={cn(
            'aucctus-border-primary flex items-center gap-2 rounded-full border p-1',
            badgeClassName,
            onClick &&
              !isAIGenerated &&
              'aucctus-bg-primary-hover cursor-pointer transition-all !duration-200',
          )}
        >
          {renderSourceLogo()}
          <span className={cn('pr-2', fontSizeClass)}>{displayTitle}</span>
        </div>
        {showPublishedDate && publishedDate && (
          <span className='aucctus-text-secondary aucctus-text-xs items-center whitespace-nowrap'>
            {publishedDate}
          </span>
        )}
      </div>
    </ComponentTooltip>
  );
};

export default SourceInfoBadge;
