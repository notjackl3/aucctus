import React, { useRef, useEffect } from 'react';
import { cn } from '@libs/utils/react';
import { ArrowUp } from 'lucide-react';

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

  return (
    <>
      <textarea
        ref={inputRef}
        value={value.replace(/\n/g, ' ')}
        onChange={(e) =>
          onChange(e as unknown as React.ChangeEvent<HTMLInputElement>)
        }
        disabled={!allowAddAnswer}
        placeholder={allowAddAnswer ? 'Enter feedback to refine concepts' : '-'}
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
        <button
          className='btn btn-primary aspect-square w-6 rounded-lg'
          aria-label='Add Answer'
          onClick={onAddAnswer}
          disabled={value.length === 0 && !allowAddAnswer}
        >
          <span>
            {<ArrowUp size={16} className='stroke-white !stroke-[0.5]' />}
          </span>
        </button>
      </span>
    </>
  );
};

export default ConceptGenerationInput;
