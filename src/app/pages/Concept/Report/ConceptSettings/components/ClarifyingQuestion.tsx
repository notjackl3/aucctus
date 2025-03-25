import { Icon } from '@components';
import type {
  ConceptIncubationQuestion,
  IClarifyingQuestion,
  IConceptSeedAnswer,
} from '@libs/api/types';
import React from 'react';

interface ClarifyingQuestionProps {
  question: IClarifyingQuestion;
  answer?: IConceptSeedAnswer;
  formatAnswer: (
    answer: IConceptSeedAnswer,
    question: ConceptIncubationQuestion,
  ) => string;
}

export const ClarifyingQuestion: React.FC<ClarifyingQuestionProps> = ({
  question,
  answer,
  formatAnswer,
}) => {
  if (!answer) return null;

  return (
    <div className='pb-3'>
      <div className='ease flex flex-row items-center gap-2 pb-3'>
        <span className='aucctus-bg-primary aucctus-border-secondary mr-2 flex h-8 w-8 items-center justify-center self-center justify-self-center rounded-lg border-2'>
          <Icon variant={question.icon || 'help'} height={16} width={16} />
        </span>

        <div className='flex flex-col'>
          <span className='aucctus-text-secondary aucctus-text-md-medium'>
            {question.title}
          </span>
          <span className='aucctus-text-secondary aucctus-text-xs'>
            {question.question.label}
          </span>
        </div>
      </div>
      <div className='aucctus-border-secondary aucctus-bg-tertiary flex flex-col gap-3 rounded-lg border-2 p-1'>
        <div className='aucctus-bg-tertiary rounded-md px-2 py-1'>
          <span className='aucctus-text-primary'>
            {formatAnswer(answer, question.question)}
          </span>
        </div>
      </div>
    </div>
  );
};
