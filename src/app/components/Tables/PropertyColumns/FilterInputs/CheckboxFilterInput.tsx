import { IPropertyDefinition } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import React from 'react';

interface ICheckboxFilterInputProps {
  definition: IPropertyDefinition;
  filterValue: string;
  onSelect: (value: string, boolValue: boolean | null) => void;
}

/**
 * Checkbox property filter input
 * Allows filtering by checked or unchecked
 */
export const CheckboxFilterInput: React.FC<ICheckboxFilterInputProps> = ({
  filterValue,
  onSelect,
}) => {
  const boolValue =
    filterValue === 'true' ? 'true' : filterValue === 'false' ? 'false' : '';

  return (
    <div className='space-y-2 p-2'>
      <div className='aucctus-text-xs aucctus-text-tertiary px-1'>
        Select a value:
      </div>
      <div className='space-y-1'>
        <button
          className={cn(
            'aucctus-text-sm w-full rounded px-3 py-2 text-left transition-colors',
            boolValue === 'true'
              ? 'aucctus-bg-brand-secondary aucctus-text-brand-primary'
              : 'aucctus-text-primary aucctus-bg-primary-hover',
          )}
          onClick={() => onSelect('true', true)}
        >
          Checked
        </button>
        <button
          className={cn(
            'aucctus-text-sm w-full rounded px-3 py-2 text-left transition-colors',
            boolValue === 'false'
              ? 'aucctus-bg-brand-secondary aucctus-text-brand-primary'
              : 'aucctus-text-primary aucctus-bg-primary-hover',
          )}
          onClick={() => onSelect('false', false)}
        >
          Unchecked
        </button>
      </div>
    </div>
  );
};
