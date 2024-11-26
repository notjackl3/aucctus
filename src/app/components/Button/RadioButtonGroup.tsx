import utils from '@libs/utils';
import { cn } from '@libs/utils/react';
import React, { useEffect, useState } from 'react';

interface RadioButtonGroupProps {
  containerClass?: string;
  label?: string;
  options: string[]; // Array of options for the radio buttons
  defaultSelected?: string; // Optional default selected value
  value?: string; // Controlled selected value
  required?: boolean;
  onChange?: (selected: string) => void; // Callback for when selection changes
}

const RadioButtonGroup: React.FC<RadioButtonGroupProps> = ({
  containerClass,
  options,
  defaultSelected,
  value,
  onChange,
}) => {
  const [selected, setSelected] = useState<string | undefined>(
    value || defaultSelected,
  );

  const handleSelect = (option: string) => {
    if (selected !== option) {
      setSelected(option);
      if (onChange) {
        onChange(option); // Pass the new selection to the parent
      }
    }
  };

  useEffect(() => {
    // Update local state if `value` prop changes (controlled behavior)
    if (value !== undefined && value !== selected) {
      setSelected(value);
    }
  }, [value, selected]);

  return (
    <div
      className={cn(
        'inline-flex items-start justify-start gap-1',
        containerClass,
      )}
      role='radiogroup'
    >
      {options.map((option) => (
        <button
          key={option}
          onClick={() => handleSelect(option)}
          className={cn('btn btn-md', {
            'btn-primary-light': selected === option,
            'btn-light': selected !== option,
          })}
          role='radio'
          aria-checked={selected === option}
        >
          {utils.string.camelCaseToTitleCase(option)}
        </button>
      ))}
    </div>
  );
};

export default RadioButtonGroup;
