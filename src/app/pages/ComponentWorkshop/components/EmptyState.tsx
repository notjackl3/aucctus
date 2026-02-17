/**
 * EmptyState Component
 *
 * Reusable empty state component for displaying when there's no content.
 * Supports customizable icon, title, description, and actions.
 */

import React from 'react';
import { DynamicIcon } from '@libs/utils/iconMap';

interface IEmptyStateAction {
  /** Button label */
  label: string;
  /** Click handler */
  onClick: () => void;
  /** Button variant */
  variant?: 'primary' | 'secondary';
}

interface IEmptyStateProps {
  /** Icon variant to display */
  icon: string;
  /** Title text */
  title: string;
  /** Description text */
  description: string;
  /** Optional action buttons */
  actions?: IEmptyStateAction[];
}

/**
 * EmptyState - Displays an empty state with icon, title, description, and actions
 */
const EmptyState: React.FC<IEmptyStateProps> = ({
  icon,
  title,
  description,
  actions = [],
}) => {
  return (
    <div className='aucctus-bg-primary aucctus-border-secondary rounded-2xl border p-12 text-center'>
      <DynamicIcon
        variant={icon}
        className='aucctus-stroke-tertiary mx-auto mb-4 h-12 w-12'
      />

      <h3 className='aucctus-text-lg-medium aucctus-text-secondary mb-2'>
        {title}
      </h3>

      <p className='aucctus-text-sm aucctus-text-tertiary mx-auto mb-6 max-w-md'>
        {description}
      </p>

      {actions.length > 0 && (
        <div className='flex justify-center gap-3'>
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`btn btn-${action.variant || 'primary'} btn-sm`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
