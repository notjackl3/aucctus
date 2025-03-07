import { QuestionIcon } from './QuestionIcons';
import { QuestionEntry } from '../../types/question';
import React from 'react';

/**
 * CurrentQuestion component displays the current active question
 */
const CurrentQuestion: React.FC<{
  questionEntry: QuestionEntry | undefined;
  questionIconRef: React.RefObject<HTMLDivElement>;
  questionLabelRef: React.RefObject<HTMLSpanElement>;
}> = ({ questionEntry, questionIconRef, questionLabelRef }) => {
  if (!questionEntry) return null;

  return (
    <div className='ease flex flex-row items-center gap-3 transition-all duration-300'>
      <QuestionIcon
        questionType={questionEntry[0]}
        innerRef={questionIconRef}
      />
      <span
        ref={questionLabelRef}
        className='ease aucctus-text-md aucctus-text-primary transition-all duration-300'
      >
        {questionEntry[1]?.label}
      </span>
    </div>
  );
};

export default CurrentQuestion;
