import React, { useRef, useEffect } from 'react';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';

interface AnswerInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize the textarea based on content with viewport constraints
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';

      // Calculate maximum available height based on viewport
      const textareaRect = textarea.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const distanceFromBottom = viewportHeight - textareaRect.bottom;
      const maxAvailableHeight = textareaRect.height + distanceFromBottom - 20; // 20px buffer

      // Set the height to scrollHeight, but constrain to max available height
      const desiredHeight = Math.max(48, textarea.scrollHeight);
      const constrainedHeight = Math.min(
        desiredHeight,
        maxAvailableHeight,
        150,
      ); // Also respect the CSS max-height

      textarea.style.height = `${constrainedHeight}px`;
    }
  }, [value]);

  return (
    <>
      <textarea
        ref={textareaRef}
        value={value.replace(/\n/g, ' ')}
        onChange={onChange}
        placeholder='Type anything'
        maxLength={500}
        rows={1}
        onKeyDown={(e) => {
          // Prevent Enter key from creating newlines
          if (e.key === 'Enter') {
            e.preventDefault();
            // Only submit if not shift+enter and there's content
            if (!e.shiftKey && value.length > 0) {
              onAddAnswer();
            }
          }
        }}
        style={{
          minHeight: '48px !important',
        }}
        className={cn(
          'aucctus-border-primary aucctus-text-primary w-full rounded-lg border pl-4 pr-28',
          'no-scrollbar !max-h-[150px] resize-none py-3',
        )}
      />
      <span className='absolute right-14 top-6 -translate-y-1/2 transform'>
        <button
          className='btn btn-light aspect-square w-6 rounded-lg'
          aria-label='Generate AI Suggestions'
          disabled={!allowAddAnswer}
          onClick={onGenerateAiSuggestions}
        >
          <span>{<Icon variant='ai-conclusion' width={16} height={16} />}</span>
        </button>
      </span>
      <span className='absolute right-2 top-6 -translate-y-1/2 transform'>
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
                width={16}
                height={16}
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
