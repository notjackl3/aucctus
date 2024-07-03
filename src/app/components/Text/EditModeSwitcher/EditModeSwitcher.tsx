import React, { useState, useEffect, FunctionComponent, useRef } from 'react';
import styles from './edit-mode-switcher.module.scss'; // Import the SCSS module
import TextArea from '../TextArea/TextArea';
import Icon from '../../Icons/Icon/Icon';

interface IEditModeSwitcherProps {
  value?: string;
  containerClassName?: string;
  textFieldClassName?: string;
  pClassName?: string;
  label?: string;
  name: string;
  error?: boolean;
  errorMessage?: string;
  required?: boolean;
  hint?: string;
  isDisableResize?: boolean;
  maxLength?: number;

  onChange?: React.ChangeEventHandler<HTMLTextAreaElement> | undefined;
  handleSave?: () => void;
  handleCancel?: () => void;
}

/**
 * EditModeSwitcher component allows the user to switch between edit mode and display mode.
 *
 * @component
 * @example
 * ```tsx
 * <EditModeSwitcher
 *   value="Hello World"
 *   containerClassName="container"
 *   textFieldClassName="textField"
 *   pClassName="paragraph"
 *   name="editModeSwitcher"
 *   label="Edit Mode Switcher"
 *   error={false}
 *   errorMessage=""
 *   required={true}
 *   hint="Click to edit"
 *   isDisableResize={false}
 *   onChange={handleChange}
 *   handleSave={handleSave}
 * />
 * ```
 *
 * @param {Object} props - The component props.
 * @param {string} props.value - The current value of the text.
 * @param {string} [props.containerClassName] - The class name for the container element.
 * @param {string} [props.textFieldClassName] - The class name for the text field element.
 * @param {string} [props.pClassName] - The class name for the paragraph element.
 * @param {string} [props.name] - The name attribute for the text field.
 * @param {string} [props.label] - The label for the text field.
 * @param {boolean} [props.error] - Indicates if there is an error with the text field.
 * @param {string} [props.errorMessage] - The error message to display.
 * @param {boolean} [props.required] - Indicates if the text field is required.
 * @param {string} [props.hint] - The hint text to display.
 * @param {boolean} [props.isDisableResize] - Indicates if the text field should be resizable.
 * @param {Function} [props.onChange] - The callback function to handle text changes.
 * @param {Function} [props.handleSave] - The callback function to handle saving the text.
 *
 * @returns {JSX.Element} The rendered EditModeSwitcher component.
 */
const EditModeSwitcher: FunctionComponent<IEditModeSwitcherProps> = ({
  value = '',
  containerClassName = '',
  textFieldClassName = '',
  pClassName = '',
  name = '',
  label = '',
  error,
  errorMessage,
  required,
  maxLength,
  hint,
  isDisableResize = false,
  onChange,
  handleSave,
  handleCancel,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing || !ref.current) return;

    // Handle the keydown event
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsEditing(false);
        handleCancel && handleCancel();
      }

      if (e.key === 'Enter' && e.shiftKey) {
        // Add a new line to the text
        onChange && onChange({ target: { value: `${value}\n` } } as React.ChangeEvent<HTMLTextAreaElement>);
        e.preventDefault(); // Prevent the default action
      } else if (e.key === 'Enter' || ((e.metaKey || e.ctrlKey) && e.key === 's')) {
        handleSave && handleSave();
        setIsEditing(false);
      }
    };

    // Close the edit mode when clicking outside the component
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsEditing(false);
        handleCancel && handleCancel();
      }
    };

    window.addEventListener('mousedown', handleClick);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleCancel, handleSave, isEditing, onChange, value]);

  return (
    <div
      className={`${styles.container}  ${!isEditing ? styles.editOff : ''} ${containerClassName}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsEditing(true);
      }}
    >
      {isEditing ? (
        <div className={styles.editContainer} ref={ref}>
          <div className={styles.editActions}>
            <button
              className={`btn btn-light ${styles.editButton}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSave && handleSave();
                setIsEditing(false);
              }}
            >
              <Icon variant='save' height={15} width={15} />
            </button>
          </div>
          <TextArea
            value={value}
            onChange={onChange}
            className={`${styles.inputField} ${textFieldClassName}`} // Use SCSS module style
            name={name}
            label={label}
            error={error}
            errorMessage={errorMessage}
            required={required}
            hint={hint}
            isDisableResize={isDisableResize}
            maxLength={maxLength}
          />
        </div>
      ) : (
        <p className={`${pClassName}`}>{value}</p> // Use SCSS module style
      )}
    </div>
  );
};

export default EditModeSwitcher;
