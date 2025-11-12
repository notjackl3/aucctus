import React, { useCallback } from 'react';
import { useModal } from '@context/ModalContextProvider';
import GenericStatusBadge from '@pages/Concept/Report/Assumptions/components/shared/GenericStatusBadge';
import CategoryIcon from '@pages/Concept/Report/Assumptions/components/cards/category-progress-card/CategoryIcon';
import { RISK_LEVEL_CONFIGS } from '@pages/Concept/Report/Assumptions/constants/statusConfigs';
import type { AssumptionCategory } from '@libs/api/types/concept/assumptions';

interface AssumptionDisplayItem {
  uuid: string;
  statement: string;
  category: AssumptionCategory;
  riskCategory: string;
}

interface RegenerateTestWarningModalProps {
  onConfirm?: () => void;
  onCancel?: () => void;
  removedAssumptions?: AssumptionDisplayItem[];
  addedAssumptions?: AssumptionDisplayItem[];
}

const RegenerateTestWarningModal: React.FC<RegenerateTestWarningModalProps> = ({
  onConfirm,
  onCancel,
  removedAssumptions = [],
  addedAssumptions = [],
}) => {
  const { closeModal } = useModal();

  const handleConfirm = useCallback(() => {
    closeModal();
    if (onConfirm) {
      onConfirm();
    }
  }, [onConfirm, closeModal]);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    }
    closeModal();
  }, [onCancel, closeModal]);

  return (
    <div className='aucctus-bg-primary inline-flex max-h-[72vh] w-full max-w-[470px] flex-col items-center justify-start rounded-xl'>
      {/* Header */}
      <div className='w-full p-6 pb-4'>
        <h2 className='aucctus-text-lg-bold aucctus-text-primary mx-auto max-w-xs text-center'>
          Changing Assumptions Will Regenerate Test Content
        </h2>
      </div>

      {/* Content */}
      <div className='w-full overflow-y-auto px-6 pb-6'>
        <div className='w-full space-y-4'>
          {/* Warning Message */}
          <p className='aucctus-text-sm aucctus-text-secondary text-center'>
            This action cannot be undone.
          </p>

          {(removedAssumptions.length > 0 || addedAssumptions.length > 0) && (
            <div className='space-y-4 pt-2'>
              {/* Removed Assumptions */}
              {removedAssumptions.length > 0 && (
                <div className='space-y-2'>
                  <p className='aucctus-text-sm-semibold aucctus-text-error-primary'>
                    Removed ({removedAssumptions.length}):
                  </p>
                  <div className='mx-auto w-full max-w-3xl space-y-2'>
                    {removedAssumptions.map((assumption) => {
                      const riskConfig =
                        RISK_LEVEL_CONFIGS[assumption.riskCategory] ||
                        RISK_LEVEL_CONFIGS.medium;

                      return (
                        <div
                          key={assumption.uuid}
                          className='aucctus-bg-error-subtle aucctus-border-error-extra-subtle rounded-lg border p-3'
                        >
                          <div className='mb-2 flex items-start justify-between'>
                            <div className='flex items-center gap-1.5'>
                              <CategoryIcon category={assumption.category} />
                              <span className='aucctus-text-sm-medium aucctus-text-primary capitalize'>
                                {assumption.category}
                              </span>
                            </div>
                            <GenericStatusBadge config={riskConfig} />
                          </div>
                          <p className='aucctus-text-sm-medium aucctus-text-primary'>
                            {assumption.statement}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Added Assumptions */}
              {addedAssumptions.length > 0 && (
                <div className='space-y-2'>
                  <p className='aucctus-text-sm-semibold aucctus-text-success-primary'>
                    Added ({addedAssumptions.length}):
                  </p>
                  <div className='mx-auto w-full max-w-3xl space-y-2'>
                    {addedAssumptions.map((assumption) => {
                      const riskConfig =
                        RISK_LEVEL_CONFIGS[assumption.riskCategory] ||
                        RISK_LEVEL_CONFIGS.medium;

                      return (
                        <div
                          key={assumption.uuid}
                          className='aucctus-bg-success-subtle aucctus-border-success-extra-subtle rounded-lg border p-3'
                        >
                          <div className='mb-2 flex items-start justify-between'>
                            <div className='flex items-center gap-1.5'>
                              <CategoryIcon category={assumption.category} />
                              <span className='aucctus-text-sm-medium aucctus-text-primary capitalize'>
                                {assumption.category}
                              </span>
                            </div>
                            <GenericStatusBadge config={riskConfig} />
                          </div>
                          <p className='aucctus-text-sm-medium aucctus-text-primary'>
                            {assumption.statement}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className='flex justify-end gap-3 pt-2'>
            <button
              type='button'
              className='btn btn-secondary'
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type='button'
              className='btn btn-primary'
              onClick={handleConfirm}
            >
              Proceed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegenerateTestWarningModal;
