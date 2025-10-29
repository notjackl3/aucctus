/* eslint-disable react/prop-types */
import React, { memo } from 'react';
import { Icon } from '@components';

interface ManualAnswerEditProps {
  answer: string;
  originalAnswer?: string; // Track original answer to detect changes
  isSubmitting: boolean;
  onAnswerChange: (answer: string) => void;
  onSubmit: (answer: string) => void;
  onCancel?: () => void; // For unfocus without changes
}

const ManualAnswerEdit: React.FC<ManualAnswerEditProps> = memo(
  ({
    answer,
    originalAnswer,
    isSubmitting,
    onAnswerChange,
    onSubmit,
    onCancel,
  }) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const [showError, setShowError] = React.useState(false);

    // Position cursor at end when component mounts
    React.useEffect(() => {
      if (textareaRef.current) {
        const textarea = textareaRef.current;
        // Set cursor position to end of text
        const length = textarea.value.length;
        textarea.setSelectionRange(length, length);
        textarea.focus();
      }
    }, []);

    // Reset error state after animation
    React.useEffect(() => {
      if (showError) {
        const timer = setTimeout(() => {
          setShowError(false);
        }, 600); // Duration of shake animation
        return () => clearTimeout(timer);
      }
    }, [showError]);

    const handleSubmit = () => {
      // Check for empty string and trigger error animation
      if (!answer.trim()) {
        setShowError(true);
        return;
      }

      // If answer hasn't changed, just cancel/return to view mode
      if (answer === (originalAnswer || '')) {
        onCancel?.();
        return;
      }
      onSubmit(answer);
    };

    const handleBlur = () => {
      // Don't save empty strings on blur
      if (!answer.trim()) {
        return;
      }

      // Save on unfocus if answer has changed
      if (!isSubmitting && answer !== (originalAnswer || '')) {
        onSubmit(answer);
      } else if (answer === (originalAnswer || '')) {
        // If no changes, just cancel
        onCancel?.();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Enter key submits the answer (with onSubmit callback)
      if (
        e.key === 'Enter' &&
        !e.shiftKey &&
        !e.ctrlKey &&
        !e.metaKey &&
        !isSubmitting
      ) {
        e.preventDefault();
        handleSubmit();
      }
    };

    return (
      <>
        <div className='mb-2 flex items-start gap-2'>
          <Icon
            variant='target'
            className='aucctus-stroke-white mt-0.5 flex-shrink-0'
            height={16}
            width={16}
          />
          <span className='aucctus-text-sm-medium leading-tight'>
            Add answer manually
          </span>
        </div>

        <div
          className={`relative mt-2 transition-all duration-150 ${
            showError ? 'animate-shake' : ''
          }`}
        >
          <textarea
            ref={textareaRef}
            disabled={isSubmitting}
            value={answer}
            onChange={(e) => !isSubmitting && onAnswerChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder='Type your answer... (Press Enter to submit)'
            className={`aucctus-text-white aucctus-text-xs min-h-16 w-full select-text resize-none rounded-lg border p-2 transition-all duration-300 placeholder:text-white/60 focus:outline-none disabled:opacity-60 ${
              showError
                ? 'aucctus-border-error focus:aucctus-border-error bg-red-500/10 focus:bg-red-500/20'
                : 'border-white/20 bg-white/10 focus:border-white/40 focus:bg-white/20'
            }`}
            onClick={(e) => e.stopPropagation()}
          />

          {/* Mini loading mask */}
          {isSubmitting && (
            <div className='absolute inset-0 flex items-center justify-center rounded-lg bg-white/5 backdrop-blur-sm'>
              <div className='flex flex-col items-center gap-2'>
                <div className='h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white'></div>
                <span className='aucctus-text-xs text-white/60'>Saving...</span>
              </div>
            </div>
          )}
        </div>

        <div className='mt-2 flex justify-end'>
          <div className='inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-2 py-1 transition-colors hover:bg-white/15'>
            <Icon
              variant='edit'
              className='aucctus-stroke-white'
              height={12}
              width={12}
            />
            <span className='aucctus-text-xs-medium max-w-[80px] truncate'>
              User Input
            </span>
          </div>
        </div>
      </>
    );
  },
);

ManualAnswerEdit.displayName = 'ManualAnswerEdit';

export default ManualAnswerEdit;
