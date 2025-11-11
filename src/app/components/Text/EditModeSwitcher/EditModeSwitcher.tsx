import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import Icon from '../../Icon/Icon/Icon';
import TextArea from '../../Input/TextArea/TextArea';

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
  rows?: number;
  saveOnBlur?: boolean;

  onChange?: React.ChangeEventHandler<HTMLTextAreaElement> | undefined;
  handleSave?: () => void;
  handleCancel?: () => void;
}

/**
 * EditModeSwitcher component allows the user to switch between edit mode and display mode.
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
  rows,
  hint,
  isDisableResize = false,
  saveOnBlur = false,
  onChange,
  handleSave,
  handleCancel,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing || !ref.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsEditing(false);
        handleCancel && handleCancel();
      }

      if (e.key === 'Enter' && e.shiftKey) {
        onChange &&
          onChange({
            target: { value: `${value}\n` },
          } as React.ChangeEvent<HTMLTextAreaElement>);
        e.preventDefault();
      } else if (
        e.key === 'Enter' ||
        ((e.metaKey || e.ctrlKey) && e.key === 's')
      ) {
        handleSave && handleSave();
        setIsEditing(false);
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsEditing(false);
        if (saveOnBlur) {
          handleSave && handleSave();
        } else {
          handleCancel && handleCancel();
        }
      }
    };

    window.addEventListener('mousedown', handleClick);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleCancel, handleSave, isEditing, onChange, value, saveOnBlur]);

  return (
    <div
      className={`relative w-full rounded-md transition-all duration-300 ${
        !isEditing
          ? 'cursor-pointer hover:bg-white hover:p-2 hover:shadow-md'
          : ''
      } ${containerClassName}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsEditing(true);
      }}
    >
      {isEditing ? (
        <div className='flex w-full flex-col' ref={ref}>
          <div className='absolute right-2 top-3 flex flex-row justify-end gap-4'>
            <button
              className='bg-light z-10 max-h-8 rounded-md p-3'
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
            className={`box-border w-full p-2 text-base !text-primary-500 opacity-100 transition-opacity duration-300 ${textFieldClassName}`}
            style={{
              paddingRight: '2rem',
              paddingBottom: '2rem',
            }}
            name={name}
            label={label}
            error={error}
            errorMessage={errorMessage}
            required={required}
            hint={hint}
            isDisableResize={isDisableResize}
            maxLength={maxLength}
            rows={rows}
          />
        </div>
      ) : (
        <p className={pClassName}>{value}</p>
      )}
    </div>
  );
};

export default EditModeSwitcher;
