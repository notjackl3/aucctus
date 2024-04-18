import { ForwardRefRenderFunction, InputHTMLAttributes } from 'react';

import styles from '../assets/styles/components/input-field.module.scss';
import React from 'react';

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

const Input: ForwardRefRenderFunction<HTMLInputElement, InputFieldProps> = (
  { label, name, hint, errorMessage, error = false, isPassword = false, variant, width, ...props },
  ref
) => {
  const showHint = !!hint || !!errorMessage;
  const hintText = errorMessage || hint;

  function getInputFieldStyle(variant: InputFieldProps['variant']) {
    switch (variant) {
      case 'settings':
        return styles.inputFieldSettings;
      default:
        return styles.inputField;
    }
  }

  const inputFieldStyle = getInputFieldStyle(variant);

  return (
    <div style={width ? { width } : {}} className={`${inputFieldStyle} ${error ? styles.inputFieldError : ''}`}>
      {label && <div className={styles.label}>{label}</div>}
      <input {...props} type={isPassword ? 'password' : props.type ? props.type : 'text'} ref={ref} name={name} />
      {showHint ? <div className={styles.hintText}>{hintText}</div> : null}
    </div>
  );
};

const InputField = React.forwardRef(Input);

export default InputField;
