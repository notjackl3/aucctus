import { ForwardRefRenderFunction, TextareaHTMLAttributes } from 'react';

import styles from '../assets/styles/components/input-field.module.scss';
import React from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  name: string;
  error?: boolean;
  errorMessage?: string;
  required?: boolean;
  hint?: string;
  isDisableResize?: boolean;
}

const Input: ForwardRefRenderFunction<HTMLTextAreaElement, TextAreaProps> = (
  { label, name, hint, errorMessage, isDisableResize, error = false, ...props },
  ref
) => {
  const showHint = !!hint || !!errorMessage;
  const hintText = errorMessage || hint;

  const disableResizeClassName = isDisableResize ? styles.disableResize : '';

  return (
    <div className={`${styles.inputField} ${error ? styles.inputFieldError : ''}`}>
      <div className={styles.label}>{label}</div>
      <textarea className={disableResizeClassName} cols={50} rows={4} {...props} ref={ref} name={name} />
      {showHint ? <div className={styles.hintText}>{hintText}</div> : null}
    </div>
  );
};

const TextArea = React.forwardRef(Input);

export default TextArea;
