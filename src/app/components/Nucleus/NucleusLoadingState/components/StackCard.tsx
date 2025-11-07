import React from 'react';
import { animated, useSpring, easings } from 'react-spring';
import { cn } from '@libs/utils/react';
import LiveAnswerCard, { LiveAnswer } from './LiveAnswerCard';
import SkeletonBlock from '@components/Skeleton/ConceptReport/SkeletonBlock';

interface StackCardProps {
  stackIndex: number;
  cardIndex: number | undefined;
  side: 'left' | 'right';
  isGhost: boolean;
  liveAnswers: LiveAnswer[];
  shouldFadeOut?: boolean;
}

/**
 * Skeleton card component matching LiveAnswerCard structure
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
 * StackCard Component
 * Renders a card in the left or right stack with proper positioning and animation
 */
const StackCard: React.FC<StackCardProps> = ({
  stackIndex,
  cardIndex,
  side,
  isGhost,
  liveAnswers,
  shouldFadeOut = false,
}) => {
  const xOffset =
    side === 'left' ? -(138 + stackIndex * 80) : 138 + stackIndex * 80;

  // Calculate target opacity based on fade out state
  const baseOpacity = stackIndex === 0 ? 0.95 : 0.7;
  const targetOpacity = shouldFadeOut ? 0 : baseOpacity;

  const spring = useSpring({
    x: xOffset,
    y: -10,
    scale: stackIndex === 0 ? 0.8 : 0.6,
    opacity: targetOpacity,
    config: shouldFadeOut
      ? { duration: 400, easing: easings.easeInOutCubic } // Match center card leave duration
      : { duration: 0 }, // Snap back instantly when transition completes
  });

  return (
    <animated.div
      key={`${side}-${stackIndex}-${cardIndex}`}
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10 - stackIndex,
      }}
    >
      <animated.div style={spring}>
        {isGhost || cardIndex === undefined || !liveAnswers[cardIndex] ? (
          <SkeletonAnswerCard />
        ) : (
          <LiveAnswerCard answer={liveAnswers[cardIndex]!} />
        )}
      </animated.div>
    </animated.div>
  );
};

export default StackCard;
