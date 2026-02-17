/**
 * QuotesCarouselWidget - Single-quote carousel with auto-play
 *
 * Displays customer quotes one at a time with smooth transitions,
 * auto-play support, and navigation controls.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';
import { GlassSurface, Icon } from '@components';
import { cn } from '@libs/utils/react';

/** Quote structure */
export interface PersonaQuote {
  uuid: string;
  text: string;
  context: string; // e.g., "On financial priorities"
}

/** Props for the QuotesCarouselWidget component */
export interface QuotesCarouselWidgetProps {
  /** Quotes data */
  quotes: PersonaQuote[];
  /** Enable auto-play (default: true) */
  autoPlay?: boolean;
  /** Auto-play interval in ms (default: 8000) */
  autoPlayInterval?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * QuotesCarouselWidget Component
 *
 * Single-quote carousel that shows one quote at a time with:
 * - Auto-play with configurable interval
 * - Dot indicators for navigation
 * - Previous/next buttons
 * - Smooth slide transitions
 */
const QuotesCarouselWidget: React.FC<QuotesCarouselWidgetProps> = ({
  quotes,
  autoPlay = true,
  autoPlayInterval = 8000,
  className,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play effect
  useEffect(() => {
    if (!autoPlay || quotes.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % quotes.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, quotes.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % quotes.length);
  }, [quotes.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + quotes.length) % quotes.length);
  }, [quotes.length]);

  const goToIndex = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Don't render if no quotes
  if (!quotes.length) return null;

  return (
    <GlassSurface
      className={cn('relative min-h-[140px] overflow-hidden', className)}
    >
      {/* Content */}
      <div className='relative z-10 flex flex-col px-8 py-5'>
        {/* Section header */}
        <div className='mb-3 flex items-center gap-2'>
          <Icon
            variant='annotation-dots'
            className='aucctus-text-brand-primary h-4 w-4'
          />
          <h3 className='aucctus-text-xs-bold aucctus-text-tertiary uppercase tracking-wider'>
            What They Say
          </h3>
        </div>

        {/* Quotes carousel */}
        <div className='relative'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <blockquote>
                <p className='aucctus-text-primary text-xl font-medium leading-snug tracking-tight md:text-2xl lg:text-[1.75rem]'>
                  &ldquo;{quotes[currentIndex].text}&rdquo;
                </p>
                {quotes[currentIndex].context && (
                  <p className='aucctus-text-tertiary mt-3 text-sm font-light'>
                    — {quotes[currentIndex].context}
                  </p>
                )}
              </blockquote>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        {quotes.length > 1 && (
          <div className='aucctus-border-primary mt-4 flex items-center justify-between border-t pt-3'>
            {/* Dot indicators */}
            <div className='flex items-center gap-2'>
              {quotes.map((_, idx) => (
                <motion.button
                  key={idx}
                  type='button'
                  aria-label={`Go to quote ${idx + 1}`}
                  onClick={() => goToIndex(idx)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    idx === currentIndex
                      ? 'w-6 bg-primary-600'
                      : 'w-2 bg-primary-200 hover:bg-primary-300',
                  )}
                />
              ))}
            </div>

            {/* Arrow buttons */}
            <div className='flex items-center gap-2'>
              <motion.button
                type='button'
                aria-label='Previous quote'
                onClick={goToPrev}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className='aucctus-border-primary aucctus-text-secondary hover:aucctus-text-primary hover:aucctus-bg-secondary flex h-8 w-8 items-center justify-center rounded-full border transition-colors'
              >
                <ChevronLeft className='h-4 w-4' />
              </motion.button>
              <motion.button
                type='button'
                aria-label='Next quote'
                onClick={goToNext}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className='aucctus-border-primary aucctus-text-secondary hover:aucctus-text-primary hover:aucctus-bg-secondary flex h-8 w-8 items-center justify-center rounded-full border transition-colors'
              >
                <ChevronRight className='h-4 w-4' />
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </GlassSurface>
  );
};

export default QuotesCarouselWidget;
