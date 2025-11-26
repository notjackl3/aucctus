import { IPropertyDefinition } from '@libs/api/types';
import React from 'react';
import {
  getOptionColor,
  getColoredTagStyles,
} from '@libs/utils/propertyColors';
import { InlineMultiSelectDropdown } from '../InlineDropdowns';

interface DropdownPosition {
  top: number;
  left: number;
  width: number;
}

interface IMultiSelectPropertyCellProps {
  editValue: any;
  definition: IPropertyDefinition;
  options: string[];
  dropdownPosition: DropdownPosition;
  isSelectOpen: boolean;
  onToggle: (option: string) => void;
}

/**
 * Multi-select property cell component for inline editing
 * Shows current values at reduced opacity with dropdown overlay
 */
export const MultiSelectPropertyCell: React.FC<
  IMultiSelectPropertyCellProps
> = ({
  editValue,
  definition,
  options,
  dropdownPosition,
  isSelectOpen,
  onToggle,
}) => {
  const selectRef = React.useRef<HTMLDivElement>(null);

  return (
    <div className='relative w-full' ref={selectRef}>
      {/* Show existing values at reduced opacity while dropdown is open */}
      {Array.isArray(editValue) && editValue.length > 0 && (
        <div className='flex w-full flex-wrap gap-1 py-1 opacity-40'>
          {editValue.map((val: string, idx: number) => (
            <span
              key={idx}
              className='line-clamp-1 inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium'
              style={getColoredTagStyles(
                getOptionColor(String(val), definition),
              )}
            >
              {String(val)}
            </span>
          ))}
        </div>
      )}

      <InlineMultiSelectDropdown
        options={options}
        selectedValues={Array.isArray(editValue) ? editValue : []}
        position={dropdownPosition}
        definition={definition}
        isOpen={isSelectOpen}
        onToggle={onToggle}
      />
    </div>
  );
};
