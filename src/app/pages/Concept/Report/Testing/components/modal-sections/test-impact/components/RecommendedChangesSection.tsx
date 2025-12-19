import React, { useState, useMemo, useEffect } from 'react';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import ApplyRecommendationsWarningModal from './ApplyRecommendationsWarningModal';
import { IComprehensiveEditRecommendation } from '../../../../types';

interface RecommendedChangesSectionProps {
  recommendations: IComprehensiveEditRecommendation[];
  onApplyRecommendations: (selectedUuids: string[]) => void;
  isApplying?: boolean;
}

const RecommendedChangesSection: React.FC<RecommendedChangesSectionProps> = ({
  recommendations,
  onApplyRecommendations,
  isApplying = false,
}) => {
  // Separate pending and applied recommendations
  const pendingRecommendations = useMemo(
    () => recommendations.filter((rec) => rec.status === 'pending'),
    [recommendations],
  );

  const appliedRecommendations = useMemo(
    () => recommendations.filter((rec) => rec.status === 'applied'),
    [recommendations],
  );

  // Track selected recommendation UUIDs (default none selected)
  const [selectedUuids, setSelectedUuids] = useState<Set<string>>(new Set());

  // Track whether to show warning modal
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Reset selection when pendingRecommendations change
  useEffect(() => {
    setSelectedUuids(new Set());
  }, [pendingRecommendations]);

  const handleToggleRecommendation = (uuid: string, isApplied: boolean) => {
    // Don't allow toggling applied recommendations
    if (isApplied) return;

    setSelectedUuids((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(uuid)) {
        newSet.delete(uuid);
      } else {
        newSet.add(uuid);
      }
      return newSet;
    });
  };

  const handleApply = () => {
    if (selectedUuids.size > 0) {
      setShowWarningModal(true);
    }
  };

  const handleConfirmApply = () => {
    setShowWarningModal(false);
    onApplyRecommendations(Array.from(selectedUuids));
  };

  const handleCancelApply = () => {
    setShowWarningModal(false);
  };

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className='space-y-5'>
      {/* Header */}
      <div className='space-y-2'>
        <div className='flex items-center gap-2'>
          <Icon
            variant='lightbulb'
            className='aucctus-stroke-brand-primary h-5 w-5'
          />
          <h4 className='aucctus-text-lg-semibold aucctus-text-brand-primary'>
            Recommended Changes to Your Concept
          </h4>
        </div>
        <p className='aucctus-text-sm aucctus-text-tertiary'>
          Select the changes you&apos;d like to apply to your concept based on
          test results.
        </p>
      </div>

      {/* Recommendations Grid */}
      <div className='grid gap-4'>
        {/* Pending Recommendations */}
        {pendingRecommendations.map((recommendation) => {
          const isSelected = selectedUuids.has(recommendation.uuid);

          return (
            <div key={recommendation.uuid} className='group relative'>
              <button
                onClick={() =>
                  handleToggleRecommendation(recommendation.uuid, false)
                }
                disabled={isApplying}
                className={cn(
                  'w-full rounded-xl border p-4 text-left shadow-sm transition-all',
                  {
                    'aucctus-border-brand aucctus-bg-brand-primary shadow-brand/10':
                      isSelected,
                    'aucctus-border-secondary aucctus-bg-primary hover:shadow-md':
                      !isSelected,
                    'cursor-not-allowed opacity-50': isApplying,
                  },
                )}
              >
                <div className='pr-8'>
                  <span
                    className={cn('aucctus-text-sm leading-relaxed', {
                      'aucctus-text-primary font-medium': isSelected,
                      'aucctus-text-primary': !isSelected,
                    })}
                  >
                    {recommendation.recommendation}
                  </span>
                </div>
              </button>
              {isSelected && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleRecommendation(recommendation.uuid, false);
                  }}
                  disabled={isApplying}
                  className='aucctus-bg-secondary absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:opacity-80'
                >
                  <Icon
                    variant='closeX'
                    className='aucctus-stroke-tertiary h-4 w-4'
                  />
                </button>
              )}
            </div>
          );
        })}

        {/* Applied Recommendations */}
        {appliedRecommendations.map((recommendation) => (
          <div
            key={recommendation.uuid}
            className='aucctus-border-success-subtle aucctus-bg-success-subtle relative cursor-not-allowed rounded-xl border p-4 opacity-60'
          >
            <div className='flex items-start gap-3'>
              <div className='aucctus-bg-success-solid flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full'>
                <Icon variant='check' className='h-3 w-3 stroke-white' />
              </div>
              <span className='aucctus-text-sm aucctus-text-tertiary leading-relaxed'>
                {recommendation.recommendation}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className='flex items-center justify-between pt-4'>
        <span className='aucctus-text-sm aucctus-text-tertiary'>
          {selectedUuids.size} of {pendingRecommendations.length} changes
          selected
        </span>
        <button
          onClick={handleApply}
          disabled={selectedUuids.size === 0 || isApplying}
          className={cn('btn btn-md flex items-center gap-2', {
            'btn-primary': selectedUuids.size > 0 && !isApplying,
            'btn-disabled': selectedUuids.size === 0 || isApplying,
          })}
        >
          {isApplying ? (
            <>
              <Icon
                variant='loading-02'
                className='h-4 w-4 animate-spin stroke-current'
              />
              Applying...
            </>
          ) : (
            <>
              <Icon variant='check' className='h-4 w-4 stroke-current' />
              Apply Selected Changes
            </>
          )}
        </button>
      </div>

      {/* Warning Modal */}
      <ApplyRecommendationsWarningModal
        isOpen={showWarningModal}
        selectedRecommendations={pendingRecommendations.filter((rec) =>
          selectedUuids.has(rec.uuid),
        )}
        onConfirm={handleConfirmApply}
        onCancel={handleCancelApply}
      />
    </div>
  );
};

export default RecommendedChangesSection;
