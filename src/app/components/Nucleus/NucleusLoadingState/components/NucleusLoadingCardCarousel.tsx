import React, { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@libs/utils/react';
import StackCard from './StackCard';
import LiveAnswerCard, { LiveAnswer } from './LiveAnswerCard';
import SkeletonBlock from '@components/Skeleton/ConceptReport/SkeletonBlock';

const STACK_SYNC_EXIT_DURATION = 0.4;
const STACK_SYNC_EASE: [number, number, number, number] = [0.65, 0, 0.35, 1];

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
        <AnimatePresence
          onExitComplete={() => {
            setIsTransitioning(false);
          }}
        >
          <motion.div
            key={centerCard}
            initial={{
              x: 0,
              y: 30,
              scale: 0.85,
              opacity: 0,
            }}
            animate={{
              x: 0,
              y: -10,
              scale: 1,
              opacity: 1,
            }}
            exit={{
              x: exitDirection === 'left' ? -138 : 138,
              y: -10,
              scale: 0.8,
              opacity: 0.95,
              transition: {
                duration: STACK_SYNC_EXIT_DURATION,
                ease: STACK_SYNC_EASE,
              },
            }}
            transition={{
              type: 'spring',
              stiffness: 170,
              damping: 26,
              mass: 1,
            }}
            onAnimationStart={(definition) => {
              // When the exit animation starts, trigger stack card fade out
              // In framer-motion, we detect exit by checking if the animation target
              // matches exit values (non-zero x)
              if (
                typeof definition === 'object' &&
                definition !== null &&
                'x' in definition &&
                (definition as { x: number }).x !== 0
              ) {
                currentExitDirection.current = exitDirection;
                setIsTransitioning(true);
              }
            }}
            transformTemplate={(_props, generated) =>
              `translate(-50%, -50%) ${generated}`
            }
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              zIndex: 20,
            }}
          >
            {liveAnswers.length === 0 ||
            centerCard >= liveAnswers.length ||
            !liveAnswers[centerCard] ? (
              <SkeletonAnswerCard />
            ) : (
              <LiveAnswerCard answer={liveAnswers[centerCard]!} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NucleusLoadingCardCarousel;
