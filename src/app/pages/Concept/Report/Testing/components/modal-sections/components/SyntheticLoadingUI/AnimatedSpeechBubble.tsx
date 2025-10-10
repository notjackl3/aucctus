import { cn } from '@libs/utils/react';
import React, { useEffect, useState } from 'react';
import { animated, useSpring } from 'react-spring';

interface AnimatedSpeechBubbleProps {
  quote: string;
  position: 'top' | 'bottom';
}

export const AnimatedSpeechBubble: React.FC<AnimatedSpeechBubbleProps> = ({
  quote,
  position,
}) => {
  const [displayQuote, setDisplayQuote] = useState(quote);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [shouldFadeOut, setShouldFadeOut] = useState(false);

  // Main bubble animation with fade-in, fade-out, and scale
  // Note: Must include translateX(-50%) to maintain horizontal centering since inline transform overrides CSS
  const bubbleSpring = useSpring({
    opacity: shouldFadeOut ? 0 : 1,
    transform: shouldFadeOut
      ? 'translateX(-50%) scale(0.95) translateY(-5px)'
      : 'translateX(-50%) scale(1) translateY(0px)',
    config: {
      tension: 200,
      friction: 25,
    },
    from: {
      opacity: 0,
      transform: 'translateX(-50%) scale(0.95) translateY(-5px)',
    },
  });

  // Quote text transition for smooth quote changes
  const textSpring = useSpring({
    opacity: isTransitioning ? 0 : 1,
    transform: isTransitioning ? 'translateY(-5px)' : 'translateY(0px)',
    config: {
      tension: 300,
      friction: 30,
    },
  });

  // Handle quote transitions
  useEffect(() => {
    if (quote !== displayQuote) {
      // New quote arrived - reset fade-out and start text transition
      setIsVisible(true);
      setShouldFadeOut(false);
      setIsTransitioning(true);

      // After transition completes, update quote and fade in
      const timer = setTimeout(() => {
        setDisplayQuote(quote);
        setIsTransitioning(false);
      }, 200); // Quick transition for text

      return () => clearTimeout(timer);
    }
  }, [quote, displayQuote]);

  // Auto-hide after 15 seconds of no new quotes
  useEffect(() => {
    // Reset visibility when new quote comes in
    setIsVisible(true);
    setShouldFadeOut(false);

    // Set timer to start fade-out animation after 14.5 seconds
    const fadeTimer = setTimeout(() => {
      setShouldFadeOut(true);
    }, 14500);

    // Set timer to fully unmount after 15 seconds (gives 500ms for animation)
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 15000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [quote]);

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  return (
    <animated.div
      style={bubbleSpring}
      className={cn(
        'pointer-events-none absolute left-1/2 z-20 w-56',
        position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
      )}
    >
      <div className='aucctus-bg-primary aucctus-border-secondary relative rounded-xl border-2 p-3 shadow-xl'>
        <animated.p
          style={textSpring}
          className='aucctus-text-primary aucctus-text-xs text-center leading-relaxed'
        >
          &ldquo;{displayQuote}&rdquo;
        </animated.p>
        {/* Speech bubble tail */}
        <div
          className={cn(
            'absolute left-1/2 -translate-x-1/2',
            position === 'top' ? '-bottom-2' : '-top-2',
          )}
        >
          {/* Outer border triangle - use theme border color */}
          <div
            className={cn(
              'h-0 w-0',
              position === 'top'
                ? 'border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-transparent'
                : 'border-b-[8px] border-l-[8px] border-r-[8px] border-b-transparent border-l-transparent border-r-transparent',
            )}
            style={{
              borderTopColor: position === 'top' ? '#EBE9E9' : undefined,
              borderBottomColor: position === 'bottom' ? '#EBE9E9' : undefined,
            }}
          />
          {/* Inner background triangle - matches card background */}
          <div
            className={cn(
              'absolute left-1/2 h-0 w-0 -translate-x-1/2',
              position === 'top'
                ? 'top-[-1px] border-l-[7px] border-r-[7px] border-t-[7px] border-l-transparent border-r-transparent border-t-transparent'
                : 'bottom-[-1px] border-b-[7px] border-l-[7px] border-r-[7px] border-b-transparent border-l-transparent border-r-transparent',
            )}
            style={{
              borderTopColor: position === 'top' ? 'white' : undefined,
              borderBottomColor: position === 'bottom' ? 'white' : undefined,
            }}
          />
        </div>
      </div>
    </animated.div>
  );
};
