import React, {
  ForwardRefRenderFunction,
  InputHTMLAttributes,
  useState,
} from 'react';
import { cn } from '@libs/utils/react';
import { DynamicIcon } from '@libs/utils/iconMap';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  name: string;
  error?: boolean;
  errorMessage?: string;
  isPassword?: boolean;
  required?: boolean;
  hint?: string;
  width?: number | string;
  variant?: 'settings';
  showAsterisk?: boolean;
}

const defaultIconProps = {
  height: 20,
  width: 20,
  stroke: '#667085',
};

const Input: ForwardRefRenderFunction<HTMLInputElement, InputFieldProps> = (
  {
    label,
    name,
    hint,
    errorMessage,
    error = false,
    isPassword = false,
    variant,
    showAsterisk = false,
    width,
    value,
    onChange,
    ...props
  },
  ref,
) => {
  const hasError = !!errorMessage || error;
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const showHint = !!hint || !!errorMessage;
  const hintText = errorMessage || hint;
  const showVisibilityIcon = isPassword && variant === 'settings';

  const getInputType = () => {
    if (isPassword && isPasswordVisible) {
      return 'text';
    } else if (isPassword) {
      return 'password';
    } else {
      return props.type ? props.type : 'text';
    }
  };

  const baseInputClasses = cn(
    'w-full flex flex-row',
    'px-3 py-2',
    'text-gray-900',
    'font-normal text-base leading-6',
    'rounded-md',
    'aucctus-bg-primary',
    'shadow-sm',
    'border aucctus-border-primary',
    'placeholder:aucctus-text-placeholder',
    'transition-all duration-300 ease-in-out',
    'focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-500',
    props.disabled && 'bg-transparent',
  );

  const containerClasses = cn(
    'relative inline-block self-stretch transition-all duration-300',
    variant === 'settings' && 'flex flex-col gap-1 flex-1 max-w-[25rem]',
    width && `w-[${width}${typeof width === 'number' ? 'px' : ''}]`,
  );

  const labelClasses = cn(
    'relative leading-5 font-medium mb-1 aucctus-text-secondary',
    variant === 'settings' && 'text-sm',
    hasError && 'font-bold text-error-500',
  );

  const hintClasses = cn(
    'relative leading-5',
    hasError ? 'text-error-500' : 'text-gray-600',
    variant === 'settings' && 'text-sm',
  );

  return (
    <div className={containerClasses}>
      {label && (
        <div className={labelClasses}>
          {label}
          {showAsterisk ? (
            <span className='font-semibold text-red-400'>*</span>
          ) : null}
        </div>
      )}
      <div className='relative'>
        <input
          {...props}
          type={getInputType()}
          ref={ref}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          className={baseInputClasses}
        />
        {showVisibilityIcon && (
          <button
            type='button'
            className='absolute right-4 top-[0.9rem] border-none bg-transparent p-0'
            onClick={togglePasswordVisibility}
            aria-label='Toggle password visibility'
          >
            <DynamicIcon
              variant={isPasswordVisible ? 'eye-off' : 'eye'}
              {...defaultIconProps}
            />
          </button>
        )}
      </div>
      {showHint ? <div className={hintClasses}>{hintText}</div> : null}
    </div>
  );
};

const InputField = React.forwardRef(Input);

export default InputField;
