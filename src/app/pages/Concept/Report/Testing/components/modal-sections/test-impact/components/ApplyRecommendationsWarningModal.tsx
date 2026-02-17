import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { snakeToTitleCase } from '@libs/utils/string';
import { IComprehensiveEditRecommendation } from '../../../../types';
import { ArrowRight, Check } from 'lucide-react';

interface ApplyRecommendationsWarningModalProps {
  isOpen: boolean;
  selectedRecommendations: IComprehensiveEditRecommendation[];
  onConfirm: () => void;
  onCancel: () => void;
}

const ApplyRecommendationsWarningModal: React.FC<
  ApplyRecommendationsWarningModalProps
> = ({ isOpen, selectedRecommendations, onConfirm, onCancel }) => {
  // Group recommendations by section
  const groupedRecommendations = useMemo(() => {
    const groups: Record<string, IComprehensiveEditRecommendation[]> = {};

    selectedRecommendations.forEach((rec) => {
      if (!groups[rec.section]) {
        groups[rec.section] = [];
      }
      groups[rec.section].push(rec);
    });

    return groups;
  }, [selectedRecommendations]);

  if (
    !isOpen ||
    typeof document === 'undefined' ||
    !document.body ||
    selectedRecommendations.length === 0
  ) {
    return null;
  }

  return createPortal(
    <div
      className='glass-modal-overlay fixed inset-0 z-50 flex items-center justify-center'
      data-aucctus-portal-target='true'
    >
      {/* Click-outside handler */}
      <div className='absolute inset-0' onClick={onCancel} />

      {/* Glass modal */}
      <div className='relative max-w-xl' onClick={(e) => e.stopPropagation()}>
        <div className='liquid-glass-modal-shell'>
          <div
            aria-hidden='true'
            className='liquid-glass-modal-rim liquid-glass-modal-rim-animated'
          >
            <div className='rim-orb rim-orb-1' />
            <div className='rim-orb rim-orb-2' />
          </div>
          <div className='liquid-glass-modal-surface p-6'>
            {/* Header */}
            <div className='mb-4'>
              <div className='mb-1 flex items-center gap-2'>
                <Check className='aucctus-stroke-brand-primary h-5 w-5' />
                <h3 className='aucctus-text-lg-semibold aucctus-text-primary'>
                  Apply Recommended Changes
                </h3>
              </div>
              <p className='aucctus-text-sm aucctus-text-secondary'>
                Review the changes that will be applied to your concept
              </p>
            </div>

            {/* Content - Grouped Recommendations */}
            <div className='mb-6 max-h-[300px] space-y-4 overflow-y-auto py-2'>
              {Object.entries(groupedRecommendations).map(
                ([section, recommendations]) => (
                  <div key={section} className='space-y-2'>
                    <div className='aucctus-text-sm-medium aucctus-text-primary'>
                      {snakeToTitleCase(section)}
                    </div>
                    {recommendations.map((rec) => (
                      <div
                        key={rec.uuid}
                        className='aucctus-bg-secondary rounded-md p-2'
                      >
                        {rec.beforeContent && rec.afterContent ? (
                          <div className='flex items-center gap-2'>
                            <div className='aucctus-text-sm aucctus-text-tertiary flex-1'>
                              {rec.beforeContent}
                            </div>
                            <ArrowRight className='aucctus-stroke-tertiary h-4 w-4 flex-shrink-0' />
                            <div className='aucctus-text-sm-medium aucctus-text-primary flex-1'>
                              {rec.afterContent}
                            </div>
                          </div>
                        ) : (
                          <span className='aucctus-text-sm aucctus-text-primary'>
                            {rec.recommendation}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ),
              )}
            </div>

            {/* Actions */}
            <div className='flex justify-end gap-3'>
              <button className='btn btn-light btn-sm' onClick={onCancel}>
                Cancel
              </button>
              <button className='btn btn-primary btn-sm' onClick={onConfirm}>
                Apply Changes & Regenerate Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ApplyRecommendationsWarningModal;
