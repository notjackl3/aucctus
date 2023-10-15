import { ForwardRefRenderFunction, InputHTMLAttributes } from "react";

import styles from '../assets/styles/components/input-field.module.scss'
import React from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: boolean;
  errorMessage?: string;
  isPassword?: boolean
  required?: boolean
  hintText?: string
}

const Input: ForwardRefRenderFunction<HTMLInputElement, InputFieldProps> = ({ label, name, hintText, errorMessage, error = false, isPassword = false, ...props }, ref) => {

  const showHint = !!hintText || !!errorMessage
  const hint = errorMessage || hintText;


  return (
    <div className={`${styles.inputField} ${error ? styles.inputFieldError : ""}`}>
      <div className={styles.label}>
        {label}
      </div>
      <input
        {...props}
        type={isPassword ? 'password' : 'text'}
        ref={ref}
        name={name}
      />
      {
        showHint ?
          <div className={styles.hintText}>
            {hint}
          </div>
          : null
      }
    </div>
  )
}

const InputField = React.forwardRef(Input);

export default InputField