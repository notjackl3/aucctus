import {
  ForwardRefRenderFunction,
  TextareaHTMLAttributes,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import styles from './text-area.module.scss';
import React from 'react';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  name: string;
  error?: boolean;
  errorMessage?: string;
  required?: boolean;
  hint?: string;
  maxLength?: number;
  isDisableResize?: boolean;
  showAsterisk?: boolean;
  calculateInitialHeight?: boolean; // New prop to control height calculation
}

interface ITextAreaHandle {
  focus: () => void;
  reset: () => void;
}

const Input: ForwardRefRenderFunction<ITextAreaHandle, TextAreaProps> = (
  {
    label,
    name,
    hint,
    errorMessage,
    isDisableResize = false,
    error = false,
    maxLength,
    showAsterisk = false,
    value,
    ...props
  },
  ref,
) => {
  const hasError = !!errorMessage || error;
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const [characterCount, setCharacterCount] = useState(0);

  const showHint = !!hint || !!errorMessage;
  const hintText = errorMessage || hint;

  const disableResizeClassName = isDisableResize ? styles.disableResize : '';
  const characterCountErrorStyle = !!maxLength && characterCount > maxLength ? styles.error : '';

  const scrollToTextAreaWithPadding = useCallback(() => {
    const padding = 35; // Adjust padding value as needed, e.g., 35 pixels from the bottom
    const element = internalRef.current;
    if (element) {
      const elementRect = element.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.scrollY;
      const middle = absoluteElementTop - (window.innerHeight - elementRect.height) / 2;
      window.scrollTo({
        top: middle - padding, // Scrolls to the position of the element minus the padding
        behavior: 'smooth',
      });
    }
  }, [internalRef]);

  // Update character count when value changes
  useEffect(() => {
    if (!maxLength) return;
    setCharacterCount(value ? value.toString().length : 0);
  }, [value, maxLength]);

  useEffect(() => {
    if (internalRef.current) {
      internalRef.current.style.height = 'auto'; // Reset height to calculate new scroll height
      internalRef.current.style.height = `${internalRef.current.scrollHeight}px`; // Set textarea height based on content
      scrollToTextAreaWithPadding();
    }
  }, [scrollToTextAreaWithPadding, value]);

  useImperativeHandle(ref, () => ({
    ...internalRef.current, // Spread all properties and methods of the textarea
    focus: () => internalRef.current?.focus(), // Additional method to focus the textarea
    reset: () => {
      // Additional method to reset the textarea content and character count
      if (internalRef.current) {
        internalRef.current.value = '';
        setCharacterCount(0);
      }
    },
  }));

  return (
    <div className={`${styles.inputField} ${hasError ? styles.inputFieldError : ''}`}>
      <div className={styles.label}>
        {label}
        {showAsterisk ? <span className='font-semibold text-red-400'>*</span> : null}
      </div>
      <textarea
        className={disableResizeClassName}
        cols={50}
        rows={4}
        value={value}
        {...props}
        ref={internalRef}
        name={name}
      />
      {maxLength ? (
        <span className={`${styles.characterCount} ${characterCountErrorStyle}`}>
          {characterCount}/{maxLength}
        </span>
      ) : null}
      {showHint ? <div className={styles.hintText}>{hintText}</div> : null}
    </div>
  );
};

const TextArea = React.forwardRef(Input);

export default TextArea;
