import { ForwardRefRenderFunction, InputHTMLAttributes } from "react";

import styles from '../assets/styles/components/input-field.module.scss'
import React from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  isPassword?: boolean
  required?: boolean
  hintText?: string
}

const Input: ForwardRefRenderFunction<HTMLInputElement, InputFieldProps> = ({ label, name, hintText, isPassword = false, ...props }, ref) => {

  return (
    <div className={styles.inputField}>
      <div className={styles.label}>
        {label}
      </div>
      <input
        {...props}
        type={isPassword ? 'password' : props.type}
        ref={ref}
        name={name}
      />
      {
        hintText ?
          <div className={styles.hintText}>
            This is a hint text to help user.
          </div>
          : null
      }
    </div>
  )
}

const InputField = React.forwardRef(Input);

export default InputField