import { useConceptIncubationStore } from '@stores/concept-incubation/enhancedStore';
import React, { useCallback, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { CompletionIcon } from './CompletionIcon';
import { ConceptIncubationQuestion } from '@libs/api/types';
import { useDispatchIncubationAnimation } from '../../hooks/incubation-animation-event.hook';

interface CompletionIconGroupProps {
  questionGroup: ConceptIncubationQuestion[];
}

const CompletionIconGroup: React.FC<CompletionIconGroupProps> = ({
  questionGroup,
}) => {
  const { currentQuestionOrder, setCurrentQuestionOrder } =
    useConceptIncubationStore();
  const componentRef = useRef<HTMLSpanElement>(null);
  const { dispatchAnimationEvent } = useDispatchIncubationAnimation();

  const isGroupCompleted = useMemo(() => {
    if (!currentQuestionOrder) return false;

    const highestOrder = Math.max(
      ...questionGroup.map((question) => question.order),
    );

    return highestOrder < Math.floor(currentQuestionOrder);
  }, [questionGroup, currentQuestionOrder]);

  const collapseAnimateProps = {
    animate: {
      marginTop: isGroupCompleted ? '-29px' : '5px',
    },
    transition: isGroupCompleted
      ? { type: 'spring' as const, stiffness: 100, damping: 12, mass: 0.5 }
      : { duration: 0 },
  };

  const fadeOutAnimateProps = {
    animate: {
      opacity: isGroupCompleted ? 0 : 1,
    },
    transition: { duration: 0.2 },
  };

  const isPartial = useCallback((question: ConceptIncubationQuestion) => {
    return !Number.isInteger(question.order);
  }, []);

  const getQuestionStyle = useCallback(
    (question: ConceptIncubationQuestion, index: number) => {
      const zIndex = 9 - index;

      if (isPartial(question)) {
        return { zIndex };
      }

      return {};
    },
    [isPartial],
  );

  const handleClickCompletionIcon = useCallback(
    (question: ConceptIncubationQuestion) => {
      dispatchAnimationEvent('fade', () => {
        setCurrentQuestionOrder(question.order);
      });
    },
    [dispatchAnimationEvent, setCurrentQuestionOrder],
  );

  if (!questionGroup || questionGroup.length === 0) return null;

  return (
    <span ref={componentRef} className='relative'>
      {questionGroup.map((question, index) => (
        <motion.span
          style={getQuestionStyle(question, index)}
          {...(index > 0 ? collapseAnimateProps : {})}
          className='relative flex flex-row items-center gap-2 ease-in-out'
          key={question.identifier}
        >
          <CompletionIcon
            onClick={() => handleClickCompletionIcon(question)}
            className='aucctus-bg-secondary-hover ml-2 h-8 w-8 cursor-pointer'
            iconClassName='z-[10] animate-fade-in opacity-0'
          />
          <motion.span
            {...(index > 0 ? fadeOutAnimateProps : {})}
            className='aucctus-completed-question-label aucctus-text-sm aucctus-text-primary'
          >
            {question.label}
          </motion.span>
        </motion.span>
      ))}
    </span>
  );
};

export default CompletionIconGroup;
