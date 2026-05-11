/**
 * SourceInfoBadge — thin wrapper over `<SourceBadge variant="standard">`.
 *
 * Owns the data-fetching for company name (logo.dev) + published date that
 * the unified SourceBadge intentionally doesn't know about. Builds an
 * enriched `Citation` and hands it off; click behavior is managed by
 * SourceBadge via `useCitationResolver`.
 */

import {
  SourceBadge,
  adaptISource,
  type Citation,
} from '@components/SourceBadge';
import {
  useCompanyInfo,
  usePublishedDatesQuery,
} from '@hooks/query/articles.hook';
import type { ISource } from '@libs/api/types';
import { formatRelativeDate } from '@libs/utils/source';
import React, { useMemo } from 'react';
import ClassificationBadge from '../../pages/Concept/Report/MarketScan/v3/components/ClassificationBadge';

interface SourceInfoBadgeProps {
  source: ISource;
  showPublishedDate?: boolean;
  badgeClassName?: string;
  badgeSize?: 'small' | 'medium';
  sourceDescription?: React.ReactNode;
  hideDelay?: number;
}

const SourceInfoBadge: React.FC<SourceInfoBadgeProps> = ({
  source,
  badgeClassName = '',
  badgeSize = 'medium',
  showPublishedDate = false,
  sourceDescription,
  hideDelay = 0,
}) => {
  const isNucleusSource = source.sourceType === 'nucleus';
  const companyInfoQuery = useCompanyInfo(isNucleusSource ? '' : source.url);
  const publishedDatesQuery = usePublishedDatesQuery(
    isNucleusSource ? { uuid: '', title: '', url: '' } : source,
    showPublishedDate && !isNucleusSource,
  );

  // Build the canonical citation, then layer in the company-name override
  // (only applied to web sources where the lookup actually returned data).
  const citation: Citation = useMemo(() => {
    const base = adaptISource(source);
    const companyName = companyInfoQuery.data?.[0]?.name;
    if (
      base.kind === 'web' &&
      companyName &&
      // logo.dev's name fallback is just the bare domain — only override
      // when we have something more specific.
      companyName !== base.label
    ) {
      return { ...base, label: companyName };
    }
    return base;
  }, [source, companyInfoQuery.data]);

  const publishedDate =
    publishedDatesQuery.data && showPublishedDate
      ? formatRelativeDate(publishedDatesQuery.data.publishedDate)
      : '';

  // Custom tooltip that includes the optional ClassificationBadge.
  const tooltip = (
    <div
      className='aucctus-bg-primary aucctus-border-secondary max-w-xs overflow-y-auto overscroll-contain rounded-xl border p-4 shadow-lg'
      style={{
        boxShadow:
          '0 0 15px rgba(0, 0, 0, 0.075), 0 8px 15px rgba(0, 0, 0, 0.15)',
      }}
    >
      {source.classification && (
        <div className='mb-3 flex justify-end'>
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
        {sourceDescription || source.description || citation.label}
      </div>
    </div>
  );

  return (
    <div className='flex flex-row items-center gap-2'>
      <SourceBadge
        citation={citation}
        variant='standard'
        size={badgeSize === 'small' ? 'sm' : 'md'}
        className={badgeClassName}
        hideDelay={hideDelay}
        tooltip={tooltip}
      />
      {showPublishedDate && publishedDate && (
        <span className='aucctus-text-secondary aucctus-text-xs items-center whitespace-nowrap'>
          {publishedDate}
        </span>
      )}
    </div>
  );
};

export default SourceInfoBadge;
