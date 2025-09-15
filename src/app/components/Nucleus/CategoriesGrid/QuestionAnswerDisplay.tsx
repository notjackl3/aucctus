import React, { useMemo } from 'react';
import { Icon } from '@components';
import LoadingMask from '@components/Card/ConceptGeneration/UserExploration/components/util/LoadingMask';
import { expandedCategoryViewUIText } from './expandedCategoryViewFixtures';
import { NucleusReportQuestion } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import AnswerCard from './AnswerCard';

interface QuestionAnswerDisplayProps {
  selectedQuestionData: NucleusReportQuestion | undefined;
  onAddAnswer: (questionUuid: string) => void;
  onEditAnswer: (answer: any) => void;
  onDeleteAnswer: (answer: any) => void;
  isAddingLoading?: boolean;
  isEditingLoading?: boolean;
  isDeletingLoading?: boolean;
  isAdmin: boolean;
}

const QuestionAnswerDisplay: React.FC<QuestionAnswerDisplayProps> = ({
  selectedQuestionData,
  onAddAnswer,
  onEditAnswer,
  onDeleteAnswer,
  isAddingLoading = false,
  isEditingLoading = false,
  isDeletingLoading = false,
  isAdmin,
}) => {
  // Aggregate loading states
  const isLoading = useMemo(
    () => isAddingLoading || isEditingLoading || isDeletingLoading,
    [isAddingLoading, isEditingLoading, isDeletingLoading],
  );
  if (!selectedQuestionData) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className='aucctus-text-tertiary py-8 text-center'>
          <Icon variant='file' className='mx-auto mb-2 h-8 w-8 opacity-50' />
          <p className='aucctus-text-sm'>
            {expandedCategoryViewUIText.placeholders.selectQuestionToView}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-full flex-col'>
      {/* Answers Header */}
      <div className='mb-4 flex items-center justify-between'>
        <h4 className='aucctus-text-primary font-semibold'>
          {expandedCategoryViewUIText.headers.answers}
        </h4>
        <button
          className={cn(
            'aspect-square rounded-lg p-1',
            isAdmin
              ? 'aucctus-bg-primary-hover cursor-pointer'
              : 'aucctus-bg-disabled cursor-not-allowed opacity-50',
          )}
          aria-label='Add Answer'
          title={isAdmin ? 'Add Answer' : 'Admin access required'}
          onClick={
            isAdmin ? () => onAddAnswer(selectedQuestionData.uuid) : undefined
          }
          disabled={!isAdmin}
        >
          <Icon
            variant='plus'
            className={cn(
              'h-5 w-5',
              isAdmin
                ? 'aucctus-stroke-brand-primary'
                : 'aucctus-stroke-disabled',
            )}
          />
        </button>
      </div>

      {/* Answer Content */}
      <div className='flex-1 overflow-y-auto'>
        {selectedQuestionData.answers &&
        selectedQuestionData.answers.length > 0 ? (
          <div className='space-y-4'>
            {/* Multiple Answers */}
            {selectedQuestionData.answers.map((answer) => (
              <AnswerCard
                key={answer.uuid}
                answer={answer}
                onEdit={onEditAnswer}
                onDelete={onDeleteAnswer}
                isEditingLoading={isEditingLoading}
                isDeletingLoading={isDeletingLoading}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        ) : (
          <div className='flex h-full items-center justify-center'>
            <div className='aucctus-text-tertiary py-8 text-center'>
              <Icon
                variant='clock'
                className='mx-auto mb-3 h-8 w-8 opacity-50'
              />
              <p className='aucctus-text-sm mb-3'>
                {expandedCategoryViewUIText.placeholders.questionNotAnswered}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Loading overlay */}
      <LoadingMask isLoading={isLoading} />
    </div>
  );
};

export default QuestionAnswerDisplay;
