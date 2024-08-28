import React, {
  ForwardRefRenderFunction,
  InputHTMLAttributes,
  useEffect,
  useState,
} from 'react';
import Icon from '../../Icon/Icon/Icon';
import styles from './input-field.module.scss';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: boolean;
  errorMessage?: string;
  isPassword?: boolean;
  required?: boolean;
  hint?: string;
  width?: number | string;
  variant?: 'settings';
  showAsterisk?: boolean;
  debounce?: number; // New prop for debounce duration
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
    debounce = 500, // Default debounce time set to 500ms
    ...props
  },
  ref,
) => {
  const hasError = !!errorMessage || error;
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [value, setValue] = useState(props.value || ''); // Local state for input value

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const showHint = !!hint || !!errorMessage;
  const hintText = errorMessage || hint;
  const showVisibilityIcon = isPassword && variant === 'settings';

  function getInputFieldStyle(variant: InputFieldProps['variant']) {
    switch (variant) {
      case 'settings':
        return styles.inputFieldSettings;
      default:
        return styles.inputField;
    }
  }

  const inputFieldStyle = getInputFieldStyle(variant);

  const getInputType = () => {
    if (isPassword && isPasswordVisible) {
      return 'text';
    } else if (isPassword) {
      return 'password';
    } else {
      return props.type ? props.type : 'text';
    }
  };

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      if (props.onChange) {
        const event = {
          ...props,
          target: { value, name },
        };
        props.onChange(event as any); // Trigger the onChange event with the debounced value
      }
    }, debounce);

    return () => {
      clearTimeout(handler);
    };
  }, [value, debounce, props, name]);

  return (
    <div
      style={width ? { width } : {}}
      className={`${inputFieldStyle} ${hasError ? styles.inputFieldError : ''}`}
    >
      {label && (
        <div className={styles.label}>
          {label}
          {showAsterisk ? (
            <span className='font-semibold text-red-400'>*</span>
          ) : null}
        </div>
      )}
      <input
        {...props}
        type={getInputType()}
        ref={ref}
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)} // Update local state
      />
      {showVisibilityIcon && (
        <button
          type='button'
          className={`${styles.icon}`}
          onClick={togglePasswordVisibility}
          aria-label='Toggle password visibility'
        >
          <Icon
            variant={isPasswordVisible ? 'eye-off' : 'eye'}
            {...defaultIconProps}
          />
        </button>
      )}
      {showHint ? <div className={styles.hintText}>{hintText}</div> : null}
    </div>
  );
};

const InputField = React.forwardRef(Input);

export default InputField;
