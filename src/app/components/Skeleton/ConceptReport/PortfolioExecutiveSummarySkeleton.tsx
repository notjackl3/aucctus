/**
 * Skeleton loading state for PortfolioExecutiveSummary
 * Mirrors the structure of the portfolio executive summary banner
 */

import React from 'react';
import SkeletonBlock from './SkeletonBlock';

const PortfolioExecutiveSummarySkeleton: React.FC = () => {
  return (
    <div className='aucctus-bg-primary w-full rounded-lg border-b border-l-4 border-r border-t border-gray-light-200 border-l-primary-500 px-6 py-4 shadow-sm dark:border-gray-light-800 dark:border-l-primary-400'>
      <div className='mb-3 flex items-center gap-3'>
        <SkeletonBlock className='h-5 w-5 flex-shrink-0 rounded' />
        <SkeletonBlock className='h-3 w-56' />
      </div>
      {/* Summary text skeleton - multiple lines */}
      <div className='space-y-2'>
        <SkeletonBlock className='h-6 w-full' />
        <SkeletonBlock className='h-6 w-full' />
        <SkeletonBlock className='h-6 w-3/4' />
      </div>
    </div>
  );
};

export default PortfolioExecutiveSummarySkeleton;
