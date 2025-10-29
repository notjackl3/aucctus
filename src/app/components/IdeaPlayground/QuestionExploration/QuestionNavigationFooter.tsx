import React from 'react';
import { Icon } from '@components';
import { Question } from '../types';
import QuestionSelector from './QuestionSelector';
import { cn } from '@libs/utils/react';
interface QuestionNavigationFooterProps {
  questions: Question[];
  currentIndex: number;
  isQuestionAnswered: (questionId: string) => boolean;
  onQuestionSelect: (index: number) => void;
  onAddQuestion: () => void;
  onRemoveQuestion: (index: number, questionId: string) => void;
  onGenerateIdeas?: () => void;
}

const QuestionNavigationFooter: React.FC<QuestionNavigationFooterProps> = ({
  questions,
  currentIndex,
  isQuestionAnswered,
  onQuestionSelect,
  // onAddQuestion,
  onRemoveQuestion,
  onGenerateIdeas,
}) => {
  return (
    <div className='absolute bottom-0 left-0 right-0 z-30'>
      <div className='w-full border-t border-white/20 bg-black/60 px-8 py-6 backdrop-blur-md'>
        <div className='flex w-full items-end justify-between'>
          <div className='w-40'></div>

          {/* Centered Question Selectors */}
          <div className='flex items-end justify-center gap-3 overflow-x-auto'>
            {questions.map((question, index) => (
              <QuestionSelector
                key={question.id}
                question={question}
                index={index}
                isActive={index === currentIndex}
                isAnswered={isQuestionAnswered(question.id)}
                onSelect={() => onQuestionSelect(index)}
                onRemove={
                  question.id.startsWith('custom-')
                    ? () => onRemoveQuestion(index, question.id)
                    : undefined
                }
              />
            ))}

            {/* Add Question Button TODO: Add this back in when we have a way to add questions */}
            {/* <button
              onClick={onAddQuestion}
              className='flex h-14 w-16 flex-shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/10 px-3 py-2 transition-all duration-300 hover:border-white/30 hover:bg-white/15'
            >
              <Icon
                variant='plus'
                className='aucctus-stroke-secondary-light'
                height={16}
                width={16}
              />
            </button> */}
          </div>

          {/* Generate Ideas Button */}
          <div className='flex items-end justify-end'>
            <button
              onClick={onGenerateIdeas}
              disabled={
                questions.length === 0 ||
                !questions.some((q) => isQuestionAnswered(q.id))
              }
              className={`btn whitespace-nowrap border px-3 py-2 transition-all duration-300 ${
                questions.length === 0 ||
                !questions.some((q) => isQuestionAnswered(q.id))
                  ? 'btn-disabled backdrop-blur-md'
                  : questions.every((q) => isQuestionAnswered(q.id))
                    ? 'btn-success animate-pulse backdrop-blur-md'
                    : 'btn-success backdrop-blur-md'
              }`}
            >
              <Icon
                variant='lightbulb'
                className={cn('aucctus-stroke-white mr-2', {
                  'animate-pulse-subtle':
                    questions.length !== 0 &&
                    questions.every((q) => isQuestionAnswered(q.id)),
                })}
                height={16}
                width={16}
              />
              Generate Ideas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionNavigationFooter;
