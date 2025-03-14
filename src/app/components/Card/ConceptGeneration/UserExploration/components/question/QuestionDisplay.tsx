import React, { useCallback, useMemo, useRef } from 'react';
import { CompletionIcon } from './CompletionIcon';
import { useQuestionTransition } from '../../hooks/question-transition.hook';
import { useQuestionIconLine } from '../../hooks/question-icon-line.hook';
import CompletedQuestions from './CompletedQuestions';
import MultiSelectAnswers from '../answer/MultiSelectAnswers';
import TextAnswers from '../answer/TextAnswers';
import CurrentQuestion from './CurrentQuestion';
import { PointerEventMask } from '../util/PointerEventMask';
import { useConceptIncubationStore } from '@stores/concept-incubation.store';
import ReadyToGenerate from '../ready-to-generate/ReadyToGenerate';
import ContinueRefining from '../continue-refining/ContinueRefining';
import { animated, useTransition } from 'react-spring';
import { cn } from '@libs/utils/react';

interface QuestionDisplayProps {}

/**
 * Main QuestionDisplay component
 * Orchestrates the display of questions and answers in the concept generation flow
 */
const QuestionDisplay: React.FC<QuestionDisplayProps> = () => {
  const questionIconLineRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);

  const {
    showMask,
    questionIconRef,
    questionLabelRef,
    nextCompletionIconRef,
    componentRef,
    answerRowRef,
    multiSelectAnswersRef,
  } = useQuestionTransition();

  const {
    currentQuestionOrder,
    submittedAnswers,
    activeQuestion,
    getPreviousQuestion,
  } = useConceptIncubationStore();

  useQuestionIconLine(
    questionIconRef,
    questionIconLineRef,
    spacerRef,
    currentQuestionOrder ?? 0,
  );

  const previousQuestion = useMemo(
    () => getPreviousQuestion(submittedAnswers),
    [getPreviousQuestion, submittedAnswers],
  );

  const nextCompletionIconStyle = useMemo(() => {
    if (
      Math.floor(previousQuestion?.order ?? 0) ===
      Math.floor(currentQuestionOrder ?? 0)
    ) {
      return { marginTop: '-10px' };
    }
    return {};
  }, [previousQuestion, currentQuestionOrder]);

  const renderQuestion = useCallback(() => {
    return (
      <span className='flex flex-col gap-4'>
        <CurrentQuestion
          questionIconRef={questionIconRef}
          questionLabelRef={questionLabelRef}
        />

        <div className='relative transition-all duration-300 ease-in-out'>
          <MultiSelectAnswers answersRef={multiSelectAnswersRef} />
          <TextAnswers answerRowRef={answerRowRef} />
        </div>
      </span>
    );
  }, [questionIconRef, questionLabelRef, multiSelectAnswersRef, answerRowRef]);

  const renderNextCompletionIcon = useCallback(
    () => (
      <div
        className={cn('relative', {
          'mt-4': !!previousQuestion,
        })}
      >
        <span
          style={nextCompletionIconStyle}
          className='absolute opacity-0'
          ref={nextCompletionIconRef}
        >
          <CompletionIcon />
        </span>
      </div>
    ),
    [nextCompletionIconRef, nextCompletionIconStyle, previousQuestion],
  );

  const renderQuestionIconLine = useCallback(
    () => (
      <div
        ref={questionIconLineRef}
        className='aucctus-border-primary absolute left-[1.4rem] top-[-25px] z-[1] h-10 w-10 border-l-[2px]'
      />
    ),
    [questionIconLineRef],
  );

  // Add transition for CompletedQuestions
  const completedQuestionsTransition = useTransition(
    previousQuestion && currentQuestionOrder !== Infinity,
    {
      from: { opacity: 1, maxHeight: '500px' },
      enter: { opacity: 1, maxHeight: '500px' },
      leave: { opacity: 0, maxHeight: '0px', delay: 500 },
      config: { tension: 100, friction: 12, mass: 0.5 },
    },
  );

  return (
    <div
      ref={componentRef}
      className='relative z-[999] flex flex-1 flex-col transition-all duration-300 ease-in-out'
    >
      {completedQuestionsTransition(
        (style, item) =>
          item && (
            <animated.span
              style={style}
              className='z-[99] flex flex-col gap-4 overflow-hidden'
            >
              <CompletedQuestions />
            </animated.span>
          ),
      )}

      {activeQuestion && renderNextCompletionIcon()}
      {!activeQuestion && <ReadyToGenerate />}

      <div ref={spacerRef} className='flex-1' />

      {!activeQuestion && <ContinueRefining iconRef={questionIconRef} />}

      {activeQuestion && renderQuestion()}

      {renderQuestionIconLine()}

      <PointerEventMask showMask={showMask} />
    </div>
  );
};

export default QuestionDisplay;
