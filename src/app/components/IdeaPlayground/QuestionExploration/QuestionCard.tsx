import React, { useRef, useEffect } from 'react';
import { Icon } from '@components';
import { Question } from '../types';
import { getAnimationStyle } from '@components/Card/ConceptGeneration/UserExploration/components/util/animation-keyframes';

interface QuestionCardProps {
  question: Question;
  isAnswered: boolean;
  hasUserAnswer?: boolean;
  customQuestionInput?: string;
  isSubmittingCustomQuestion?: boolean;
  userInputValue?: string;
  isSubmittingUserInput?: boolean;
  onCustomQuestionInputChange?: (value: string) => void;
  onCustomQuestionSubmit?: () => void;
  onUserInputChange?: (value: string) => void;
  onUserInputSubmit?: () => void;
}

const MAX_QUESTION_LENGTH = 500;

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  isAnswered,
  hasUserAnswer,
  customQuestionInput,
  isSubmittingCustomQuestion,
  userInputValue,
  isSubmittingUserInput,
  onCustomQuestionInputChange,
  onCustomQuestionSubmit,
  onUserInputChange,
  onUserInputSubmit,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Autofocus the appropriate input when question changes
  useEffect(() => {
    const isCustom = question.id.startsWith('custom-');
    const hasQ = question.question;

    // Small delay to ensure DOM is ready after animation
    const timer = setTimeout(() => {
      if (isCustom && !hasQ) {
        textareaRef.current?.focus();
      } else if (!isCustom && !hasUserAnswer) {
        inputRef.current?.focus();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [question.id, question.question, hasUserAnswer]);

  const isCustomQuestion = question.id.startsWith('custom-');
  const hasQuestion = question.question;
  const inputLength = customQuestionInput?.length || 0;
  const isOverLimit = inputLength > MAX_QUESTION_LENGTH;
  const canSubmit =
    customQuestionInput?.trim() && !isOverLimit && !isSubmittingCustomQuestion;

  return (
    <div
      className={`relative z-20 select-none rounded-lg p-6 shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-[1.02] ${
        isAnswered
          ? 'aucctus-bg-success-glass aucctus-border-success hover:aucctus-bg-success-glass-hover border-2'
          : 'border-2 border-dashed border-white/30 bg-transparent hover:border-white/40 hover:bg-white/10'
      }`}
      style={getAnimationStyle('slideInFromRight', 400, 0)}
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
            Add Your Own Question
          </p>
          <textarea
            ref={textareaRef}
            value={customQuestionInput || ''}
            onChange={(e) => onCustomQuestionInputChange?.(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && canSubmit) {
                e.preventDefault();
                onCustomQuestionSubmit?.();
              }
            }}
            placeholder='What would you like to explore?'
            className={`no-focus-ring aucctus-text-xl-bold w-full select-text resize-none overflow-hidden border-none bg-transparent text-center leading-tight outline-none placeholder:text-white placeholder:opacity-40 ${
              isOverLimit ? 'text-red-400' : 'aucctus-text-white'
            }`}
            disabled={isSubmittingCustomQuestion}
            rows={1}
            style={{ minHeight: 'auto' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = target.scrollHeight + 'px';
            }}
          />
          {/* Character count and submit hint */}
          <div className='mt-3 flex items-center justify-center gap-4'>
            <span
              className={`aucctus-text-xs ${isOverLimit ? 'text-red-400' : 'text-white/50'}`}
            >
              {inputLength}/{MAX_QUESTION_LENGTH}
            </span>
            {canSubmit && (
              <span className='aucctus-text-xs text-white/50'>
                Press Enter to submit
              </span>
            )}
            {isSubmittingCustomQuestion && (
              <span className='aucctus-text-xs animate-pulse text-white/70'>
                Submitting...
              </span>
            )}
          </div>
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

          {/* Inline answer input for non-custom questions without saved user answer */}
          {!isCustomQuestion && !hasUserAnswer && (
            <div className='mt-4 border-t border-white/10 pt-4'>
              <input
                ref={inputRef}
                type='text'
                value={userInputValue || ''}
                onChange={(e) => onUserInputChange?.(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === 'Enter' &&
                    userInputValue?.trim() &&
                    !isSubmittingUserInput
                  ) {
                    e.preventDefault();
                    e.stopPropagation();
                    onUserInputSubmit?.();
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                placeholder='Type your answer or select a bubble...'
                className='no-focus-ring w-full border-none bg-transparent text-left text-sm text-white/80 transition-all placeholder:text-white/30 focus:text-white focus:outline-none'
                disabled={isSubmittingUserInput}
              />
              {isSubmittingUserInput && (
                <p className='aucctus-text-xs mt-2 animate-pulse text-center text-white/70'>
                  Saving...
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QuestionCard;
