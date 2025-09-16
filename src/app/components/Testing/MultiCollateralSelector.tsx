import React, { useState, useMemo } from 'react';
import { Icon } from '@components';
import { ITestCollateralOption } from '@libs/api/types/concept/testing';

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

  const handleToggleCollateral = (uuid: string) => {
    if (disabled) return;

    const newSelection = selectedCollateralUuids.includes(uuid)
      ? selectedCollateralUuids.filter((id) => id !== uuid)
      : [...selectedCollateralUuids, uuid];

    onSelectionChange(newSelection);
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
      {/* Selection Summary */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <span className='aucctus-text-sm aucctus-text-primary'>
            {selectedCollaterals.length === 0
              ? 'No collaterals selected (will use latest)'
              : `${selectedCollaterals.length} collateral${selectedCollaterals.length > 1 ? 's' : ''} selected`}
          </span>
          {selectedCollaterals.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={disabled}
              className='aucctus-text-xs aucctus-text-secondary hover:aucctus-text-primary disabled:opacity-50'
            >
              Clear all
            </button>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          disabled={disabled}
          className='aucctus-text-sm aucctus-text-secondary hover:aucctus-text-primary flex items-center gap-1 disabled:opacity-50'
        >
          <span>{isExpanded ? 'Collapse' : 'Select collaterals'}</span>
          <Icon
            variant={isExpanded ? 'chevronup' : 'chevrondown'}
            className='aucctus-stroke-secondary h-4 w-4'
          />
        </button>
      </div>

      {/* Selected Collaterals Preview */}
      {selectedCollaterals.length > 0 && (
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
                <Icon variant='closeX' className='h-3 w-3' />
              </button>
            </div>
          ))}
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
                  return (
                    <label
                      key={collateral.uuid}
                      className='aucctus-bg-primary-hover flex cursor-pointer items-start gap-3 rounded-md p-2 transition-colors'
                    >
                      <input
                        type='checkbox'
                        checked={isSelected}
                        onChange={() => handleToggleCollateral(collateral.uuid)}
                        disabled={disabled}
                        className='aucctus-border-secondary mt-0.5 h-4 w-4 rounded disabled:opacity-50'
                      />
                      <div className='min-w-0 flex-1'>
                        <div className='aucctus-text-sm aucctus-text-primary'>
                          {collateral.title}
                        </div>
                        {collateral.description && (
                          <div className='aucctus-text-xs aucctus-text-secondary mt-1'>
                            {collateral.description}
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

      {/* Help Text */}
      <p className='aucctus-text-xs aucctus-text-secondary'>
        Select multiple collaterals to combine different content types (e.g.,
        image + survey). If none selected, the latest collateral will be used.
      </p>
    </div>
  );
};

export default MultiCollateralSelector;
