import { IClarifyingQuestion, IConceptSeedAnswer } from '@libs/api/types';
import React from 'react';

export const useClarifyingQuestionsWithAnswers = (
  clarifyingQuestions: IClarifyingQuestion[],
  answers?: IConceptSeedAnswer[],
) => {
  return React.useMemo(() => {
    if (!answers || !clarifyingQuestions) {
      return [];
    }

    return clarifyingQuestions.reduce<
      Array<{
        question: IClarifyingQuestion;
        answer: IConceptSeedAnswer;
      }>
    >((acc, question) => {
      const associatedAnswer = answers.find(
        (answer) => answer.question.id === question.question.id,
      );

      if (associatedAnswer) {
        acc.push({
          question,
          answer: associatedAnswer,
        });
      }

      return acc;
    }, []);
  }, [answers, clarifyingQuestions]);
};
