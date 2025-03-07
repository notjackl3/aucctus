import { cn } from '@libs/utils/react';
import React from 'react';
import EditableAnswerRow from './EditableAnswerRow';
import { useAnswerList } from '../../hooks/answer-list.hook';
import { useConceptIncubationStore } from '@stores/concept-incubation.store';

/**
 * TextAnswers component displays and manages text-based answers
 */
const TextAnswers: React.FC<{
  answerRowRef: React.RefObject<HTMLDivElement>;
  isMultiSelectOrRadio: boolean;
}> = ({ answerRowRef, isMultiSelectOrRadio }) => {
  const {
    currentQuestionIndex,
    currentTextAnswerList,
    setCurrentTextAnswerList,
  } = useConceptIncubationStore();

  const { handleRemoveAnswer, handleUpdateAnswer } = useAnswerList(
    currentTextAnswerList,
    setCurrentTextAnswerList,
  );

  return (
    <div
      ref={answerRowRef}
      className={cn(
        'flex',
        'flex-1',
        'flex-col',
        'gap-3',
        'overflow-y-auto',
        'mt-4',
        {
          'max-h-[10vh]': isMultiSelectOrRadio,
          'max-h-[40vh]': !isMultiSelectOrRadio,
        },
      )}
    >
      {currentTextAnswerList.map((answer) => (
        <EditableAnswerRow
          key={`answer-${answer.answer}-${currentQuestionIndex}`}
          answer={answer}
          handleUpdateAnswer={handleUpdateAnswer}
          handleRemoveAnswer={handleRemoveAnswer}
        />
      ))}
    </div>
  );
};

export default TextAnswers;
