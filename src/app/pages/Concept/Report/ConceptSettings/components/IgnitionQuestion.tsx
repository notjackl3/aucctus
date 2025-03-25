import { QuestionIcon } from '@components/Icon/QuestionIcon';
import type {
  ConceptIncubationQuestion,
  IConceptSeedAnswer,
} from '@libs/api/types';
import React from 'react';

interface IgnitionQuestionProps {
  answer: IConceptSeedAnswer;
  question: ConceptIncubationQuestion;
  formatAnswer: (
    answer: IConceptSeedAnswer,
    question: ConceptIncubationQuestion,
  ) => string;
}

export const IgnitionQuestion: React.FC<IgnitionQuestionProps> = ({
  answer,
  question,
  formatAnswer,
}) => {
  return (
    <div className='pb-3'>
      <div className='ease flex flex-row items-center gap-3 pb-3'>
        <QuestionIcon questionType={answer.question.identifier} />
        <span className='ease aucctus-text-md aucctus-text-primary'>
          {answer.question.label}
        </span>
      </div>

      <div className='aucctus-border-secondary aucctus-bg-tertiary flex flex-col gap-3 rounded-lg border-2 p-1'>
        <div className='aucctus-bg-tertiary rounded-md px-2 py-1'>
          <span className='aucctus-text-primary'>
            {formatAnswer(answer, question)}
          </span>
        </div>
      </div>
    </div>
  );
};
