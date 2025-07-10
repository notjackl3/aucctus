import images from '@assets/img';
import { ComponentTooltip, Icon } from '@components';
import {
  useClearbitCompany,
  usePublishedDatesQuery,
} from '@hooks/query/articles.hook';
import type { IBaseFinancialProjectionSourceV2 } from '@libs/api/types';
import utils from '@libs/utils';
import { cn } from '@libs/utils/react';
import React, { useEffect, useState } from 'react';

interface FinancialProjectionSourceBadgeProps {
  source: IBaseFinancialProjectionSourceV2;
  badgeClassName?: string;
  badgeSize?: 'small' | 'medium';
  showPublishedDate?: boolean;
}

const FinancialProjectionSourceBadge: React.FC<
  FinancialProjectionSourceBadgeProps
> = ({
  source,
  badgeClassName = '',
  badgeSize = 'medium',
  showPublishedDate = false,
}) => {
  const getBaseUrl = (url: string): string => {
    try {
      const urlObject = new URL(url);
      return urlObject.hostname.replace(/^www\./, '');
    } catch (e) {
      return url;
    }
  };

  const [sourceTitle, setSourceTitle] = useState<string>('loading...');
  const [publishedDate, setPublishedDate] = useState<string | undefined>(
    undefined,
  );
  const isAIReasoning = source.title === 'AI Reasoning' || !source.url;
  const hasValidUrl = source.url && source.url.trim() !== '';

  const clearbitCompanyQuery = useClearbitCompany(source.url || '');
  const publishedDatesQuery = usePublishedDatesQuery(
    hasValidUrl
      ? {
          uuid: source.uuid,
          title: source.title,
          url: source.url!,
        }
      : { uuid: '', title: '', url: '' },
    showPublishedDate && !!hasValidUrl,
  );

  useEffect(() => {
    if (publishedDatesQuery.data && showPublishedDate && hasValidUrl) {
      const date = new Date(publishedDatesQuery.data.publishedDate);

      if (!isNaN(date.getTime())) {
        const now = new Date();
        const diffDays = utils.time.differenceInDays(date, now);
        const diffMonths = utils.time.differenceInMonths(date, now);

        if (diffDays < 30) {
          setPublishedDate(`${diffDays} days ago`);
        } else if (diffMonths < 12) {
          setPublishedDate(`${diffMonths} months ago`);
        } else {
          setPublishedDate(utils.time.dateFormatter(date.toISOString()));
        }
      }
    }
  }, [publishedDatesQuery.data, showPublishedDate, hasValidUrl]);

  useEffect(() => {
    if (isAIReasoning) {
      setSourceTitle('AI Reasoning');
    } else if (
      clearbitCompanyQuery.data &&
      clearbitCompanyQuery.data.length > 0 &&
      clearbitCompanyQuery.data[0].name
    ) {
      setSourceTitle(clearbitCompanyQuery.data[0].name);
    } else if (hasValidUrl) {
      setSourceTitle(getBaseUrl(source.url!));
    } else {
      setSourceTitle(source.title);
    }
  }, [
    clearbitCompanyQuery.data,
    source.title,
    source.url,
    isAIReasoning,
    hasValidUrl,
  ]);

  const logoSizeClass = badgeSize === 'small' ? 'h-4 w-4' : 'h-6 w-6';
  const fontSizeClass =
    badgeSize === 'small' ? 'text-xs font-normal' : 'text-sm font-medium';

  const handleClick = () => {
    if (hasValidUrl && !isAIReasoning) {
      window.open(source.url, '_blank');
    }
  };

  const renderSourceLogo = () => {
    if (isAIReasoning) {
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

    if (hasValidUrl) {
      const sourceBaseUrl = getBaseUrl(source.url!);

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
    }

    // Fallback for sources without URL
    return (
      <div
        className={cn(
          'flex items-center justify-center overflow-hidden rounded-full',
          logoSizeClass,
        )}
      >
        <Icon
          variant='file'
          className={cn('aucctus-fill-tertiary', logoSizeClass)}
        />
      </div>
    );
  };

  const renderTooltipContent = () => (
    <div className='aucctus-bg-primary aucctus-border-secondary max-w-xs rounded-lg border p-3 shadow-lg'>
      <div className='aucctus-text-sm-semibold aucctus-text-primary mb-2'>
        {source.title}
      </div>
      <div className='aucctus-text-xs aucctus-text-secondary'>
        {source.reasoning}
      </div>
    </div>
  );

  return (
    <ComponentTooltip tip={renderTooltipContent()} hideDelay={300}>
      <div className='flex flex-row items-center gap-2'>
        <div
          onClick={handleClick}
          className={cn(
            'aucctus-border-primary flex items-center gap-2 rounded-full border p-1',
            'aucctus-bg-primary-hover transition-all !duration-200',
            badgeClassName,
            hasValidUrl && !isAIReasoning ? 'cursor-pointer' : 'cursor-default',
          )}
        >
          {renderSourceLogo()}
          <span className={cn('pr-2', 'line-clamp-1', fontSizeClass)}>
            {sourceTitle.length > 25
              ? `${sourceTitle.slice(0, 25)}...`
              : sourceTitle}
          </span>
        </div>
        {showPublishedDate && (
          <span className='aucctus-text-secondary aucctus-text-xs items-center whitespace-nowrap'>
            {publishedDate}
          </span>
        )}
      </div>
    </ComponentTooltip>
  );
};

export default FinancialProjectionSourceBadge;
