import React from 'react';
import { Icon } from '@components';
import { Question } from '../types';

interface QuestionSelectorProps {
  question: Question;
  index: number;
  isActive: boolean;
  isAnswered: boolean;
  onSelect: () => void;
  onRemove?: () => void;
}

const QuestionSelector: React.FC<QuestionSelectorProps> = ({
  question,
  index,
  isActive,
  isAnswered,
  onSelect,
  onRemove,
}) => {
  const isCustomQuestion = question.id.startsWith('custom-');

  return (
    <button
      onClick={onSelect}
      className={`group relative flex h-14 min-w-20 flex-shrink-0 flex-col items-center justify-center rounded-lg border px-4 py-2 transition-all duration-300 ${
        isActive && isAnswered
          ? 'aucctus-bg-success-solid aucctus-border-success aucctus-text-white shadow-lg'
          : isActive
            ? 'aucctus-text-white border-white/40 bg-white/20 shadow-lg'
            : isAnswered
              ? 'aucctus-bg-success-glass aucctus-border-success aucctus-text-success-primary hover:aucctus-bg-success-glass-hover'
              : 'aucctus-text-quaternary border-white/20 bg-white/10 hover:border-white/30 hover:bg-white/15'
      }`}
    >
      {isCustomQuestion && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className='aucctus-bg-secondary-solid hover:aucctus-bg-secondary-solid-hover absolute -right-1 -top-1 z-[100] flex h-5 w-5 items-center justify-center rounded-full opacity-0 transition-all duration-200 group-hover:opacity-100'
        >
          <Icon
            variant='closeX'
            className='aucctus-stroke-white'
            height={12}
            width={12}
          />
        </button>
      )}

      <div className='aucctus-text-sm-medium text-center leading-tight'>
        {question.label}
      </div>
      <div className='aucctus-text-xs aucctus-text-white mt-1 opacity-50'>
        {index + 1}
      </div>
    </button>
  );
};

export default QuestionSelector;
