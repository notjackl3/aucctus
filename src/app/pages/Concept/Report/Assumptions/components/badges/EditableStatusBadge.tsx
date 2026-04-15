import React, { useCallback, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@libs/utils/react';
import { AssumptionStatusV2 } from '@libs/api/types';
import { ASSUMPTION_STATUS_CONFIGS } from '../../constants/statusConfigs';
import { Check, ChevronDown } from 'lucide-react';
import { DynamicIcon } from '@libs/utils/iconMap';

interface EditableStatusBadgeProps {
  status: AssumptionStatusV2;
  onChange: (newStatus: AssumptionStatusV2) => void;
  disabled?: boolean;
}

// Only allow these statuses for editing
type EditableStatus =
  | 'validated'
  | 'partially_validated'
  | 'invalidated'
  | 'untested';

const EditableStatusBadge: React.FC<EditableStatusBadgeProps> = ({
  status,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Convert status to editable status (filter out unsupported statuses)
  const getEditableStatus = (value: AssumptionStatusV2): EditableStatus => {
    if (
      value === 'validated' ||
      value === 'partially_validated' ||
      value === 'invalidated' ||
      value === 'untested'
    ) {
      return value;
    }
    return 'untested'; // Default fallback
  };

  const currentStatus = getEditableStatus(status);

  // Get status config for display
  const getStatusConfig = (statusValue: EditableStatus) => {
    return (
      ASSUMPTION_STATUS_CONFIGS[statusValue] ||
      ASSUMPTION_STATUS_CONFIGS.untested
    );
  };

  const currentConfig = getStatusConfig(currentStatus);

  const handleSelect = useCallback(
    (newStatus: EditableStatus) => {
      if (newStatus === currentStatus) {
        setIsOpen(false);
        return; // No actual change, so skip notifying parent to avoid false banner
      }

      onChange(newStatus);
      setIsOpen(false);
    },
    [onChange, currentStatus],
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Check if click is inside the dropdown button ref
      if (dropdownRef.current && dropdownRef.current.contains(target)) {
        return;
      }

      // Check if click is inside the portal dropdown (using the data attribute)
      if (target.closest('[data-aucctus-portal-target="true"]')) {
        return;
      }

      // Click is outside both the button and portal dropdown, so close
      setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const statusOptions: EditableStatus[] = [
    'validated',
    'partially_validated',
    'invalidated',
    'untested',
  ];

  const renderDropdown = () => {
    if (!isOpen || !dropdownRef.current) return null;

    const rect = dropdownRef.current.getBoundingClientRect();

    return createPortal(
      <div
        className='aucctus-bg-primary aucctus-border-secondary min-w-[160px] overflow-hidden rounded-md border shadow-lg'
        style={{
          position: 'fixed',
          top: `${rect.bottom + 4}px`,
          left: `${rect.left}px`,
          zIndex: 9999,
          pointerEvents: 'auto',
        }}
        data-aucctus-portal-target='true'
      >
        {statusOptions.map((statusOption) => {
          const config = getStatusConfig(statusOption);
          const isSelected = statusOption === currentStatus;
          return (
            <button
              key={statusOption}
              type='button'
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(statusOption);
              }}
              className={cn(
                'aucctus-bg-primary-hover flex w-full items-center gap-2 px-3 py-2 text-left transition',
                isSelected && 'aucctus-bg-secondary',
              )}
              data-aucctus-portal-target='true'
            >
              <DynamicIcon
                variant={config.icon as any}
                className={cn('h-4 w-4', config.stroke)}
              />
              <span className={cn('aucctus-text-sm', config.text)}>
                {config.label}
              </span>
              {isSelected && (
                <Check className={cn('ml-auto h-4 w-4', config.stroke)} />
              )}
            </button>
          );
        })}
      </div>,
      document.body,
    );
  };

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        type='button'
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) {
            setIsOpen(!isOpen);
          }
        }}
        disabled={disabled}
        className={cn(
          'aucctus-text-xs-medium aucctus-border-secondary inline-flex items-center gap-1 rounded-md border px-2 py-1 transition-opacity',
          currentConfig.bg,
          currentConfig.text,
          !disabled && 'cursor-pointer hover:opacity-80',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        <DynamicIcon
          variant={currentConfig.icon as any}
          className={cn('h-3 w-3', currentConfig.stroke)}
        />
        {currentConfig.label}
        {!disabled && (
          <ChevronDown className={cn('ml-0.5 h-3 w-3', currentConfig.stroke)} />
        )}
      </button>

      {renderDropdown()}
    </div>
  );
};

export default EditableStatusBadge;
