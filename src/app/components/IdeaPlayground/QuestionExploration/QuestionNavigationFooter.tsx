import React from 'react';
import { Icon } from '@components';
import { Question } from '../types';
import QuestionSelector from './QuestionSelector';

interface QuestionNavigationFooterProps {
  questions: Question[];
  currentIndex: number;
  isQuestionAnswered: (questionId: string) => boolean;
  onQuestionSelect: (index: number) => void;
  onAddQuestion: () => void;
  onRemoveQuestion: (index: number, questionId: string) => void;
  onGenerateIdeas?: () => void;
  onViewConcepts?: () => void;
  hasGeneratedConcepts?: boolean;
  hasInputsChangedSinceGeneration?: boolean;
  deletingQuestionId?: string | null;
}

const QuestionNavigationFooter: React.FC<QuestionNavigationFooterProps> = ({
  questions,
  currentIndex,
  isQuestionAnswered,
  onQuestionSelect,
  onAddQuestion,
  onRemoveQuestion,
  onGenerateIdeas,
  onViewConcepts,
  hasGeneratedConcepts = false,
  hasInputsChangedSinceGeneration = false,
  deletingQuestionId = null,
}) => {
  // Determine button state and text
  const showViewConcepts =
    hasGeneratedConcepts && !hasInputsChangedSinceGeneration;
  const buttonText = showViewConcepts
    ? 'View Generated Concepts'
    : 'Generate Ideas';
  const buttonIcon = showViewConcepts ? 'eye' : 'lightbulb';
  const handleButtonClick = showViewConcepts ? onViewConcepts : onGenerateIdeas;
  return (
    <div className='absolute bottom-0 left-0 right-0 z-30'>
      <div className='w-full border-t border-white/20 bg-black/60 px-6 py-3 backdrop-blur-md'>
        <div className='flex w-full items-center justify-between'>
          <div className='w-40'></div>

          {/* Centered Question Selectors */}
          <div className='flex items-center justify-center gap-2 overflow-x-auto overflow-y-visible py-1'>
            {questions.map((question, index) => {
              // Allow deletion for local temporary questions OR API custom questions
              const canDelete =
                question.id.startsWith('custom-') || question.isCustomQuestion;
              return (
                <QuestionSelector
                  key={question.id}
                  question={question}
                  index={index}
                  isActive={index === currentIndex}
                  isAnswered={isQuestionAnswered(question.id)}
                  isDeleting={deletingQuestionId === question.id}
                  onSelect={() => onQuestionSelect(index)}
                  onRemove={
                    canDelete
                      ? () => onRemoveQuestion(index, question.id)
                      : undefined
                  }
                />
              );
            })}

            {/* Add Question Button */}
            <button
              onClick={onAddQuestion}
              className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/5 text-white/70 transition-all duration-300 hover:border-white/30 hover:bg-white/10'
            >
              <Icon
                variant='plus'
                className='stroke-white/70'
                height={14}
                width={14}
              />
            </button>
          </div>

          {/* Generate Ideas / View Concepts Button */}
          <div className='flex items-center justify-end'>
            <button
              onClick={handleButtonClick}
              className='btn btn-primary btn-sm group whitespace-nowrap border border-white/30 bg-white/10 px-3 py-1.5 text-white backdrop-blur-md transition-all duration-300 hover:!border-white hover:!bg-white hover:!text-gray-900'
            >
              <Icon
                variant={buttonIcon}
                className='mr-1.5 stroke-white group-hover:stroke-gray-light-700'
                height={14}
                width={14}
              />
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionNavigationFooter;
