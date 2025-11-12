import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';

interface EditableImportanceMeterProps {
  importance: number; // 0-100 percentage
  onChange: (newImportance: number) => void;
  disabled?: boolean;
}

type ImportanceLevel = 'low' | 'medium' | 'high';

const EditableImportanceMeter: React.FC<EditableImportanceMeterProps> = ({
  importance,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Convert percentage to level
  const getImportanceLevel = (value: number): ImportanceLevel => {
    if (value >= 75) return 'high';
    if (value >= 50) return 'medium';
    return 'low';
  };

  // Convert level to percentage
  const levelToPercentage = (level: ImportanceLevel): number => {
    switch (level) {
      case 'high':
        return 85;
      case 'medium':
        return 60;
      case 'low':
        return 35;
    }
  };

  const currentLevel = getImportanceLevel(importance);

  // Get blocks for display
  const getImportanceBlocks = (level: ImportanceLevel) => {
    const config = {
      high: { blocks: 3, color: 'bg-red-500' },
      medium: { blocks: 2, color: 'bg-yellow-500' },
      low: { blocks: 1, color: 'bg-green-500' },
    };
    const { blocks, color } = config[level];
    return Array.from({ length: 3 }, (_, i) => (
      <div
        key={i}
        className={cn('h-2.5 w-1.5', i < blocks ? color : 'bg-gray-200')}
      />
    ));
  };

  const handleSelect = useCallback(
    (level: ImportanceLevel) => {
      if (level === currentLevel) {
        setIsOpen(false);
        return; // No actual change, so skip notifying parent to avoid false banner
      }

      const newValue = levelToPercentage(level);
      onChange(newValue);
      setIsOpen(false);
    },
    [onChange, currentLevel],
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

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
          'aucctus-bg-secondary aucctus-border-secondary flex h-7 items-center gap-1.5 rounded-md border px-2 py-0.5 transition-opacity',
          !disabled && 'hover:opacity-80',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        <span className='aucctus-text-xs aucctus-text-secondary'>
          Importance
        </span>
        <div className='flex gap-0.5'>{getImportanceBlocks(currentLevel)}</div>
        <span className='aucctus-text-xs-semibold aucctus-text-primary capitalize'>
          {currentLevel}
        </span>
        <Icon
          variant='chevrondown'
          className='aucctus-stroke-secondary h-3 w-3'
        />
      </button>

      {isOpen && (
        <div className='aucctus-bg-primary aucctus-border-secondary absolute left-0 top-full z-50 mt-1 overflow-hidden rounded-md border shadow-lg'>
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation();
              handleSelect('high');
            }}
            className='aucctus-bg-primary-hover flex w-full items-center gap-2 px-3 py-2 text-left transition'
          >
            <div className='flex gap-0.5'>{getImportanceBlocks('high')}</div>
            <span className='aucctus-text-sm aucctus-text-error-primary'>
              High
            </span>
          </button>
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation();
              handleSelect('medium');
            }}
            className='aucctus-bg-primary-hover flex w-full items-center gap-2 px-3 py-2 text-left transition'
          >
            <div className='flex gap-0.5'>{getImportanceBlocks('medium')}</div>
            <span className='aucctus-text-sm aucctus-text-warning-primary'>
              Medium
            </span>
          </button>
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation();
              handleSelect('low');
            }}
            className='aucctus-bg-primary-hover flex w-full items-center gap-2 px-3 py-2 text-left transition'
          >
            <div className='flex gap-0.5'>{getImportanceBlocks('low')}</div>
            <span className='aucctus-text-sm aucctus-text-success-primary'>
              Low
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default EditableImportanceMeter;
