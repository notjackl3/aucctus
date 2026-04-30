/**
 * FinancialProjectionSourceBadge — thin wrapper over `<SourceBadge variant="standard">`.
 *
 * Owns the data-fetching for company name (logo.dev) + published date
 * specific to the financial projection source shape. The reasoning text
 * lives on the citation as `citation.reasoning` and the badge auto-renders
 * it as the tooltip body when no `description` override is provided.
 */

import {
  SourceBadge,
  adaptFinancialProjectionSource,
  type Citation,
} from '@components/SourceBadge';
import {
  useCompanyInfo,
  usePublishedDatesQuery,
} from '@hooks/query/articles.hook';
import type { IBaseFinancialProjectionSourceV2 } from '@libs/api/types';
import utils from '@libs/utils';
import React, { useMemo, useState, useEffect } from 'react';

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
  const isNucleusSource = source.sourceType === 'nucleus';
  const hasValidUrl = !!(source.url && source.url.trim() !== '');

  const companyInfoQuery = useCompanyInfo(
    isNucleusSource ? '' : source.url || '',
  );
  const publishedDatesQuery = usePublishedDatesQuery(
    hasValidUrl && !isNucleusSource
      ? { uuid: source.uuid, title: source.title, url: source.url! }
      : { uuid: '', title: '', url: '' },
    showPublishedDate && hasValidUrl && !isNucleusSource,
  );

  const [publishedDate, setPublishedDate] = useState<string | undefined>(
    undefined,
  );
  useEffect(() => {
    if (publishedDatesQuery.data && showPublishedDate && hasValidUrl) {
      const date = new Date(publishedDatesQuery.data.publishedDate);
      if (!isNaN(date.getTime())) {
        const now = new Date();
        const diffDays = utils.time.differenceInDays(date, now);
        const diffMonths = utils.time.differenceInMonths(date, now);
        if (diffDays < 30) setPublishedDate(`${diffDays} days ago`);
        else if (diffMonths < 12) setPublishedDate(`${diffMonths} months ago`);
        else setPublishedDate(utils.time.dateFormatter(date.toISOString()));
      }
    }
  }, [publishedDatesQuery.data, showPublishedDate, hasValidUrl]);

  const citation: Citation = useMemo(() => {
    const base = adaptFinancialProjectionSource(source);
    const companyName = companyInfoQuery.data?.[0]?.name;
    if (base.kind === 'web' && companyName && companyName !== base.label) {
      return { ...base, label: companyName };
    }
    return base;
  }, [source, companyInfoQuery.data]);

  return (
    <div className='flex flex-row items-center gap-2'>
      <SourceBadge
        citation={citation}
        variant='standard'
        size={badgeSize === 'small' ? 'sm' : 'md'}
        className={badgeClassName}
        hideDelay={300}
      />
      {showPublishedDate && publishedDate && (
        <span className='aucctus-text-secondary aucctus-text-xs items-center whitespace-nowrap'>
          {publishedDate}
        </span>
      )}
    </div>
  );
};

export default FinancialProjectionSourceBadge;
