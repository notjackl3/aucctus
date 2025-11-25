import { Input } from '@components';
import { IPropertyDefinition, IPropertyOption } from '@libs/api/types';
import React from 'react';
import {
  getPropertyOptions,
  extractOptionValues,
  getColorScheme,
} from '@libs/utils/propertyColors';

interface ISelectFilterInputProps {
  definition: IPropertyDefinition;
  selectedValues: string[];
  onToggle: (option: string) => void;
  onApply: () => void;
}

/**
 * Select property filter input with multi-select checkboxes
 * Supports selecting multiple values with OR logic
 */
export const SelectFilterInput: React.FC<ISelectFilterInputProps> = ({
  definition,
  selectedValues,
  onToggle,
  onApply,
}) => {
  const normalizedOptions = getPropertyOptions(definition);
  const optionValues = extractOptionValues(definition.config.options);

  return (
    <div className='space-y-2 p-2'>
      <div className='aucctus-text-xs aucctus-text-tertiary px-1'>
        Select values (multiple):
      </div>
      <div className='no-scrollbar max-h-60 space-y-1 overflow-y-auto'>
        {optionValues.map((option) => {
          const isSelected = selectedValues.includes(option);
          const optionData = normalizedOptions.find(
            (opt: IPropertyOption) => opt.value === option,
          );
          const color = optionData?.color || '#F5F3F3';
          const colorScheme = getColorScheme(color);

          return (
            <label
              key={option}
              className='aucctus-text-sm aucctus-text-primary aucctus-bg-primary-hover flex cursor-pointer items-center gap-2 rounded px-3 py-2 transition-colors'
            >
              <Input.CheckBox
                checked={isSelected}
                onChange={() => onToggle(option)}
              />
              <div className='flex items-center gap-2'>
                <div
                  className='h-3 w-3 flex-shrink-0 rounded-full border'
                  style={{
                    backgroundColor: colorScheme.backgroundColor,
                    borderColor: colorScheme.borderColor,
                  }}
                />
                <span>{option}</span>
              </div>
            </label>
          );
        })}
      </div>
      <div className='aucctus-border-secondary flex items-center justify-end gap-2 border-t pt-2'>
        <button
          onClick={onApply}
          className='aucctus-text-sm aucctus-text-brand-primary aucctus-bg-brand-primary rounded px-2 py-1 font-medium transition-colors'
        >
          Apply {selectedValues.length > 0 && `(${selectedValues.length})`}
        </button>
      </div>
    </div>
  );
};
