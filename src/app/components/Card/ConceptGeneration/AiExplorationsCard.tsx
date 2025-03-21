import images from '@assets/img';
import { Card } from '@components';
import { cn } from '@libs/utils/react';
import { useConceptIncubationStore } from '@stores/concept-incubation.store';
import React, { useMemo } from 'react';
import AiSuggestions from './AiExploration/AiSuggestions';
import { useFadeTransition } from './hooks/fade-transition.hook';
import { animationStyles } from './UserExploration/components/util/animation-keyframes';
import LoadingIcon from './Generation/LoadingIcon';

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
  const { activeGeneratedConcept, currentQuestionOrder } =
    useConceptIncubationStore();
  const { activeQuestion, activeClarifyingQuestion } =
    useConceptIncubationStore();
  const isValidQuestionIndex = useMemo(
    () => !!currentQuestionOrder,
    [currentQuestionOrder],
  );
  const question = activeClarifyingQuestion
    ? activeClarifyingQuestion.question
    : activeQuestion;

  const { contentRef, stateValue: startedAiExploration } = useFadeTransition({
    currentValue: !!question || isValidQuestionIndex,
  });

  const renderActiveCard = React.useCallback(() => {
    if (activeGeneratedConcept?.isGenerating) {
      return (
        <div className='relative flex h-full w-full animate-fade-in flex-col items-center justify-center gap-4 pb-4'>
          <LoadingIcon />
          <span className='aucctus-text-white aucctus-text-md-semibold absolute mt-24 animate-fade-oscillation'>
            Generating report...
          </span>
        </div>
      );
    }

    if (startedAiExploration) {
      return <AiSuggestions key='suggestions' />;
    }

    return <Card.IntroducingAucctusCard key='intro' />;
  }, [startedAiExploration, activeGeneratedConcept?.isGenerating]);

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
