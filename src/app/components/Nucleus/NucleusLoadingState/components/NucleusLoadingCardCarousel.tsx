import React, { useState, useRef } from 'react';
import { animated, useTransition, easings } from 'react-spring';
import { cn } from '@libs/utils/react';
import StackCard from './StackCard';
import LiveAnswerCard, { LiveAnswer } from './LiveAnswerCard';
import SkeletonBlock from '@components/Skeleton/ConceptReport/SkeletonBlock';

interface NucleusLoadingCardCarouselProps {
  liveAnswers: LiveAnswer[];
  centerCard: number;
  leftCards: number[];
  rightCards: number[];
  exitDirection: 'left' | 'right';
}

/**
 * Skeleton card component for center card
 */
const SkeletonAnswerCard: React.FC = () => (
  <div
    className={cn(
      'w-[221px] rounded-lg px-3 py-2.5',
      'aucctus-bg-primary-alt aucctus-border-secondary border bg-opacity-90',
      'shadow-sm backdrop-blur-sm',
    )}
  >
    <div className='mb-2 flex-1'>
      <SkeletonBlock className='mb-1.5 h-2.5 animate-pulse' />
      <SkeletonBlock className='h-2.5 w-4/5 animate-pulse' />
    </div>
  </div>
);

/**
 * NucleusLoadingCardCarousel Component
 * Displays an animated carousel of live research answers with center focus and side stacks
 */
const NucleusLoadingCardCarousel: React.FC<NucleusLoadingCardCarouselProps> = ({
  liveAnswers,
  centerCard,
  leftCards,
  rightCards,
  exitDirection,
}) => {
  // Track transition state to coordinate stack card fade out
  const [isTransitioning, setIsTransitioning] = useState(false);
  const currentExitDirection = useRef(exitDirection);

  // Use transition for center card to handle enter/exit animations with keys
  const centerTransitions = useTransition(centerCard, {
    from: {
      x: 0,
      y: 30,
      scale: 0.85,
      opacity: 0,
    },
    enter: {
      x: 0,
      y: -10,
      scale: 1,
      opacity: 1,
    },
    leave: {
      // Exit to the exact position and appearance of the first stack card
      x: exitDirection === 'left' ? -138 : 138,
      y: -10,
      scale: 0.8,
      opacity: 0.95, // Match the first stack card opacity instead of fading to 0
    },
    config: (item, index, state) => {
      // Use spring physics for enter, smoother/faster duration for exit
      return state === 'leave'
        ? { duration: 400, easing: easings.easeInOutCubic } // Faster to sync with stack card appearance
        : { tension: 170, friction: 26, mass: 1 };
    },
    keys: centerCard,
    onStart: () => {
      // When leave animation starts, trigger stack card fade out
      currentExitDirection.current = exitDirection;
      setIsTransitioning(true);
    },
    onRest: () => {
      // When animations complete, snap opacity back
      setIsTransitioning(false);
    },
  });

  return (
    <div className='relative mb-8 flex h-20 w-full max-w-4xl items-center justify-center'>
      <div className='relative flex h-full w-full items-center justify-center'>
        {/* Left cards stack (2 cards) */}
        {[0, 1].map((stackIndex) => {
          const cardIndex = leftCards[stackIndex];
          const isGhost =
            stackIndex === 1 ||
            cardIndex === undefined ||
            !liveAnswers?.length ||
            cardIndex >= liveAnswers.length;

          // First stack card should fade out when center card is transitioning to this side
          const shouldFadeOut =
            isTransitioning &&
            stackIndex === 0 &&
            currentExitDirection.current === 'left';

          return (
            <StackCard
              key={`left-${stackIndex}-${cardIndex}`}
              stackIndex={stackIndex}
              cardIndex={cardIndex}
              side='left'
              isGhost={isGhost}
              liveAnswers={liveAnswers}
              shouldFadeOut={shouldFadeOut}
            />
          );
        })}

        {/* Right cards stack (2 cards) */}
        {[0, 1].map((stackIndex) => {
          const cardIndex = rightCards[stackIndex];
          const isGhost =
            stackIndex === 1 ||
            cardIndex === undefined ||
            !liveAnswers?.length ||
            !liveAnswers[cardIndex] ||
            cardIndex >= liveAnswers.length;

          // First stack card should fade out when center card is transitioning to this side
          const shouldFadeOut =
            isTransitioning &&
            stackIndex === 0 &&
            currentExitDirection.current === 'right';

          return (
            <StackCard
              key={`right-${stackIndex}-${cardIndex}`}
              stackIndex={stackIndex}
              cardIndex={cardIndex}
              side='right'
              isGhost={isGhost}
              liveAnswers={liveAnswers}
              shouldFadeOut={shouldFadeOut}
            />
          );
        })}

        {/* Center card with enter/exit animations */}
        {centerTransitions((style, item) => (
          <animated.div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 20,
            }}
          >
            <animated.div style={style}>
              {liveAnswers.length === 0 ||
              item >= liveAnswers.length ||
              !liveAnswers[item] ? (
                <SkeletonAnswerCard />
              ) : (
                <LiveAnswerCard answer={liveAnswers[item]!} />
              )}
            </animated.div>
          </animated.div>
        ))}
      </div>
    </div>
  );
};

export default NucleusLoadingCardCarousel;
