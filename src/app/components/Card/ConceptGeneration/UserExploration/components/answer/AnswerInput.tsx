import React from 'react';
import { Icon } from '@components';

interface AnswerInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddAnswer: () => void;
  allowAddAnswer: boolean;
}

const AnswerInput: React.FC<AnswerInputProps> = ({
  value,
  onChange,
  onAddAnswer,
  allowAddAnswer,
}) => {
  return (
    <div className='relative h-12 w-full'>
      <input
        type='text'
        value={value}
        onChange={onChange}
        placeholder={allowAddAnswer ? 'Type anything' : '-'}
        maxLength={500}
        disabled={!allowAddAnswer}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && value.length > 0) {
            onAddAnswer();
          }
        }}
        className='aucctus-border-primary h-12 w-full rounded-lg border pl-4 pr-10'
      />
      <span className='absolute right-14 top-1/2 -translate-y-1/2 transform'>
        <button
          className='btn btn-light aspect-square w-6 rounded-lg'
          aria-label='Generate AI Suggestions'
          disabled={!allowAddAnswer}
        >
          <span>{<Icon variant='ai-conclusion' width={16} height={16} />}</span>
        </button>
      </span>
      <span className='absolute right-2 top-1/2 -translate-y-1/2 transform'>
        <button
          className='btn btn-primary my-2 aspect-square w-6 rounded-lg'
          disabled={value.length === 0 || !allowAddAnswer}
          aria-label='Add Answer'
          onClick={onAddAnswer}
        >
          <span>
            {
              <Icon
                variant='arrowup'
                width={20}
                height={20}
                className='stroke-white !stroke-[0.5]'
              />
            }
          </span>
        </button>
      </span>
    </div>
  );
};

export default AnswerInput;
