import React, { useMemo } from 'react';
import { useConceptIncubationStore } from '@stores/concept-incubation.store';
import { ConceptIgnitionQuestion } from '@libs/api/types';
import CompletionIconGroup from './CompletionIconGroup';

/**
 * CompletedQuestions component displays a list of questions that have been answered
 */
const CompletedQuestions: React.FC = () => {
  const { activeQuestionnaire, submittedAnswers, currentQuestionOrder } =
    useConceptIncubationStore();

  // Get all completed questions
  const numCompletedQuestions = useMemo(() => {
    if (!currentQuestionOrder) return 0;

    return submittedAnswers.filter(
      (answer) => answer.question.order < currentQuestionOrder,
    ).length;
  }, [submittedAnswers, currentQuestionOrder]);

  const completedQuestions = useMemo(() => {
    if (!activeQuestionnaire?.questions) return [];

    const allQuestions = Object.values(activeQuestionnaire.questions);
    return allQuestions.slice(0, numCompletedQuestions);
  }, [activeQuestionnaire, numCompletedQuestions]);

  const groupedCompletedQuestions = useMemo(() => {
    if (!completedQuestions.length) return [];

    // Create a map to group questions by their floor order value
    const groupMap: Record<number, ConceptIgnitionQuestion[]> = {};

    completedQuestions.forEach((question) => {
      const floorOrder = Math.floor(question.order);
      if (!groupMap[floorOrder]) {
        groupMap[floorOrder] = [];
      }
      groupMap[floorOrder].push(question);
    });

    // Convert the map to an array of arrays
    return Object.values(groupMap);
  }, [completedQuestions]);

  if (completedQuestions.length === 0) return null;

  return (
    <>
      {groupedCompletedQuestions.map((group) => (
        <CompletionIconGroup key={group[0].identifier} questionGroup={group} />
      ))}
    </>
  );
};

export default CompletedQuestions;
