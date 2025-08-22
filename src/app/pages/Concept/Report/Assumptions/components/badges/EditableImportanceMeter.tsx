import React, { useCallback } from 'react';
import { Icon, ComponentTooltip } from '@components';
import { cn } from '@libs/utils/react';

interface EditableImportanceMeterProps {
  importance: number; // 0-100 percentage
  onChange: (newImportance: number) => void;
  disabled?: boolean;
}

const EditableImportanceMeter: React.FC<EditableImportanceMeterProps> = ({
  importance,
  onChange,
  disabled = false,
}) => {
  // Determine level based on the value
  const getLevel = (val: number): 'high' | 'medium' | 'low' => {
    if (val >= 66) return 'high';
    if (val >= 33) return 'medium';
    return 'low';
  };

  const level = getLevel(importance);

  // Handle level clicks
  const handleLevelClick = useCallback(
    (newLevel: 'low' | 'medium' | 'high') => {
      if (disabled) return;

      const levelValues = {
        low: 16, // Changed: below 33 threshold to ensure it's "low"
        medium: 50, // Changed: between 33-65 to ensure it's "medium"
        high: 83, // Changed: above 66 threshold to ensure it's "high"
      };

      onChange(levelValues[newLevel]);
    },
    [onChange, disabled],
  );

  // Color configurations for each level
  const levelConfigs = {
    high: {
      text: 'text-red-500',
      activeBlocks: ['bg-red-500', 'bg-red-500', 'bg-red-500'],
      clickableBlocks: ['bg-red-500', 'bg-red-500', 'bg-red-500'],
    },
    medium: {
      text: 'text-yellow-500',
      activeBlocks: ['bg-yellow-400', 'bg-yellow-400', 'bg-gray-200'],
      clickableBlocks: ['bg-yellow-400', 'bg-yellow-400', 'bg-gray-300'],
    },
    low: {
      text: 'text-green-600',
      activeBlocks: ['bg-green-600', 'bg-gray-200', 'bg-gray-200'],
      clickableBlocks: ['bg-green-600', 'bg-gray-300', 'bg-gray-300'],
    },
  };

  const currentConfig = levelConfigs[level];

  return (
    <ComponentTooltip
      tip={
        <div className='aucctus-bg-primary aucctus-border-secondary max-w-xs rounded-lg border p-4 shadow-lg'>
          <p className='aucctus-text-xs aucctus-text-secondary leading-relaxed'>
            How important this assumption is to the concept&apos;s success.
            Click to change.
          </p>
        </div>
      }
    >
      <div className='aucctus-bg-secondary aucctus-border-tertiary inline-block rounded p-2'>
        <div className='flex items-center gap-3'>
          <div className='flex items-center'>
            <Icon
              variant='alert-circle'
              className='aucctus-stroke-tertiary mr-1.5 h-3.5 w-3.5'
            />
            <span className='aucctus-text-primary aucctus-text-xs-medium'>
              Importance
            </span>
          </div>
          <div className='flex items-center space-x-1.5'>
            {/* Clickable meter squares */}
            <div className='flex gap-0.5'>
              {/* Box 1 (leftmost) */}
              <button
                type='button'
                className={cn(
                  'h-4 w-4 rounded-sm transition-colors',
                  level === 'low'
                    ? 'bg-green-600'
                    : level === 'medium'
                      ? 'bg-yellow-400'
                      : level === 'high'
                        ? 'bg-red-500'
                        : 'bg-gray-300',
                  !disabled && 'hover:opacity-80',
                  disabled && 'cursor-not-allowed opacity-50',
                )}
                onClick={() => handleLevelClick('low')}
                disabled={disabled}
                title='Set to Low importance'
              />
              {/* Box 2 (middle) */}
              <button
                type='button'
                className={cn(
                  'h-4 w-4 rounded-sm transition-colors',
                  level === 'medium'
                    ? 'bg-yellow-400'
                    : level === 'high'
                      ? 'bg-red-500'
                      : 'bg-gray-300',
                  !disabled && 'hover:opacity-80',
                  disabled && 'cursor-not-allowed opacity-50',
                )}
                onClick={() => handleLevelClick('medium')}
                disabled={disabled}
                title='Set to Medium importance'
              />
              {/* Box 3 (rightmost) */}
              <button
                type='button'
                className={cn(
                  'h-4 w-4 rounded-sm transition-colors',
                  level === 'high' ? 'bg-red-500' : 'bg-gray-300',
                  !disabled && 'hover:opacity-80',
                  disabled && 'cursor-not-allowed opacity-50',
                )}
                onClick={() => handleLevelClick('high')}
                disabled={disabled}
                title='Set to High importance'
              />
            </div>
            <span className={cn('aucctus-text-xs-medium', currentConfig.text)}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </span>
          </div>
        </div>
      </div>
    </ComponentTooltip>
  );
};

export default EditableImportanceMeter;
