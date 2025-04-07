import { Icon } from '@components';
import { IncubationAnswer } from '@libs/api/concepts';
import {
  ConceptIncubationQuestion,
  IClarifyingQuestion,
} from '@libs/api/types';
import { animated } from '@react-spring/web';
import React, { useCallback } from 'react';
import { boxShadowStyle } from '../../../../../Icon/QuestionIcon';
import { CompletionIcon } from '../question/CompletionIcon';
import { useContinueRefiningAnimations } from './continue-refining-animation.hook';

interface ContinueRefiningIconProps {
  iconRef: React.RefObject<HTMLSpanElement>;
}

const ContinueRefiningIcon: React.FC<ContinueRefiningIconProps> = ({
  iconRef,
}) => {
  return (
    <span className='relative' ref={iconRef}>
      <CompletionIcon
        variant='compass-03'
        className='aucctus-bg-primary ml-1 h-10 w-10'
      />
    </span>
  );
};

interface ContinueRefiningProps {
  iconRef: React.RefObject<HTMLSpanElement>;
  clarifyingQuestions: IClarifyingQuestion[];
  submittedAnswers: IncubationAnswer[];
  onMouseEnter?: () => void;
  selectClarifyingQuestion: (question: IClarifyingQuestion) => void;
}

const ContinueRefining: React.FC<ContinueRefiningProps> = ({
  iconRef,
  clarifyingQuestions,
  submittedAnswers,
  onMouseEnter,
  selectClarifyingQuestion,
}) => {
  const { iconAnimation, labelAnimation, cardAnimation } =
    useContinueRefiningAnimations();

  const hasClarifyingAnswer = useCallback(
    (question: ConceptIncubationQuestion) => {
      return submittedAnswers.some(
        (answer) => answer.question.id === question.id,
      );
    },
    [submittedAnswers],
  );

  return (
    <span onMouseEnter={onMouseEnter} className='z-[999] flex flex-col gap-4'>
      <animated.span
        style={iconAnimation}
        className='flex flex-row items-center gap-2'
      >
        <ContinueRefiningIcon iconRef={iconRef} />
        <animated.span style={labelAnimation} className='aucctus-text-primary'>
          {'Or, answer these questions to help refine even further'}
        </animated.span>
      </animated.span>
      <animated.span
        style={cardAnimation}
        className='no-scrollbar flex flex-col gap-2'
      >
        {clarifyingQuestions.map((question: IClarifyingQuestion) => (
          <div
            key={question.uuid}
            onClick={() => selectClarifyingQuestion(question)}
            className='aucctus-bg-primary-hover aucctus-border-primary flex w-full cursor-pointer flex-row gap-2 rounded-xl border-2 p-4'
          >
            <span
              style={boxShadowStyle}
              className='aucctus-bg-primary aucctus-border-secondary mr-2 flex h-8 w-8 items-center justify-center self-center justify-self-center rounded-lg border-2'
            >
              <Icon
                variant={(question.icon as IconVariant) || 'help'}
                height={16}
                width={16}
              />
            </span>
            <div className='flex flex-col'>
              <span className='aucctus-text-secondary aucctus-text-md-medium'>
                {question.title}
              </span>
              <span className='aucctus-text-secondary aucctus-text-xs'>
                {question.question.label}
              </span>
            </div>
            <span className='flex-1' />
            {hasClarifyingAnswer(question.question) && (
              <CompletionIcon className='aucctus-bg-secondary self-center justify-self-center stroke-success-800' />
            )}
          </div>
        ))}
      </animated.span>
    </span>
  );
};

export default ContinueRefining;
