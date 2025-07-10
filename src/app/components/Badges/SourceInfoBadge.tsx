import images from '@assets/img';
import { ComponentTooltip } from '@components';
import {
  useClearbitCompany,
  usePublishedDatesQuery,
} from '@hooks/query/articles.hook';
import type { ISource } from '@libs/api/types';
import { getBaseUrl, formatRelativeDate } from '@libs/utils/source';
import { cn } from '@libs/utils/react';
import React, { useMemo } from 'react';
import ClassificationBadge from '../../pages/Concept/Report/MarketScan/v3/components/ClassificationBadge';

interface SourceInfoBadgeProps {
  source: ISource;
  onClick?: () => void;
  showPublishedDate?: boolean;
  badgeClassName?: string;
  badgeSize?: 'small' | 'medium';
}

const SourceInfoBadge: React.FC<SourceInfoBadgeProps> = ({
  source,
  onClick,
  badgeClassName = '',
  badgeSize = 'medium',
  showPublishedDate = false,
}) => {
  const publishedDatesQuery = usePublishedDatesQuery(source, showPublishedDate);
  const clearbitCompanyQuery = useClearbitCompany(source.url);

  // Memoized computed values to reduce re-renders
  const { sourceTitle, publishedDate, logoSizeClass, fontSizeClass } =
    useMemo(() => {
      const logoSizeClass = badgeSize === 'small' ? 'h-4 w-4' : 'h-6 w-6';
      const fontSizeClass =
        badgeSize === 'small' ? 'text-xs font-normal' : 'text-sm font-medium';

      let sourceTitle = 'loading...';
      if (clearbitCompanyQuery.data?.[0]?.name) {
        sourceTitle = clearbitCompanyQuery.data[0].name;
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
      clearbitCompanyQuery.data,
      publishedDatesQuery.data,
      showPublishedDate,
      source.url,
    ]);

  const renderSourceLogo = () => {
    const sourceBaseUrl = getBaseUrl(source.url);

    return (
      <div
        className={cn(
          'flex items-center justify-center overflow-hidden rounded-full border border-transparent',
          logoSizeClass,
        )}
      >
        <img
          className='h-full w-full object-contain'
          alt='source-logo'
          src={`https://logo.clearbit.com/${sourceBaseUrl || ''}`}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = images.link;
          }}
        />
      </div>
    );
  };

  const renderTooltipContent = () => (
    <div className='aucctus-bg-primary aucctus-border-secondary max-w-xs rounded-xl border p-4 shadow-lg'>
      {/* Classification badge in top right */}
      {source.classification && (
        <div className='mb-2 flex justify-end'>
          <ClassificationBadge
            classification={source.classification}
            size='small'
          />
        </div>
      )}

      <div className='aucctus-text-sm-semibold aucctus-text-primary mb-2'>
        {source.title}
      </div>
      <div className='aucctus-text-xs aucctus-text-secondary'>
        {getBaseUrl(source.url)}
      </div>
    </div>
  );

  const displayTitle =
    sourceTitle.length > 25 ? `${sourceTitle.slice(0, 25)}...` : sourceTitle;

  return (
    <ComponentTooltip tip={renderTooltipContent()} hideDelay={300}>
      <div className='flex flex-row items-center gap-2'>
        <div
          onClick={onClick}
          className={cn(
            'aucctus-border-primary flex items-center gap-2 rounded-full border p-1',
            badgeClassName,
            onClick &&
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
