import React from 'react';
import { Icon } from '@components';

interface TestCompletionWarningModalProps {
  testName: string;
  affectingSections: string[];
  onClose: () => void;
}

const TestCompletionWarningModal: React.FC<TestCompletionWarningModalProps> = ({
  testName,
  affectingSections,
  onClose,
}) => {
  const sectionsText = affectingSections
    .map((section) => section.charAt(0).toUpperCase() + section.slice(1))
    .join(', ');

  return (
    <div className='aucctus-bg-primary inline-flex max-h-[100vh] w-[600px] flex-col items-center justify-start rounded-xl'>
      {/* Header */}
      <div className='aucctus-border-primary inline-flex w-full items-center justify-between border-b p-4'>
        <span className='aucctus-text-lg-medium aucctus-text-primary pl-2'>
          Complete Test Before Applying
        </span>
        <button
          className='aucctus-bg-primary-hover rounded-lg p-2'
          onClick={onClose}
          aria-label='Close modal'
        >
          <Icon variant='closeX' className='aucctus-stroke-secondary h-6 w-6' />
        </button>
      </div>

      {/* Content */}
      <div className='inline-flex w-full items-start justify-start overflow-auto p-6'>
        <div className='w-full'>
          {/* Warning Icon and Message */}
          <div className='mb-6 flex flex-col'>
            <div className='mb-4 flex items-start gap-4'>
              <div className='aucctus-bg-warning-secondary flex h-12 w-12 shrink-0 items-center justify-center rounded-full'>
                <Icon
                  variant='alert-circle'
                  className='aucctus-stroke-warning-primary'
                  height={24}
                  width={24}
                />
              </div>
              <div className='flex-1'>
                <p className='aucctus-text-secondary aucctus-text-md mb-4'>
                  Selected recommendations affect{' '}
                  <span className='aucctus-text-primary font-semibold'>
                    {sectionsText}
                  </span>
                  . You must mark the current test as complete before applying
                  these recommendations to avoid losing test data.
                </p>
              </div>
            </div>

            {/* Test Details Section */}
            <div className='aucctus-bg-warning-subtle aucctus-border-warning-subtle mb-6 rounded-lg border p-4'>
              <h3 className='aucctus-text-warning-primary aucctus-text-sm-semibold mb-2'>
                Review Your Test
              </h3>
              <div className='aucctus-text-primary aucctus-text-md'>
                <span className='aucctus-text-secondary'>Test: </span>
                <span className='font-medium'>{testName}</span>
              </div>
            </div>

            {/* Info Message */}
            <div className='aucctus-text-secondary aucctus-text-sm'>
              <p className='mb-3'>
                Applying recommendations that affect{' '}
                <span className='font-semibold'>
                  {sectionsText.toLowerCase()}
                </span>{' '}
                could trigger test regeneration, which removes:
              </p>
              <ul className='ml-6 list-disc space-y-1'>
                <li>Previous raw test results</li>
                <li>Extracted learnings</li>
                <li>Current recommendations</li>
              </ul>
              <p className='mt-3'>
                <span className='aucctus-text-primary font-semibold'>
                  Only completed tests will remain unchanged.
                </span>{' '}
                You cannot undo this action.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex justify-end'>
            <button
              type='button'
              className='btn btn-primary'
              onClick={onClose}
              autoFocus
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestCompletionWarningModal;
