import React from 'react';
import { Icon } from '@components';

interface AnswerInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddAnswer: () => void;
  onGenerateAiSuggestions: () => void;
  allowAddAnswer: boolean;
}

const AnswerInput: React.FC<AnswerInputProps> = ({
  value,
  onChange,
  onAddAnswer,
  onGenerateAiSuggestions,
  allowAddAnswer,
}) => {
  return (
    <>
      <input
        type='text'
        value={value}
        onChange={onChange}
        placeholder='Type anything'
        maxLength={500}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && value.length > 0) {
            onAddAnswer();
          }
        }}
        className='aucctus-border-primary aucctus-text-primary h-12 w-full rounded-lg border pl-4 pr-28'
      />
      <span className='absolute right-14 top-1/2 -translate-y-1/2 transform'>
        <button
          className='btn btn-light aspect-square w-6 rounded-lg'
          aria-label='Generate AI Suggestions'
          disabled={!allowAddAnswer}
          onClick={onGenerateAiSuggestions}
        >
          <span>{<Icon variant='ai-conclusion' width={16} height={16} />}</span>
        </button>
      </span>
      <span className='absolute right-2 top-1/2 -translate-y-1/2 transform'>
        <button
          className='btn btn-primary aspect-square w-6 rounded-lg'
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
    </>
  );
};

export default AnswerInput;
