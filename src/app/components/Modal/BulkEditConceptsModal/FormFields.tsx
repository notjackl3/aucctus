import { Check, ChevronDown, X } from 'lucide-react';
import { IPropertyDefinition } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import {
  getColoredTagStyles,
  getOptionColor,
  getPropertyOptions,
} from '@libs/utils/propertyColors';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/* ------------------------------------------------------------------ */
/*  FormTextInput                                                      */
/* ------------------------------------------------------------------ */

interface FormTextInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onReset?: () => void;
  hasChanged?: boolean;
}

export const FormTextInput: React.FC<FormTextInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  onReset,
  hasChanged,
}) => (
  <div className='space-y-1.5'>
    <label className='aucctus-text-sm-medium aucctus-text-primary'>
      {label}
    </label>
    <div className='relative'>
      <input
        type='text'
        className='aucctus-bg-primary aucctus-text-primary aucctus-border-secondary placeholder:aucctus-text-quaternary w-full rounded-lg border px-3 py-2 text-sm transition-all duration-200 focus:outline-none'
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {hasChanged && onReset && (
        <button
          type='button'
          className='aucctus-text-quaternary hover:aucctus-text-secondary absolute right-2 top-1/2 -translate-y-1/2 p-0.5'
          onClick={onReset}
        >
          <X className='h-3.5 w-3.5' />
        </button>
      )}
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  FormNumberInput                                                    */
/* ------------------------------------------------------------------ */

interface FormNumberInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onReset?: () => void;
  hasChanged?: boolean;
  min?: number;
  max?: number;
}

export const FormNumberInput: React.FC<FormNumberInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  onReset,
  hasChanged,
  min,
  max,
}) => (
  <div className='space-y-1.5'>
    <label className='aucctus-text-sm-medium aucctus-text-primary'>
      {label}
    </label>
    <div className='relative flex items-center gap-2'>
      <input
        type='number'
        className='aucctus-bg-primary aucctus-text-primary aucctus-border-secondary placeholder:aucctus-text-quaternary w-full rounded-lg border px-3 py-2 text-sm transition-all duration-200 [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
      />
      {hasChanged && onReset && (
        <button
          type='button'
          className='aucctus-text-quaternary hover:aucctus-text-secondary shrink-0 p-0.5'
          onClick={onReset}
        >
          <X className='h-3.5 w-3.5' />
        </button>
      )}
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  FormCheckbox (three-state segmented control)                       */
/* ------------------------------------------------------------------ */

interface FormCheckboxProps {
  label: string;
  value: 'no_change' | 'true' | 'false';
  onChange: (value: 'no_change' | 'true' | 'false') => void;
}

const CHECKBOX_OPTIONS: {
  value: 'no_change' | 'true' | 'false';
  label: string;
}[] = [
  { value: 'no_change', label: 'No change' },
  { value: 'true', label: 'Yes' },
  { value: 'false', label: 'No' },
];

export const FormCheckbox: React.FC<FormCheckboxProps> = ({
  label,
  value,
  onChange,
}) => (
  <div className='space-y-1.5'>
    <label className='aucctus-text-sm-medium aucctus-text-primary'>
      {label}
    </label>
    <div className='aucctus-bg-primary aucctus-border-secondary flex rounded-lg border'>
      {CHECKBOX_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type='button'
          className={cn(
            'flex-1 px-3 py-2 text-sm transition-all duration-200 first:rounded-l-lg last:rounded-r-lg',
            {
              'aucctus-bg-secondary aucctus-text-primary font-medium':
                value === opt.value,
              'aucctus-text-quaternary hover:aucctus-text-secondary':
                value !== opt.value,
            },
          )}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  FormMultiSelect                                                    */
/* ------------------------------------------------------------------ */

interface FormMultiSelectProps {
  label: string;
  placeholder: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  onReset?: () => void;
  hasChanged?: boolean;
  definition: IPropertyDefinition;
}

export const FormMultiSelect: React.FC<FormMultiSelectProps> = ({
  label,
  placeholder,
  options,
  selectedValues,
  onChange,
  onReset,
  hasChanged,
  definition,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  const normalizedOptions = getPropertyOptions(definition);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (
        !triggerRef.current?.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const toggleOption = (optionValue: string) => {
    if (selectedValues.includes(optionValue)) {
      onChange(selectedValues.filter((v) => v !== optionValue));
    } else {
      onChange([...selectedValues, optionValue]);
    }
  };

  return (
    <div className='space-y-1.5'>
      <label className='aucctus-text-sm-medium aucctus-text-primary'>
        {label}
      </label>
      <div ref={triggerRef}>
        <div
          className={cn(
            'aucctus-bg-primary aucctus-text-primary flex min-h-[38px] w-full cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-sm transition-all duration-200',
            {
              'aucctus-border-brand': isOpen,
              'aucctus-border-secondary': !isOpen,
            },
          )}
          onClick={() => setIsOpen(!isOpen)}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setIsOpen(!isOpen);
              e.preventDefault();
            }
          }}
        >
          <div className='flex flex-1 flex-wrap gap-1'>
            {!hasChanged || selectedValues.length === 0 ? (
              <span className='aucctus-text-quaternary'>{placeholder}</span>
            ) : (
              selectedValues.map((val) => (
                <span
                  key={val}
                  className='inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium'
                  style={getColoredTagStyles(getOptionColor(val, definition))}
                >
                  {val}
                </span>
              ))
            )}
          </div>
          <div className='flex items-center gap-1'>
            {hasChanged && onReset && (
              <button
                type='button'
                className='aucctus-text-quaternary hover:aucctus-text-secondary p-0.5'
                onClick={(e) => {
                  e.stopPropagation();
                  onReset();
                  setIsOpen(false);
                }}
              >
                <X className='h-3.5 w-3.5' />
              </button>
            )}
            <ChevronDown
              className={cn(
                'aucctus-stroke-secondary h-4 w-4 transition-transform duration-200',
                { 'rotate-180': isOpen },
              )}
            />
          </div>
        </div>
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            data-aucctus-portal-target='true'
            className='aucctus-bg-primary aucctus-border-secondary fixed z-[10000] rounded-lg border shadow-lg'
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              width: `${position.width}px`,
            }}
          >
            <ul className='no-scrollbar max-h-60 overflow-y-auto overscroll-contain py-1'>
              {options.map((opt) => {
                const isSelected = selectedValues.includes(opt);
                const normalizedOpt = normalizedOptions.find(
                  (o) => o.value === opt,
                );
                return (
                  <li
                    key={opt}
                    className={cn(
                      'aucctus-text-sm aucctus-text-primary flex cursor-pointer items-center gap-2 px-3 py-2 transition-colors',
                      {
                        'aucctus-bg-secondary': isSelected,
                        'aucctus-bg-primary-hover': !isSelected,
                      },
                    )}
                    onClick={() => toggleOption(opt)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        toggleOption(opt);
                        e.preventDefault();
                      }
                    }}
                  >
                    <div
                      className={cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                        {
                          'border-blue-500 bg-blue-500': isSelected,
                          'aucctus-border-secondary': !isSelected,
                        },
                      )}
                    >
                      {isSelected && <Check className='h-3 w-3 stroke-white' />}
                    </div>
                    {normalizedOpt?.color && (
                      <span
                        className='h-3 w-3 shrink-0 rounded-full border'
                        style={{
                          backgroundColor: normalizedOpt.color,
                          borderColor: normalizedOpt.color,
                        }}
                      />
                    )}
                    <span>{opt}</span>
                  </li>
                );
              })}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  );
};
