/**
 * WidgetIconPicker - Grid of selectable icons for custom widgets
 *
 * Displays a 5x4 grid of Lucide icons. Selected icon gets brand highlight.
 */

import React from 'react';
import { cn } from '@libs/utils/react';
import { WIDGET_ICON_MAP, WIDGET_ICON_NAMES } from './widgetIconMap';

/** Props for the WidgetIconPicker component */
export interface WidgetIconPickerProps {
  /** Currently selected icon */
  value: string;
  /** Callback when icon is selected */
  onChange: (icon: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * WidgetIconPicker Component
 */
const WidgetIconPicker: React.FC<WidgetIconPickerProps> = ({
  value,
  onChange,
  className,
}) => {
  return (
    <div className={cn('grid grid-cols-5 gap-2', className)}>
      {WIDGET_ICON_NAMES.map((iconName) => {
        const LucideIcon = WIDGET_ICON_MAP[iconName];
        return (
          <button
            key={iconName}
            type='button'
            onClick={() => onChange(iconName)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg border-2 transition-all',
              value === iconName
                ? 'aucctus-border-brand aucctus-bg-brand-secondary'
                : 'aucctus-border-secondary aucctus-bg-secondary hover:aucctus-bg-tertiary',
            )}
            title={iconName}
          >
            <LucideIcon
              size={16}
              className={cn(
                value === iconName
                  ? 'aucctus-stroke-brand-primary'
                  : 'aucctus-stroke-secondary',
              )}
            />
          </button>
        );
      })}
    </div>
  );
};

export default WidgetIconPicker;
