import React, { useRef, useEffect } from 'react';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';

interface ConceptGenerationInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddAnswer: () => void;
  onGenerateMoreConcepts: () => void;
  allowAddAnswer: boolean;
  allowGenerateMoreConcepts: boolean;
}

const ConceptGenerationInput: React.FC<ConceptGenerationInputProps> = ({
  value,
  onChange,
  onAddAnswer,
  onGenerateMoreConcepts,
  allowAddAnswer,
  allowGenerateMoreConcepts,
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize the textarea based on content
  useEffect(() => {
    const textarea = inputRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';

      // Set the height to scrollHeight, but with a minimum height
      const desiredHeight = Math.max(48, textarea.scrollHeight);
      const constrainedHeight = Math.min(desiredHeight, 150); // Respect max-height

      textarea.style.height = `${constrainedHeight}px`;
    }
  }, [value]);

  const renderActiveButton = () => {
    if (allowAddAnswer && value.length > 0) {
      return (
        <button
          className='btn btn-primary my-2 aspect-square w-6 rounded-lg'
          aria-label='Add Answer'
          onClick={onAddAnswer}
        >
          <span>
            {
              <Icon
                variant='arrowup'
                width={16}
                height={16}
                className='stroke-white !stroke-[0.5]'
              />
            }
          </span>
        </button>
      );
    }
    return (
      <button
        className='btn btn-light my-2 aspect-square w-6 rounded-lg'
        aria-label='Generate More Concepts'
        onClick={onGenerateMoreConcepts}
        disabled={!allowGenerateMoreConcepts}
      >
        <span>
          {
            <Icon
              variant='ai-conclusion'
              width={16}
              height={16}
              className='stroke-gray-light-900 !stroke-[0.5]'
            />
          }
        </span>
      </button>
    );
  };

  return (
    <>
      <textarea
        ref={inputRef}
        value={value.replace(/\n/g, ' ')}
        onChange={(e) =>
          onChange(e as unknown as React.ChangeEvent<HTMLInputElement>)
        }
        disabled={!allowAddAnswer}
        placeholder={allowAddAnswer ? 'Type anything' : 'Max 3 answers'}
        maxLength={500}
        rows={1}
        onKeyDown={(e) => {
          // Prevent Enter key from creating newlines
          if (e.key === 'Enter') {
            e.preventDefault();
            // Only submit if there's content
            if (value.length > 0) {
              onAddAnswer();
            }
          }
        }}
        className={cn(
          'aucctus-border-primary aucctus-text-primary w-full rounded-lg border pl-4 pr-14',
          'no-scrollbar !max-h-[150px] !min-h-[48px] resize-none py-3',
        )}
      />
      <span className='absolute right-2 top-1/2 -translate-y-1/2 transform'>
        {renderActiveButton()}
      </span>
    </>
  );
};

export default ConceptGenerationInput;
