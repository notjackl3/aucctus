import React, { forwardRef, useMemo } from 'react';
import MultiSelectAnswers from '../answer/MultiSelectAnswers';
import TextAnswers from '../answer/TextAnswers';
import CurrentQuestion from './CurrentQuestion';
import { ConceptIncubationQuestion } from '@libs/api/types';

interface QuestionProps {
  question: ConceptIncubationQuestion;
  icon?: string;
  questionIconRef: React.RefObject<HTMLSpanElement>;
  questionLabelRef: React.RefObject<HTMLSpanElement>;
  multiSelectAnswersRef: React.RefObject<HTMLDivElement>;
  answerRowRef: React.RefObject<HTMLDivElement>;
}

/**
 * Question component that displays a question and its answer options
 */
const Question = forwardRef<HTMLSpanElement, QuestionProps>(
  (
    {
      question,
      icon,
      questionIconRef,
      questionLabelRef,
      multiSelectAnswersRef,
      answerRowRef,
    },
    ref,
  ) => {
    const questionIcon = useMemo(() => {
      if (icon) {
        return (icon as string) || 'help-circle';
      }

      return undefined;
    }, [icon]);

    return (
      <span
        ref={ref}
        className='flex flex-col gap-4 transition-all duration-[500ms] ease-in-out'
      >
        <CurrentQuestion
          questionIconRef={questionIconRef}
          questionLabelRef={questionLabelRef}
          question={question}
          iconVariant={questionIcon}
        />

        <div className='relative transition-all duration-300 ease-in-out'>
          <MultiSelectAnswers answersRef={multiSelectAnswersRef} />
          <TextAnswers answerRowRef={answerRowRef} />
        </div>
      </span>
    );
  },
);

// Add display name for better debugging
Question.displayName = 'Question';

export default Question;
