import React from 'react';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import StatusDropdown from '../StatusDropdown/StatusDropdown';
import { NucleusReportQuestion } from '@libs/api/types';
import { QuestionState } from './types';

interface QuestionCardProps {
  question: NucleusReportQuestion;
  index: number;
  isCore: boolean;
  isSelected: boolean;
  questionState: QuestionState;
  activeDropdown: string | null;
  onSelect: (questionUuid: string) => void;
  onStatusChange: (questionUuid: string, status: QuestionState) => void;
  onEdit: (question: NucleusReportQuestion) => void;
  onDelete: (question: NucleusReportQuestion) => void;
  setActiveDropdown: (dropdownId: string | null) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  isCore,
  isSelected,
  questionState,
  activeDropdown,
  onSelect,
  onStatusChange,
  onEdit,
  onDelete,
  setActiveDropdown,
}) => {
  return (
    <div
      key={question.uuid}
      className={cn(
        'group relative cursor-pointer rounded-lg border p-3 transition-all duration-200',
        {
          'aucctus-bg-brand-primary aucctus-border-brand shadow-sm':
            isSelected && isCore,
          'aucctus-bg-secondary aucctus-border-secondary shadow-sm':
            isSelected && !isCore,
          'aucctus-bg-secondary aucctus-border-secondary hover:aucctus-bg-secondary-hover':
            !isSelected && isCore,
          'aucctus-bg-tertiary aucctus-border-tertiary hover:aucctus-bg-tertiary-hover':
            !isSelected && !isCore,
        },
      )}
      onClick={() => onSelect(question.uuid)}
    >
      {/* Hover actions for edit and delete - positioned to avoid status dropdown */}
      <div className='absolute bottom-2 right-2 z-20 flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
        <button
          className='aucctus-bg-primary aucctus-border-secondary hover:aucctus-bg-primary-hover rounded-md border p-1 shadow-sm'
          onClick={(e) => {
            e.stopPropagation();
            onEdit(question);
          }}
          aria-label='Edit question'
        >
          <Icon variant='edit' className='aucctus-stroke-secondary h-3 w-3' />
        </button>
        <button
          className='aucctus-bg-primary aucctus-border-secondary hover:aucctus-bg-primary-hover rounded-md border p-1 shadow-sm'
          onClick={(e) => {
            e.stopPropagation();
            onDelete(question);
          }}
          aria-label='Delete question'
        >
          <Icon
            variant='trash'
            className='aucctus-stroke-error-primary h-3 w-3'
          />
        </button>
      </div>

      <div className='mb-2 flex items-start justify-between gap-2'>
        <span
          className={cn('aucctus-text-xs font-medium', {
            'aucctus-text-tertiary': isCore,
            'aucctus-text-quaternary': !isCore,
          })}
        >
          {isCore ? `Q${index + 1}` : `D${index + 1}`}
        </span>
        <div
          className='flex items-center gap-2'
          onClick={(e) => e.stopPropagation()}
        >
          <StatusDropdown
            currentStatus={questionState}
            onStatusChange={(status) =>
              onStatusChange(question.uuid, status as QuestionState)
            }
            dropdownId={`question-${question.uuid}`}
            isCategory={false}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            compact={true}
          />
        </div>
      </div>
      <p
        className={cn('aucctus-text-sm pr-12 leading-relaxed', {
          'aucctus-text-secondary': isCore,
          'aucctus-text-tertiary': !isCore,
        })}
      >
        {question.question}
      </p>
    </div>
  );
};

export default React.memo(QuestionCard);
