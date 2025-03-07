import React from 'react';
import { QuestionEntry } from '../../types/question';
import { CompletionIcon } from './QuestionIcons';

/**
 * CompletedQuestions component displays a list of questions that have been answered
 */
const CompletedQuestions: React.FC<{
  questions: QuestionEntry[];
}> = ({ questions }) => {
  if (questions.length === 0) return null;

  return (
    <>
      {questions.map((question) => (
        <span className='flex flex-row items-center gap-4' key={question[0]}>
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
