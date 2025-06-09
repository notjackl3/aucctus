import React from 'react';
import { cn } from '@libs/utils/react';
import {
  marketSizeStyles,
  type MarketSizeType,
} from '../styles/marketSizeStyles';

interface MarketSizeTagProps {
  type: MarketSizeType;
  label?: string;
  value?: string | number;
  className?: string;
}

/**
 * A simple tag component that uses the common market size styles
 * Demonstrates how any component can easily access the market size styling
 */
const MarketSizeTag: React.FC<MarketSizeTagProps> = ({
  type,
  label,
  value,
  className = '',
}) => {
  // Simply access the base styles for the specified market size type
  const styles = marketSizeStyles[type];

  return (
    <div
      className={cn(
        // Apply background, text color, and border styles
        'flex items-center gap-2 rounded-md px-3 py-1.5',
        styles.bgClass,
        styles.textColor,
        'border-0.5 border',
        styles.borderClass,
        className,
      )}
    >
      {label && (
        <span
          className={cn('text-xs font-semibold uppercase', styles.subtextColor)}
        >
          {label || type.toUpperCase()}:
        </span>
      )}
      {value && <span className={styles.fontSize}>{value}</span>}
    </div>
  );
};

export default MarketSizeTag;
