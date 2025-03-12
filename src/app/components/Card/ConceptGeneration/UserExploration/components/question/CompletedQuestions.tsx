import React, { useMemo } from 'react';
import { QuestionEntry } from '../../types/question';
import { CompletionIcon } from './QuestionIcons';
import { useConceptIncubationStore } from '@stores/concept-incubation.store';

/**
 * CompletedQuestions component displays a list of questions that have been answered
 */
const CompletedQuestions: React.FC = () => {
  const { activeQuestionnaire, currentQuestionOrder } =
    useConceptIncubationStore();

  // Get all completed questions
  const numCompletedQuestions = currentQuestionOrder
    ? Math.floor(currentQuestionOrder - 1)
    : 0;
  const completedQuestions = useMemo(() => {
    if (!activeQuestionnaire?.questions) return [];

    const allQuestions = Object.entries(activeQuestionnaire.questions);
    return allQuestions.slice(0, numCompletedQuestions) as QuestionEntry[];
  }, [activeQuestionnaire, numCompletedQuestions]);

  if (completedQuestions.length === 0) return null;

  return (
    <>
      {completedQuestions.map((question) => (
        <span
          className='flex flex-row items-center gap-4'
          key={question.identifier}
        >
          <CompletionIcon className='z-[10] animate-fade-in opacity-0' />
          <span className='aucctus-text-sm aucctus-text-primary animate-fade-in opacity-0'>
            {question[1]?.label}
          </span>
        </span>
      ))}
    </>
  );
};

export default CompletedQuestions;
