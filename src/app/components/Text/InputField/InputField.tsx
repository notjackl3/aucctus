import { ForwardRefRenderFunction, InputHTMLAttributes, useState } from 'react';

import styles from './input-field.module.scss';
import React from 'react';
import Icon from '../../Icons/Icon/Icon';

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
}

const defaultIconProps = {
  height: 20,
  width: 20,
  stroke: '#667085',
};

const Input: ForwardRefRenderFunction<HTMLInputElement, InputFieldProps> = (
  { label, name, hint, errorMessage, error = false, isPassword = false, variant, width, ...props },
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

  return (
    <div style={width ? { width } : {}} className={`${inputFieldStyle} ${hasError ? styles.inputFieldError : ''}`}>
      {label && <div className={styles.label}>{label}</div>}
      <input {...props} type={getInputType()} ref={ref} name={name} />
      {showVisibilityIcon && (
        <button
          type="button"
          className={`${styles.icon}`}
          onClick={togglePasswordVisibility}
          aria-label="Toggle password visibility"
        >
          <Icon variant={isPasswordVisible ? 'eye-off' : 'eye'} {...defaultIconProps} />
        </button>
      )}
      {showHint ? <div className={styles.hintText}>{hintText}</div> : null}
    </div>
  );
};

const InputField = React.forwardRef(Input);

export default InputField;
