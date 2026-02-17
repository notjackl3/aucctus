import { useState, useRef, useEffect } from 'react';
import { cn } from '@libs/utils/react';
import DropdownMenu from './DropdownMenu';
import { ChevronDown } from 'lucide-react';

interface CategorySelectProps<T extends string> {
  label: string;
  selectedValue: T;
  options: readonly T[];
  onChange: (value: T) => void;
  errorMessage?: string;
  required?: boolean;
}

const CategorySelect = <T extends string>({
  label,
  selectedValue,
  options,
  onChange,
  errorMessage,
  required,
}: CategorySelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  // Update dropdown position when it opens
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isAucctusIgnoreTarget =
        (event.target as Element)?.closest(
          '[data-aucctus-portal-target="true"]',
        ) ||
        (event.target as Element)?.hasAttribute('data-aucctus-portal-target');

      if (!isAucctusIgnoreTarget) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className='mb-4'>
      <label className='aucctus-text-sm aucctus-text-primary mb-2 block'>
        {label}
        {required && <span className='aucctus-text-error-primary ml-1'>*</span>}
      </label>
      <div className='relative' ref={dropdownRef}>
        {/* Custom select trigger */}
        <div
          className={cn({
            'flex w-full cursor-pointer items-center justify-between rounded-md border p-3 transition-all duration-200':
              true,
            'aucctus-bg-primary aucctus-text-primary': true,
            'aucctus-border-secondary': !isOpen && !errorMessage,
            'aucctus-border-error': !isOpen && !!errorMessage,
            'aucctus-border-brand': isOpen,
            'focus:aucctus-border-brand': true,
          })}
          onClick={() => setIsOpen(!isOpen)}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setIsOpen(!isOpen);
              e.preventDefault();
            }
          }}
        >
          <span>{selectedValue}</span>
          <ChevronDown
            className={cn({
              'aucctus-stroke-secondary h-4 w-4 transition-transform duration-200':
                true,
              'rotate-180 transform': isOpen,
            })}
          />
        </div>

        {/* Error message */}
        {errorMessage && (
          <span className='aucctus-text-error-primary mt-1 block text-sm'>
            {errorMessage}
          </span>
        )}

        {/* Dropdown options */}
        {isOpen && (
          <DropdownMenu
            options={options}
            selectedValue={selectedValue}
            position={dropdownPosition}
            onSelect={(option) => {
              onChange(option);
              setIsOpen(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default CategorySelect;
