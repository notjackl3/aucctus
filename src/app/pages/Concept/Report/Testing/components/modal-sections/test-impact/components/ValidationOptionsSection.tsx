import React from 'react';

interface ValidationOption {
  type: string;
  label: string;
  icon: React.ReactNode;
  isSelected: boolean;
}

interface ValidationOptionsSectionProps {
  options: ValidationOption[];
  isUpdating: boolean;
  onOptionSelect: (optionType: string) => void;
}

const ValidationOptionsSection: React.FC<ValidationOptionsSectionProps> = ({
  options,
  isUpdating,
  onOptionSelect,
}) => {
  return (
    <div>
      <div className='mb-3'>
        <span className='aucctus-text-xs-regular aucctus-text-tertiary'>
          Validation Result
        </span>
      </div>

      {/* Horizontal toggle group layout */}
      <div className='flex items-center gap-1'>
        {options.map((option) => {
          const isCurrentlySelected = option.isSelected;
          const isDisabled = isUpdating || isCurrentlySelected;

          return (
            <button
              key={option.type}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md border p-2 transition-all duration-150 ${
                option.isSelected
                  ? 'aucctus-border-brand-primary aucctus-bg-brand-secondary'
                  : 'aucctus-border-secondary aucctus-bg-primary'
              } ${
                isDisabled
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:aucctus-bg-secondary-subtle cursor-pointer'
              }`}
              onClick={() => {
                if (!isDisabled) {
                  onOptionSelect(option.type);
                }
              }}
              disabled={isDisabled}
              type='button'
            >
              <div className='flex-shrink-0'>{option.icon}</div>
              <span
                className={`aucctus-text-xs-regular whitespace-nowrap ${
                  option.isSelected
                    ? 'aucctus-text-brand-primary'
                    : 'aucctus-text-secondary'
                }`}
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ValidationOptionsSection;
