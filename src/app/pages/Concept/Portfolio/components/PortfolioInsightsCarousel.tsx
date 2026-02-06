/**
 * Portfolio Insights Carousel
 *
 * Displays AI-generated portfolio insights in a rotating carousel.
 * Uses real data from the Portfolio Insights API with WebSocket support.
 * Shows actionable observations about the account's concept portfolio.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@components';
import {
  usePortfolioInsights,
  usePortfolioInsightsSocketEvents,
} from '@hooks/query/portfolioInsights.hook';
import type { IPortfolioInsight } from '@libs/api/types/portfolioInsights';

const CARD_DURATION = 8000; // 8 seconds per card
const PROGRESS_INTERVAL = 50; // Update progress every 50ms

const PortfolioInsightsCarousel: React.FC = () => {
  // Fetch insights (ordered by priority)
  const { insights, isLoading, isError, refetch } = usePortfolioInsights(1, 10); // Get top 10 insights

  // WebSocket events for real-time updates
  const { isGenerating } = usePortfolioInsightsSocketEvents();

  // Carousel state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-progression logic
  useEffect(() => {
    if (!isAutoPlaying || insights.length === 0 || isGenerating) return;

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (PROGRESS_INTERVAL / CARD_DURATION) * 100;

        if (newProgress >= 100) {
          setCurrentIndex((current) => (current + 1) % insights.length);
          return 0;
        }

        return newProgress;
      });
    }, PROGRESS_INTERVAL);

    return () => clearInterval(progressTimer);
  }, [isAutoPlaying, currentIndex, insights.length, isGenerating]);

  const handleIndicatorClick = useCallback((index: number) => {
    setCurrentIndex(index);
    setProgress(0);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsAutoPlaying(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsAutoPlaying(true);
    setProgress(0);
  }, []);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const currentInsight = useMemo(
    () => insights[currentIndex] || insights[0],
    [insights, currentIndex],
  );

  // Get severity badge color
  const getSeverityColor = (severity: IPortfolioInsight['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  // Convert snake_case to Title Case (e.g. "strategic_alignment" → "Strategic Alignment")
  const toTitleCase = (value: string): string =>
    value
      .split('_')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  // Get insight type display name
  const getInsightTypeDisplay = (
    insightType: IPortfolioInsight['insightType'],
  ) => {
    const typeMap: Record<IPortfolioInsight['insightType'], string> = {
      stale_concepts: 'Stale Concepts',
      risk_concentration: 'Risk Concentration',
      emerging_theme: 'Emerging Theme',
      validation_gap: 'Validation Gap',
      strategic_misalignment: 'Strategic Misalignment',
      horizon_imbalance: 'Horizon Imbalance',
    };
    return typeMap[insightType] || toTitleCase(insightType);
  };

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='aucctus-bg-primary aucctus-border-secondary flex h-[360px] flex-col overflow-hidden rounded-lg border shadow-sm'
      >
        <div className='aucctus-bg-secondary/30 flex min-h-0 flex-1 flex-col p-4'>
          {/* Header */}
          <div className='mb-4 flex shrink-0 items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Icon
                variant='sparkles'
                height={20}
                width={20}
                className='aucctus-stroke-brand-primary'
              />
              <h2 className='aucctus-text-primary aucctus-text-xl font-semibold'>
                Portfolio Insights
              </h2>
            </div>
          </div>

          {/* Loading skeleton */}
          <div className='aucctus-bg-primary aucctus-border-secondary/40 flex min-h-0 flex-1 animate-pulse flex-col overflow-hidden rounded-xl border p-5'>
            <div className='mb-4 h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-700'></div>
            <div className='mb-2 h-4 w-full rounded bg-gray-200 dark:bg-gray-700'></div>
            <div className='mb-4 h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-700'></div>
            <div className='h-20 w-full rounded bg-gray-100 dark:bg-gray-800'></div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Empty state
  if (insights.length === 0 && !isError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='aucctus-bg-primary aucctus-border-secondary flex h-[360px] flex-col overflow-hidden rounded-lg border shadow-sm'
      >
        <div className='aucctus-bg-secondary/30 flex min-h-0 flex-1 flex-col p-4'>
          {/* Header */}
          <div className='mb-4 flex shrink-0 items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Icon
                variant='sparkles'
                height={20}
                width={20}
                className='aucctus-stroke-brand-primary'
              />
              <h2 className='aucctus-text-primary aucctus-text-xl font-semibold'>
                Portfolio Insights
              </h2>
            </div>
          </div>

          {/* Empty state content */}
          <div className='aucctus-bg-primary aucctus-border-secondary/40 flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden rounded-xl border p-8'>
            <Icon
              variant='lightbulb'
              height={48}
              width={48}
              className='aucctus-stroke-secondary mb-4'
            />
            <h3 className='aucctus-text-primary mb-2 text-lg font-semibold'>
              No Insights Yet
            </h3>
            <p className='aucctus-text-secondary text-center text-sm'>
              Insights will appear automatically once concept priorities are
              calculated.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Error state
  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='aucctus-bg-primary aucctus-border-secondary flex h-[360px] flex-col overflow-hidden rounded-lg border shadow-sm'
      >
        <div className='aucctus-bg-secondary/30 flex min-h-0 flex-1 flex-col p-4'>
          {/* Header */}
          <div className='mb-4 flex shrink-0 items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Icon
                variant='sparkles'
                height={20}
                width={20}
                className='aucctus-stroke-brand-primary'
              />
              <h2 className='aucctus-text-primary aucctus-text-xl font-semibold'>
                Portfolio Insights
              </h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRetry}
              className='aucctus-text-secondary hover:aucctus-text-primary flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800'
              aria-label='Retry loading insights'
            >
              <Icon variant='refresh' height={16} width={16} />
              <span>Retry</span>
            </motion.button>
          </div>

          {/* Error state content */}
          <div className='aucctus-bg-primary aucctus-border-secondary/40 flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden rounded-xl border p-8'>
            <Icon
              variant='alert-circle'
              height={48}
              width={48}
              className='mb-4 stroke-red-500'
            />
            <h3 className='aucctus-text-primary mb-2 text-lg font-semibold'>
              Failed to Load Insights
            </h3>
            <p className='aucctus-text-secondary text-center text-sm'>
              Unable to fetch portfolio insights. Please try again.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Normal state with insights
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className='aucctus-bg-primary aucctus-border-secondary flex h-[360px] flex-col overflow-hidden rounded-lg border shadow-sm'
    >
      <div className='aucctus-bg-secondary/30 flex min-h-0 flex-1 flex-col p-4'>
        {/* Header */}
        <div className='mb-4 flex shrink-0 items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Icon
              variant='sparkles'
              height={20}
              width={20}
              className='aucctus-stroke-brand-primary'
            />
            <h2 className='aucctus-text-primary aucctus-text-xl font-semibold'>
              Portfolio Insights
            </h2>
          </div>
        </div>

        {/* Main Card with Timer */}
        <div
          className='flex min-h-0 flex-1 cursor-pointer flex-col'
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Progress Bar Navigation */}
          <div className='mb-4 shrink-0'>
            <div className='flex gap-2'>
              {insights.map((_, index) => (
                <div key={index} className='flex-1'>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className='aucctus-border-secondary h-1 w-full overflow-hidden rounded-full border-0 bg-gray-200 p-0 dark:bg-gray-700'
                    onClick={() => handleIndicatorClick(index)}
                    aria-label={`Go to insight ${index + 1}`}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        index === currentIndex
                          ? 'bg-primary-500'
                          : index < currentIndex
                            ? 'bg-primary-400'
                            : 'bg-transparent'
                      }`}
                      style={{
                        width:
                          index === currentIndex
                            ? `${progress}%`
                            : index < currentIndex
                              ? '100%'
                              : '0%',
                      }}
                    />
                  </motion.button>
                </div>
              ))}
            </div>
          </div>

          {/* Insight Card */}
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentInsight?.uuid}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className='aucctus-bg-primary aucctus-border-secondary/40 flex min-h-0 flex-1 overflow-hidden rounded-xl border shadow-sm'
            >
              <div className='h-full space-y-3 overflow-auto p-5'>
                {/* Header with badges */}
                <div className='flex items-start justify-between gap-2'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getSeverityColor(
                        currentInsight.severity,
                      )}`}
                    >
                      {toTitleCase(currentInsight.severity)}
                    </span>
                    <span className='aucctus-text-secondary rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium dark:bg-gray-800'>
                      {getInsightTypeDisplay(currentInsight.insightType)}
                    </span>
                  </div>
                  <span className='aucctus-text-tertiary shrink-0 text-xs'>
                    Priority: {currentInsight.priority}
                  </span>
                </div>

                {/* Title */}
                <h4 className='aucctus-text-primary aucctus-text-xl line-clamp-2 font-bold leading-snug'>
                  {currentInsight.title}
                </h4>

                {/* Description */}
                <p className='aucctus-text-secondary aucctus-text-sm line-clamp-4 leading-relaxed'>
                  {currentInsight.description}
                </p>

                {/* Metadata (if any relevant info) */}
                {currentInsight.metadata?.conceptCount && (
                  <div className='aucctus-text-tertiary flex items-center gap-1 text-xs'>
                    <Icon variant='layers' height={14} width={14} />
                    <span>
                      {currentInsight.metadata.conceptCount} concept
                      {currentInsight.metadata.conceptCount !== 1
                        ? 's'
                        : ''}{' '}
                      affected
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(PortfolioInsightsCarousel);
