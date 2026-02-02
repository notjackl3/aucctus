/**
 * Portfolio Insights Feed
 *
 * Auto-rotating carousel of portfolio insights with progress indicators.
 * Pauses on hover for better UX. Displays real AI-generated insights from
 * bulk priority calculation.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Icon } from '@components';
import {
  IPortfolioSummaryResponse,
  ITopPrioritySummary,
} from '@libs/api/types/concept/concept_priority';

interface PortfolioInsightsFeedProps {
  portfolioSummary: IPortfolioSummaryResponse;
}

// Internal insight type for display
interface DisplayInsight {
  id: string;
  headline: string;
  context: string;
  soWhat: string;
}

const CARD_DURATION = 5000; // 5 seconds per card
const PROGRESS_INTERVAL = 50; // Update progress every 50ms

const PortfolioInsightsFeed: React.FC<PortfolioInsightsFeedProps> = ({
  portfolioSummary,
}) => {
  // Transform portfolio summary into display insights
  const insights = useMemo<DisplayInsight[]>(() => {
    const result: DisplayInsight[] = [];

    // Main executive insight
    if (portfolioSummary.executiveInsight) {
      result.push({
        id: 'executive',
        headline: 'Executive Insight',
        context: portfolioSummary.executiveInsight,
        soWhat: portfolioSummary.keyRecommendation,
      });
    }

    // Portfolio health insight
    const healthLabels = {
      strong: 'Strong Portfolio Health',
      balanced: 'Balanced Portfolio',
      needs_attention: 'Portfolio Needs Attention',
    };
    result.push({
      id: 'health',
      headline: healthLabels[portfolioSummary.portfolioHealth],
      context: `Analyzed ${portfolioSummary.totalAnalyzed} concepts with an average score of ${portfolioSummary.averageScore.toFixed(1)}. ${portfolioSummary.highPriorityCount} high-priority concepts identified.`,
      soWhat: portfolioSummary.keyRecommendation,
    });

    // Top priorities as insights
    portfolioSummary.topPriorities.forEach(
      (priority: ITopPrioritySummary, index: number) => {
        result.push({
          id: `priority-${index}`,
          headline: priority.title,
          context: `Priority Score: ${priority.overallScore.toFixed(1)}`,
          soWhat: priority.keyStrength,
        });
      },
    );

    return result;
  }, [portfolioSummary]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-progression logic
  useEffect(() => {
    if (!isAutoPlaying) return;

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
  }, [isAutoPlaying, currentIndex, insights.length]);

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

  const currentInsight = useMemo(
    () => insights[currentIndex] || insights[0],
    [insights, currentIndex],
  );

  if (insights.length === 0 || !currentInsight) {
    return null;
  }

  return (
    <div className='aucctus-bg-primary aucctus-border-secondary flex h-[360px] flex-col overflow-hidden rounded-lg border shadow-sm'>
      <div className='aucctus-bg-secondary/30 flex min-h-0 flex-1 flex-col p-4'>
        {/* Header */}
        <div className='mb-4 flex shrink-0 items-center gap-2'>
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
                  <button
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
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Insight Card */}
          <div className='aucctus-bg-primary aucctus-border-secondary/40 flex min-h-0 flex-1 overflow-hidden rounded-xl border shadow-sm'>
            <div className='h-full space-y-3 overflow-auto p-5'>
              {/* Headline */}
              <h4 className='aucctus-text-primary aucctus-text-xl line-clamp-2 font-bold leading-snug'>
                {currentInsight.headline}
              </h4>

              {/* Context */}
              <p className='aucctus-text-secondary aucctus-text-sm line-clamp-2 leading-relaxed'>
                {currentInsight.context}
              </p>

              {/* So What Box */}
              <div className='rounded-r-lg border-l-4 border-primary-500 bg-primary-50 p-3 dark:bg-primary-900/20'>
                <div className='aucctus-text-brand-primary mb-1 text-xs font-semibold uppercase'>
                  SO WHAT
                </div>
                <p className='aucctus-text-primary aucctus-text-sm line-clamp-3 leading-relaxed'>
                  {currentInsight.soWhat}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(PortfolioInsightsFeed);
