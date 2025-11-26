import { Icon } from '@components';
import { IPropertyDefinition, IPropertyOption } from '@libs/api/types';
import React from 'react';
import { createPortal } from 'react-dom';
import { useTransition, animated } from '@react-spring/web';
import { getPropertyOptions, getColorScheme } from '@libs/utils/propertyColors';

interface DropdownPosition {
  top: number;
  left: number;
  width: number;
}

interface IInlineMultiSelectDropdownProps {
  options: string[];
  selectedValues: string[];
  position: DropdownPosition;
  onToggle: (option: string) => void;
  definition: IPropertyDefinition;
  isOpen: boolean;
}

/**
 * Inline multi-select dropdown menu for multi-select property cells
 * Uses portal rendering with check icons on the right for selected items
 * Features smooth mount/unmount animations with react-spring
 * Saves on blur/unmount (no "Done" button)
 */
export const InlineMultiSelectDropdown: React.FC<
  IInlineMultiSelectDropdownProps
> = ({ options, selectedValues, position, onToggle, definition, isOpen }) => {
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
            className='aucctus-bg-primary aucctus-border-secondary w-fit min-w-[200px] rounded-md border shadow-lg'
            data-aucctus-portal-target='true'
          >
            <div className='no-scrollbar max-h-60 overflow-y-auto overscroll-contain py-1'>
              {options.map((option) => {
                const isSelected = selectedValues.includes(option);
                const optionData = normalizedOptions.find(
                  (opt: IPropertyOption) => opt.value === option,
                );
                const color = optionData?.color || '#F5F3F3';
                const colorScheme = getColorScheme(color);

                return (
                  <button
                    key={option}
                    className='aucctus-text-sm aucctus-text-primary aucctus-bg-primary-hover flex w-full cursor-pointer items-center justify-between whitespace-nowrap px-3 py-2 transition-all duration-200'
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggle(option);
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
                    {isSelected && (
                      <Icon
                        variant='check'
                        className='aucctus-stroke-brand-primary h-4 w-4 flex-shrink-0'
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </animated.div>
        ) : null,
      )}
    </>,
    document.body,
  );
};
