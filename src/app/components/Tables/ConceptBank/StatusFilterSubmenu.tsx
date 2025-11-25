import { Icon, Input } from '@components';
import { IConceptFilterOptions } from '@hooks/tables/concept-bank.hook';
import { ConceptStatus } from '@libs/api/types';
import utils from '@libs/utils';
import { CONCEPT_STATUS_LIST } from '@libs/utils/concepts';
import React, { useState } from 'react';

export interface IStatusFilterSubmenuProps {
  filterOptions: IConceptFilterOptions;
  updateFilterOptions: (value: Partial<IConceptFilterOptions>) => void;
  statusOptions?: Array<{ value: string; label: string }>;
  onClose?: () => void;
}

/**
 * Status filter submenu component
 * Used as a flyout submenu in StaticColumnMenu
 */
const StatusFilterSubmenu: React.FC<IStatusFilterSubmenuProps> = ({
  filterOptions,
  updateFilterOptions,
  statusOptions,
  onClose,
}) => {
  // Local state to buffer changes
  const [localSelection, setLocalSelection] = useState<Set<ConceptStatus>>(
    filterOptions.status,
  );

  // Sync local state when filter options change
  React.useEffect(() => {
    setLocalSelection(filterOptions.status);
  }, [filterOptions.status]);

  // Apply changes when submenu is left
  const handleApply = () => {
    if (localSelection !== filterOptions.status) {
      updateFilterOptions({ status: localSelection });
    }
    if (onClose) {
      onClose();
    }
  };

  const hasActiveFilter = localSelection && localSelection.size > 0;

  const createStatusCheckItem = (value: ConceptStatus) => (
    <div
      key={value}
      className='flex cursor-pointer items-center px-3 py-2'
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        setLocalSelection((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(value)) {
            newSet.delete(value);
          } else {
            newSet.add(value);
          }
          return newSet;
        });
      }}
    >
      <Input.CheckBox
        key={`checkbox-${value}-${localSelection.has(value)}`}
        id={`filter-status-${value}`}
        checked={localSelection.has(value)}
        onChange={(e) => {
          e.stopPropagation();
          // Toggle is handled by parent div onClick
        }}
      />
      <span className='aucctus-text-secondary ml-2 text-sm font-medium'>
        {utils.string.camelCaseToTitleCase(value)}
      </span>
    </div>
  );

  const createCustomStatusCheckItem = (option: {
    value: string;
    label: string;
  }) => (
    <div
      key={option.value}
      className='flex cursor-pointer items-center px-3 py-2'
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        setLocalSelection((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(option.value as ConceptStatus)) {
            newSet.delete(option.value as ConceptStatus);
          } else {
            newSet.add(option.value as ConceptStatus);
          }
          return newSet;
        });
      }}
    >
      <Input.CheckBox
        key={`checkbox-${option.value}-${localSelection.has(option.value as ConceptStatus)}`}
        id={`filter-status-${option.value}`}
        checked={localSelection.has(option.value as ConceptStatus)}
        onChange={(e) => {
          e.stopPropagation();
          // Toggle is handled by parent div onClick
        }}
      />
      <span className='aucctus-text-secondary ml-2 text-sm font-medium'>
        {option.label}
      </span>
    </div>
  );

  const handleClearFilter = () => {
    setLocalSelection(new Set());
    updateFilterOptions({ status: new Set() });
    if (onClose) {
      onClose();
    }
  };

  return (
    <div
      className='aucctus-bg-primary aucctus-border-secondary min-w-[200px] rounded-lg border shadow-lg'
      onMouseLeave={handleApply}
    >
      <div className='p-1'>
        <div className='max-h-80 overflow-y-auto'>
          {statusOptions
            ? statusOptions.map((option) => createCustomStatusCheckItem(option))
            : CONCEPT_STATUS_LIST.map((status) =>
                createStatusCheckItem(status),
              )}
        </div>

        {hasActiveFilter && (
          <>
            <div className='aucctus-bg-secondary my-1 h-px' />
            <button
              className='aucctus-bg-primary-hover flex w-full cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm outline-none transition-colors'
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                handleClearFilter();
              }}
            >
              <Icon
                variant='closeX'
                className='aucctus-stroke-secondary h-4 w-4'
              />
              <span className='aucctus-text-secondary'>Clear filter</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default StatusFilterSubmenu;
