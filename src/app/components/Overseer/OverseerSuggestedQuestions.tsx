import { cn } from '@libs/utils/react';
import React from 'react';

interface OverseerSuggestedQuestionsProps {
  questions: string[];
  onQuestionClick: (question: string) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Follow-up suggestion pills - smaller, more subtle style
 * Features horizontal drag scrolling
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
    <div className={cn('shrink-0 px-4 py-2', className)}>
      <div
        className='flex cursor-grab gap-1.5 overflow-x-auto active:cursor-grabbing'
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
            className='shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-light text-white/45 transition-colors hover:text-white/70 disabled:cursor-not-allowed disabled:opacity-50'
            style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
};

export default OverseerSuggestedQuestions;
