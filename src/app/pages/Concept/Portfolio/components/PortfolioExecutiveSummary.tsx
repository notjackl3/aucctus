/**
 * Portfolio Executive Summary Banner
 *
 * Displays the AI-generated executive summary of the portfolio
 * following the Aucctus design patterns - matching ExecutiveSummaryBanner.tsx
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  usePortfolioExecutiveSummary,
  usePortfolioExecutiveSummarySocketEvents,
} from '@hooks/query/portfolio.hook';
import { dateFormatter } from '@libs/utils/time';
import { AlertCircle, Clock, Layers, Lightbulb, Loader2 } from 'lucide-react';

const PortfolioExecutiveSummary: React.FC = () => {
  const { summary, isEmpty, isError } = usePortfolioExecutiveSummary();
  const { generationProgress } = usePortfolioExecutiveSummarySocketEvents();

  // Determine if we're actively generating (triggered via signals/background)
  const isActivelyGenerating = generationProgress.isGenerating;

  // Format the generated timestamp
  const generatedAtText = useMemo(() => {
    if (!summary?.generatedAt) return null;
    try {
      const formattedTime = dateFormatter(summary.generatedAt);
      return `Generated ${formattedTime}`;
    } catch {
      return null;
    }
  }, [summary?.generatedAt]);

  // Calculate concept count from metadata
  const conceptCount = summary?.metadata?.conceptCount;

  // Render empty state
  if (isEmpty && !isActivelyGenerating) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className='aucctus-bg-primary w-full rounded-lg border-b border-l-4 border-r border-t border-gray-light-200 border-l-primary-500 px-6 py-4 shadow-sm dark:border-gray-light-800 dark:border-l-primary-400'
      >
        <div className='mb-3 flex items-center justify-between gap-3'>
          <div className='flex items-center gap-3'>
            <Lightbulb
              size={20}
              className='aucctus-stroke-tertiary flex-shrink-0'
            />
            <h3 className='aucctus-text-tertiary aucctus-text-sm font-medium uppercase tracking-wider'>
              PORTFOLIO EXECUTIVE SUMMARY
            </h3>
          </div>
        </div>
        <p className='aucctus-text-secondary aucctus-text-base leading-relaxed'>
          Executive summary will be generated automatically when concept
          priorities are calculated.
        </p>
      </motion.div>
    );
  }

  // Render error state
  if (isError && !isActivelyGenerating) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className='aucctus-bg-primary w-full rounded-lg border-b border-l-4 border-r border-t border-red-200 border-l-red-500 px-6 py-4 shadow-sm dark:border-red-800 dark:border-l-red-400'
      >
        <div className='mb-3 flex items-center gap-3'>
          <AlertCircle
            size={20}
            className='flex-shrink-0 stroke-red-500 dark:stroke-red-400'
          />
          <h3 className='font-medium uppercase tracking-wider text-red-600 dark:text-red-400'>
            PORTFOLIO EXECUTIVE SUMMARY
          </h3>
        </div>
        <p className='aucctus-text-secondary aucctus-text-base leading-relaxed'>
          Failed to load portfolio summary. A new summary will be generated
          automatically when portfolio data changes.
        </p>
      </motion.div>
    );
  }

  // Render generating state with progress
  if (isActivelyGenerating) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className='aucctus-bg-primary w-full rounded-lg border-b border-l-4 border-r border-t border-gray-light-200 border-l-primary-500 px-6 py-4 shadow-sm dark:border-gray-light-800 dark:border-l-primary-400'
      >
        <div className='mb-3 flex items-center gap-3'>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2
              size={20}
              className='aucctus-stroke-tertiary flex-shrink-0'
            />
          </motion.div>
          <h3 className='aucctus-text-tertiary aucctus-text-sm font-medium uppercase tracking-wider'>
            GENERATING PORTFOLIO EXECUTIVE SUMMARY
          </h3>
        </div>
        <div className='space-y-3'>
          <p className='aucctus-text-secondary aucctus-text-base leading-relaxed'>
            {generationProgress.message ||
              'Analyzing your portfolio and generating executive summary...'}
          </p>
          {generationProgress.progress > 0 && (
            <div className='space-y-2'>
              <div className='flex items-center justify-between text-xs'>
                <span className='aucctus-text-tertiary'>
                  {generationProgress.stage}
                </span>
                <span className='aucctus-text-tertiary'>
                  {generationProgress.progress}%
                </span>
              </div>
              <div className='h-1.5 w-full overflow-hidden rounded-full bg-gray-light-200 dark:bg-gray-light-800'>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${generationProgress.progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className='h-full rounded-full bg-primary-500'
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Render normal state with summary data
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className='aucctus-bg-primary w-full rounded-lg border-b border-l-4 border-r border-t border-gray-light-200 border-l-primary-500 px-6 py-4 shadow-sm dark:border-gray-light-800 dark:border-l-primary-400'
    >
      <div className='mb-3 flex items-center gap-3'>
        <Lightbulb
          size={20}
          className='aucctus-stroke-tertiary flex-shrink-0'
        />
        <h3 className='aucctus-text-tertiary aucctus-text-sm font-medium uppercase tracking-wider'>
          PORTFOLIO EXECUTIVE SUMMARY
        </h3>
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className='aucctus-text-primary aucctus-text-xl-semibold leading-relaxed'
      >
        {summary?.summaryText}
      </motion.p>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className='mt-3 flex items-center gap-4 text-xs'
      >
        {generatedAtText && (
          <span className='aucctus-text-tertiary flex items-center gap-1'>
            <Clock size={12} className='aucctus-stroke-tertiary' />
            {generatedAtText}
          </span>
        )}
        {conceptCount !== undefined && (
          <span className='aucctus-text-tertiary flex items-center gap-1'>
            <Layers size={12} className='aucctus-stroke-tertiary' />
            {conceptCount} concept{conceptCount !== 1 ? 's' : ''} analyzed
          </span>
        )}
      </motion.div>
    </motion.div>
  );
};

export default React.memo(PortfolioExecutiveSummary);
