import { ConceptIncubationQuestion } from '@libs/api/types';
import { useConceptIncubationStore } from '@stores/concept-incubation/enhancedStore';
import React, { useMemo } from 'react';
import CompletionIconGroup from './CompletionIconGroup';

/**
 * CompletedQuestions component displays a list of questions that have been answered
 */
const CompletedQuestions: React.FC = () => {
  const { submittedAnswers, currentQuestionOrder } =
    useConceptIncubationStore();

  const completedQuestions = useMemo(() => {
    return submittedAnswers
      .filter((answer) => !!answer.question.identifier) // Filter out clarifying questions
      .filter((answer) => answer.question.order < (currentQuestionOrder ?? 0))
      .map((answer) => answer.question);
  }, [submittedAnswers, currentQuestionOrder]);

  const groupedCompletedQuestions: ConceptIncubationQuestion[][] =
    useMemo(() => {
      if (!completedQuestions.length) return [];

      // Create a map to group questions by their floor order value
      const groupMap: Record<number, ConceptIncubationQuestion[]> = {};

      completedQuestions.forEach((question) => {
        const floorOrder = Math.floor(question.order);
        if (!groupMap[floorOrder]) {
          groupMap[floorOrder] = [];
        }
        groupMap[floorOrder].push(question);
      });

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
