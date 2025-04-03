import React from 'react';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';

interface AucctusMessageInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmitMessage: () => void;
  onGenerateAiSuggestions?: () => void;
  allowSubmitMessage: boolean;
  className?: string;
}

const AucctusMessageInput = React.forwardRef<
  HTMLTextAreaElement,
  AucctusMessageInputProps
>(
  (
    {
      value,
      onChange,
      onSubmitMessage: onAddAnswer,
      onGenerateAiSuggestions,
      allowSubmitMessage: allowAddAnswer,
      className = '',
    },
    ref,
  ) => {
    return (
      <>
        <textarea
          ref={ref}
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
          className={cn(
            'aucctus-border-primary aucctus-text-primary w-full rounded-lg border pl-4 pr-28',
            'no-scrollbar !min-h-[48px] resize-none py-3',
            className,
          )}
        />
        {onGenerateAiSuggestions && (
          <span className='absolute right-14 top-6 -translate-y-1/2 transform'>
            <button
              className='btn btn-light aspect-square w-6 rounded-lg'
              aria-label='Generate AI Suggestions'
              disabled={!allowAddAnswer}
              onClick={onGenerateAiSuggestions}
            >
              <span>
                {<Icon variant='ai-conclusion' width={16} height={16} />}
              </span>
            </button>
          </span>
        )}
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
  },
);

AucctusMessageInput.displayName = 'AucctusMessageInput';

export default AucctusMessageInput;
