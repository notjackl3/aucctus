/**
 * KeyFactsWidget - Statistical facts with trend indicators
 *
 * Displays key statistics about a persona with trend-colored cards.
 * Ported from lovable KeyFacts design:
 * - Trend-colored card backgrounds/borders (emerald for up, red for down)
 * - Flex-wrap layout with 50% min-width per card
 * - Large stat text with trend icons
 */

import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import { AnimatePresence, motion } from 'framer-motion';
import { TrendingDown, TrendingUp } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import GlassWidget, { WidgetSize } from './GlassWidget';

/** Trend direction */
export type TrendDirection = 'up' | 'down' | 'neutral';

/** Key fact structure */
export interface KeyFact {
  uuid: string;
  stat: string; // e.g., "59%"
  label: string; // e.g., "Renters"
  trend?: TrendDirection;
}

/** Props for the KeyFactsWidget component */
export interface KeyFactsWidgetProps {
  /** Widget title */
  title?: string;
  /** Icon variant */
  icon?: string;
  /** Key facts data */
  facts: KeyFact[];
  /** Widget size */
  size?: WidgetSize;
  /** Whether editing is enabled */
  isEditable?: boolean;
  /** Callback to add new fact */
  onAdd?: (data: { stat: string; label: string; trend?: string }) => void;
  /** Callback to delete fact */
  onDelete?: (uuid: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get trend icon component
 */
const getTrendIcon = (
  trend?: TrendDirection,
): React.FC<{ className?: string }> | null => {
  switch (trend) {
    case 'up':
      return TrendingUp;
    case 'down':
      return TrendingDown;
    default:
      return null;
  }
};

/**
 * Get trend icon color
 */
const getTrendIconColor = (trend?: TrendDirection): string => {
  switch (trend) {
    case 'up':
      return 'text-emerald-600 dark:text-emerald-400';
    case 'down':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'aucctus-text-tertiary';
  }
};

/**
 * Get trend-based card styling
 */
const getTrendCardStyle = (trend?: TrendDirection): string => {
  switch (trend) {
    case 'up':
      return 'border border-emerald-300/50 bg-emerald-50/30 dark:border-emerald-700/40 dark:bg-emerald-950/20';
    case 'down':
      return 'border border-red-300/50 bg-red-50/30 dark:border-red-700/40 dark:bg-red-950/20';
    default:
      return 'aucctus-bg-secondary';
  }
};

/**
 * KeyFactsWidget Component
 */
const KeyFactsWidget: React.FC<KeyFactsWidgetProps> = ({
  title = 'Key Facts',
  icon = 'chart-column',
  facts,
  size = 'small',
  isEditable = false,
  onAdd,
  onDelete,
  className,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newStat, setNewStat] = useState('');
  const [newLabel, setNewLabel] = useState('');

  const handleAdd = useCallback(() => {
    if (!newStat.trim() || !newLabel.trim() || !onAdd) return;
    onAdd({ stat: newStat.trim(), label: newLabel.trim() });
    setNewStat('');
    setNewLabel('');
    setIsAdding(false);
  }, [newStat, newLabel, onAdd]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleAdd();
      if (e.key === 'Escape') {
        setIsAdding(false);
        setNewStat('');
        setNewLabel('');
      }
    },
    [handleAdd],
  );

  return (
    <GlassWidget
      title={title}
      icon={icon}
      size={size}
      showAddButton={!!(isEditable && onAdd)}
      onAction={() => setIsAdding(true)}
      className={className}
    >
      <p className='aucctus-text-xs aucctus-text-tertiary mb-3'>
        Statistical insights and notable characteristics of this segment
      </p>

      {/* Inline add form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className='mb-3'
          >
            <div className='aucctus-border-brand space-y-2 rounded-lg border p-2'>
              <input
                type='text'
                value={newStat}
                onChange={(e) => setNewStat(e.target.value)}
                placeholder='Stat (e.g., 59%)'
                className='aucctus-bg-primary aucctus-text-primary aucctus-text-sm w-full border-none outline-none'
                autoFocus
              />
              <input
                type='text'
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='Label (e.g., Renters)'
                className='aucctus-bg-primary aucctus-text-primary aucctus-text-sm w-full border-none outline-none'
              />
              <div className='flex gap-2'>
                <button
                  type='button'
                  onClick={handleAdd}
                  disabled={!newStat.trim() || !newLabel.trim()}
                  className='btn btn-primary btn-xs'
                >
                  Add
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setIsAdding(false);
                    setNewStat('');
                    setNewLabel('');
                  }}
                  className='btn btn-ghost btn-xs'
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className='flex flex-wrap gap-3'>
        {facts.map((fact, index) => {
          const TrendIcon = getTrendIcon(fact.trend);
          return (
            <motion.div
              key={fact.uuid}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.2,
                delay: Math.min(index * 0.05, 0.3),
              }}
              className={cn(
                'group relative min-w-[calc(50%-0.375rem)] flex-1 rounded-lg p-4',
                getTrendCardStyle(fact.trend),
              )}
            >
              <div className='flex items-start justify-between'>
                <div>
                  <p className='aucctus-text-lg-bold aucctus-text-primary'>
                    {fact.stat}
                  </p>
                  <p className='aucctus-text-sm aucctus-text-secondary mt-1'>
                    {fact.label}
                  </p>
                </div>
                <div className='flex items-center gap-1'>
                  {TrendIcon && (
                    <TrendIcon
                      className={cn('h-4 w-4', getTrendIconColor(fact.trend))}
                    />
                  )}
                  {onDelete && (
                    <button
                      type='button'
                      onClick={() => onDelete(fact.uuid)}
                      className='flex h-5 w-5 shrink-0 items-center justify-center rounded opacity-0 transition-opacity hover:bg-red-100 group-hover:opacity-100 dark:hover:bg-red-900/30'
                    >
                      <Icon variant='closeX' className='h-3 w-3 text-red-500' />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </GlassWidget>
  );
};

export default KeyFactsWidget;
