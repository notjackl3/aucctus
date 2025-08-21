import React, { useState, useCallback } from 'react';
import { Icon, Modal } from '@components';
import StatusBadge from '../badges/StatusBadge';
import RiskBadge from '../badges/RiskBadge';
import ImportanceMeter from '../badges/ImportanceMeter';
import CertaintyMeter from '../badges/CertaintyMeter';
import ValidationBenchmarkCard from '../../../Testing/components/modal-sections/test-impact/components/ValidationBenchmarkCard';
import { getCategoryColors } from '../../constants/categoryColors';
import { getCategoryIcon } from '../../utils/assumptionUtils';
import { IAssumptionV2, AssumptionStatusV2 } from '@libs/api/types';
import {
  useAssumptionUpdate,
  useAssumptionRemove,
} from '@hooks/query/concepts.hook';
import { useModal } from '@context/ModalContextProvider';
import { cn } from '@libs/utils/react';
import useStore from '@stores/store';

interface AssumptionDetailCardProps {
  assumption: IAssumptionV2;
  onClick?: () => void;
  showBenchmark?: boolean;
  showActions?: boolean;
}

const AssumptionDetailCard: React.FC<AssumptionDetailCardProps> = ({
  assumption,
  onClick,
  showBenchmark,
  showActions = true,
}) => {
  const conceptIdentifier = useStore((state) => state.conceptReport.identifier);
  const { openModal } = useModal();
  const [isHovering, setIsHovering] = useState(false);

  // Mutation hooks
  const { mutate: updateAssumption } = useAssumptionUpdate();
  const { mutate: removeAssumption } = useAssumptionRemove();

  // Get category colors
  const categoryColors = getCategoryColors(assumption.category);

  // Convert 0-1 values to 0-100 percentages for display
  const riskPercentage = Math.round(assumption.risk * 100);
  const certaintyPercentage = Math.round(assumption.certainty * 100);
  const importancePercentage = Math.round(assumption.importance * 100);

  // Determine validation status from the validationStatus field
  const getValidationStatus = (): AssumptionStatusV2 => {
    // Use the validationStatus field directly, with fallback to status or untested
    return assumption.validationStatus || assumption.status || 'untested';
  };

  // Helper to render category icon using utility function
  const renderCategoryIcon = (): React.ReactNode => {
    const iconVariant = getCategoryIcon(assumption.category);
    return (
      <Icon
        variant={iconVariant as any}
        className={`${categoryColors.stroke} h-5 w-5`}
      />
    );
  };

  // Event handlers
  const handleMouseEnter = useCallback(() => setIsHovering(true), []);
  const handleMouseLeave = useCallback(() => setIsHovering(false), []);

  const handleEditAssumption = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      openModal(
        Modal.AssumptionStatementModal,
        {
          mode: 'edit',
          initialStatement: assumption.statement,
          onSubmit: () => {
            // This won't be called when onConfirm is provided
          },
          onConfirm: async (statement: string) => {
            updateAssumption({
              rootIdentifier: conceptIdentifier!,
              assumptionUuid: assumption.uuid,
              data: { statement },
            });
          },
        },
        {
          position: 'center',
          backgroundClassName: 'aucctus-bg-secondary-solid bg-opacity-20',
        },
      );
    },
    [assumption, conceptIdentifier, openModal, updateAssumption],
  );

  const handleDeleteAssumption = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      openModal(
        Modal.AssumptionLifecycleConfirmationModal,
        {
          mode: 'delete',
          assumptionStatement: assumption.statement,
          onConfirm: async () => {
            removeAssumption({
              rootIdentifier: conceptIdentifier!,
              assumptionUuid: assumption.uuid,
            });
          },
        },
        {
          position: 'center',
          backgroundClassName: 'aucctus-bg-secondary-solid bg-opacity-20',
        },
      );
    },
    [assumption, conceptIdentifier, openModal, removeAssumption],
  );
  return (
    <div
      className={cn(
        'aucctus-bg-primary hover:aucctus-bg-primary-hover aucctus-border-primary relative rounded-lg border p-5 shadow-sm transition-colors',
        {
          'cursor-pointer': showActions,
        },
      )}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Assumption header */}
      <div className='mb-3 flex flex-wrap items-start justify-between gap-2'>
        <div className='flex items-center'>
          {renderCategoryIcon()}
          <span className='aucctus-text-sm-medium ml-2 capitalize'>
            {assumption.category}
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <RiskBadge risk={riskPercentage} />
          <StatusBadge status={getValidationStatus()} />
        </div>
      </div>

      {/* Assumption statement */}
      <p className='aucctus-text-md-semibold aucctus-text-primary mb-4'>
        {assumption.statement}
      </p>

      {/* Meters */}
      <div className='mb-4 mt-3 flex flex-wrap gap-2'>
        <ImportanceMeter importance={importancePercentage} />
        <CertaintyMeter certainty={certaintyPercentage} />
      </div>

      {showBenchmark && assumption.benchmark && (
        <ValidationBenchmarkCard benchmark={assumption.benchmark} />
      )}

      {/* Action buttons - shown on hover only when showActions is true */}
      {showActions && (
        <div
          className={cn(
            'absolute bottom-3 right-3 flex gap-2 transition-all duration-300',
            {
              'pointer-events-none opacity-0': !isHovering,
              'pointer-events-auto opacity-100': isHovering,
            },
          )}
        >
          <button
            onClick={handleEditAssumption}
            className='aucctus-bg-primary-hover aucctus-border-secondary rounded-md border p-2 shadow-sm'
            aria-label='Edit assumption'
          >
            <Icon variant='edit' className='aucctus-stroke-secondary h-4 w-4' />
          </button>
          <button
            onClick={handleDeleteAssumption}
            className='aucctus-bg-primary-hover aucctus-border-secondary rounded-md border p-2 shadow-sm'
            aria-label='Delete assumption'
          >
            <Icon
              variant='trash'
              className='aucctus-stroke-error-primary h-4 w-4'
            />
          </button>
        </div>
      )}
    </div>
  );
};

export default AssumptionDetailCard;
