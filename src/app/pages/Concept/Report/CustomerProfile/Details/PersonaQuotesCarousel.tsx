import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ICustomerQuote } from '@libs/api/types';

interface PersonaQuotesCarouselProps {
  quotes: ICustomerQuote[];
  profileId: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

const PersonaQuotesCarousel: React.FC<PersonaQuotesCarouselProps> = ({
  quotes,
  profileId,
  autoPlay = true,
  autoPlayInterval = 8000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [profileId]);

  useEffect(() => {
    if (!autoPlay || quotes.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % quotes.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, quotes.length]);

  const goToNext = () => setCurrentIndex((prev) => (prev + 1) % quotes.length);
  const goToPrev = () =>
    setCurrentIndex((prev) => (prev - 1 + quotes.length) % quotes.length);

  if (!quotes.length) return null;

  return (
    <div className='aucctus-border-secondary/40 relative overflow-hidden rounded-xl border'>
      {/* Glass background */}
      <div className='from-[var(--aucctus-bg-primary)]/70 via-[var(--aucctus-bg-secondary)]/30 to-[var(--aucctus-bg-primary)]/50 absolute inset-0 bg-gradient-to-br backdrop-blur-xl' />
      <div className='from-indigo-500/4 to-indigo-500/2 absolute inset-0 bg-gradient-to-tr via-transparent' />

      {/* Glass border */}
      <div className='absolute inset-0 rounded-xl border border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]' />

      {/* Content */}
      <div className='relative z-10 flex flex-col px-8 py-5'>
        {/* Quotes carousel — grid stack keeps height of tallest quote */}
        <div className='grid'>
          {quotes.map((q, idx) => (
            <motion.div
              key={idx}
              className='col-start-1 row-start-1'
              initial={false}
              animate={{
                opacity: idx === currentIndex ? 1 : 0,
              }}
              transition={{
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              aria-hidden={idx !== currentIndex}
            >
              <blockquote>
                <p className='aucctus-text-primary text-xl font-medium leading-snug tracking-tight md:text-2xl lg:text-[1.75rem]'>
                  &ldquo;{q.text}&rdquo;
                </p>
                {q.context && (
                  <p className='aucctus-text-secondary mt-3 text-sm font-light'>
                    &mdash; {q.context}
                  </p>
                )}
              </blockquote>
            </motion.div>
          ))}
        </div>

        {/* Navigation */}
        {quotes.length > 1 && (
          <div className='flex items-center justify-between pt-3'>
            <div className='flex items-center gap-1.5'>
              {quotes.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? 'aucctus-text-primary w-6 bg-current opacity-40'
                      : 'aucctus-text-secondary w-1.5 bg-current opacity-20 hover:opacity-40'
                  }`}
                />
              ))}
            </div>
            <div className='flex items-center gap-2'>
              <button
                onClick={goToPrev}
                className='aucctus-border-secondary/60 aucctus-text-secondary hover:aucctus-text-primary flex h-8 w-8 items-center justify-center rounded-full border transition-colors'
              >
                <ChevronLeft className='h-4 w-4' />
              </button>
              <button
                onClick={goToNext}
                className='aucctus-border-secondary/60 aucctus-text-secondary hover:aucctus-text-primary flex h-8 w-8 items-center justify-center rounded-full border transition-colors'
              >
                <ChevronRight className='h-4 w-4' />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(PersonaQuotesCarousel);
