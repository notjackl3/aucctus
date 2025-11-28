import { Icon } from '@components';
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
 * Auto-applies filter when submenu closes (component unmounts)
 */
export const SelectFilterInput: React.FC<ISelectFilterInputProps> = ({
  definition,
  selectedValues,
  onToggle,
  onApply,
}) => {
  const hasChangesRef = React.useRef(false);
  const onApplyRef = React.useRef(onApply);

  // Keep onApply ref updated to avoid stale closure in cleanup
  React.useEffect(() => {
    onApplyRef.current = onApply;
  }, [onApply]);

  const handleToggle = (option: string) => {
    hasChangesRef.current = true;
    onToggle(option);
  };

  // Apply filter when submenu closes (component unmounts)
  React.useEffect(() => {
    return () => {
      if (hasChangesRef.current) {
        onApplyRef.current();
      }
    };
  }, []);

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
            <div
              key={option}
              onClick={() => handleToggle(option)}
              className='aucctus-text-sm aucctus-text-primary aucctus-bg-primary-hover flex cursor-pointer items-center gap-2 rounded px-3 py-2 transition-colors'
            >
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
              {isSelected && (
                <Icon
                  variant='check'
                  className='aucctus-stroke-success-primary h-4 w-4 flex-shrink-0'
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
