import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@components';
import { ITestCollateralOption } from '@libs/api/types/concept/testing';

interface CollateralSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  collaterals: ITestCollateralOption[];
  selectedCollateralUuids: string[];
  onSelectionChange: (uuids: string[]) => void;
  maxSelection?: number;
  isLoading?: boolean;
}

const CollateralSelectionModal: React.FC<CollateralSelectionModalProps> = ({
  isOpen,
  onClose,
  collaterals,
  selectedCollateralUuids,
  onSelectionChange,
  maxSelection = 4,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Handle body scroll lock and escape key
  useEffect(() => {
    if (isOpen) {
      // Lock body scroll
      document.body.style.overflow = 'hidden';

      // Handle escape key
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);

      return () => {
        // Restore body scroll
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  // Filter collaterals based on search term
  const filteredCollaterals = useMemo(() => {
    if (!searchTerm) return collaterals;

    const term = searchTerm.toLowerCase();
    return collaterals.filter(
      (collateral) =>
        collateral.title.toLowerCase().includes(term) ||
        collateral.description?.toLowerCase().includes(term) ||
        collateral.type.toLowerCase().includes(term),
    );
  }, [collaterals, searchTerm]);

  // Group collaterals by type
  const collateralsByType = useMemo(() => {
    const groups: Record<string, ITestCollateralOption[]> = {};
    filteredCollaterals.forEach((collateral) => {
      const type = collateral.type || 'text';
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(collateral);
    });
    return groups;
  }, [filteredCollaterals]);

  const handleCollateralToggle = (collateralUuid: string) => {
    const isCurrentlySelected =
      selectedCollateralUuids.includes(collateralUuid);

    if (isCurrentlySelected) {
      // Remove from selection
      const newSelection = selectedCollateralUuids.filter(
        (uuid) => uuid !== collateralUuid,
      );
      onSelectionChange(newSelection);
    } else {
      // Add to selection if under limit
      if (selectedCollateralUuids.length < maxSelection) {
        const newSelection = [...selectedCollateralUuids, collateralUuid];
        onSelectionChange(newSelection);
      }
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return 'file-attachment';
      case 'prototype':
        return 'cube';
      case 'survey':
        return 'survey';
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
        return 'Visual Assets';
      case 'prototype':
        return 'Interactive';
      case 'survey':
        return 'Social Proof';
      case 'guide':
        return 'Pricing';
      case 'text':
        return 'Text Documents';
      default:
        return 'Other';
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className='fixed inset-0 z-[100] flex items-center justify-center'
      data-aucctus-portal-target='true'
    >
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black bg-opacity-50'
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className='aucctus-bg-primary aucctus-border-secondary relative mx-4 max-h-[80vh] w-full max-w-2xl rounded-lg border shadow-lg'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='aucctus-border-secondary border-b p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='aucctus-text-lg-semibold aucctus-text-primary'>
                Select Interview Collaterals
              </h2>
              <p className='aucctus-text-sm aucctus-text-secondary mt-1'>
                Choose up to {maxSelection} collaterals for your customer
                interviews. At least one must be selected to proceed.
              </p>
            </div>
            <button
              onClick={onClose}
              className='aucctus-bg-secondary-hover rounded-full p-2 transition-colors'
              aria-label='Close modal'
            >
              <Icon variant='closeX' className='aucctus-stroke-secondary' />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='space-y-4 p-6'>
          {/* Search */}
          <div className='relative'>
            <Icon
              variant='search-md'
              className='aucctus-stroke-tertiary absolute left-3 top-1/2 -translate-y-1/2 transform'
            />
            <input
              type='text'
              placeholder='Search collaterals...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='aucctus-bg-primary aucctus-border-secondary aucctus-text-primary focus:ring-brand-primary w-full rounded-md border py-2 pl-10 pr-4 focus:outline-none focus:ring-2'
            />
          </div>

          {/* Selection Counter */}
          <div className='aucctus-text-sm flex items-center justify-between'>
            <span className='aucctus-text-secondary'>
              {selectedCollateralUuids.length} of {maxSelection} selected
            </span>
            {selectedCollateralUuids.length >= maxSelection && (
              <span className='aucctus-text-warning-primary'>
                Maximum reached
              </span>
            )}
          </div>

          {/* Collaterals List */}
          <div className='max-h-96 overflow-y-auto pr-2'>
            {isLoading ? (
              <div className='flex items-center justify-center py-8'>
                <Icon
                  variant='loading-02'
                  className='aucctus-stroke-secondary animate-spin'
                />
                <span className='aucctus-text-sm aucctus-text-secondary ml-2'>
                  Loading collaterals...
                </span>
              </div>
            ) : Object.keys(collateralsByType).length === 0 ? (
              <div className='py-8 text-center'>
                <Icon
                  variant='file'
                  className='aucctus-stroke-tertiary mx-auto mb-2'
                />
                <p className='aucctus-text-sm aucctus-text-secondary'>
                  {searchTerm
                    ? 'No collaterals match your search'
                    : 'No collaterals available'}
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {Object.entries(collateralsByType).map(
                  ([type, typeCollaterals]) => (
                    <div key={type}>
                      {/* Type Header */}
                      <div className='mb-3 flex items-center gap-2'>
                        <Icon
                          variant={getTypeIcon(type)}
                          className='aucctus-stroke-tertiary'
                        />
                        <span className='aucctus-text-sm-semibold aucctus-text-primary'>
                          {getTypeLabel(type)}
                        </span>
                        <span className='aucctus-text-xs aucctus-text-secondary'>
                          ({typeCollaterals.length})
                        </span>
                      </div>

                      {/* Collaterals in this type */}
                      <div className='ml-6 space-y-3'>
                        {typeCollaterals.map((collateral) => {
                          const isSelected = selectedCollateralUuids.includes(
                            collateral.uuid,
                          );
                          const isDisabled =
                            !isSelected &&
                            selectedCollateralUuids.length >= maxSelection;

                          return (
                            <div
                              key={collateral.uuid}
                              className={`aucctus-border-secondary flex items-start space-x-3 rounded-lg border p-4 transition-colors ${
                                isDisabled
                                  ? 'cursor-not-allowed opacity-50'
                                  : 'aucctus-bg-primary-hover cursor-pointer'
                              }`}
                              onClick={() =>
                                !isDisabled &&
                                handleCollateralToggle(collateral.uuid)
                              }
                            >
                              <input
                                type='checkbox'
                                checked={isSelected}
                                onChange={() =>
                                  !isDisabled &&
                                  handleCollateralToggle(collateral.uuid)
                                }
                                disabled={isDisabled}
                                className='aucctus-border-secondary mt-0.5 h-4 w-4 rounded'
                              />
                              <div className='min-w-0 flex-1'>
                                <div className='mb-2 flex items-center gap-2'>
                                  <label className='aucctus-text-sm-semibold aucctus-text-primary cursor-pointer'>
                                    {collateral.title}
                                  </label>
                                  <span className='aucctus-bg-secondary-subtle aucctus-text-secondary aucctus-text-xs rounded px-2 py-1'>
                                    {getTypeLabel(collateral.type)}
                                  </span>
                                </div>
                                {collateral.description && (
                                  <p className='aucctus-text-sm aucctus-text-secondary leading-relaxed'>
                                    {collateral.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className='aucctus-border-secondary border-t p-6'>
          <div className='flex items-center justify-between'>
            <span className='aucctus-text-sm aucctus-text-secondary'>
              {selectedCollateralUuids.length} collateral
              {selectedCollateralUuids.length !== 1 ? 's' : ''} selected
            </span>
            <div className='flex items-center gap-3'>
              <button onClick={onClose} className='btn btn-light btn-sm'>
                Cancel
              </button>
              <button
                onClick={onClose}
                disabled={selectedCollateralUuids.length === 0}
                className='btn btn-primary btn-sm disabled:cursor-not-allowed disabled:opacity-50'
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CollateralSelectionModal;
