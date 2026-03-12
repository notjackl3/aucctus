import React, { useMemo } from 'react';
import { Modal } from '@components';
import { ITestDetails } from '../../types';
import GenericStatusBadge from '../../../Assumptions/components/shared/GenericStatusBadge';
import { TEST_STATUS_CONFIGS } from '../../../Assumptions/constants/statusConfigs';
import TestValidationStats from './TestValidationStats';
import { useModal } from '@context/ModalContextProvider';
import { Eye } from 'lucide-react';

interface TestHistoryItemProps {
  test: ITestDetails;
  isExpanded: boolean;
  conceptUuid?: string;
  concept?: any;
  generationState: {
    status: string;
  };
}

const TestStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config = TEST_STATUS_CONFIGS[status] || TEST_STATUS_CONFIGS.planned;
  return <GenericStatusBadge config={config} />;
};

const TestHistoryItem: React.FC<TestHistoryItemProps> = ({ test, concept }) => {
  const { openModal } = useModal();

  // Calculate validation stats from assumptions
  const validationStats = useMemo(() => {
    const normalizeStatus = (status: string | undefined): string => {
      if (!status) return 'untested';
      if (status === 'partiallyValidated') return 'partially_validated';
      return status.toLowerCase();
    };

    const validated = test.assumptions.filter(
      (a) => normalizeStatus(a.validationStatus) === 'validated',
    ).length;
    const invalidated = test.assumptions.filter(
      (a) => normalizeStatus(a.validationStatus) === 'invalidated',
    ).length;

    return {
      validated,
      invalidated,
    };
  }, [test.assumptions]);

  // Get learning summary from objective or description
  const learningSummary = test.objective || test.description || '';

  const handleViewDetails = () => {
    openModal(
      Modal.TestExecutionModal,
      {
        testUuid: test.uuid,
        testType: test.testType,
        concept,
        mode: 'view' as const,
        initialTestDetail: test,
      },
      {
        position: 'center',
        backgroundClassName: 'aucctus-bg-secondary-solid bg-opacity-25',
        shouldCloseOnOverlayClick: true,
        shouldCloseOnEscape: true,
      },
    );
  };

  return (
    <div className='aucctus-border-secondary aucctus-bg-primary overflow-hidden rounded-lg border'>
      <div className='p-5'>
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-12'>
          {/* Left Column - Test Info */}
          <div className='lg:col-span-4'>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <h3 className='aucctus-text-md-medium aucctus-text-brand-primary'>
                  {test.name}
                </h3>
                <TestStatusBadge status={test.status} />
              </div>
              <p className='aucctus-text-sm aucctus-text-tertiary'>
                {new Date(test.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Middle Column - Learning Summary */}
          <div className='lg:col-span-5'>
            <div className='space-y-2'>
              <h4 className='aucctus-text-sm-medium aucctus-text-primary'>
                Learning Summary
              </h4>
              <p className='aucctus-text-sm aucctus-text-secondary'>
                {learningSummary}
              </p>
            </div>
          </div>

          {/* Right Column - Stats and Toggle */}
          <div className='lg:col-span-3'>
            <div className='space-y-3'>
              {/* Validation Stats */}
              <TestValidationStats validationStats={validationStats} />

              {/* View Details Button */}
              <button
                onClick={handleViewDetails}
                className='btn btn-light btn-sm w-full gap-1'
              >
                View Details
                <Eye className='aucctus-stroke-primary h-3.5 w-3.5' />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestHistoryItem;
