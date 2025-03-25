import { ConceptIncubationQuestion } from '@libs/api/types';
import React from 'react';
import { QuestionIcon } from '../../../../../Icon/QuestionIcon';

/**
 * CurrentQuestion component displays the current active question
 */
const CurrentQuestion: React.FC<{
  questionIconRef: React.RefObject<HTMLSpanElement>;
  questionLabelRef: React.RefObject<HTMLSpanElement>;
  question: ConceptIncubationQuestion;
  iconVariant?: IconVariant;
}> = ({ questionIconRef, questionLabelRef, question, iconVariant }) => {
  if (!question) return null;

  return (
    <div className='ease flex flex-row items-center gap-3 transition-all duration-300'>
      <QuestionIcon
        questionType={question.identifier}
        innerRef={questionIconRef}
        variant={iconVariant}
      />
      <span
        ref={questionLabelRef}
        className='ease aucctus-text-md aucctus-text-primary transition-all duration-300'
      >
        {question.label}
      </span>
    </div>
  );
};

export default CurrentQuestion;
