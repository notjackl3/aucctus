import { toast } from '@components';
import { ConceptStatus } from '@libs/api/types';
import {
  getConceptStatusDisplayName,
  getConceptStatusStyles,
} from '@libs/utils/concepts';
import { cn } from '@libs/utils/react';
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '@libs/api';
import { useQueryClient } from 'react-query';
import { AucctusQueryKeys } from '@hooks/query/query-keys';
import { useTransition, animated } from '@react-spring/web';

interface IEditableStatusCellProps {
  value: ConceptStatus;
  conceptIdentifier: string;
}

interface DropdownPosition {
  top: number;
  left: number;
  width: number;
}

interface InlineStatusDropdownProps {
  selectedValue: ConceptStatus;
  position: DropdownPosition;
  onSelect: (status: ConceptStatus) => void;
  isOpen: boolean;
}

// All available concept statuses (excluding 'archived' which requires special action)
const CONCEPT_STATUSES: ConceptStatus[] = [
  'new',
  'ideating',
  'inReview',
  'prototyping',
  'proofOfConcept',
  'minimumViableProduct',
  'commercialized',
];

/**
 * Inline dropdown menu for status cell
 * Uses portal rendering to avoid z-index issues within table cells
 * Features smooth mount/unmount animations with react-spring
 */
const InlineStatusDropdown: React.FC<InlineStatusDropdownProps> = ({
  selectedValue,
  position,
  onSelect,
  isOpen,
}) => {
  // Animation transition for mount/unmount
  const transition = useTransition(isOpen, {
    from: { opacity: 0, transform: 'scale(0.95) translateY(-8px)' },
    enter: { opacity: 1, transform: 'scale(1) translateY(0px)' },
    leave: { opacity: 0, transform: 'scale(0.95) translateY(-8px)' },
    config: { tension: 300, friction: 25 },
  });

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      {transition((style, item) =>
        item ? (
          <animated.div
            style={{
              ...style,
              position: 'fixed',
              top: `${position.top}px`,
              left: `${position.left}px`,
              zIndex: 9999,
            }}
            className='aucctus-bg-primary aucctus-border-secondary w-fit min-w-[180px] rounded-md border shadow-lg'
            data-aucctus-portal-target='true'
          >
            <ul className='no-scrollbar max-h-60 overflow-y-auto overscroll-contain py-1'>
              {CONCEPT_STATUSES.map((status) => {
                const styles = getConceptStatusStyles(status);
                const displayName = getConceptStatusDisplayName(status);
                const isSelected = status === selectedValue;

                return (
                  <li
                    key={status}
                    className={cn(
                      'aucctus-text-sm cursor-pointer px-3 py-2 transition-all duration-200',
                      {
                        'aucctus-bg-primary-hover': !isSelected,
                        'aucctus-bg-brand-secondary': isSelected,
                      },
                    )}
                    onClick={() => onSelect(status)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        onSelect(status);
                        e.preventDefault();
                      }
                    }}
                    data-aucctus-portal-target='true'
                  >
                    <div className='flex items-center gap-2'>
                      <div
                        className={cn(
                          'flex items-center justify-center rounded-full px-2 py-1',
                          'w-full',
                          styles.bg,
                          `border border-${styles.bg.match(/bg-([a-z]+)-\d+/)?.[1] || 'gray'}-100`,
                        )}
                      >
                        <span
                          className={cn(
                            'aucctus-text-sm font-medium capitalize',
                            styles.text,
                          )}
                        >
                          {displayName}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </animated.div>
        ) : null,
      )}
    </>,
    document.body,
  );
};

/**
 * Editable status cell with inline editing (Notion-style)
 * Allows users to change concept status via dropdown
 */
const EditableStatusCell: React.FC<IEditableStatusCellProps> = ({
  value,
  conceptIdentifier,
}) => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);
  const selectRef = useRef<HTMLDivElement>(null);
  const cellRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  // Sync local state with prop changes (e.g., from external updates)
  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  // Update dropdown position when select opens
  useEffect(() => {
    if (isSelectOpen) {
      const refToUse = selectRef.current || cellRef.current;
      if (refToUse) {
        const rect = refToUse.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 4, // Position below the cell with 4px gap
          left: rect.left,
          width: rect.width,
        });
      }
    }
  }, [isSelectOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isSelectOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const isPortalTarget =
        (event.target as Element)?.closest(
          '[data-aucctus-portal-target="true"]',
        ) ||
        (event.target as Element)?.hasAttribute('data-aucctus-portal-target');

      if (!isPortalTarget) {
        setIsSelectOpen(false);
        setIsEditing(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSelectOpen]);

  const handleStatusSelect = async (newStatus: ConceptStatus) => {
    setIsSelectOpen(false);
    setIsEditing(false);

    // Don't update if value hasn't changed
    if (newStatus === displayValue) return;

    const previousValue = displayValue;
    setDisplayValue(newStatus);
    setIsUpdating(true);

    try {
      await api.concept.updateConceptStatus(conceptIdentifier, newStatus);
      setIsUpdating(false);

      // Invalidate concepts query to refresh table data
      queryClient.invalidateQueries([AucctusQueryKeys.concepts]);

      toast.success(
        'Status Updated',
        `Concept status changed to ${getConceptStatusDisplayName(newStatus)}`,
      );
    } catch (error: any) {
      // Revert on error
      setDisplayValue(previousValue);
      setIsUpdating(false);

      toast.error(
        'Update Failed',
        error?.response?.data?.message || 'Failed to update concept status',
      );
    }
  };

  // Display mode
  if (!isEditing) {
    const styles = getConceptStatusStyles(displayValue);
    const displayName = getConceptStatusDisplayName(displayValue);

    // Extract color type from the background class
    const bgColorMatch = styles.bg.match(/bg-([a-z]+)-\d+/);
    const colorType = bgColorMatch ? bgColorMatch[1] : 'gray';
    const borderClass = `border border-${colorType}-100`;

    return (
      <div className='relative'>
        <button
          ref={cellRef}
          onClick={(e) => {
            if (isUpdating) return;
            e.stopPropagation();
            setIsEditing(true);
            setIsSelectOpen(true);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          disabled={isUpdating}
          className={cn(
            'group flex w-full items-center justify-start rounded py-1 text-left',
            {
              'cursor-pointer': !isUpdating,
              'cursor-not-allowed opacity-50': isUpdating,
            },
          )}
        >
          <div
            className={cn(
              'flex items-center justify-center rounded-md px-2 py-1',
              'w-fit max-w-[160px]',
              'transition-all duration-200',
              'hover:brightness-90',
              styles.bg,
              borderClass,
            )}
          >
            <span
              className={cn(
                'font-inter aucctus-text-sm text-center font-medium capitalize',
                'overflow-hidden truncate',
                styles.text,
              )}
            >
              {displayName}
            </span>
          </div>
        </button>

        {/* Loading overlay */}
        {isUpdating && (
          <div className='absolute inset-0 flex items-center justify-center rounded'>
            <div className='absolute inset-0 rounded bg-white/30 dark:bg-black/20' />
            <div className='relative h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500' />
          </div>
        )}
      </div>
    );
  }

  // Edit mode - show dropdown
  return (
    <div
      className='flex w-full items-center gap-1'
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className='relative w-full' ref={selectRef}>
        {/* Show existing value at reduced opacity while dropdown is open */}
        {displayValue && (
          <div className='flex w-full items-center justify-center px-2 py-1 opacity-40'>
            {(() => {
              const styles = getConceptStatusStyles(displayValue);
              const displayName = getConceptStatusDisplayName(displayValue);
              const bgColorMatch = styles.bg.match(/bg-([a-z]+)-\d+/);
              const colorType = bgColorMatch ? bgColorMatch[1] : 'gray';
              const borderClass = `border border-${colorType}-100`;

              return (
                <div
                  className={cn(
                    'flex items-center justify-center rounded-full px-4 py-1.5',
                    'w-fit max-w-[160px]',
                    styles.bg,
                    borderClass,
                  )}
                >
                  <span
                    className={cn(
                      'font-inter aucctus-text-sm h-[20px] text-center font-medium capitalize leading-[20px]',
                      'overflow-hidden truncate',
                      styles.text,
                    )}
                  >
                    {displayName}
                  </span>
                </div>
              );
            })()}
          </div>
        )}

        <InlineStatusDropdown
          selectedValue={displayValue}
          position={dropdownPosition}
          isOpen={isSelectOpen}
          onSelect={handleStatusSelect}
        />
      </div>
    </div>
  );
};

export default EditableStatusCell;
