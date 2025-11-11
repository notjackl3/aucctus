import React, { useState, useMemo, useEffect } from 'react';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import ApplyRecommendationsWarningModal from './ApplyRecommendationsWarningModal';

interface ComprehensiveEditRecommendation {
  uuid: string;
  section: string;
  recommendation: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  rationale: string;
  sourceCount: number;
  sourceDetails: string[];
  status: 'pending' | 'applied' | 'rejected';
  appliedAt?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface RecommendedChangesSectionProps {
  recommendations: ComprehensiveEditRecommendation[];
  onApplyRecommendations: (selectedUuids: string[]) => void;
  isApplying?: boolean;
}

const priorityConfig = {
  critical: {
    color: 'aucctus-text-error-primary',
    bgColor: 'aucctus-bg-error-subtle',
    label: 'Critical',
  },
  high: {
    color: 'aucctus-text-warning-primary',
    bgColor: 'aucctus-bg-warning-subtle',
    label: 'High',
  },
  medium: {
    color: 'aucctus-text-info-primary',
    bgColor: 'aucctus-bg-info-subtle',
    label: 'Medium',
  },
  low: {
    color: 'aucctus-text-secondary',
    bgColor: 'aucctus-bg-secondary-subtle',
    label: 'Low',
  },
};

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

  // Track selected recommendation UUIDs (default all pending selected)
  const [selectedUuids, setSelectedUuids] = useState<Set<string>>(new Set());

  // Track whether to show warning modal
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Sync selectedUuids when pendingRecommendations change (e.g., after deletion/regeneration)
  useEffect(() => {
    setSelectedUuids(new Set(pendingRecommendations.map((rec) => rec.uuid)));
  }, [pendingRecommendations]);

  // Check if all pending recommendations are selected
  const allSelected = useMemo(
    () =>
      pendingRecommendations.length > 0 &&
      selectedUuids.size === pendingRecommendations.length,
    [selectedUuids, pendingRecommendations],
  );

  const handleToggleAll = () => {
    if (allSelected) {
      setSelectedUuids(new Set());
    } else {
      setSelectedUuids(new Set(pendingRecommendations.map((rec) => rec.uuid)));
    }
  };

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
    <div className='aucctus-bg-secondary-subtle aucctus-border-secondary mt-8 space-y-4 rounded-lg border p-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Icon
            variant='lightbulb'
            className='aucctus-stroke-brand-primary h-5 w-5'
          />
          <h3 className='aucctus-text-lg-semibold aucctus-text-brand-primary'>
            Recommended Concept Changes
          </h3>
        </div>
        {pendingRecommendations.length > 0 && (
          <div className='flex items-center gap-3'>
            <button
              className='btn btn-secondary btn-sm flex items-center gap-2'
              onClick={handleToggleAll}
              disabled={isApplying}
            >
              <Icon
                variant={allSelected ? 'check' : 'plus'}
                className='aucctus-stroke-tertiary h-4 w-4'
              />
              {allSelected ? 'Deselect All' : 'Select All'}
            </button>
            <button
              className={cn('btn btn-sm flex items-center gap-2', {
                'btn-primary': selectedUuids.size > 0 && !isApplying,
                'btn-disabled': selectedUuids.size === 0 || isApplying,
              })}
              onClick={handleApply}
              disabled={selectedUuids.size === 0 || isApplying}
            >
              {isApplying ? (
                <>
                  <Icon
                    variant='loading-02'
                    className='aucctus-stroke-disabled h-4 w-4 animate-spin'
                  />
                  Applying...
                </>
              ) : (
                <>
                  <Icon
                    variant='check'
                    className={cn('h-4 w-4', {
                      'aucctus-stroke-white': selectedUuids.size > 0,
                      'aucctus-stroke-disabled': selectedUuids.size === 0,
                    })}
                  />
                  Apply {selectedUuids.size} Recommendation
                  {selectedUuids.size !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Detailed Recommendations List */}
      <div className='space-y-4'>
        {/* Pending Recommendations */}
        {pendingRecommendations.map((recommendation) => {
          const isSelected = selectedUuids.has(recommendation.uuid);
          const priorityStyle = priorityConfig[recommendation.priority];

          return (
            <div
              key={recommendation.uuid}
              className={cn(
                'aucctus-border-secondary cursor-pointer rounded-lg border-2 p-4 transition-all duration-200',
                {
                  'aucctus-bg-brand-primary aucctus-border-brand': isSelected,
                  'aucctus-bg-primary aucctus-bg-secondary-hover': !isSelected,
                },
              )}
              onClick={() =>
                handleToggleRecommendation(recommendation.uuid, false)
              }
            >
              <div className='flex items-start gap-3'>
                {/* Checkbox */}
                <div className='flex-shrink-0 pt-1'>
                  <div
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded border-2 transition-all duration-200',
                      {
                        'aucctus-bg-brand-solid aucctus-border-brand':
                          isSelected,
                        'aucctus-border-secondary aucctus-bg-primary':
                          !isSelected,
                      },
                    )}
                  >
                    {isSelected && (
                      <Icon
                        variant='check'
                        className='aucctus-stroke-white h-3 w-3'
                      />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className='flex-1 space-y-2'>
                  <div className='flex items-start justify-between gap-2'>
                    <h4 className='aucctus-text-md-semibold aucctus-text-brand-primary flex-1'>
                      {recommendation.recommendation}
                    </h4>
                    <div
                      className={cn(
                        'aucctus-text-xs-medium rounded-full px-2 py-1',
                        priorityStyle.bgColor,
                        priorityStyle.color,
                      )}
                    >
                      {priorityStyle.label}
                    </div>
                  </div>

                  <p className='aucctus-text-sm-regular aucctus-text-secondary'>
                    <span className='aucctus-text-tertiary'>Target:</span>{' '}
                    {recommendation.section}
                  </p>

                  <div className='aucctus-bg-secondary-subtle rounded-md p-3'>
                    <p className='aucctus-text-xs-medium aucctus-text-tertiary mb-1'>
                      Rationale:
                    </p>
                    <p className='aucctus-text-xs-regular aucctus-text-secondary'>
                      {recommendation.rationale}
                    </p>
                  </div>

                  {recommendation.sourceCount > 0 && (
                    <div className='flex items-center gap-2'>
                      <Icon
                        variant='users-03'
                        className='aucctus-stroke-tertiary h-4 w-4'
                      />
                      <p className='aucctus-text-xs-regular aucctus-text-tertiary'>
                        Based on {recommendation.sourceCount} test result
                        {recommendation.sourceCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Applied Recommendations */}
        {appliedRecommendations.map((recommendation) => {
          const priorityStyle = priorityConfig[recommendation.priority];

          return (
            <div
              key={recommendation.uuid}
              className='aucctus-border-secondary aucctus-bg-secondary-subtle cursor-not-allowed rounded-lg border-2 p-4 opacity-60'
            >
              <div className='flex items-start gap-3'>
                {/* Checkmark indicator */}
                <div className='flex-shrink-0 pt-1'>
                  <div className='aucctus-bg-success-solid aucctus-border-success flex h-5 w-5 items-center justify-center rounded border-2'>
                    <Icon
                      variant='check'
                      className='aucctus-stroke-white h-3 w-3'
                    />
                  </div>
                </div>

                {/* Content */}
                <div className='flex-1 space-y-2'>
                  <div className='flex items-start justify-between gap-2'>
                    <h4 className='aucctus-text-md-semibold aucctus-text-tertiary flex-1'>
                      {recommendation.recommendation}
                    </h4>
                    <div className='flex items-center gap-2'>
                      <div className='aucctus-bg-success-subtle aucctus-text-success-primary aucctus-text-xs-medium rounded-full px-2 py-1'>
                        Applied
                      </div>
                      <div
                        className={cn(
                          'aucctus-text-xs-medium rounded-full px-2 py-1',
                          priorityStyle.bgColor,
                          priorityStyle.color,
                        )}
                      >
                        {priorityStyle.label}
                      </div>
                    </div>
                  </div>

                  <p className='aucctus-text-sm-regular aucctus-text-tertiary'>
                    <span className='aucctus-text-quaternary'>Target:</span>{' '}
                    {recommendation.section}
                  </p>

                  <div className='aucctus-bg-secondary rounded-md p-3'>
                    <p className='aucctus-text-xs-medium aucctus-text-quaternary mb-1'>
                      Rationale:
                    </p>
                    <p className='aucctus-text-xs-regular aucctus-text-tertiary'>
                      {recommendation.rationale}
                    </p>
                  </div>

                  {recommendation.sourceCount > 0 && (
                    <div className='flex items-center gap-2'>
                      <Icon
                        variant='users-03'
                        className='aucctus-stroke-quaternary h-4 w-4'
                      />
                      <p className='aucctus-text-xs-regular aucctus-text-quaternary'>
                        Based on {recommendation.sourceCount} test result
                        {recommendation.sourceCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Warning Modal */}
      {showWarningModal && (
        <ApplyRecommendationsWarningModal
          recommendationCount={selectedUuids.size}
          onConfirm={handleConfirmApply}
          onCancel={handleCancelApply}
        />
      )}
    </div>
  );
};

export default RecommendedChangesSection;
