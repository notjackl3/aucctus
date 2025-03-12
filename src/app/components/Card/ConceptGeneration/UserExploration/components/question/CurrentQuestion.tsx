import { QuestionIcon } from './QuestionIcons';
import React from 'react';
import { useConceptIncubationStore } from '@stores/concept-incubation.store';

/**
 * CurrentQuestion component displays the current active question
 */
const CurrentQuestion: React.FC<{
  questionIconRef: React.RefObject<HTMLDivElement>;
  questionLabelRef: React.RefObject<HTMLSpanElement>;
}> = ({ questionIconRef, questionLabelRef }) => {
  const { activeQuestion } = useConceptIncubationStore();

  if (!activeQuestion) return null;

  return (
    <div className='ease flex flex-row items-center gap-3 transition-all duration-300'>
      <QuestionIcon
        questionType={activeQuestion.identifier}
        innerRef={questionIconRef}
      />
      <span
        ref={questionLabelRef}
        className='ease aucctus-text-md aucctus-text-primary transition-all duration-300'
      >
        {activeQuestion.label}
      </span>
    </div>
  );
};

export default CurrentQuestion;
