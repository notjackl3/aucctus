import React from 'react';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';
// TODO: Replace with import from Icon types when available
export type IconVariant = 'alert-circle' | 'briefcase' | 'plus';

/**
 * Props for SectionHeader component.
 * @param icon The icon variant to display (see Icon component)
 * @param iconClass Class for the icon (stroke/fill)
 * @param iconBgClass Class for the icon background
 * @param title The section title
 * @param rightAction Optional React node to render on the right (e.g., add button)
 * @param className Optional className for the header container
 * @param noDivider When true, removes the bottom border divider
 */
export interface SectionHeaderProps {
  icon: IconVariant;
  iconClass?: string;
  iconBgClass?: string;
  title: string;
  rightAction?: React.ReactNode;
  className?: string;
  noDivider?: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon,
  iconClass = '',
  iconBgClass = 'aucctus-bg-primary aucctus-border-secondary',
  title,
  rightAction,
  className = '',
  noDivider = false,
}) => (
  <div
    className={cn(
      'aucctus-border-secondary flex items-center justify-between px-4 pt-3',
      !noDivider && 'border-b',
      className,
    )}
  >
    <div className='flex items-center gap-2'>
      <span
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-lg border-2',
          iconBgClass,
        )}
      >
        <Icon variant={icon} height={16} width={16} className={iconClass} />
      </span>
      <span className='aucctus-text-primary aucctus-text-md-semibold'>
        {title}
      </span>
    </div>
    {rightAction && rightAction}
  </div>
);

export default React.memo(SectionHeader);
