/**
 * KeyFactsWidget - Statistical facts with trend indicators
 *
 * Displays key statistics about a persona with trend-colored cards.
 * Ported from lovable KeyFacts design:
 * - Trend-colored card backgrounds/borders (emerald for up, red for down)
 * - Flex-wrap layout with 50% min-width per card
 * - Large stat text with trend icons
 */

import { cn } from '@libs/utils/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Pencil, Plus, TrendingDown, TrendingUp, X } from 'lucide-react';
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
  /** Callback to update fact */
  onUpdate?: (
    uuid: string,
    data: { stat: string; label: string; trend?: string },
  ) => void;
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
  onUpdate,
  onDelete,
  className,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newStat, setNewStat] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newTrend, setNewTrend] = useState<TrendDirection | undefined>(
    undefined,
  );
  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [editStat, setEditStat] = useState('');
  const [editLabel, setEditLabel] = useState('');
  const [editTrend, setEditTrend] = useState<TrendDirection | undefined>(
    undefined,
  );

  const handleAdd = useCallback(() => {
    if (!newStat.trim() || !newLabel.trim() || !onAdd) return;
    onAdd({
      stat: newStat.trim(),
      label: newLabel.trim(),
      trend: newTrend,
    });
    setNewStat('');
    setNewLabel('');
    setNewTrend(undefined);
    setIsAdding(false);
  }, [newStat, newLabel, newTrend, onAdd]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleAdd();
      if (e.key === 'Escape') {
        setIsAdding(false);
        setNewStat('');
        setNewLabel('');
        setNewTrend(undefined);
      }
    },
    [handleAdd],
  );

  const handleStartEdit = useCallback((fact: KeyFact) => {
    setEditingUuid(fact.uuid);
    setEditStat(fact.stat);
    setEditLabel(fact.label);
    setEditTrend(fact.trend);
    setIsAdding(false);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingUuid || !editStat.trim() || !editLabel.trim() || !onUpdate)
      return;
    onUpdate(editingUuid, {
      stat: editStat.trim(),
      label: editLabel.trim(),
      trend: editTrend,
    });
    setEditingUuid(null);
    setEditStat('');
    setEditLabel('');
    setEditTrend(undefined);
  }, [editingUuid, editStat, editLabel, editTrend, onUpdate]);

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSaveEdit();
      if (e.key === 'Escape') {
        setEditingUuid(null);
        setEditStat('');
        setEditLabel('');
        setEditTrend(undefined);
      }
    },
    [handleSaveEdit],
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
              <div className='flex flex-wrap items-center gap-1'>
                <span className='aucctus-text-xs aucctus-text-tertiary mr-1'>
                  Trend:
                </span>
                {(['up', 'down', 'neutral'] as TrendDirection[]).map(
                  (direction) => (
                    <button
                      key={direction}
                      type='button'
                      onClick={() =>
                        setNewTrend(
                          newTrend === direction ? undefined : direction,
                        )
                      }
                      className={cn(
                        'flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium transition-colors',
                        newTrend === direction
                          ? direction === 'up'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : direction === 'down'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : 'aucctus-bg-secondary aucctus-text-primary'
                          : 'aucctus-text-tertiary hover:aucctus-bg-secondary',
                      )}
                    >
                      {direction === 'up' && <TrendingUp className='h-3 w-3' />}
                      {direction === 'down' && (
                        <TrendingDown className='h-3 w-3' />
                      )}
                      {direction.charAt(0).toUpperCase() + direction.slice(1)}
                    </button>
                  ),
                )}
              </div>
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
                    setNewTrend(undefined);
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

      {/* Empty state */}
      {facts.length === 0 && !isAdding && onAdd && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='flex flex-1 items-center justify-center'
        >
          <button
            type='button'
            onClick={() => setIsAdding(true)}
            className='aucctus-text-secondary hover:aucctus-text-primary aucctus-border-secondary hover:aucctus-border-primary flex items-center gap-2 rounded-lg border border-dashed px-4 py-2 transition-colors'
          >
            <Plus className='h-4 w-4' />
            <span className='aucctus-text-sm'>Add a key fact</span>
          </button>
        </motion.div>
      )}

      <div className='flex flex-wrap gap-3'>
        {facts.map((fact, index) => {
          const TrendIcon = getTrendIcon(fact.trend);
          const isEditingThis = editingUuid === fact.uuid;
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
                isEditingThis
                  ? 'aucctus-border-brand border'
                  : getTrendCardStyle(fact.trend),
              )}
            >
              {isEditingThis ? (
                <div className='space-y-2'>
                  <input
                    type='text'
                    value={editStat}
                    onChange={(e) => setEditStat(e.target.value)}
                    placeholder='Stat (e.g., 59%)'
                    className='aucctus-bg-primary aucctus-text-primary aucctus-text-sm w-full border-none outline-none'
                    autoFocus
                  />
                  <input
                    type='text'
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    placeholder='Label (e.g., Renters)'
                    className='aucctus-bg-primary aucctus-text-primary aucctus-text-sm w-full border-none outline-none'
                  />
                  <div className='flex flex-wrap items-center gap-1'>
                    <span className='aucctus-text-xs aucctus-text-tertiary mr-1'>
                      Trend:
                    </span>
                    {(['up', 'down', 'neutral'] as TrendDirection[]).map(
                      (direction) => (
                        <button
                          key={direction}
                          type='button'
                          onClick={() =>
                            setEditTrend(
                              editTrend === direction ? undefined : direction,
                            )
                          }
                          className={cn(
                            'flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium transition-colors',
                            editTrend === direction
                              ? direction === 'up'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : direction === 'down'
                                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                  : 'aucctus-bg-secondary aucctus-text-primary'
                              : 'aucctus-text-tertiary hover:aucctus-bg-secondary',
                          )}
                        >
                          {direction === 'up' && (
                            <TrendingUp className='h-3 w-3' />
                          )}
                          {direction === 'down' && (
                            <TrendingDown className='h-3 w-3' />
                          )}
                          {direction.charAt(0).toUpperCase() +
                            direction.slice(1)}
                        </button>
                      ),
                    )}
                  </div>
                  <div className='flex gap-2'>
                    <button
                      type='button'
                      onClick={handleSaveEdit}
                      disabled={!editStat.trim() || !editLabel.trim()}
                      className='btn btn-primary btn-xs'
                    >
                      Save
                    </button>
                    <button
                      type='button'
                      onClick={() => {
                        setEditingUuid(null);
                        setEditStat('');
                        setEditLabel('');
                        setEditTrend(undefined);
                      }}
                      className='btn btn-ghost btn-xs'
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
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
                    {onUpdate && (
                      <button
                        type='button'
                        onClick={() => handleStartEdit(fact)}
                        className='flex h-5 w-5 shrink-0 items-center justify-center rounded opacity-0 transition-opacity hover:bg-blue-100 group-hover:opacity-100 dark:hover:bg-blue-900/30'
                      >
                        <Pencil className='aucctus-text-secondary h-3 w-3' />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type='button'
                        onClick={() => onDelete(fact.uuid)}
                        className='flex h-5 w-5 shrink-0 items-center justify-center rounded opacity-0 transition-opacity hover:bg-red-100 group-hover:opacity-100 dark:hover:bg-red-900/30'
                      >
                        <X className='h-3 w-3 text-red-500' />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </GlassWidget>
  );
};

export default KeyFactsWidget;
