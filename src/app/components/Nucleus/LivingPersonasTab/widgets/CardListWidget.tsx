/**
 * CardListWidget - Ranked list widget for Jobs, Pains, etc.
 *
 * Displays a numbered list of items with priority/severity indicators.
 * Supports optional description and vertical scale bar.
 * Used for: Jobs to be Done, Pains
 */

import { motion, AnimatePresence } from 'framer-motion';
import React, { useCallback, useState } from 'react';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import GlassWidget, { WidgetSize } from './GlassWidget';

/** Card list item structure */
export interface CardListItem {
  uuid: string;
  text: string;
  priority?: number; // 1-10
  severity?: number; // 1-10
  impact?: number; // 1-10
}

/** Scale configuration for vertical scale bar */
export interface ScaleConfig {
  /** Label at the top of the scale */
  topLabel: string;
  /** Label at the bottom of the scale */
  bottomLabel: string;
  /** CSS color class for the gradient (e.g., 'emerald', 'red') */
  color: string;
}

/** Props for the CardListWidget component */
export interface CardListWidgetProps {
  /** Widget title */
  title: string;
  /** Icon variant */
  icon?: string;
  /** List items */
  items: CardListItem[];
  /** Label for the indicator (Priority, Severity, Impact) */
  indicatorLabel?: string;
  /** Indicator field to use */
  indicatorField?: 'priority' | 'severity' | 'impact';
  /** Widget size */
  size?: WidgetSize;
  /** Max items to show before collapse */
  maxItems?: number;
  /** Whether editing is enabled */
  isEditable?: boolean;
  /** Callback when item is updated */
  onUpdate?: (uuid: string, text: string) => void;
  /** Callback to add new item */
  onAdd?: () => void;
  /** Callback to delete item */
  onDelete?: (uuid: string) => void;
  /** Description text shown below the header */
  description?: string;
  /** Scale configuration for vertical scale bar on the left */
  scaleConfig?: ScaleConfig;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get indicator color class based on value
 */
const getIndicatorColor = (value: number): string => {
  if (value >= 8)
    return 'aucctus-text-success-primary aucctus-bg-success-secondary';
  if (value >= 5)
    return 'aucctus-text-warning-primary aucctus-bg-warning-secondary';
  return 'aucctus-text-tertiary aucctus-bg-secondary';
};

/**
 * Get scale gradient classes based on color name
 */
const getScaleGradient = (color: string): string => {
  switch (color) {
    case 'red':
      return 'from-red-500/80 to-red-500/10';
    case 'emerald':
      return 'from-emerald-500/80 to-emerald-500/10';
    case 'blue':
      return 'from-blue-500/80 to-blue-500/10';
    case 'amber':
      return 'from-amber-500/80 to-amber-500/10';
    default:
      return 'from-emerald-500/80 to-emerald-500/10';
  }
};

/**
 * Get scale text color classes based on color name
 */
const getScaleTextColor = (
  color: string,
): { top: string; bottom: string; arrow: string; arrowFaded: string } => {
  switch (color) {
    case 'red':
      return {
        top: 'text-red-500',
        bottom: 'text-red-500/50',
        arrow: 'text-red-500/60',
        arrowFaded: 'text-red-500/20',
      };
    case 'emerald':
      return {
        top: 'text-emerald-500',
        bottom: 'text-emerald-500/50',
        arrow: 'text-emerald-500/60',
        arrowFaded: 'text-emerald-500/20',
      };
    case 'blue':
      return {
        top: 'text-blue-500',
        bottom: 'text-blue-500/50',
        arrow: 'text-blue-500/60',
        arrowFaded: 'text-blue-500/20',
      };
    case 'amber':
      return {
        top: 'text-amber-500',
        bottom: 'text-amber-500/50',
        arrow: 'text-amber-500/60',
        arrowFaded: 'text-amber-500/20',
      };
    default:
      return {
        top: 'text-emerald-500',
        bottom: 'text-emerald-500/50',
        arrow: 'text-emerald-500/60',
        arrowFaded: 'text-emerald-500/20',
      };
  }
};

/**
 * CardListWidget Component
 */
const CardListWidget: React.FC<CardListWidgetProps> = ({
  title,
  icon,
  items,
  indicatorField = 'priority',
  size = 'small',
  maxItems = 5,
  isEditable = false,
  onAdd,
  description,
  scaleConfig,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayItems = isExpanded ? items : items.slice(0, maxItems);
  const hasMore = items.length > maxItems;

  const handleToggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const renderItemsList = (): React.ReactNode => (
    <div className='space-y-2'>
      <AnimatePresence>
        {displayItems.map((item, index) => {
          const indicatorValue = item[indicatorField] || 0;
          return (
            <motion.div
              key={item.uuid}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{
                duration: 0.2,
                delay: Math.min(index * 0.03, 0.3),
              }}
              className='aucctus-bg-secondary flex items-start gap-3 rounded-lg p-2'
            >
              {/* Rank number */}
              <span className='aucctus-bg-tertiary aucctus-text-xs-bold aucctus-text-secondary flex h-6 w-6 shrink-0 items-center justify-center rounded-full'>
                {index + 1}
              </span>

              {/* Item text */}
              <p className='aucctus-text-sm aucctus-text-primary flex-1'>
                {item.text}
              </p>

              {/* Priority/Severity indicator */}
              {indicatorValue > 0 && (
                <span
                  className={cn(
                    'aucctus-text-xs-bold shrink-0 rounded px-1.5 py-0.5',
                    getIndicatorColor(indicatorValue),
                  )}
                >
                  {indicatorValue}
                </span>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Show more/less button */}
      {hasMore && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.02 }}
          onClick={handleToggleExpand}
          className='aucctus-text-xs-medium aucctus-text-brand-primary w-full py-2 hover:underline'
        >
          {isExpanded ? 'Show less' : `Show ${items.length - maxItems} more`}
        </motion.button>
      )}
    </div>
  );

  return (
    <GlassWidget
      title={title}
      icon={icon}
      size={size}
      showAddButton={!!(isEditable && onAdd)}
      onAction={onAdd}
      className={cn(scaleConfig && 'h-[480px]', className)}
    >
      {description && (
        <p className='aucctus-text-xs aucctus-text-tertiary mb-3'>
          {description}
        </p>
      )}
      {scaleConfig ? (
        <div className='flex h-full'>
          {/* Vertical Scale Bar */}
          <div className='mr-3 flex flex-shrink-0 flex-col items-center pt-1'>
            <span
              className={cn(
                'text-xs font-semibold',
                getScaleTextColor(scaleConfig.color).top,
              )}
              style={{
                writingMode: 'vertical-lr',
                transform: 'rotate(180deg)',
              }}
            >
              {scaleConfig.topLabel}
            </span>
            <Icon
              variant='arrowdown'
              className={cn(
                'my-1 h-3 w-3',
                getScaleTextColor(scaleConfig.color).arrow,
              )}
            />
            <div
              className={cn(
                'mx-auto my-1 h-full w-px flex-grow bg-gradient-to-b',
                getScaleGradient(scaleConfig.color),
              )}
            />
            <Icon
              variant='arrowdown'
              className={cn(
                'my-1 h-3 w-3',
                getScaleTextColor(scaleConfig.color).arrowFaded,
              )}
            />
            <span
              className={cn(
                'text-xs font-medium',
                getScaleTextColor(scaleConfig.color).bottom,
              )}
              style={{
                writingMode: 'vertical-lr',
                transform: 'rotate(180deg)',
              }}
            >
              {scaleConfig.bottomLabel}
            </span>
          </div>

          {/* Items List - Scrollable */}
          <div className='flex-1 overflow-y-auto pr-1'>{renderItemsList()}</div>
        </div>
      ) : (
        renderItemsList()
      )}
    </GlassWidget>
  );
};

export default CardListWidget;
