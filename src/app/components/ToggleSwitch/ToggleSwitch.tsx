import { cn } from '@libs/utils/react';
import React from 'react';

/**
 * ToggleSwitch - A reusable toggle switch component
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ToggleSwitch
 *   checked={isEnabled}
 *   onChange={setIsEnabled}
 * />
 *
 * // With different variants and sizes
 * <ToggleSwitch
 *   checked={includeInContext}
 *   onChange={setIncludeInContext}
 *   size="lg"
 *   variant="success"
 *   aria-label="Include in agent context"
 * />
 * ```
 */

export interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'brand' | 'success' | 'warning' | 'error';
  className?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  variant = 'brand',
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
}) => {
  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'h-4 w-7',
      thumb: 'h-2.5 w-2.5',
      translate: {
        checked: 'translate-x-3.5',
        unchecked: 'translate-x-0.5',
      },
    },
    md: {
      container: 'h-5 w-9',
      thumb: 'h-3 w-3',
      translate: {
        checked: 'translate-x-5',
        unchecked: 'translate-x-1',
      },
    },
    lg: {
      container: 'h-6 w-11',
      thumb: 'h-4 w-4',
      translate: {
        checked: 'translate-x-6',
        unchecked: 'translate-x-1',
      },
    },
  };

  // Variant configurations
  const variantConfig = {
    primary: {
      checked: 'aucctus-bg-primary-solid',
      unchecked: 'aucctus-bg-quaternary',
    },
    brand: {
      checked: 'aucctus-bg-brand-primary',
      unchecked: 'aucctus-bg-quaternary',
    },
    success: {
      checked: 'aucctus-bg-success-primary',
      unchecked: 'aucctus-bg-quaternary',
    },
    warning: {
      checked: 'aucctus-bg-warning-primary',
      unchecked: 'aucctus-bg-quaternary',
    },
    error: {
      checked: 'aucctus-bg-error-primary',
      unchecked: 'aucctus-bg-quaternary',
    },
  };

  const currentSize = sizeConfig[size];
  const currentVariant = variantConfig[variant];

  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      type='button'
      role='switch'
      aria-checked={checked}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'focus:ring-brand-primary relative inline-flex items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
        currentSize.container,
        {
          [currentVariant.checked]: checked && !disabled,
          [currentVariant.unchecked]: !checked && !disabled,
          'aucctus-bg-disabled cursor-not-allowed opacity-50': disabled,
          'cursor-pointer': !disabled,
        },
        className,
      )}
    >
      <span
        className={cn(
          'aucctus-bg-primary inline-block transform rounded-full shadow-sm transition-transform duration-200 ease-in-out',
          currentSize.thumb,
          {
            [currentSize.translate.checked]: checked,
            [currentSize.translate.unchecked]: !checked,
          },
        )}
      />
    </button>
  );
};

export default ToggleSwitch;
