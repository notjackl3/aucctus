import React, { useState, useMemo, useCallback } from 'react';
import { cn } from '@libs/utils/react';
import type { TimePeriod } from '../types';
import { useWatchtowerTrends } from '@hooks/query/watchtower.hook';
import { useWatchtowerView } from '../WatchtowerViewContext';
import { TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const PAGE_SIZE = 5;

const periodLabels: Record<TimePeriod, string> = {
  '6mo': '6 Months',
  '12mo': '12 Months',
  '12plus': '12+ Months',
};

/**
 * SignalTrendsWidget - Time-period trend bullets with dot pagination
 */
const SignalTrendsWidget: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('6mo');
  const [currentPage, setCurrentPage] = useState(0);
  const { activeWatchtowerConfigUuid, selectedScanUuid } = useWatchtowerView();
  const { trends } = useWatchtowerTrends(
    selectedScanUuid,
    activeWatchtowerConfigUuid,
  );

  const bullets = useMemo(() => {
    switch (selectedPeriod) {
      case '6mo':
        return trends.period6mo;
      case '12mo':
        return trends.period12mo;
      case '12plus':
        return trends.period12plus;
      default:
        return [];
    }
  }, [selectedPeriod, trends]);

  const pages = useMemo(() => {
    const result = [];
    for (let i = 0; i < bullets.length; i += PAGE_SIZE) {
      result.push(bullets.slice(i, i + PAGE_SIZE));
    }
    return result;
  }, [bullets]);

  const totalPages = pages.length;
  const hasPagination = totalPages > 1;

  const handlePeriodChange = useCallback((period: TimePeriod) => {
    setSelectedPeriod(period);
    setCurrentPage(0);
  }, []);

  const goNext = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  }, [totalPages]);

  const goPrev = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  }, []);

  return (
    <div className='aucctus-bg-primary aucctus-border-secondary h-full rounded-xl border p-6'>
      <div className='mb-4 flex items-center gap-2'>
        <TrendingUp size={20} className='aucctus-stroke-secondary' />
        <h3 className='aucctus-text-primary aucctus-text-lg-semibold'>
          Trends Over Time
        </h3>
      </div>
      <div className='mb-4 flex flex-wrap gap-1.5'>
        {(Object.keys(periodLabels) as TimePeriod[]).map((period) => (
          <button
            key={period}
            onClick={() => handlePeriodChange(period)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
              selectedPeriod === period
                ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900'
                : 'aucctus-bg-secondary aucctus-border-secondary aucctus-text-secondary hover:aucctus-bg-secondary-hover',
            )}
          >
            {periodLabels[period]}
          </button>
        ))}
      </div>
      <div className='aucctus-bg-secondary aucctus-border-secondary rounded-lg border p-4'>
        {/* Grid stack: all pages overlap so container = tallest page */}
        <div className='grid'>
          {pages.map((pageBullets, pageIdx) => (
            <motion.ul
              key={`${selectedPeriod}-page-${pageIdx}`}
              className='col-start-1 row-start-1 space-y-2.5'
              initial={false}
              animate={{ opacity: pageIdx === currentPage ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              aria-hidden={pageIdx !== currentPage}
            >
              {pageBullets.map((bullet, idx) => (
                <li key={idx} className='flex items-start gap-2 text-sm'>
                  <span className='aucctus-text-secondary mt-0.5'>•</span>
                  <span className='aucctus-text-secondary leading-relaxed'>
                    <span className='aucctus-text-primary font-semibold'>
                      {bullet.highlight}
                    </span>{' '}
                    {bullet.text}
                  </span>
                </li>
              ))}
            </motion.ul>
          ))}
        </div>

        {/* Dot pagination */}
        {hasPagination && (
          <div className='mt-3 flex items-center justify-between border-t border-black/5 pt-3 dark:border-white/10'>
            <div className='flex items-center gap-1.5'>
              {Array.from({ length: totalPages }).map((_, pageIdx) => (
                <button
                  key={pageIdx}
                  onClick={() => setCurrentPage(pageIdx)}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-200',
                    pageIdx === currentPage
                      ? 'aucctus-bg-brand-solid w-4'
                      : 'aucctus-bg-tertiary w-1.5 hover:opacity-80',
                  )}
                />
              ))}
            </div>
            <div className='flex items-center gap-1'>
              <button
                onClick={goPrev}
                disabled={currentPage === 0}
                className={cn(
                  'aucctus-border-secondary flex h-6 w-6 items-center justify-center rounded border transition-colors',
                  currentPage === 0
                    ? 'cursor-not-allowed opacity-30'
                    : 'aucctus-bg-secondary-hover',
                )}
              >
                <ChevronLeft size={14} className='aucctus-stroke-secondary' />
              </button>
              <button
                onClick={goNext}
                disabled={currentPage === totalPages - 1}
                className={cn(
                  'aucctus-border-secondary flex h-6 w-6 items-center justify-center rounded border transition-colors',
                  currentPage === totalPages - 1
                    ? 'cursor-not-allowed opacity-30'
                    : 'aucctus-bg-secondary-hover',
                )}
              >
                <ChevronRight size={14} className='aucctus-stroke-secondary' />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(SignalTrendsWidget);
