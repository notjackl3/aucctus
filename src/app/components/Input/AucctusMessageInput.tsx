import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import React, { useEffect, useRef } from 'react';

interface AucctusMessageInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmitMessage: () => void;
  onGenerateAiSuggestions?: () => void;
  allowSubmitMessage: boolean;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
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
      disabled = false,
      placeholder = 'Type anything',
    },
    ref,
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const adjustHeight = () => {
      const textarea = textareaRef.current;
      const container = containerRef.current;
      if (!textarea || !container) return;

      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = '0px';

      // Get the scroll height which represents the content height
      const scrollHeight = textarea.scrollHeight;

      // Set minimum height (1 row) and maximum height (4 rows)
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 24;
      const minHeight = 48; // Minimum height (1 row + padding)
      const maxHeight = lineHeight * 4 + 24; // 4 rows + padding

      // Calculate the new height
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);

      // Apply the new height to both textarea and container
      textarea.style.height = `${newHeight}px`;
      container.style.height = `${newHeight}px`;
    };

    // Combine refs
    const setRefs = (element: HTMLTextAreaElement | null) => {
      textareaRef.current = element;

      // Forward the ref
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    };

    // Adjust height when content changes
    useEffect(() => {
      adjustHeight();
    }, [value]);

    // Initialize height on mount
    useEffect(() => {
      adjustHeight();
    }, []);

    // Handle window resize
    useEffect(() => {
      const handleResize = () => adjustHeight();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
      <div className='relative' ref={containerRef}>
        <textarea
          ref={setRefs}
          value={value}
          onChange={(e) => {
            onChange(e);
            adjustHeight(); // Adjust immediately on change
          }}
          placeholder={placeholder}
          maxLength={500}
          onKeyDown={(e) => {
            // Prevent Enter key from creating newlines
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              // Only submit if not shift+enter and there's content
              if (value.length > 0 && !disabled) {
                onAddAnswer();
              }
            }
          }}
          className={cn(
            'aucctus-border-primary aucctus-text-primary w-full rounded-lg border pl-4 pr-28',
            'no-scrollbar transition-height !min-h-[48px] resize-none overflow-y-auto py-3 duration-100',
            className,
          )}
        />
        {onGenerateAiSuggestions && (
          <span className='absolute right-14 top-1/2 -translate-y-1/2 transform'>
            <button
              className='btn btn-light aspect-square w-6 rounded-lg'
              aria-label='Generate AI Suggestions'
              disabled={!allowAddAnswer || disabled}
              onClick={onGenerateAiSuggestions}
            >
              <span>
                {<Icon variant='ai-conclusion' width={16} height={16} />}
              </span>
            </button>
          </span>
        )}
        <span className='absolute right-2 top-1/2 -translate-y-1/2 transform'>
          <button
            className='btn btn-primary aspect-square w-6 rounded-lg'
            disabled={value.trim().length === 0 || !allowAddAnswer || disabled}
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
      </div>
    );
  },
);

AucctusMessageInput.displayName = 'AucctusMessageInput';

export default AucctusMessageInput;
