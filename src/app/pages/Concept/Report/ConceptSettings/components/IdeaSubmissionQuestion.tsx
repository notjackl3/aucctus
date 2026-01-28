import { QuestionIcon } from '@components/Icon/QuestionIcon';
import React from 'react';

interface IdeaSubmissionQuestionProps {
  label: string;
  answer: string;
  iconVariant?: IconVariant;
}

/**
 * Component to display idea submission fields in the same format as IgnitionQuestion
 * Used to render watchtower and employee submission concepts like regular ideation concepts
 */
export const IdeaSubmissionQuestion: React.FC<IdeaSubmissionQuestionProps> = ({
  label,
  answer,
  iconVariant = 'help-circle',
}) => {
  if (!answer) return null;

  return (
    <div className='pb-3'>
      <div className='ease flex flex-row items-center gap-3 pb-3'>
        <QuestionIcon questionType='' variant={iconVariant} />
        <span className='ease aucctus-text-md aucctus-text-primary'>
          {label}
        </span>
      </div>

      <div className='aucctus-border-secondary aucctus-bg-tertiary flex flex-col gap-3 rounded-lg border-2 p-1'>
        <div className='aucctus-bg-tertiary rounded-md px-2 py-1'>
          <span className='aucctus-text-primary whitespace-pre-line'>
            {answer}
          </span>
        </div>
      </div>
    </div>
  );
};
