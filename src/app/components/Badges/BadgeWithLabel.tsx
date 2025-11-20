import React from 'react';
import { cn } from '@libs/utils/react';

interface BadgeWithLabelProps {
  label: string;
  icon: string;
  className?: string;
}

/**
 * A reusable badge component with an icon and label
 * Used for displaying category tags like Market Forecast, Industry Analysis, etc.
 *
 * @example
 * <BadgeWithLabel label="Market Forecast" icon="M" />
 */
const BadgeWithLabel: React.FC<BadgeWithLabelProps> = ({
  label,
  icon,
  className,
}) => {
  return (
    <div
      className={cn(
        'aucctus-bg-primary aucctus-text-primary flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium',
        className,
      )}
    >
      <div className='aucctus-bg-primary flex h-3 w-3 items-center justify-center rounded-sm'>
        <span className='aucctus-text-primary text-xs font-bold'>{icon}</span>
      </div>
      <span>{label}</span>
    </div>
  );
};

export default BadgeWithLabel;
