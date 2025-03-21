import { AnswerItem } from '@stores/concept-incubation/enhancedStore'; // Adjust import based on your actual type
import React, { useCallback } from 'react';

export const useAnswerList = (
  currentTextAnswerList: AnswerItem[],
  setCurrentTextAnswerList: (answers: AnswerItem[]) => void,
) => {
  const handleRemoveAnswer = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, answerUuid: string) => {
      e.preventDefault();
      const answerDiv = e.currentTarget.closest(
        'div.aucctus-incubation-answer-row',
      );

      if (answerDiv) {
        const handleAnimationEnd = () => {
          setCurrentTextAnswerList(
            currentTextAnswerList.filter(
              (answer) => answer.uuid !== answerUuid,
            ),
          );
          answerDiv.removeEventListener('animationend', handleAnimationEnd);
        };

        answerDiv.addEventListener('animationend', handleAnimationEnd);
        answerDiv.classList.remove('animate-incubation-answer-expand');
        answerDiv.classList.add('animate-incubation-answer-collapse');
      } else {
        setCurrentTextAnswerList(
          currentTextAnswerList.filter((answer) => answer.uuid !== answerUuid),
        );
      }
    },
    [currentTextAnswerList, setCurrentTextAnswerList],
  );

  const allowUpdateAnswer = useCallback(
    (newAnswer: string) => {
      if (newAnswer.trim().length === 0) return false;
      return !currentTextAnswerList
        .map((answer) => answer.answer.trim())
        .includes(newAnswer.trim());
    },
    [currentTextAnswerList],
  );

  const handleUpdateAnswer = useCallback(
    (answerUuid: string, newAnswer: string) => {
      if (
        currentTextAnswerList.map((answer) => answer.answer).includes(newAnswer)
      )
        return;

      const newAnswerList = currentTextAnswerList.map((answer) => {
        if (answer.uuid === answerUuid) {
          return { ...answer, answer: newAnswer };
        }
        return answer;
      });
      setCurrentTextAnswerList(newAnswerList);
    },
    [currentTextAnswerList, setCurrentTextAnswerList],
  );

  return { handleRemoveAnswer, handleUpdateAnswer, allowUpdateAnswer };
};
