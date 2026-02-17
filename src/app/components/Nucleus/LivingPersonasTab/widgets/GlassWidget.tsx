/**
 * GlassWidget - Base wrapper for persona widgets
 *
 * Provides consistent styling and layout for all persona widgets.
 * Features:
 * - Solid card styling matching CustomerProfile design
 * - SectionHeader-style header with icon in bordered container + bold title
 * - Circular "+" add button matching CustomerProfile SectionHeader
 * - Configurable size (small, medium, large, full)
 */

import { Plus } from 'lucide-react';
import React from 'react';
import { cn } from '@libs/utils/react';
import { getWidgetIcon } from './widgetIconMap';

/** Widget size type */
export type WidgetSize = 'small' | 'medium' | 'large' | 'full';

/** Props for the GlassWidget component */
export interface GlassWidgetProps {
  /** Widget title */
  title: string;
  /** Optional icon name (lucide icon string) */
  icon?: string;
  /** Icon background class */
  iconBgClass?: string;
  /** Icon color class */
  iconColorClass?: string;
  /** Widget size (affects grid span) */
  size?: WidgetSize;
  /** Whether the widget is in empty state */
  isEmpty?: boolean;
  /** Whether to show the add button in the header */
  showAddButton?: boolean;
  /** Callback for add button */
  onAction?: () => void;
  /** Children content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Maps widget size to grid column span classes
 */
export const getWidgetSizeClass = (size: WidgetSize): string => {
  switch (size) {
    case 'small':
      return 'md:col-span-1';
    case 'medium':
      return 'md:col-span-2 xl:col-span-2';
    case 'large':
      return 'md:col-span-2 xl:col-span-3';
    case 'full':
      return 'md:col-span-2 xl:col-span-3';
    default:
      return 'md:col-span-1';
  }
};

/**
 * GlassWidget Component
 */
const GlassWidget: React.FC<GlassWidgetProps> = ({
  title,
  icon,
  iconBgClass = 'aucctus-bg-primary aucctus-border-secondary',
  iconColorClass = 'aucctus-stroke-secondary',
  size = 'small',
  isEmpty = false,
  showAddButton = false,
  onAction,
  children,
  className,
}) => {
  const LucideIcon = icon ? getWidgetIcon(icon) : undefined;

  return (
    <div
      className={cn(
        'aucctus-bg-primary aucctus-border-secondary flex h-full flex-col overflow-hidden rounded-lg border shadow-sm',
        isEmpty && 'border-[#F79009]/60 bg-[#F79009]/5',
        getWidgetSizeClass(size),
        className,
      )}
    >
      {/* Header - SectionHeader style */}
      <div className='flex items-center justify-between px-4 pt-3'>
        <div className='flex items-center gap-2'>
          {LucideIcon && (
            <span
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg border-2',
                iconBgClass,
              )}
            >
              <LucideIcon size={16} className={iconColorClass} />
            </span>
          )}
          <span className='aucctus-text-primary aucctus-text-md-semibold'>
            {title}
          </span>
        </div>

        {showAddButton && (
          <button
            type='button'
            onClick={onAction}
            className='aucctus-bg-secondary-hover flex items-center justify-center rounded-full p-2 transition-colors'
          >
            <Plus size={14} className='aucctus-stroke-secondary' />
          </button>
        )}
      </div>

      {/* Content - flex column so children can use flex-1 */}
      <div className='flex min-h-0 flex-1 flex-col px-4 py-2'>{children}</div>
    </div>
  );
};

export default GlassWidget;
