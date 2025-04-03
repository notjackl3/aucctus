import { AnswerItem } from '@stores/concept-incubation/actions';
import React from 'react';
import EditableAnswerRow from '../UserExploration/components/answer/EditableAnswerRow';

interface PromptAnswersProps {
  promptAnswers: AnswerItem[];
}

const PromptAnswers: React.FC<PromptAnswersProps> = ({ promptAnswers }) => {
  return (
    <div className='mx-2 flex flex-col gap-2'>
      {promptAnswers.map((answer) => (
        <EditableAnswerRow
          bgClass='aucctus-bg-primary'
          buttonClass='aucctus-bg-primary-hover cursor-pointer rounded-lg p-2'
          className='aucctus-border-primary'
          key={`answer-${answer.answer}`}
          answer={answer}
          allowEdit={false}
        />
      ))}
    </div>
  );
};

export default PromptAnswers;
