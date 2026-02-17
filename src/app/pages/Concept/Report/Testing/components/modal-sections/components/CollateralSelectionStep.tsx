import React from 'react';
import { cn } from '@libs/utils/react';
import { ITestCollateralOption } from '@libs/api/types/concept/testing';
import { Check, Eye, FileUp } from 'lucide-react';

interface ICollateralSelectionStepProps {
  collaterals: ITestCollateralOption[];
  selectedCollateralUuids: string[];
  onSelectionChange: (uuids: string[]) => void;
  isLoading: boolean;
  maxSelection?: number;
  onNavigateToCollateral?: (collateralUuid: string) => void;
}

const CollateralSelectionStep: React.FC<ICollateralSelectionStepProps> = ({
  collaterals,
  selectedCollateralUuids,
  onSelectionChange,
  isLoading,
  maxSelection = 4,
  onNavigateToCollateral,
}) => {
  const handleToggleSelection = (collateralUuid: string) => {
    const isCurrentlySelected =
      selectedCollateralUuids.includes(collateralUuid);

    if (isCurrentlySelected) {
      // Remove from selection
      const newSelection = selectedCollateralUuids.filter(
        (uuid) => uuid !== collateralUuid,
      );
      onSelectionChange(newSelection);
    } else {
      // Add to selection (if under max limit)
      if (selectedCollateralUuids.length < maxSelection) {
        const newSelection = [...selectedCollateralUuids, collateralUuid];
        onSelectionChange(newSelection);
      }
    }
  };

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className='aucctus-bg-secondary-subtle animate-pulse rounded-lg border p-4'
            >
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <div className='aucctus-bg-secondary h-4 w-24 rounded'></div>
                  <div className='aucctus-bg-secondary h-4 w-4 rounded'></div>
                </div>
                <div className='space-y-2'>
                  <div className='aucctus-bg-secondary h-3 w-full rounded'></div>
                  <div className='aucctus-bg-secondary h-3 w-2/3 rounded'></div>
                </div>
                <div className='aucctus-bg-secondary h-5 w-16 rounded'></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!collaterals || collaterals.length === 0) {
    return (
      <div className='aucctus-border-secondary flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-12'>
        <div className='aucctus-bg-secondary-subtle mb-4 rounded-full p-3'>
          <FileUp className='aucctus-stroke-tertiary h-6 w-6' />
        </div>
        <h3 className='aucctus-text-sm-semibold aucctus-text-primary mb-2 text-center'>
          No collaterals available
        </h3>
        <p className='aucctus-text-sm aucctus-text-secondary text-center'>
          Create some collaterals first to use in your synthetic interviews.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Collateral Grid */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {collaterals.map((collateral) => {
          const isSelected = selectedCollateralUuids.includes(collateral.uuid);
          const isMaxReached =
            selectedCollateralUuids.length >= maxSelection && !isSelected;

          return (
            <div
              key={collateral.uuid}
              className={cn(
                'relative cursor-pointer rounded-lg border p-4 transition-all',
                isSelected
                  ? 'aucctus-border-brand aucctus-bg-primary ring-brand-primary/20 ring-2'
                  : isMaxReached
                    ? 'aucctus-border-secondary aucctus-bg-disabled cursor-not-allowed opacity-50'
                    : 'aucctus-border-secondary aucctus-bg-primary hover:aucctus-border-tertiary hover:aucctus-bg-secondary-subtle',
              )}
              onClick={() =>
                !isMaxReached && handleToggleSelection(collateral.uuid)
              }
              role='button'
              tabIndex={0}
              aria-pressed={isSelected}
              aria-label={`${isSelected ? 'Deselect' : 'Select'} ${collateral.title} collateral`}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !isMaxReached) {
                  e.preventDefault();
                  handleToggleSelection(collateral.uuid);
                }
              }}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className='absolute -right-2 -top-2 z-10'>
                  <div className='flex h-6 w-6 items-center justify-center rounded-full bg-green-500 shadow-sm'>
                    <Check className='h-3 w-3 stroke-white' />
                  </div>
                </div>
              )}

              {/* Card Content */}
              <div className='space-y-3'>
                {/* Header with Title and Preview Icon */}
                <div className='flex items-start justify-between gap-2'>
                  <h4 className='aucctus-text-sm-semibold aucctus-text-primary line-clamp-2 flex-1'>
                    {collateral.title}
                  </h4>
                  <button
                    className='aucctus-bg-secondary-hover flex-shrink-0 rounded p-1 transition-colors'
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onNavigateToCollateral) {
                        onNavigateToCollateral(collateral.uuid);
                      }
                    }}
                    aria-label={`View ${collateral.title} in collateral tab`}
                  >
                    <Eye className='aucctus-stroke-secondary h-4 w-4' />
                  </button>
                </div>

                {/* Description */}
                {collateral.description && (
                  <p className='aucctus-text-xs aucctus-text-secondary line-clamp-2'>
                    {collateral.description}
                  </p>
                )}

                {/* Type Badge */}
                <div className='flex items-center justify-between'>
                  <span className='aucctus-bg-secondary aucctus-text-secondary aucctus-text-xs rounded px-2 py-1 font-medium'>
                    {collateral.type}
                  </span>

                  {/* Visual indicator for selection state */}
                  <div
                    className={cn(
                      'h-2 w-2 rounded-full transition-colors',
                      isSelected
                        ? 'aucctus-bg-brand-primary'
                        : 'aucctus-bg-secondary',
                    )}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Help Text */}
      <div className='aucctus-text-xs aucctus-text-secondary text-center'>
        {selectedCollateralUuids.length === 0
          ? `Select up to ${maxSelection} collaterals for your synthetic interviews`
          : selectedCollateralUuids.length === maxSelection
            ? 'Maximum collaterals selected'
            : `You can select ${maxSelection - selectedCollateralUuids.length} more collateral${maxSelection - selectedCollateralUuids.length === 1 ? '' : 's'}`}
      </div>
    </div>
  );
};

export default React.memo(CollateralSelectionStep);
