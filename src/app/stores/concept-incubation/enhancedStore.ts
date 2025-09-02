import { IncubationAnswer } from '@libs/api/concepts';
import { ConceptIncubationQuestion } from '@libs/api/types';
import useStore from '@stores/store';
import React from 'react';

export const useConceptIncubationStore = () => {
  const store = useStore((state) => state.incubation);
  const { activeQuestionnaire, currentQuestionOrder, isClonedSeed } = store;

  const questions = React.useMemo(() => {
    if (!activeQuestionnaire) return [];

    return Object.values(activeQuestionnaire.questions).filter(
      (question) => question.order > 0,
    );
  }, [activeQuestionnaire]);

  const shouldShowQuestion = React.useCallback(
    (question: ConceptIncubationQuestion, answers: IncubationAnswer[]) => {
      if (question.dependsOn) {
        const dependentAnswer = answers.find(
          (answer) => answer.question.identifier === question.dependsOn,
        );

        if (dependentAnswer && question.dependsOnValue) {
          return dependentAnswer.answer.some((answer) =>
            question.dependsOnValue?.includes(answer),
          );
        }
      }

      return true;
    },
    [],
  );

  const getNextQuestion = React.useCallback(
    (answers: IncubationAnswer[]): ConceptIncubationQuestion | undefined => {
      if (currentQuestionOrder === undefined) return;

      const checkAnswers = isClonedSeed
        ? answers.filter(
            (answer) => answer.question.order <= currentQuestionOrder,
          )
        : answers;

      const eligibleQuestions = questions
        .filter((question) => !!question.identifier)
        .filter(
          (question) =>
            question.order > currentQuestionOrder &&
            shouldShowQuestion(question, checkAnswers),
        )
        .sort((a, b) => a.order - b.order);

      // Return the first eligible question (the one with the lowest order above currentQuestionOrder)
      return eligibleQuestions[0];
    },
    [currentQuestionOrder, questions, shouldShowQuestion, isClonedSeed],
  );

  const getPreviousQuestion = React.useCallback(
    (answers: IncubationAnswer[]) => {
      if (!currentQuestionOrder) return;

      const previousQuestion = [...answers]
        .filter((answer) => !!answer.question.identifier) // filter out clarifying questions
        .map((answer) => answer.question)
        .sort((a, b) => b.order - a.order)
        .find((question) => question.order < currentQuestionOrder);

      return previousQuestion;
    },
    [currentQuestionOrder],
  );

  const totalSteps = React.useMemo(() => {
    if (!questions) return 0;

    const highestOrderNumber = Math.max(
      ...questions.map((question) => question.order),
    );
    return Math.floor(highestOrderNumber);
  }, [questions]);

  const currentStep = React.useMemo(() => {
    return Math.floor(currentQuestionOrder ?? 0);
  }, [currentQuestionOrder]);

  const activeQuestion = React.useMemo(() => {
    return questions.find(
      (question) => question.order === currentQuestionOrder,
    );
  }, [questions, currentQuestionOrder]);

  const enhancedStore = {
    ...store,
    getNextQuestion,
    getPreviousQuestion,
    totalSteps,
    currentStep,
    activeQuestion,
  };

  return enhancedStore;
};
