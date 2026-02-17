/**
 * ScoringCriteriaSection - Main container for displaying scoring criteria.
 *
 * This component provides a unified interface for displaying scoring data from:
 * - Concept priority scoring (editable)
 * - Idea submission scoring (readonly)
 *
 * @example
 * ```tsx
 * // Readonly mode for submissions
 * <ScoringCriteriaSection
 *   categories={submissionDetail.categoryScores}
 *   totalScore={submissionDetail.totalScore ?? 0}
 *   variant="readonly"
 *   showQuestionReasoning
 * />
 *
 * // Editable mode for concepts
 * <ScoringCriteriaSection
 *   categories={priorityDetail.categoryScores}
 *   totalScore={overallScore}
 *   variant="editable"
 *   onScoreChange={handleScoreChange}
 *   onConfigureClick={handleConfigureCriteria}
 *   showConfigButton
 *   isUpdating={updateMutation.isLoading}
 *   updatingQuestionId={updatingQuestionId}
 * />
 * ```
 */

import React from 'react';
import { cn } from '@libs/utils/react';

import EmptyScoringState from './EmptyScoringState';
import ScoringCategoryCard from './ScoringCategoryCard';
import { ScoringCriteriaSectionProps } from './types';
import { Settings } from 'lucide-react';

const ScoringCriteriaSection: React.FC<ScoringCriteriaSectionProps> = ({
  categories,
  totalScore,
  variant = 'readonly',
  questionScores = {},
  onScoreChange,
  onConfigureClick,
  showConfigButton = false,
  isUpdating = false,
  updatingQuestionId = null,
  showQuestionReasoning = false,
  className,
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <h3 className='aucctus-text-xl-semibold aucctus-text-primary'>
            Scoring Criteria
          </h3>
          {showConfigButton && onConfigureClick && (
            <button
              className='aucctus-bg-secondary-hover rounded-md p-1.5 transition-colors'
              title='Configure criteria'
              onClick={onConfigureClick}
            >
              <Settings className='aucctus-stroke-tertiary h-4 w-4' />
            </button>
          )}
        </div>
        <div className='aucctus-text-sm-semibold aucctus-text-tertiary'>
          Score: <span className='aucctus-text-primary'>{totalScore}</span>
        </div>
      </div>

      {/* Category Cards */}
      {categories.length > 0 ? (
        <div className='space-y-3'>
          {categories.map((category) => (
            <ScoringCategoryCard
              key={category.categoryUuid}
              category={category}
              variant={variant}
              questionScores={questionScores}
              onScoreChange={onScoreChange}
              isUpdating={isUpdating}
              updatingQuestionId={updatingQuestionId}
              showQuestionReasoning={showQuestionReasoning}
            />
          ))}
        </div>
      ) : (
        <EmptyScoringState
          message={
            variant === 'editable'
              ? 'Run priority scoring from the Portfolio tab to see detailed breakdowns.'
              : 'This submission has not been scored yet.'
          }
        />
      )}
    </div>
  );
};

export default ScoringCriteriaSection;
