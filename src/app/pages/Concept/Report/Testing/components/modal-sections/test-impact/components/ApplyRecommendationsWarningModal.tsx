import React from 'react';
import { createPortal } from 'react-dom';

interface ApplyRecommendationsWarningModalProps {
  recommendationCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const ApplyRecommendationsWarningModal: React.FC<
  ApplyRecommendationsWarningModalProps
> = ({ recommendationCount, onConfirm, onCancel }) => {
  if (typeof document === 'undefined' || !document.body) {
    return null;
  }

  return createPortal(
    <div
      className='fixed inset-0 z-50 flex items-center justify-center'
      data-aucctus-portal-target='true'
    >
      {/* Backdrop */}
      <div
        className='aucctus-bg-secondary-solid absolute inset-0 bg-opacity-50'
        onClick={onCancel}
      />

      {/* Modal */}
      <div className='aucctus-bg-primary aucctus-border-secondary relative max-w-[400px] rounded-xl border p-6 shadow-lg'>
        {/* Header */}
        <div className='mb-6 text-center'>
          <h3 className='aucctus-text-lg-semibold aucctus-text-brand-primary mb-2'>
            Applying Recommendations
            <br />
            Will Complete Test
          </h3>
          <p className='aucctus-text-sm-regular aucctus-text-secondary'>
            This action cannot be undone.
          </p>
        </div>

        {/* Content */}
        <div className='aucctus-bg-secondary-subtle aucctus-border-secondary mb-6 rounded-lg border p-4'>
          <p className='aucctus-text-sm-regular aucctus-text-secondary'>
            Applying {recommendationCount} recommendation
            {recommendationCount !== 1 ? 's' : ''} will mark your current test
            as completed. A new recommended test will be generated once the
            recommendations have been processed.
          </p>
        </div>

        {/* Actions */}
        <div className='flex justify-end gap-3'>
          <button className='btn btn-light btn-sm' onClick={onCancel}>
            Cancel
          </button>
          <button className='btn btn-primary btn-sm' onClick={onConfirm}>
            Proceed
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ApplyRecommendationsWarningModal;
