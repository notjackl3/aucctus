import { cn } from '@libs/utils/react';
import { useConceptIncubationStore } from '@stores/concept-incubation/enhancedStore';
import React, { useMemo } from 'react';
import { useAnswerList } from '../../hooks/answer-list.hook';
import EditableAnswerRow from './EditableAnswerRow';

/**
 * TextAnswers component displays and manages text-based answers
 */
const TextAnswers: React.FC<{
  answerRowRef: React.RefObject<HTMLDivElement>;
}> = ({ answerRowRef }) => {
  const {
    currentQuestionOrder,
    currentTextAnswerList,
    setCurrentTextAnswerList,
    activeQuestion,
  } = useConceptIncubationStore();

  const isMultiSelectOrRadio = useMemo(
    () =>
      activeQuestion?.fieldType === 'multiSelect' ||
      activeQuestion?.fieldType === 'radioButton',
    [activeQuestion],
  );

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
        'no-scrollbar',
        'mt-4',
        {
          'max-h-[10vh]': isMultiSelectOrRadio,
          'max-h-[40vh]': !isMultiSelectOrRadio,
        },
      )}
    >
      {currentTextAnswerList.map((answer) => (
        <EditableAnswerRow
          key={`answer-${answer.answer}-${currentQuestionOrder}`}
          answer={answer}
          handleUpdateAnswer={handleUpdateAnswer}
          handleRemoveAnswer={handleRemoveAnswer}
        />
      ))}
    </div>
  );
};

export default TextAnswers;
