import { Icon } from '@components';
import { ITestCollateralOption } from '@libs/api/types/concept/testing';
import React, { useMemo, useState } from 'react';

// Collateral limits configuration
const COLLATERAL_LIMITS = {
  max_total: 4,
  max_by_type: {
    image: 3,
    text: 3,
    survey: 2,
    guide: 2,
    prototype: 2,
    file: 2,
    url: 1,
  } as Record<string, number>,
};

interface MultiCollateralSelectorProps {
  collaterals: ITestCollateralOption[];
  selectedCollateralUuids: string[];
  onSelectionChange: (uuids: string[]) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const MultiCollateralSelector: React.FC<MultiCollateralSelectorProps> = ({
  collaterals,
  selectedCollateralUuids,
  onSelectionChange,
  isLoading = false,
  disabled = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Group collaterals by type for better organization
  const collateralsByType = useMemo(() => {
    const groups: Record<string, ITestCollateralOption[]> = {};
    collaterals.forEach((collateral) => {
      const type = collateral.type || 'text';
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(collateral);
    });
    return groups;
  }, [collaterals]);

  const selectedCollaterals = useMemo(() => {
    return collaterals.filter((c) => selectedCollateralUuids.includes(c.uuid));
  }, [collaterals, selectedCollateralUuids]);

  // Calculate type counts for selected collaterals
  const selectedTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    selectedCollaterals.forEach((collateral) => {
      const type = collateral.type || 'text';
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }, [selectedCollaterals]);

  // Check if a collateral can be selected
  const canSelectCollateral = (collateral: ITestCollateralOption) => {
    if (selectedCollateralUuids.includes(collateral.uuid)) {
      return true; // Already selected, can be deselected
    }

    // Check total limit
    if (selectedCollateralUuids.length >= COLLATERAL_LIMITS.max_total) {
      return false;
    }

    // Check type-specific limit
    const type = collateral.type || 'text';
    const currentTypeCount = selectedTypeCounts[type] || 0;
    const maxForType = COLLATERAL_LIMITS.max_by_type[type] || 2;

    return currentTypeCount < maxForType;
  };

  // Get warning messages for current selection
  const getWarningMessages = () => {
    const warnings: string[] = [];
    const totalSelected = selectedCollateralUuids.length;

    // Total count warnings
    if (totalSelected === COLLATERAL_LIMITS.max_total - 1) {
      warnings.push('You can select 1 more collateral');
    } else if (totalSelected >= COLLATERAL_LIMITS.max_total) {
      warnings.push('Maximum collaterals selected');
    }

    // Type-specific warnings
    Object.entries(selectedTypeCounts).forEach(([type, count]) => {
      const maxForType = COLLATERAL_LIMITS.max_by_type[type] || 2;
      if (count === maxForType - 1) {
        warnings.push(`You can select 1 more ${type} collateral`);
      } else if (count >= maxForType) {
        warnings.push(`Maximum ${type} collaterals selected`);
      }
    });

    // Quality guidance
    if (totalSelected >= 3) {
      warnings.push(
        'Consider if all materials are necessary for quality feedback',
      );
    }

    return warnings;
  };

  const handleToggleCollateral = (uuid: string) => {
    if (disabled) return;

    const collateral = collaterals.find((c) => c.uuid === uuid);
    if (!collateral) return;

    const isCurrentlySelected = selectedCollateralUuids.includes(uuid);

    if (isCurrentlySelected) {
      // Always allow deselection
      const newSelection = selectedCollateralUuids.filter((id) => id !== uuid);
      onSelectionChange(newSelection);
    } else {
      // Check if selection is allowed
      if (canSelectCollateral(collateral)) {
        const newSelection = [...selectedCollateralUuids, uuid];
        onSelectionChange(newSelection);
      }
      // If not allowed, do nothing (user will see disabled state)
    }
  };

  const handleClearAll = () => {
    if (disabled) return;
    onSelectionChange([]);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
      case 'prototype':
        return 'file-attachment';
      case 'survey':
        return 'clipboard';
      case 'guide':
        return 'book-open';
      case 'text':
      default:
        return 'file';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'image':
        return 'Images';
      case 'prototype':
        return 'Prototypes';
      case 'survey':
        return 'Surveys';
      case 'guide':
        return 'Guides';
      case 'text':
        return 'Text Documents';
      default:
        return 'Other';
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center gap-2 py-2'>
        <Icon
          variant='loading-02'
          className='aucctus-stroke-secondary h-4 w-4'
        />
        <span className='aucctus-text-sm aucctus-text-secondary'>
          Loading collaterals...
        </span>
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      {/* Card-style placeholder when no collaterals selected */}
      {selectedCollaterals.length === 0 ? (
        <div className='aucctus-bg-secondary aucctus-border-secondary rounded-lg border p-4'>
          <div className='text-center'>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              disabled={disabled}
              className='btn btn-primary btn-sm mx-auto flex items-center gap-2 disabled:opacity-50'
            >
              <Icon variant='plus' className='aucctus-stroke-white h-4 w-4' />
              Select Collaterals
            </button>
          </div>
        </div>
      ) : (
        /* Selected Collaterals as Chips */
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <span className='aucctus-text-sm aucctus-text-primary'>
                {selectedCollaterals.length} of {COLLATERAL_LIMITS.max_total}{' '}
                collateral
                {selectedCollaterals.length > 1 ? 's' : ''} selected
              </span>
              {selectedCollaterals.length >= COLLATERAL_LIMITS.max_total && (
                <span className='aucctus-text-xs aucctus-text-warning-primary'>
                  Limit reached
                </span>
              )}
            </div>
            <div className='flex items-center gap-2'>
              <button
                onClick={handleClearAll}
                disabled={disabled}
                className='aucctus-text-xs aucctus-text-secondary hover:aucctus-text-primary disabled:opacity-50'
              >
                Clear all
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                disabled={disabled}
                className='btn btn-light btn-sm flex items-center gap-1 disabled:opacity-50'
              >
                <span>{isExpanded ? 'Done' : 'Edit'}</span>
                <Icon
                  variant={isExpanded ? 'check' : 'edit'}
                  className='aucctus-stroke-secondary h-3 w-3'
                />
              </button>
            </div>
          </div>

          <div className='flex flex-wrap gap-2'>
            {selectedCollaterals.map((collateral) => (
              <div
                key={collateral.uuid}
                className='aucctus-bg-secondary-subtle aucctus-border-secondary flex items-center gap-2 rounded-md border px-2 py-1'
              >
                <Icon
                  variant={getTypeIcon(collateral.type || 'text')}
                  className='aucctus-stroke-tertiary h-3 w-3'
                />
                <span className='aucctus-text-xs aucctus-text-primary'>
                  {collateral.title}
                </span>
                <button
                  onClick={() => handleToggleCollateral(collateral.uuid)}
                  disabled={disabled}
                  className='aucctus-text-tertiary hover:aucctus-text-error-primary disabled:opacity-50'
                >
                  <Icon
                    variant='closeX'
                    className='stroke-aucctus-primary h-3 w-3'
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expandable Selection Interface */}
      {isExpanded && (
        <div className='aucctus-bg-secondary-extra-subtle aucctus-border-secondary space-y-3 rounded-md border p-3'>
          {Object.entries(collateralsByType).map(([type, typeCollaterals]) => (
            <div key={type} className='space-y-2'>
              <div className='flex items-center gap-2'>
                <Icon
                  variant={getTypeIcon(type)}
                  className='aucctus-stroke-tertiary h-4 w-4'
                />
                <span className='aucctus-text-sm-medium aucctus-text-primary'>
                  {getTypeLabel(type)}
                </span>
                <span className='aucctus-text-xs aucctus-text-tertiary'>
                  ({typeCollaterals.length})
                </span>
              </div>
              <div className='space-y-1 pl-6'>
                {typeCollaterals.map((collateral) => {
                  const isSelected = selectedCollateralUuids.includes(
                    collateral.uuid,
                  );
                  const canSelect = canSelectCollateral(collateral);
                  const isDisabled = disabled || (!isSelected && !canSelect);

                  return (
                    <label
                      key={collateral.uuid}
                      className={`flex items-start gap-3 rounded-md p-2 transition-colors ${
                        isDisabled
                          ? 'cursor-not-allowed opacity-50'
                          : 'aucctus-bg-primary-hover cursor-pointer'
                      }`}
                    >
                      <input
                        type='checkbox'
                        checked={isSelected}
                        onChange={() => handleToggleCollateral(collateral.uuid)}
                        disabled={isDisabled}
                        className='aucctus-border-secondary mt-0.5 h-4 w-4 rounded disabled:opacity-50'
                      />
                      <div className='min-w-0 flex-1'>
                        <div
                          className={`aucctus-text-sm ${
                            isDisabled
                              ? 'aucctus-text-secondary'
                              : 'aucctus-text-primary'
                          }`}
                        >
                          {collateral.title}
                        </div>
                        {collateral.description && (
                          <div className='aucctus-text-xs aucctus-text-secondary mt-1'>
                            {collateral.description}
                          </div>
                        )}
                        {!isSelected && !canSelect && (
                          <div className='aucctus-text-xs aucctus-text-warning-primary mt-1'>
                            {selectedCollateralUuids.length >=
                            COLLATERAL_LIMITS.max_total
                              ? 'Maximum collaterals selected'
                              : `Maximum ${collateral.type || 'text'} collaterals selected`}
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {collaterals.length === 0 && (
            <div className='py-4 text-center'>
              <Icon
                variant='file'
                className='aucctus-stroke-tertiary mx-auto mb-2 h-8 w-8'
              />
              <p className='aucctus-text-sm aucctus-text-secondary'>
                No collaterals available for this test
              </p>
            </div>
          )}
        </div>
      )}

      {/* Warning Messages */}
      {isExpanded && getWarningMessages().length > 0 && (
        <div className='space-y-1'>
          {getWarningMessages().map((warning, index) => (
            <p
              key={index}
              className='aucctus-text-xs aucctus-text-warning-primary'
            >
              {warning}
            </p>
          ))}
        </div>
      )}

      {/* Help Text - Only show when expanded or no selection */}
      {(isExpanded || selectedCollaterals.length === 0) && (
        <p className='aucctus-text-xs aucctus-text-secondary'>
          At least one collateral must be selected to proceed. Maximum{' '}
          {COLLATERAL_LIMITS.max_total} collaterals allowed.
        </p>
      )}
    </div>
  );
};

export default MultiCollateralSelector;
