import React from 'react';
import { AnswerItem } from '@stores/concept-incubation.store';
import EditableAnswerRow from '../UserExploration/components/answer/EditableAnswerRow';

interface PromptAnswersProps {
  promptAnswers: AnswerItem[];
  handleUpdateAnswer: (uuid: string, newAnswer: string) => void;
  handleRemoveAnswer: (
    e: React.MouseEvent<HTMLButtonElement>,
    uuid: string,
  ) => void;
}

const PromptAnswers: React.FC<PromptAnswersProps> = ({
  promptAnswers,
  handleUpdateAnswer,
  handleRemoveAnswer,
}) => {
  return (
    <div className='mx-2 flex flex-col gap-2'>
      {promptAnswers.map((answer) => (
        <EditableAnswerRow
          bgClass='aucctus-bg-primary'
          buttonClass='aucctus-bg-secondary-hover cursor-pointer rounded-lg p-2'
          className='aucctus-border-primary'
          key={`answer-${answer.answer}`}
          answer={answer}
          allowEdit={false}
          handleUpdateAnswer={handleUpdateAnswer}
          handleRemoveAnswer={handleRemoveAnswer}
        />
      ))}
    </div>
  );
};

export default PromptAnswers;
