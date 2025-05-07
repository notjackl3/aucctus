import React from 'react';
import { cn } from '@libs/utils/react';
import { createPortal } from 'react-dom';

interface DropdownPosition {
  top: number;
  left: number;
  width: number;
}

interface DropdownMenuProps<T extends string> {
  options: readonly T[];
  selectedValue: T;
  position: DropdownPosition;
  onSelect: (option: T) => void;
}

const DropdownMenu = <T extends string>({
  options,
  selectedValue,
  position,
  onSelect,
}: DropdownMenuProps<T>) => {
  // Only render in browser environment
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className='aucctus-bg-primary aucctus-border-secondary fixed z-50 rounded-md border shadow-lg'
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
      }}
      data-aucctus-ignore-target='true'
    >
      <ul className='no-scrollbar max-h-60 overscroll-contain py-1'>
        {options.map((option) => (
          <li
            key={option}
            className={cn(
              'aucctus-text-sm aucctus-text-primary cursor-pointer p-2 transition-all duration-200',
              {
                'aucctus-bg-primary-hover': option !== selectedValue,
                'aucctus-bg-secondary-hover': option === selectedValue,
              },
            )}
            onClick={() => onSelect(option)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onSelect(option);
                e.preventDefault();
              }
            }}
            data-aucctus-portal-target='true'
          >
            {option}
          </li>
        ))}
      </ul>
    </div>,
    document.body,
  );
};

export default DropdownMenu;
