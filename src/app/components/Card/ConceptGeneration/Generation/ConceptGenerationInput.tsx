import React from 'react';
import { Icon } from '@components';

interface ConceptGenerationInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddAnswer: () => void;
  allowAddAnswer: boolean;
}

const ConceptGenerationInput: React.FC<ConceptGenerationInputProps> = ({
  value,
  onChange,
  onAddAnswer,
  allowAddAnswer,
}) => {
  return (
    <>
      <input
        type='text'
        value={value}
        onChange={onChange}
        disabled={!allowAddAnswer}
        placeholder={allowAddAnswer ? 'Type anything' : 'Max 3 answers'}
        maxLength={500}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && value.length > 0) {
            onAddAnswer();
          }
        }}
        className='aucctus-border-primary aucctus-text-primary h-12 w-full rounded-lg border pl-4 pr-14'
      />
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
    </>
  );
};

export default ConceptGenerationInput;
