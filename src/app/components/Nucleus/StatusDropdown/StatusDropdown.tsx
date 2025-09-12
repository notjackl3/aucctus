import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from 'react';
import {
  categoryStatusOptions,
  questionStatusOptions,
  StatusOption,
} from './fixtures';
import { StatusDropdownProps, CategoryState, QuestionState } from './types';
import DropdownMenu, { DropdownPosition } from './DropdownMenu';

// Constants
const MIN_DROPDOWN_WIDTH = 192; // 192px (w-48 equivalent)
const DROPDOWN_GAP = 8; // 8px gap below button

// Custom hook for dropdown positioning
const useDropdownPosition = (
  isOpen: boolean,
  buttonRef: React.RefObject<HTMLButtonElement>,
) => {
  const [dropdownPosition, setDropdownPosition] =
    useState<DropdownPosition | null>(null);

  const updatePosition = useCallback(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollX = window.scrollX || document.documentElement.scrollLeft;

      setDropdownPosition({
        top: rect.bottom + scrollY + DROPDOWN_GAP,
        left: rect.left + scrollX,
        width: Math.max(rect.width, MIN_DROPDOWN_WIDTH),
      });
    } else {
      setDropdownPosition(null);
    }
  }, [isOpen, buttonRef]);

  useEffect(() => {
    updatePosition();
  }, [updatePosition]);

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

  return dropdownPosition;
};

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
  const dropdownPosition = useDropdownPosition(isOpen, buttonRef);

  // Memoize status options and current config for performance
  const statusOptions = useMemo(() => {
    return isCategory ? categoryStatusOptions : questionStatusOptions;
  }, [isCategory]);

  const currentConfig = useMemo(() => {
    return statusOptions.find((opt) => opt.value === currentStatus);
  }, [statusOptions, currentStatus]);

  // Event handlers
  const handleToggleDropdown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setActiveDropdown(isOpen ? null : dropdownId);
    },
    [isOpen, dropdownId, setActiveDropdown],
  );

  const handleOptionClick = useCallback(
    (optionValue: CategoryState | QuestionState) => {
      onStatusChange(optionValue);
      setActiveDropdown(null);
    },
    [onStatusChange, setActiveDropdown],
  );

  const handleBackdropClick = useCallback(() => {
    setActiveDropdown(null);
  }, [setActiveDropdown]);

  // Memoize button styles for performance
  const buttonClassNames = useMemo(() => {
    return cn({
      'flex items-center border transition-all duration-200 focus:outline-none':
        true,
      'gap-1 rounded-md px-2 py-1': compact,
      'gap-2 rounded-lg px-3 py-1.5': !compact,
      [currentConfig?.borderClass || 'aucctus-border-secondary']: true,
      [currentConfig?.bgClass || 'aucctus-bg-secondary']: true,
      'hover:aucctus-bg-secondary-hover focus:aucctus-border-brand': true,
    });
  }, [compact, currentConfig]);

  return (
    <div className='relative' data-dropdown>
      <DropdownTrigger
        ref={buttonRef}
        isOpen={isOpen}
        compact={compact}
        currentConfig={currentConfig}
        buttonClassNames={buttonClassNames}
        onToggle={handleToggleDropdown}
      />

      {isOpen && dropdownPosition && (
        <DropdownMenu
          position={dropdownPosition}
          options={statusOptions}
          currentStatus={currentStatus}
          onOptionClick={handleOptionClick}
          onBackdropClick={handleBackdropClick}
        />
      )}
    </div>
  );
};

// Dropdown Trigger Component
interface DropdownTriggerProps {
  isOpen: boolean;
  compact: boolean;
  currentConfig: StatusOption | undefined;
  buttonClassNames: string;
  onToggle: (e: React.MouseEvent) => void;
}

const DropdownTrigger = React.forwardRef<
  HTMLButtonElement,
  DropdownTriggerProps
>(({ isOpen, compact, currentConfig, buttonClassNames, onToggle }, ref) => (
  <button ref={ref} onClick={onToggle} className={buttonClassNames}>
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
      <span className={cn('aucctus-text-sm-medium', currentConfig.colorClass)}>
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
));

DropdownTrigger.displayName = 'DropdownTrigger';

export default StatusDropdown;
