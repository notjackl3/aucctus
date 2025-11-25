import { Icon } from '@components';
import { IPropertyFilter, IPropertyDefinition } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import React, { useState, useEffect, useRef } from 'react';

interface ITextFilterInputProps {
  definition: IPropertyDefinition;
  filterValue: string;
  filterOperator: IPropertyFilter['operator'];
  onFilterValueChange: (value: string) => void;
  onFilterOperatorChange: (operator: IPropertyFilter['operator']) => void;
  onApply: () => void;
  onCancel: () => void;
}

const TEXT_OPERATOR_OPTIONS = [
  { value: 'exact', label: 'Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'is_null', label: 'Is empty' },
  { value: 'not_blank', label: 'Is not blank' },
] as const;

/**
 * Text property filter input with operator dropdown
 * Supports: exact, contains, is_null, not_blank
 */
export const TextFilterInput: React.FC<ITextFilterInputProps> = ({
  definition,
  filterValue,
  filterOperator,
  onFilterValueChange,
  onFilterOperatorChange,
  onApply,
  onCancel,
}) => {
  const [isOperatorDropdownOpen, setIsOperatorDropdownOpen] = useState(false);
  const operatorDropdownRef = useRef<HTMLDivElement>(null);

  const selectedOperatorLabel =
    TEXT_OPERATOR_OPTIONS.find(
      (opt) => opt.value === (filterOperator || 'contains'),
    )?.label || 'Contains';

  // Close operator dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        operatorDropdownRef.current &&
        !operatorDropdownRef.current.contains(event.target as Node)
      ) {
        setIsOperatorDropdownOpen(false);
      }
    };

    if (isOperatorDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOperatorDropdownOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onApply();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const needsValueInput =
    filterOperator !== 'is_null' && filterOperator !== 'not_blank';

  return (
    <div className='space-y-2'>
      {/* Operator dropdown */}
      <div className='relative' ref={operatorDropdownRef}>
        <div
          className='aucctus-bg-primary aucctus-border-secondary aucctus-text-primary hover:aucctus-bg-secondary flex w-full cursor-pointer items-center justify-between rounded border px-2 py-1.5 text-sm transition-colors'
          onClick={() => setIsOperatorDropdownOpen(!isOperatorDropdownOpen)}
        >
          <span>{selectedOperatorLabel}</span>
          <Icon
            variant='chevrondown'
            className={cn(
              'aucctus-stroke-secondary h-4 w-4 transition-transform',
              {
                'rotate-180': isOperatorDropdownOpen,
              },
            )}
          />
        </div>

        {isOperatorDropdownOpen && (
          <div className='aucctus-bg-primary aucctus-border-secondary absolute z-[10001] mt-1 w-full rounded border shadow-lg'>
            {TEXT_OPERATOR_OPTIONS.map((option) => (
              <div
                key={option.value}
                className={cn(
                  'aucctus-text-sm cursor-pointer px-3 py-2 transition-colors',
                  filterOperator === option.value
                    ? 'aucctus-bg-brand-secondary aucctus-text-brand-primary'
                    : 'aucctus-text-primary aucctus-bg-primary-hover',
                )}
                onClick={() => {
                  onFilterOperatorChange(
                    option.value as IPropertyFilter['operator'],
                  );
                  setIsOperatorDropdownOpen(false);
                }}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Text input (hidden for operators that don't need a value) */}
      {needsValueInput && (
        <input
          type='text'
          value={filterValue}
          onChange={(e) => onFilterValueChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Filter by ${definition.name}...`}
          className='aucctus-bg-primary aucctus-border-secondary aucctus-text-primary w-full rounded border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
          autoFocus
        />
      )}

      {/* Apply/Cancel buttons */}
      <div className='aucctus-border-secondary flex items-center justify-end gap-2 border-t pt-2'>
        <button
          onClick={onCancel}
          className='aucctus-text-sm aucctus-text-tertiary hover:aucctus-text-secondary rounded px-2 py-1 transition-colors'
        >
          Cancel
        </button>
        <button
          onClick={onApply}
          className='aucctus-text-sm aucctus-text-brand-primary aucctus-bg-brand-primary rounded px-2 py-1 font-medium transition-colors'
        >
          Apply
        </button>
      </div>
    </div>
  );
};
