import { IPropertyDefinition, IPropertyOption } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import React from 'react';
import { createPortal } from 'react-dom';
import { useTransition, animated } from '@react-spring/web';
import { getPropertyOptions, getColorScheme } from '@libs/utils/propertyColors';

interface DropdownPosition {
  top: number;
  left: number;
  width: number;
}

interface IInlineSelectDropdownProps {
  options: string[];
  selectedValue: string;
  position: DropdownPosition;
  onSelect: (option: string) => void;
  definition: IPropertyDefinition;
  isOpen: boolean;
}

/**
 * Inline dropdown menu for select property cells
 * Uses portal rendering to avoid z-index issues within table cells
 * Features smooth mount/unmount animations with react-spring
 */
export const InlineSelectDropdown: React.FC<IInlineSelectDropdownProps> = ({
  options,
  selectedValue,
  position,
  onSelect,
  definition,
  isOpen,
}) => {
  // Get normalized options with colors
  const normalizedOptions = getPropertyOptions(definition);

  // Animation transition for mount/unmount
  const transition = useTransition(isOpen, {
    from: { opacity: 0, transform: 'scale(0.95) translateY(-8px)' },
    enter: { opacity: 1, transform: 'scale(1) translateY(0px)' },
    leave: { opacity: 0, transform: 'scale(0.95) translateY(-8px)' },
    config: { tension: 300, friction: 25 },
  });

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      {transition((style, item) =>
        item ? (
          <animated.div
            style={{
              ...style,
              position: 'fixed',
              top: `${position.top}px`,
              left: `${position.left}px`,
              zIndex: 9999,
            }}
            className='aucctus-bg-primary aucctus-border-secondary w-fit min-w-[150px] rounded-md border shadow-lg'
            data-aucctus-portal-target='true'
          >
            <ul className='no-scrollbar max-h-60 overflow-y-auto overscroll-contain py-1'>
              {options.map((option) => {
                const optionData = normalizedOptions.find(
                  (opt: IPropertyOption) => opt.value === option,
                );
                const color = optionData?.color || '#F5F3F3';
                const colorScheme = getColorScheme(color);

                return (
                  <li
                    key={option}
                    className={cn(
                      'aucctus-text-sm aucctus-text-primary cursor-pointer whitespace-nowrap px-3 py-2 transition-all duration-200',
                      {
                        'aucctus-bg-primary-hover': option !== selectedValue,
                        'aucctus-bg-brand-secondary aucctus-text-brand-primary':
                          option === selectedValue,
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
                    <div className='flex items-center gap-2'>
                      <div
                        className='h-3 w-3 flex-shrink-0 rounded-full border'
                        style={{
                          backgroundColor: colorScheme.backgroundColor,
                          borderColor: colorScheme.borderColor,
                        }}
                      />
                      <span>{option}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </animated.div>
        ) : null,
      )}
    </>,
    document.body,
  );
};
