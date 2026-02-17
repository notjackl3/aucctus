import React from 'react';
import { cn } from '@libs/utils/react';
import { ExpandCollapse } from '@hooks/animation/animation.hook';
import { TestResultCardProps } from '../TestResults.types';
import SyntheticResultView from './SyntheticResultView';
import RegularResultView from './RegularResultView';
import { Eye, Trash2 } from 'lucide-react';
import { DynamicIcon } from '@libs/utils/iconMap';

interface TestResultCardPropsExtended extends TestResultCardProps {
  isExpanded: boolean;
  onToggleExpansion: () => void;
}

const TestResultCard: React.FC<TestResultCardPropsExtended> = ({
  result,
  viewMode,
  onToggleViewMode,
  onDeleteResult,
  onDeleteFile,
  canDelete,
  isProcessingComplete,
  isExpanded,
  onToggleExpansion,
}) => {
  const isSyntheticExpanded = isExpanded && result.isSynthetic;

  // Handle card click for expansion (only for synthetic results)
  const handleCardClick = (e: React.MouseEvent) => {
    // Only handle clicks for synthetic results
    if (!result.isSynthetic) return;

    // Prevent expansion if clicking on action buttons
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return; // Don't expand if clicking on any button
    }

    onToggleExpansion();
  };

  // Handle keyboard events for accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!result.isSynthetic) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggleExpansion();
    }
  };

  return (
    <div
      className={cn(
        'aucctus-border-secondary aucctus-bg-primary w-full rounded-lg border transition-all duration-300 hover:shadow-md',
        result.isSynthetic &&
          'cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50',
      )}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={result.isSynthetic ? 0 : -1}
      role={result.isSynthetic ? 'button' : undefined}
      aria-expanded={result.isSynthetic ? isExpanded : undefined}
      aria-label={
        result.isSynthetic
          ? `${isExpanded ? 'Collapse' : 'Expand'} ${result.title}`
          : undefined
      }
    >
      {/* Card Header */}
      <div className='aucctus-border-secondary border-b px-4 py-3'>
        <div className='flex items-center gap-3'>
          <div className='aucctus-bg-brand-secondary flex h-8 w-8 items-center justify-center rounded-full'>
            <DynamicIcon
              variant={result.isSynthetic ? 'ai-conclusion' : 'file-2'}
              className='aucctus-stroke-brand-primary h-4 w-4'
            />
          </div>
          <h3 className='aucctus-text-base-medium aucctus-text-primary flex-1'>
            {result.title}
          </h3>

          {/* Action Buttons - Moved to right side of header */}
          <div className='flex items-center gap-2'>
            {/* Only show View Raw button when card is expanded */}
            {result.isSynthetic &&
              result.rawInterviewTranscript &&
              isExpanded && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleViewMode(result.uuid);
                  }}
                  className='aucctus-text-secondary hover:aucctus-text-primary aucctus-bg-secondary-hover flex items-center gap-1 rounded px-2 py-1 text-sm transition-colors'
                >
                  <Eye className='aucctus-stroke-secondary h-4 w-4' />
                  {viewMode === 'raw'
                    ? 'View Structured'
                    : 'View Raw Interview'}
                </button>
              )}

            {canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteResult(result.uuid, result.title);
                }}
                className='aucctus-text-secondary hover:aucctus-text-error-primary aucctus-bg-secondary-hover rounded p-1 transition-colors'
                title='Delete file'
              >
                <Trash2 className='aucctus-stroke-secondary hover:aucctus-stroke-error-primary h-4 w-4 transition-colors' />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Card Content */}
      {result.isSynthetic ? (
        // Animated expand/collapse for synthetic results
        (result.keyInsights ||
          result.painPoints ||
          result.solutionFeedback ||
          result.willingnessToPayFeedback ||
          result.overallSentiment ||
          result.summary) && (
          <ExpandCollapse
            isExpanded={isSyntheticExpanded}
            withOpacity
            maxHeight={5000}
            duration={0.3}
          >
            <SyntheticResultView
              result={result}
              viewMode={viewMode}
              onToggleViewMode={onToggleViewMode}
            />
          </ExpandCollapse>
        )
      ) : (
        <RegularResultView
          result={result}
          canDelete={canDelete}
          isProcessingComplete={isProcessingComplete}
          onDeleteFile={onDeleteFile}
        />
      )}
    </div>
  );
};

export default TestResultCard;
export type { TestResultCardPropsExtended };
