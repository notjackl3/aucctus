// @ts-nocheck
// DEPRECATED: This component is no longer used. Use Concept Report Workshop tab instead.
/**
 * ComponentCard Component
 *
 * Card component for displaying a component in the library grid.
 * Shows component metadata, status, and actions.
 */

import React from 'react';
import { cn } from '@libs/utils/react';
import type { IComponentListItem } from '@libs/api/types/dynamicComponent.d';
import { Box, Trash2 } from 'lucide-react';

interface IComponentCardProps {
  /** Component metadata */
  component: IComponentListItem;
  /** Whether this component is currently selected */
  isSelected: boolean;
  /** Whether a delete operation is in progress */
  isDeleting: boolean;
  /** Callback when the card is clicked */
  onClick: () => void;
  /** Callback when the delete button is clicked */
  onDelete: (e: React.MouseEvent) => void;
}

/**
 * Format bytes to human-readable size
 */
const formatSize = (bytes: number): string => {
  return `${(bytes / 1024).toFixed(1)} KB`;
};

/**
 * ComponentCard - Displays a single component in the library
 */
const ComponentCard: React.FC<IComponentCardProps> = ({
  component,
  isSelected,
  isDeleting,
  onClick,
  onDelete,
}) => {
  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      role='button'
      tabIndex={0}
      aria-selected={isSelected}
      className={cn(
        'aucctus-bg-primary aucctus-border-secondary rounded-xl border p-4',
        'cursor-pointer transition-all duration-200',
        'hover:aucctus-border-brand hover:shadow-md',
        'focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]',
        {
          'aucctus-border-brand ring-[var(--brand-500)]/20 ring-2': isSelected,
        },
      )}
    >
      {/* Header */}
      <div className='flex items-start justify-between'>
        <div className='flex items-center gap-3'>
          <div className='aucctus-bg-brand-secondary flex h-10 w-10 items-center justify-center rounded-lg'>
            <Box className='aucctus-stroke-brand-primary h-5 w-5' />
          </div>
          <div>
            <h3 className='aucctus-text-sm-semibold aucctus-text-primary'>
              {component.name}
            </h3>
            <p className='aucctus-text-xs aucctus-text-tertiary'>
              {component.filename}
            </p>
          </div>
        </div>

        {/* Delete Button */}
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className={cn(
            'rounded-lg p-1.5 transition-colors',
            'hover:aucctus-bg-error-subtle',
            'focus:outline-none focus:ring-2 focus:ring-[var(--error-500)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
          aria-label={`Delete ${component.name}`}
        >
          <Trash2 className='aucctus-stroke-tertiary hover:aucctus-stroke-error-primary h-4 w-4' />
        </button>
      </div>

      {/* Footer */}
      <div className='mt-4 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <span
            className={cn('aucctus-text-xs rounded-full px-2 py-0.5', {
              'aucctus-bg-success-subtle aucctus-text-success-primary':
                component.hasCompiled,
              'aucctus-bg-warning-subtle aucctus-text-warning-primary':
                !component.hasCompiled,
            })}
          >
            {component.hasCompiled ? 'Compiled' : 'Source Only'}
          </span>
        </div>
        <span className='aucctus-text-xs aucctus-text-quaternary'>
          {formatSize(component.sizeBytes)}
        </span>
      </div>
    </div>
  );
};

export default ComponentCard;
