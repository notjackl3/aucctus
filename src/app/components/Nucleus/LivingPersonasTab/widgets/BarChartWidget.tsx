/**
 * BarChartWidget - Horizontal bar chart widget
 *
 * Displays distribution/preference data as horizontal bars.
 * Used for: Banking Preferences, Purchase Channels, Asset Breakdown
 */

import { motion } from 'framer-motion';
import React from 'react';
import GlassWidget, { WidgetSize } from './GlassWidget';

/** Bar chart data point */
export interface BarChartItem {
  uuid: string;
  label: string;
  value: string; // Display value (e.g., "$526K", "45%")
  percentage: number; // 0-100 for bar width
}

/** Props for the BarChartWidget component */
export interface BarChartWidgetProps {
  /** Widget title */
  title: string;
  /** Icon variant */
  icon?: string;
  /** Chart data */
  data: BarChartItem[];
  /** Bar color class */
  barColor?: string;
  /** Widget size */
  size?: WidgetSize;
  /** Whether editing is enabled */
  isEditable?: boolean;
  /** Callback to add new item */
  onAdd?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * BarChartWidget Component
 */
const BarChartWidget: React.FC<BarChartWidgetProps> = ({
  title,
  icon,
  data,
  barColor = 'bg-primary',
  size = 'small',
  isEditable = false,
  onAdd,
  className,
}) => {
  return (
    <GlassWidget
      title={title}
      icon={icon}
      size={size}
      showAddButton={!!(isEditable && onAdd)}
      onAction={onAdd}
      className={className}
    >
      <div className='space-y-3'>
        {data.map((item, index) => (
          <motion.div
            key={item.uuid}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
          >
            {/* Label and value row */}
            <div className='mb-1 flex items-center justify-between'>
              <span className='aucctus-text-xs aucctus-text-secondary'>
                {item.label}
              </span>
              <span className='aucctus-text-xs-bold aucctus-text-primary'>
                {item.value}
              </span>
            </div>

            {/* Bar */}
            <div className='aucctus-bg-secondary h-2 w-full overflow-hidden rounded-full'>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className={`h-full rounded-full ${barColor}`}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </GlassWidget>
  );
};

export default BarChartWidget;
