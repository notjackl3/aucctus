import React, { useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import { CategoryState, QuestionState } from './types';
import { StatusOption } from './fixtures';

// Types
interface DropdownPosition {
  top: number;
  left: number;
  width: number;
}

// Constants
const MIN_DROPDOWN_WIDTH = 192; // 192px (w-48 equivalent)

// Dropdown Menu Component
interface DropdownMenuProps {
  position: DropdownPosition;
  options: StatusOption[];
  currentStatus: CategoryState | QuestionState;
  onOptionClick: (value: CategoryState | QuestionState) => void;
  onBackdropClick: () => void;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  position,
  options,
  currentStatus,
  onOptionClick,
  onBackdropClick,
}) => {
  // Handle backdrop clicks - prevent propagation to parent components
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onBackdropClick();
    },
    [onBackdropClick],
  );

  // Handle dropdown menu container clicks - prevent propagation
  const handleMenuClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // Only render in browser environment
  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      {/* Backdrop - catches clicks outside dropdown */}
      <div
        className='fixed inset-0 z-[9998]'
        onClick={handleBackdropClick}
        style={{ pointerEvents: 'auto' }}
        data-aucctus-portal-target='true'
      />

      {/* Dropdown Menu Container */}
      <div
        className='aucctus-bg-primary aucctus-border-primary animate-in fade-in-0 zoom-in-95 absolute z-[9999] rounded-lg border py-1 shadow-lg duration-200'
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          width: `${position.width}px`,
          minWidth: `${MIN_DROPDOWN_WIDTH}px`,
          pointerEvents: 'auto',
        }}
        onClick={handleMenuClick}
        data-aucctus-portal-target='true'
      >
        {options.map((option) => (
          <DropdownOption
            key={option.value}
            option={option}
            isSelected={option.value === currentStatus}
            onClick={() => onOptionClick(option.value)}
          />
        ))}
      </div>
    </>,
    document.body,
  );
};

// Dropdown Option Component
interface DropdownOptionProps {
  option: StatusOption;
  isSelected: boolean;
  onClick: () => void;
}

const DropdownOption: React.FC<DropdownOptionProps> = ({
  option,
  isSelected,
  onClick,
}) => {
  // Handle pointer interactions (mouse/touch/pen) early to avoid losing the element before click fires
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onClick();
    },
    [onClick],
  );

  // Handle keyboard-initiated clicks (e.g., Enter/Space) where detail === 0
  const handleKeyboardClick = useCallback(
    (e: React.MouseEvent) => {
      if ((e as unknown as { detail?: number }).detail !== 0) {
        return;
      }
      e.stopPropagation();
      e.preventDefault();
      onClick();
    },
    [onClick],
  );

  const optionClassNames = useMemo(() => {
    return cn({
      'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors duration-150':
        true,
      [option.bgClass]: isSelected,
      [option.colorClass]: isSelected,
      'aucctus-text-secondary hover:aucctus-bg-secondary-hover': !isSelected,
      [option.hoverBgClass]: true,
    });
  }, [option, isSelected]);

  const iconClassNames = useMemo(() => {
    return cn({
      [option.colorClass.replace('aucctus-text-', 'aucctus-stroke-')]:
        isSelected,
      'aucctus-stroke-quaternary': !isSelected,
    });
  }, [option, isSelected]);

  return (
    <button
      type='button'
      onPointerDown={handlePointerDown}
      onClick={handleKeyboardClick}
      className={optionClassNames}
    >
      <Icon
        variant={option.icon}
        className={iconClassNames}
        height={16}
        width={16}
      />
      <span className='aucctus-text-sm-medium'>{option.label}</span>
      {isSelected && (
        <div className='ml-auto'>
          <div className={`h-2 w-2 rounded-full bg-${option.colorClass}`} />
        </div>
      )}
    </button>
  );
};

export default DropdownMenu;
export type { DropdownPosition, DropdownMenuProps };
