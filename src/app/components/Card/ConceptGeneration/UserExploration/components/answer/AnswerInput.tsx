import React, { useRef, useEffect } from 'react';
import AucctusMessageInput from '@components/Input/AucctusMessageInput';

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
    <AucctusMessageInput
      ref={textareaRef}
      value={value}
      onChange={onChange}
      onSubmitMessage={onAddAnswer}
      onGenerateAiSuggestions={onGenerateAiSuggestions}
      allowSubmitMessage={allowAddAnswer}
      className='!max-h-[150px]'
    />
  );
};

export default AnswerInput;
