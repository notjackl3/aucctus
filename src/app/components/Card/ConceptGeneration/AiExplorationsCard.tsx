import React, { useMemo } from 'react';
import { cn } from '@libs/utils/react';
import images from '@assets/img';
import { Card } from '@components';
import { useFadeTransition } from './hooks/fade-transition.hook';
import AiSuggestions from './AiExploration/AiSuggestions';
import { useConceptIncubationStore } from '@stores/concept-incubation.store';

const animationStyles = `
  @keyframes moveBackground {
    0% {
      background-position: 0% 0%;
    }
    50% {
      background-position: 50% 0%;
    }
    100% {
      background-position: 0% 0%;
    }
  }
`;

const mainStyle = {
  backgroundImage: `url(${images.aiExplorationsBackground})`,
  backgroundSize: 'cover',
  animation: 'fadeIn 1s ease-in-out forwards, moveBackground 40s ease infinite',
  opacity: 0,
};

interface AiExplorationsCardProps {
  className?: string;
}

const AiExplorationsCard: React.FC<AiExplorationsCardProps> = ({
  className = '',
}) => {
  const { currentQuestionOrder } = useConceptIncubationStore();
  const isValidQuestionIndex = useMemo(
    () => currentQuestionOrder !== undefined,
    [currentQuestionOrder],
  );

  const { contentRef, stateValue: startedAiExploration } = useFadeTransition({
    currentValue: isValidQuestionIndex,
  });

  const renderActiveCard = React.useCallback(() => {
    if (startedAiExploration) {
      return <AiSuggestions />;
    }

    return <Card.IntroducingAucctusCard />;
  }, [startedAiExploration]);

  return (
    <>
      <style>{animationStyles}</style>
      <div
        className={cn('flex flex-col rounded-xl', className)}
        style={mainStyle}
      >
        <div ref={contentRef} className='flex h-full w-full flex-col'>
          {renderActiveCard()}
        </div>
      </div>
    </>
  );
};

export default AiExplorationsCard;
