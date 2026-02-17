/**
 * ScoringCategoryCard - A collapsible card showing a scoring category with questions.
 *
 * Supports both readonly and editable modes:
 * - readonly: Used for idea submissions where scores are AI-generated
 * - editable: Used for concepts where users can adjust scores
 */

import React, { useState } from 'react';
import { cn } from '@libs/utils/react';

import { ScoringCategoryCardProps, QuestionImportance } from './types';
import { ChevronDown } from 'lucide-react';
import { DynamicIcon } from '@libs/utils/iconMap';

/**
 * Map icon name from backend to frontend icon variant
 */
const mapIconVariant = (icon: string): string => {
  const iconMap: Record<string, string> = {
    target: 'target',
    'trending-up': 'trending-up',
    'users-02': 'users-02',
    zap: 'zap',
    'shield-dollar': 'shield-dollar',
    beaker: 'beaker',
    'currency-dollar': 'currency-dollar',
  };
  return iconMap[icon] || 'target';
};

/**
 * Get color classes for importance badge
 */
const getImportanceClasses = (importance: QuestionImportance): string => {
  switch (importance) {
    case 'high':
      return 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-950 dark:text-emerald-400';
    case 'medium':
      return 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-600 dark:bg-amber-950 dark:text-amber-400';
    case 'low':
    default:
      return 'border-slate-300 bg-slate-50 text-slate-600 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-400';
  }
};

const ScoringCategoryCard: React.FC<ScoringCategoryCardProps> = ({
  category,
  variant = 'readonly',
  questionScores = {},
  onScoreChange,
  isUpdating = false,
  updatingQuestionId = null,
  showQuestionReasoning = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const percentage =
    category.maxScore > 0 ? (category.score / category.maxScore) * 100 : 0;

  const getScoreColor = () => {
    if (percentage < 50) return 'text-red-500';
    if (percentage < 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getBorderColor = () => {
    if (percentage < 50) return 'border-l-red-500';
    if (percentage < 75) return 'border-l-yellow-500';
    return 'border-l-green-500';
  };

  const isEditable = variant === 'editable' && onScoreChange;

  return (
    <div
      className={cn(
        'aucctus-bg-secondary aucctus-border-secondary overflow-hidden rounded-xl border border-l-4 shadow-sm',
        getBorderColor(),
      )}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='group w-full transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50'
      >
        <div className='flex items-center justify-between p-5'>
          <div className='flex flex-1 items-center gap-3 text-left'>
            <div className='aucctus-bg-tertiary rounded-md p-2'>
              <DynamicIcon
                variant={mapIconVariant(category.categoryIcon) as any}
                className='aucctus-stroke-secondary h-4 w-4'
              />
            </div>
            <div>
              <h4 className='aucctus-text-md-semibold aucctus-text-primary'>
                {category.categoryName}
              </h4>
              <p className='aucctus-text-sm aucctus-text-tertiary'>
                {category.questions.length} question
                {category.questions.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-4'>
            <div className='text-right'>
              <div className={cn('text-2xl font-bold', getScoreColor())}>
                {category.score}
              </div>
              <div className='aucctus-text-xs aucctus-text-tertiary'>
                out of {category.maxScore}
              </div>
            </div>
            <ChevronDown
              className={cn(
                'aucctus-stroke-tertiary h-5 w-5 transition-transform duration-200',
                { 'rotate-180': isExpanded },
              )}
            />
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className='aucctus-bg-primary px-5 pb-5 pt-2'>
          {category.questions.map((question) => {
            const score =
              questionScores[question.questionUuid] || question.score || 0;

            return (
              <div
                key={question.questionUuid}
                className='aucctus-border-secondary border-b py-4 last:border-b-0'
              >
                <div className='flex items-start justify-between gap-4'>
                  <div className='flex-1'>
                    <p className='aucctus-text-sm-semibold aucctus-text-primary'>
                      {question.questionText}
                    </p>
                    {/* Show reasoning if available and enabled */}
                    {showQuestionReasoning && question.reasoning && (
                      <p className='aucctus-text-sm aucctus-text-tertiary mt-2'>
                        {question.reasoning}
                      </p>
                    )}
                  </div>

                  {/* Score buttons - same appearance for both variants */}
                  <div className='flex items-center gap-1'>
                    {[1, 2, 3, 4, 5].map((value) => {
                      const isThisUpdating =
                        isUpdating &&
                        updatingQuestionId === question.questionUuid;
                      const isDisabled = !isEditable || isUpdating;

                      return (
                        <button
                          key={value}
                          onClick={() =>
                            isEditable &&
                            onScoreChange?.(question.questionUuid, value)
                          }
                          disabled={isDisabled}
                          className={cn(
                            'h-8 w-8 rounded-md text-sm font-medium transition-all',
                            score === value
                              ? 'bg-[#5C3D2E] text-white'
                              : 'aucctus-bg-primary aucctus-border-secondary aucctus-text-tertiary border',
                            {
                              'hover:aucctus-text-primary cursor-pointer':
                                isEditable && !isUpdating,
                              'cursor-default': !isEditable,
                              'cursor-not-allowed opacity-50':
                                isEditable && isUpdating,
                              'animate-pulse':
                                isThisUpdating && score === value,
                            },
                          )}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Importance badge */}
                <div className='mt-2'>
                  <span
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium',
                      getImportanceClasses(question.importance),
                    )}
                  >
                    {question.importance.charAt(0).toUpperCase() +
                      question.importance.slice(1)}{' '}
                    Priority
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ScoringCategoryCard;
