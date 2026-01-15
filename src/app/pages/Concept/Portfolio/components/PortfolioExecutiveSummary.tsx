/**
 * Portfolio Executive Summary Banner
 *
 * Displays the AI-generated executive summary of the portfolio
 * following the Aucctus design patterns - matching ExecutiveSummaryBanner.tsx
 */

import React from 'react';
import { Icon } from '@components';

interface PortfolioExecutiveSummaryProps {
  summary: string;
}

const PortfolioExecutiveSummary: React.FC<PortfolioExecutiveSummaryProps> = ({
  summary,
}) => {
  return (
    <div className='aucctus-bg-primary w-full rounded-lg border-b border-l-4 border-r border-t border-gray-light-200 border-l-primary-500 px-6 py-4 shadow-sm dark:border-gray-light-800 dark:border-l-primary-400'>
      <div className='mb-3 flex items-center gap-3'>
        <Icon
          variant='lightbulb'
          className='aucctus-stroke-tertiary flex-shrink-0'
          height={20}
          width={20}
        />
        <h3 className='aucctus-text-tertiary aucctus-text-sm font-medium uppercase tracking-wider'>
          PORTFOLIO EXECUTIVE SUMMARY
        </h3>
      </div>
      <p className='aucctus-text-primary aucctus-text-xl-semibold leading-relaxed'>
        {summary}
      </p>
    </div>
  );
};

export default React.memo(PortfolioExecutiveSummary);
