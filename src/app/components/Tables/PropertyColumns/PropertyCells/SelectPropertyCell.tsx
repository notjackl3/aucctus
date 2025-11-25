import { IPropertyDefinition } from '@libs/api/types';
import React from 'react';
import {
  getOptionColor,
  getColoredTagStyles,
} from '@libs/utils/propertyColors';
import { InlineSelectDropdown } from '../InlineDropdowns';

interface DropdownPosition {
  top: number;
  left: number;
  width: number;
}

interface ISelectPropertyCellProps {
  editValue: any;
  definition: IPropertyDefinition;
  options: string[];
  dropdownPosition: DropdownPosition;
  isSelectOpen: boolean;
  onSelect: (option: string) => void;
}

/**
 * Select property cell component for inline editing
 * Shows current value at reduced opacity with dropdown overlay
 */
export const SelectPropertyCell: React.FC<ISelectPropertyCellProps> = ({
  editValue,
  definition,
  options,
  dropdownPosition,
  isSelectOpen,
  onSelect,
}) => {
  const selectRef = React.useRef<HTMLDivElement>(null);

  return (
    <div className='relative w-full' ref={selectRef}>
      {/* Show existing value at reduced opacity while dropdown is open */}
      {editValue && (
        <div className='flex w-full items-center px-4 py-1 opacity-40'>
          <span
            className='inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium'
            style={getColoredTagStyles(
              getOptionColor(String(editValue), definition),
            )}
          >
            {String(editValue)}
          </span>
        </div>
      )}

      <InlineSelectDropdown
        options={options}
        selectedValue={editValue || ''}
        position={dropdownPosition}
        definition={definition}
        isOpen={isSelectOpen}
        onSelect={onSelect}
      />
    </div>
  );
};
