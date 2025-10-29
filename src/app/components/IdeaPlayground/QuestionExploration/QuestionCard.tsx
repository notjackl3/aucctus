import React from 'react';
import { Icon } from '@components';
import { Question } from '../types';
import { getAnimationStyle } from '@components/Card/ConceptGeneration/UserExploration/components/util/animation-keyframes';

interface QuestionCardProps {
  question: Question;
  isAnswered: boolean;
  hasUserAnswer?: boolean;
  customQuestionInput?: string;
  onQuestionClick?: () => void;
  onCustomQuestionInputChange?: (value: string) => void;
  onCustomQuestionSubmit?: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  isAnswered,
  hasUserAnswer,
  customQuestionInput,
  onQuestionClick,
  onCustomQuestionInputChange,
  onCustomQuestionSubmit,
}) => {
  const isCustomQuestion = question.id.startsWith('custom-');
  const hasQuestion = question.question;

  return (
    <div
      className={`relative z-20 select-none rounded-2xl p-6 shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-[1.02] ${
        isAnswered
          ? 'aucctus-bg-success-glass aucctus-border-success hover:aucctus-bg-success-glass-hover border-2'
          : 'border-2 border-dashed border-white/30 bg-transparent hover:border-white/40 hover:bg-white/10'
      }`}
      style={getAnimationStyle('slideInFromRight', 400, 0)}
      onClick={() => !isCustomQuestion && onQuestionClick?.()}
    >
      {/* Answered Checkmark */}
      {isAnswered && (
        <div className='aucctus-bg-success-solid absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full shadow-lg'>
          <Icon
            variant='check'
            className='aucctus-stroke-white'
            height={16}
            width={16}
          />
        </div>
      )}

      {/* Custom Question Input or Regular Question */}
      {isCustomQuestion && !hasQuestion ? (
        <div className='mb-4 text-center'>
          <p className='aucctus-text-white aucctus-text-sm mb-3 opacity-60'>
            Describe Something to Consider
          </p>
          <textarea
            value={customQuestionInput || ''}
            onChange={(e) => onCustomQuestionInputChange?.(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onCustomQuestionSubmit?.();
              }
            }}
            placeholder='Start typing your question...'
            className='aucctus-text-xl-bold aucctus-text-white w-full select-text resize-none overflow-hidden border-none bg-transparent text-center leading-tight outline-none placeholder:text-white placeholder:opacity-40'
            autoFocus
            rows={1}
            style={{ minHeight: 'auto' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = target.scrollHeight + 'px';
            }}
          />
          {customQuestionInput?.trim() && (
            <div className='mt-3 text-center'>
              <p className='aucctus-text-white aucctus-text-xs opacity-50'>
                Press Enter to generate insights
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className='mb-4 text-center'>
            <h2 className='aucctus-text-xl-bold aucctus-text-white mb-3 leading-tight'>
              {question.question}
            </h2>
            <p className='aucctus-text-white aucctus-text-md leading-relaxed opacity-80'>
              {question.explanation}
            </p>
          </div>

          {/* Click Hint for non-custom questions */}
          {!isCustomQuestion && !hasUserAnswer && (
            <div className='mt-3 text-center'>
              <p className='aucctus-text-white aucctus-text-xs opacity-50'>
                Click to Add Answer Manually
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QuestionCard;
