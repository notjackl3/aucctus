import { Icon, Portal } from '@components';
import { cn } from '@libs/utils/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { categoryStatusOptions, questionStatusOptions } from './fixtures';
import { StatusDropdownProps } from './types';

const StatusDropdown: React.FC<StatusDropdownProps> = ({
  currentStatus,
  onStatusChange,
  dropdownId,
  isCategory = true,
  activeDropdown,
  setActiveDropdown,
  compact = false,
}) => {
  const isOpen = activeDropdown === dropdownId;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const statusOptions = isCategory
    ? categoryStatusOptions
    : questionStatusOptions;
  const currentConfig = statusOptions.find(
    (opt) => opt.value === currentStatus,
  );

  // Calculate dropdown position when opened
  const updatePosition = useCallback(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollX = window.scrollX || document.documentElement.scrollLeft;

      setDropdownPosition({
        top: rect.bottom + scrollY + 8, // 8px gap below button
        left: rect.left + scrollX,
        width: Math.max(rect.width, 192), // min-width of 192px (w-48)
      });
    } else {
      setDropdownPosition(null);
    }
  }, [isOpen]);

  useEffect(() => {
    updatePosition();
  }, [updatePosition]);

  // Update position on scroll/resize
  useEffect(() => {
    if (isOpen) {
      const handleUpdate = () => updatePosition();
      window.addEventListener('scroll', handleUpdate, true);
      window.addEventListener('resize', handleUpdate);

      return () => {
        window.removeEventListener('scroll', handleUpdate, true);
        window.removeEventListener('resize', handleUpdate);
      };
    }
  }, [isOpen, updatePosition]);

  return (
    <div className='relative' data-dropdown>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setActiveDropdown(isOpen ? null : dropdownId);
        }}
        className={cn({
          'flex items-center border transition-all duration-200 focus:outline-none':
            true,
          'gap-1 rounded-md px-2 py-1': compact,
          'gap-2 rounded-lg px-3 py-1.5': !compact,
          [currentConfig?.borderClass || 'aucctus-border-secondary']: true,
          [currentConfig?.bgClass || 'aucctus-bg-secondary']: true,
          'hover:aucctus-bg-secondary-hover focus:aucctus-border-brand': true,
        })}
      >
        {currentConfig && (
          <Icon
            variant={currentConfig.icon}
            className={currentConfig.colorClass.replace(
              'aucctus-text-',
              'aucctus-stroke-',
            )}
            height={compact ? 12 : 16}
            width={compact ? 12 : 16}
          />
        )}
        {!compact && currentConfig && (
          <span
            className={cn('aucctus-text-sm-medium', currentConfig.colorClass)}
          >
            {currentConfig.label}
          </span>
        )}
        <Icon
          variant={isOpen ? 'chevronup' : 'chevrondown'}
          className='aucctus-stroke-quaternary'
          height={12}
          width={12}
        />
      </button>

      {isOpen && dropdownPosition && (
        <Portal>
          {/* Backdrop */}
          <div
            className='fixed inset-0 z-[9998]'
            onClick={() => setActiveDropdown(null)}
            style={{ pointerEvents: 'auto' }}
          />

          {/* Dropdown Menu */}
          <div
            className='aucctus-bg-primary aucctus-border-primary animate-in fade-in-0 zoom-in-95 absolute z-[9999] rounded-lg border py-1 shadow-lg duration-200'
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
              minWidth: '192px', // w-48 equivalent
              pointerEvents: 'auto',
            }}
          >
            {statusOptions.map((option) => {
              const isSelected = option.value === currentStatus;

              return (
                <button
                  key={option.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(option.value);
                    setActiveDropdown(null);
                  }}
                  className={cn({
                    'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors duration-150':
                      true,
                    [option.bgClass]: isSelected,
                    [option.colorClass]: isSelected,
                    'aucctus-text-secondary hover:aucctus-bg-secondary-hover':
                      !isSelected,
                    [option.hoverBgClass]: true,
                  })}
                >
                  <Icon
                    variant={option.icon}
                    className={cn({
                      [option.colorClass.replace(
                        'aucctus-text-',
                        'aucctus-stroke-',
                      )]: isSelected,
                      'aucctus-stroke-quaternary': !isSelected,
                    })}
                    height={16}
                    width={16}
                  />

                  <span className='aucctus-text-sm-medium'>{option.label}</span>
                  {isSelected && (
                    <div className='ml-auto'>
                      <div
                        className={`h-2 w-2 rounded-full bg-${option.colorClass}`}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Portal>
      )}
    </div>
  );
};

export default StatusDropdown;
