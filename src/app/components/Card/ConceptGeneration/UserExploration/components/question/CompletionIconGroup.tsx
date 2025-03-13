import React, { useCallback, useMemo, useRef } from 'react';
import { CompletionIcon } from './CompletionIcon';
import { ConceptIgnitionQuestion } from '@libs/api/types';
import { useConceptIncubationStore } from '@stores/concept-incubation.store';
import { useSpring, animated } from 'react-spring';

interface CompletionIconGroupProps {
  questionGroup: ConceptIgnitionQuestion[];
}

const CompletionIconGroup: React.FC<CompletionIconGroupProps> = ({
  questionGroup,
}) => {
  const { currentQuestionOrder } = useConceptIncubationStore();
  const componentRef = useRef<HTMLSpanElement>(null);

  const isGroupCompleted = useMemo(() => {
    if (!currentQuestionOrder) return false;

    const highestOrder = Math.max(
      ...questionGroup.map((question) => question.order),
    );

    return highestOrder < Math.floor(currentQuestionOrder);
  }, [questionGroup, currentQuestionOrder]);

  const fadeAnimation = useSpring({
    marginTop: isGroupCompleted ? '-30px' : '5px',
    config: isGroupCompleted
      ? { tension: 100, friction: 12, mass: 0.5 }
      : { duration: 0 },
  });

  const labelAnimation = useSpring({
    opacity: isGroupCompleted ? 0 : 1,
    config: { duration: 200 },
  });

  const isPartial = useCallback((question: ConceptIgnitionQuestion) => {
    return !Number.isInteger(question.order);
  }, []);

  const getQuestionStyle = useCallback(
    (question: ConceptIgnitionQuestion, index: number) => {
      const zIndex = 9 - index;

      if (isPartial(question)) {
        return { zIndex };
      }

      return {};
    },
    [isPartial],
  );

  if (!questionGroup || questionGroup.length === 0) return null;

  return (
    <span ref={componentRef} className='relative'>
      {questionGroup.map((question, index) => (
        <animated.span
          style={{
            ...getQuestionStyle(question, index),
            ...(index > 0 ? fadeAnimation : {}),
          }}
          className='relative flex flex-row items-center gap-2 ease-in-out'
          key={question.identifier}
        >
          <CompletionIcon className='z-[10] animate-fade-in opacity-0' />
          <animated.span
            style={index > 0 ? labelAnimation : {}}
            className='aucctus-completed-question-label aucctus-text-sm aucctus-text-primary'
          >
            {question.label}
          </animated.span>
        </animated.span>
      ))}
    </span>
  );
};

export default CompletionIconGroup;
