import React, { useCallback } from 'react';
import { Icon, ComponentTooltip } from '@components';
import { cn } from '@libs/utils/react';

interface EditableCertaintyMeterProps {
  certainty: number; // 0-100 percentage
  onChange: (newCertainty: number) => void;
  disabled?: boolean;
}

const EditableCertaintyMeter: React.FC<EditableCertaintyMeterProps> = ({
  certainty,
  onChange,
  disabled = false,
}) => {
  // Determine level based on the value
  const getLevel = (val: number): 'high' | 'medium' | 'low' => {
    if (val >= 66) return 'high';
    if (val >= 33) return 'medium';
    return 'low';
  };

  const level = getLevel(certainty);

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
      text: 'text-green-600',
      activeBlocks: ['bg-green-600', 'bg-green-600', 'bg-green-600'],
    },
    medium: {
      text: 'text-yellow-500',
      activeBlocks: ['bg-yellow-400', 'bg-yellow-400', 'bg-gray-200'],
    },
    low: {
      text: 'text-red-500',
      activeBlocks: ['bg-red-500', 'bg-gray-200', 'bg-gray-200'],
    },
  };

  const currentConfig = levelConfigs[level];

  return (
    <ComponentTooltip
      tip={
        <div className='aucctus-bg-primary aucctus-border-secondary max-w-xs rounded-lg border p-4 shadow-lg'>
          <p className='aucctus-text-xs aucctus-text-secondary leading-relaxed'>
            How certain we are that this assumption is valid. Click to change.
          </p>
        </div>
      }
    >
      <div className='aucctus-bg-secondary aucctus-border-tertiary inline-block rounded p-2'>
        <div className='flex items-center gap-3'>
          <div className='flex items-center'>
            <Icon
              variant='activity'
              className='aucctus-stroke-tertiary mr-1.5 h-3.5 w-3.5'
            />
            <span className='aucctus-text-primary aucctus-text-xs-medium'>
              Certainty
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
                    ? 'bg-red-500'
                    : level === 'medium'
                      ? 'bg-yellow-400'
                      : level === 'high'
                        ? 'bg-green-600'
                        : 'bg-gray-300',
                  !disabled && 'hover:opacity-80',
                  disabled && 'cursor-not-allowed opacity-50',
                )}
                onClick={() => handleLevelClick('low')}
                disabled={disabled}
                title='Set to Low certainty'
              />
              {/* Box 2 (middle) */}
              <button
                type='button'
                className={cn(
                  'h-4 w-4 rounded-sm transition-colors',
                  level === 'medium'
                    ? 'bg-yellow-400'
                    : level === 'high'
                      ? 'bg-green-600'
                      : 'bg-gray-300',
                  !disabled && 'hover:opacity-80',
                  disabled && 'cursor-not-allowed opacity-50',
                )}
                onClick={() => handleLevelClick('medium')}
                disabled={disabled}
                title='Set to Medium certainty'
              />
              {/* Box 3 (rightmost) */}
              <button
                type='button'
                className={cn(
                  'h-4 w-4 rounded-sm transition-colors',
                  level === 'high' ? 'bg-green-600' : 'bg-gray-300',
                  !disabled && 'hover:opacity-80',
                  disabled && 'cursor-not-allowed opacity-50',
                )}
                onClick={() => handleLevelClick('high')}
                disabled={disabled}
                title='Set to High certainty'
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

export default EditableCertaintyMeter;
