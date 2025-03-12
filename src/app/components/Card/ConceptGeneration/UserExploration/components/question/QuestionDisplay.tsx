import React, { useRef } from 'react';
import { CompletionIcon } from './QuestionIcons';
import { useQuestionTransition } from '../../hooks/question-transition.hook';
import { useQuestionIconLine } from '../../hooks/question-icon-line.hook';
import CompletedQuestions from './CompletedQuestions';
import MultiSelectAnswers from '../answer/MultiSelectAnswers';
import TextAnswers from '../answer/TextAnswers';
import CurrentQuestion from './CurrentQuestion';
import { PointerEventMask } from '../util/PointerEventMask';

interface QuestionDisplayProps {}

/**
 * Main QuestionDisplay component
 * Orchestrates the display of questions and answers in the concept generation flow
 */
const QuestionDisplay: React.FC<QuestionDisplayProps> = () => {
  const {
    showMask,
    questionIconRef,
    questionLabelRef,
    nextCompletionIconRef,
    componentRef,
    answerRowRef,
    multiSelectAnswersRef,
  } = useQuestionTransition();

  const questionIconLineRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);

  // Use the custom hook to manage the question icon line
  useQuestionIconLine(
    questionIconRef as React.RefObject<HTMLDivElement>,
    questionIconLineRef,
    spacerRef,
  );

  return (
    <div
      ref={componentRef}
      className='relative flex flex-1 flex-col gap-4 transition-all duration-300 ease-in-out'
    >
      <CompletedQuestions />

      <div className='relative'>
        <span className='absolute opacity-0' ref={nextCompletionIconRef}>
          <CompletionIcon />
        </span>
      </div>

      <div ref={spacerRef} className='flex-1' />

      <CurrentQuestion
        questionIconRef={questionIconRef as React.RefObject<HTMLDivElement>}
        questionLabelRef={questionLabelRef}
      />

      <div className='relative transition-all duration-300 ease-in-out'>
        <MultiSelectAnswers answersRef={multiSelectAnswersRef} />

        <TextAnswers answerRowRef={answerRowRef} />
      </div>

      <div
        ref={questionIconLineRef}
        className='aucctus-border-primary absolute left-[1.4rem] top-[-18px] z-[1] h-10 w-10 border-l-[2px]'
      />

      <PointerEventMask showMask={showMask} />
    </div>
  );
};

export default QuestionDisplay;
