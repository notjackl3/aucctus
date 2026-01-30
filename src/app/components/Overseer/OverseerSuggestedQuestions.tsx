import { cn } from '@libs/utils/react';
import React from 'react';

interface OverseerSuggestedQuestionsProps {
  questions: string[];
  onQuestionClick: (question: string) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Suggested follow-up questions displayed as pill buttons
 * Features horizontal drag scrolling and subtle styling
 */
const OverseerSuggestedQuestions: React.FC<OverseerSuggestedQuestionsProps> = ({
  questions,
  onQuestionClick,
  disabled = false,
  className,
}) => {
  if (!questions || questions.length === 0) return null;

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const startX = e.pageX - el.offsetLeft;
    const scrollLeft = el.scrollLeft;
    let isDragging = true;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging) return;
      moveEvent.preventDefault();
      const x = moveEvent.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.5;
      el.scrollLeft = scrollLeft - walk;
    };

    const onMouseUp = () => {
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div
      className={cn('shrink-0 border-t border-white/10 px-4 py-2.5', className)}
    >
      <div
        className='flex cursor-grab gap-2 overflow-x-auto active:cursor-grabbing'
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
        onMouseDown={handleMouseDown}
      >
        {questions.slice(0, 3).map((question, index) => (
          <button
            key={index}
            onClick={() => onQuestionClick(question)}
            disabled={disabled}
            className={cn(
              'aucctus-bg-frosted-glass shrink-0 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 backdrop-blur-md',
              'aucctus-text-xs-medium text-white/60 transition-all duration-200',
              'hover:border-white/30 hover:bg-white/10 hover:text-white',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            <span>{question}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default OverseerSuggestedQuestions;
