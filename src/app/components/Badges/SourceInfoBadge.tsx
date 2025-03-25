import images from '@assets/img';
import {
  useClearbitCompany,
  usePublishedDatesQuery,
} from '@hooks/query/articles.hook';
import type { ISource } from '@libs/api/types';
import utils from '@libs/utils';
import { cn } from '@libs/utils/react';
import React, { useEffect, useState } from 'react';

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
  const getBaseUrl = (url: string): string => {
    try {
      const urlObject = new URL(url);
      return urlObject.hostname.replace(/^www\./, '');
    } catch (e) {
      return url;
    }
  };

  const [publishedDate, setPublishedDate] = useState<string | undefined>(
    undefined,
  );
  const [sourceTitle, setSourceTitle] = useState<string>('loading...');

  const publishedDatesQuery = usePublishedDatesQuery(source);
  const clearbitCompanyQuery = useClearbitCompany(source.url);

  useEffect(() => {
    if (publishedDatesQuery.data && showPublishedDate) {
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
  }, [publishedDatesQuery.data, showPublishedDate]);

  useEffect(() => {
    if (
      clearbitCompanyQuery.data &&
      clearbitCompanyQuery.data.length > 0 &&
      clearbitCompanyQuery.data[0].name
    ) {
      setSourceTitle(clearbitCompanyQuery.data[0].name);
    } else {
      setSourceTitle(getBaseUrl(source.url));
    }
  }, [clearbitCompanyQuery.data, source.url]);

  const logoSizeClass = badgeSize === 'small' ? 'h-4 w-4' : 'h-6 w-6';
  const fontSizeClass =
    badgeSize === 'small' ? 'text-xs font-normal' : 'text-sm font-medium';

  const renderSourceLogo = (source: ISource) => {
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

  return (
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
        {renderSourceLogo(source)}
        <span className={cn('pr-2', fontSizeClass)}>
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
  );
};

export default SourceInfoBadge;
