/**
 * CustomWidgetRenderer - Dispatches an ICustomWidget to the correct display component
 *
 * Supports: metric_chart, timeline, card_list, stat_list
 * Each sub-renderer supports inline editing (add/delete items) when isEditable.
 */

import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  Moon,
  Pencil,
  Plus,
  Sun,
  Utensils,
  TrendingUp,
  TrendingDown,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '@libs/utils/react';
import type {
  ICustomWidget,
  IUpdateCustomWidgetPayload,
} from '@libs/api/types/persona';
import PriorityIndicator from '@pages/Concept/Report/CustomerProfile/Details/components/PriorityIndicator';
import GlassWidget, { WidgetSize } from './GlassWidget';
import MetricChartWidget from './MetricChartWidget';
import { getWidgetIcon } from './widgetIconMap';

/** Props for the CustomWidgetRenderer component */
export interface CustomWidgetRendererProps {
  /** The custom widget data */
  widget: ICustomWidget;
  /** Widget size */
  size?: WidgetSize;
  /** Whether editing is enabled */
  isEditable?: boolean;
  /** Whether layout mode is active (shows delete widget button, hides add buttons) */
  isLayoutMode?: boolean;
  /** Callback to add item to widget */
  onAddItem?: (widgetUuid: string, data: Record<string, unknown>) => void;
  /** Callback to update item */
  onUpdateItem?: (
    widgetUuid: string,
    itemUuid: string,
    data: Record<string, unknown>,
  ) => void;
  /** Callback to delete item */
  onDeleteItem?: (widgetUuid: string, itemUuid: string) => void;
  /** Callback to update widget metadata */
  onUpdateWidget?: (
    widgetUuid: string,
    data: IUpdateCustomWidgetPayload,
  ) => void;
  /** Callback to delete widget */
  onDeleteWidget?: (widgetUuid: string) => void;
  /** Additional CSS classes */
  className?: string;
}

// ============================================
// Timeline Sub-renderer
// ============================================

const getTimeIcon = (label: string): React.FC<{ className?: string }> => {
  const lower = label.toLowerCase();
  if (
    lower.includes('morning') ||
    lower.includes('am') ||
    lower.includes('sunrise')
  )
    return Sun;
  if (lower.includes('coffee') || lower.includes('break')) return Coffee;
  if (
    lower.includes('lunch') ||
    lower.includes('noon') ||
    lower.includes('afternoon')
  )
    return Utensils;
  if (
    lower.includes('evening') ||
    lower.includes('night') ||
    lower.includes('pm')
  )
    return Moon;
  return Clock;
};

interface CustomTimelineProps {
  widget: ICustomWidget;
  size?: WidgetSize;
  isEditable?: boolean;
  isLayoutMode?: boolean;
  onAddItem?: (widgetUuid: string, data: Record<string, unknown>) => void;
  onUpdateItem?: (
    widgetUuid: string,
    itemUuid: string,
    data: Record<string, unknown>,
  ) => void;
  onDeleteItem?: (widgetUuid: string, itemUuid: string) => void;
}

const CustomTimeline: React.FC<CustomTimelineProps> = ({
  widget,
  size = 'full',
  isEditable = false,
  isLayoutMode = false,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // Inline editing state
  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const entries = widget.timelineEntries;
  const [canScroll, setCanScroll] = useState(false);

  const checkOverflow = useCallback(() => {
    const el = scrollContainerRef.current;
    if (el) {
      setCanScroll(el.scrollWidth > el.clientWidth);
    }
  }, []);

  useEffect(() => {
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [checkOverflow, entries.length]);

  const scrollBy = useCallback((direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: direction === 'right' ? 240 : -240,
        behavior: 'smooth',
      });
    }
  }, []);

  const handleAdd = useCallback(() => {
    if (!newLabel.trim() || !newTitle.trim() || !onAddItem) return;
    onAddItem(widget.uuid, {
      label: newLabel.trim(),
      title: newTitle.trim(),
      description: newDescription.trim(),
    });
    setNewLabel('');
    setNewTitle('');
    setNewDescription('');
    setIsAdding(false);
  }, [newLabel, newTitle, newDescription, onAddItem, widget.uuid]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleAdd();
      if (e.key === 'Escape') {
        setIsAdding(false);
        setNewLabel('');
        setNewTitle('');
        setNewDescription('');
      }
    },
    [handleAdd],
  );

  const startEditing = useCallback(
    (entry: {
      uuid: string;
      label: string;
      title: string;
      description?: string;
    }) => {
      setEditingUuid(entry.uuid);
      setEditLabel(entry.label);
      setEditTitle(entry.title);
      setEditDescription(entry.description || '');
      setIsAdding(false);
    },
    [],
  );

  const cancelEditing = useCallback(() => {
    setEditingUuid(null);
    setEditLabel('');
    setEditTitle('');
    setEditDescription('');
  }, []);

  const saveEditing = useCallback(() => {
    if (!editingUuid || !onUpdateItem) return;
    onUpdateItem(widget.uuid, editingUuid, {
      label: editLabel.trim(),
      title: editTitle.trim(),
      description: editDescription.trim(),
    });
    cancelEditing();
  }, [
    editingUuid,
    editLabel,
    editTitle,
    editDescription,
    onUpdateItem,
    widget.uuid,
    cancelEditing,
  ]);

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') saveEditing();
      if (e.key === 'Escape') cancelEditing();
    },
    [saveEditing, cancelEditing],
  );

  return (
    <GlassWidget
      title={widget.title}
      icon={widget.icon || 'calendar-days'}
      size={size}
      showAddButton={!isLayoutMode && !!onAddItem}
      onAction={() => setIsAdding(true)}
    >
      {widget.description && (
        <p className='aucctus-text-xs aucctus-text-tertiary mb-3'>
          {widget.description}
        </p>
      )}

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
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder='Label (e.g., Morning)'
                className='aucctus-bg-primary aucctus-text-primary aucctus-text-sm w-full border-none outline-none'
                autoFocus
              />
              <input
                type='text'
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder='Title'
                className='aucctus-bg-primary aucctus-text-primary aucctus-text-sm w-full border-none outline-none'
              />
              <input
                type='text'
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='Description (optional)'
                className='aucctus-bg-primary aucctus-text-primary aucctus-text-sm w-full border-none outline-none'
              />
              <div className='flex gap-2'>
                <button
                  type='button'
                  onClick={handleAdd}
                  disabled={!newLabel.trim() || !newTitle.trim()}
                  className='btn btn-primary btn-xs'
                >
                  Add
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setIsAdding(false);
                    setNewLabel('');
                    setNewTitle('');
                    setNewDescription('');
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

      {entries.length === 0 && !isAdding ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='flex flex-col items-center py-6'
        >
          <div className='relative mb-4 w-full px-4'>
            <div className='h-[2px] bg-violet-500/20' />
            {[0.15, 0.4, 0.65, 0.9].map((pos) => (
              <div
                key={pos}
                className='absolute top-1/2 -translate-y-1/2'
                style={{ left: `${pos * 100}%` }}
              >
                <div className='h-3 w-3 rounded-full border-2 border-violet-300/40 bg-violet-100/30 dark:border-violet-600/30 dark:bg-violet-900/20' />
              </div>
            ))}
          </div>
          <p className='aucctus-text-sm aucctus-text-tertiary mb-2'>
            No entries yet
          </p>
          {onAddItem && (
            <button
              type='button'
              onClick={() => setIsAdding(true)}
              className='btn btn-ghost btn-sm flex items-center gap-1.5'
            >
              <Plus size={14} />
              Add first entry
            </button>
          )}
        </motion.div>
      ) : (
        <div className='relative'>
          {canScroll && (
            <>
              <motion.button
                aria-label='Scroll timeline left'
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => scrollBy('left')}
                className='aucctus-bg-primary aucctus-border-secondary absolute -left-4 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border shadow-md'
              >
                <ChevronLeft className='aucctus-text-secondary h-4 w-4' />
              </motion.button>
              <motion.button
                aria-label='Scroll timeline right'
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => scrollBy('right')}
                className='aucctus-bg-primary aucctus-border-secondary absolute -right-4 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border shadow-md'
              >
                <ChevronRight className='aucctus-text-secondary h-4 w-4' />
              </motion.button>
            </>
          )}

          <div className='absolute inset-x-2 top-1/2 z-0 h-[2px] -translate-y-1/2 bg-violet-500/20' />

          <div
            ref={scrollContainerRef}
            className='no-scrollbar relative z-[1] overflow-x-auto'
          >
            <div className='flex w-max py-4 pl-4'>
              {entries.map((entry, index) => {
                const TimeIcon = getTimeIcon(entry.label);
                const isEditingThis = editingUuid === entry.uuid;
                return (
                  <motion.div
                    key={entry.uuid}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: Math.min(index * 0.05, 0.3),
                    }}
                    className={cn(
                      'relative z-[1] shrink-0 grow-0 pr-4 pt-6',
                      isEditingThis ? 'basis-[260px]' : 'basis-[220px]',
                    )}
                  >
                    <div
                      className={cn(
                        'aucctus-bg-primary group relative rounded-lg border p-4 transition-all',
                        isEditingThis
                          ? 'border-violet-300 shadow-md dark:border-violet-600'
                          : 'aucctus-border-primary hover:shadow-md',
                      )}
                    >
                      {isEditingThis ? (
                        /* Inline edit form */
                        <div className='space-y-2'>
                          <input
                            type='text'
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            placeholder='Label (e.g., Morning)'
                            className='aucctus-bg-secondary aucctus-text-primary aucctus-text-xs aucctus-border-primary w-full rounded-md border px-2 py-1.5'
                            autoFocus
                            onKeyDown={handleEditKeyDown}
                          />
                          <input
                            type='text'
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder='Title'
                            className='aucctus-bg-secondary aucctus-text-primary aucctus-text-xs aucctus-border-primary w-full rounded-md border px-2 py-1.5'
                            onKeyDown={handleEditKeyDown}
                          />
                          <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder='Description (optional)'
                            rows={2}
                            className='aucctus-bg-secondary aucctus-text-primary aucctus-text-xs aucctus-border-primary w-full resize-none rounded-md border px-2 py-1.5'
                            onKeyDown={handleEditKeyDown}
                          />
                          <div className='flex gap-1'>
                            <button
                              type='button'
                              onClick={saveEditing}
                              className='flex h-5 w-5 items-center justify-center rounded text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                            >
                              <Check size={12} />
                            </button>
                            <button
                              type='button'
                              onClick={cancelEditing}
                              className='flex h-5 w-5 items-center justify-center rounded text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30'
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className='absolute -top-3 left-4 flex items-center gap-1 rounded-full border border-violet-200 bg-violet-100 px-2 py-1 dark:border-violet-700/50 dark:bg-violet-900/40'>
                            <TimeIcon className='h-3 w-3 text-violet-600 dark:text-violet-400' />
                            <span className='text-xs font-medium text-violet-700 dark:text-violet-300'>
                              {entry.label}
                            </span>
                          </div>
                          <div className='aucctus-bg-tertiary aucctus-text-secondary absolute -top-3 right-4 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold'>
                            {index + 1}
                          </div>
                          <h4 className='aucctus-text-primary mt-2 text-sm font-medium'>
                            {entry.title}
                          </h4>
                          <p className='aucctus-text-tertiary mt-1 line-clamp-2 text-xs'>
                            {entry.description}
                          </p>
                          {isEditable && (onUpdateItem || onDeleteItem) && (
                            <div className='absolute bottom-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
                              {onUpdateItem && (
                                <button
                                  type='button'
                                  className='btn btn-no-border btn-light-primary btn-sm h-6 w-6 rounded-full p-0'
                                  onClick={() => startEditing(entry)}
                                  title='Edit entry'
                                >
                                  <Pencil className='h-3 w-3' />
                                </button>
                              )}
                              {onDeleteItem && (
                                <button
                                  type='button'
                                  className='btn btn-no-border btn-light-primary btn-sm text-destructive h-6 w-6 rounded-full p-0'
                                  onClick={() =>
                                    onDeleteItem(widget.uuid, entry.uuid)
                                  }
                                >
                                  <X className='h-3 w-3' />
                                </button>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </GlassWidget>
  );
};

// ============================================
// Card List Sub-renderer
// ============================================

interface CustomCardListProps {
  widget: ICustomWidget;
  size?: WidgetSize;
  isEditable?: boolean;
  isLayoutMode?: boolean;
  onAddItem?: (widgetUuid: string, data: Record<string, unknown>) => void;
  onDeleteItem?: (widgetUuid: string, itemUuid: string) => void;
}

const CustomCardList: React.FC<CustomCardListProps> = ({
  widget,
  size = 'small',
  isEditable = false,
  isLayoutMode = false,
  onAddItem,
  onDeleteItem,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const items = widget.cardListItems;
  const hasScale = !!(widget.topScaleLabel && widget.bottomScaleLabel);
  const CardIcon = getWidgetIcon(widget.icon || 'list');

  const handleAdd = useCallback(() => {
    if (!newTitle.trim() || !onAddItem) return;
    onAddItem(widget.uuid, {
      title: newTitle.trim(),
      description: newDescription.trim(),
    });
    setNewTitle('');
    setNewDescription('');
    setIsAdding(false);
  }, [newTitle, newDescription, onAddItem, widget.uuid]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleAdd();
      if (e.key === 'Escape') {
        setIsAdding(false);
        setNewTitle('');
        setNewDescription('');
      }
    },
    [handleAdd],
  );

  const addForm = (
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
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder='Title'
              className='aucctus-bg-primary aucctus-text-primary aucctus-text-sm w-full border-none outline-none'
              autoFocus
            />
            <input
              type='text'
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Description (optional)'
              className='aucctus-bg-primary aucctus-text-primary aucctus-text-sm w-full border-none outline-none'
            />
            <div className='flex gap-2'>
              <button
                type='button'
                onClick={handleAdd}
                disabled={!newTitle.trim()}
                className='btn btn-primary btn-xs'
              >
                Add
              </button>
              <button
                type='button'
                onClick={() => {
                  setIsAdding(false);
                  setNewTitle('');
                  setNewDescription('');
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
  );

  const emptyState = items.length === 0 && !isAdding && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className='flex flex-col items-center py-6'
    >
      <div className='mb-4 w-full space-y-2 px-2'>
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className='aucctus-border-secondary flex items-start gap-3 rounded-md border p-3 opacity-40'
          >
            <div className='aucctus-bg-tertiary flex h-8 w-8 shrink-0 items-center justify-center rounded-full'>
              {CardIcon && (
                <CardIcon size={14} className='aucctus-stroke-secondary' />
              )}
            </div>
            <div className='flex-1 space-y-1'>
              <div className='aucctus-bg-secondary h-3 w-3/4 rounded' />
              <div className='aucctus-bg-secondary h-2 w-1/2 rounded' />
            </div>
          </div>
        ))}
      </div>
      <p className='aucctus-text-sm aucctus-text-tertiary mb-2'>No items yet</p>
      {onAddItem && (
        <button
          type='button'
          onClick={() => setIsAdding(true)}
          className='btn btn-ghost btn-sm flex items-center gap-1.5'
        >
          <Plus size={14} />
          Add first item
        </button>
      )}
    </motion.div>
  );

  const itemsList = (
    <div className='space-y-3'>
      <AnimatePresence>
        {items.map((item, index) => (
          <motion.div
            key={item.uuid}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
            className='aucctus-border-secondary hover:aucctus-bg-secondary-hover group rounded-md border p-3 transition-colors'
          >
            <div className='flex items-start gap-3'>
              <div className='aucctus-bg-tertiary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full'>
                {CardIcon && (
                  <CardIcon size={14} className='aucctus-stroke-secondary' />
                )}
              </div>
              <div className='min-w-0 flex-1'>
                <h4 className='aucctus-text-sm-bold aucctus-text-primary'>
                  {item.title}
                </h4>
                {item.description && (
                  <p className='aucctus-text-xs aucctus-text-secondary mt-1'>
                    {item.description}
                  </p>
                )}
              </div>
              {isEditable && onDeleteItem && (
                <button
                  type='button'
                  onClick={() => onDeleteItem(widget.uuid, item.uuid)}
                  className='flex h-5 w-5 shrink-0 items-center justify-center rounded opacity-0 transition-opacity hover:bg-red-100 group-hover:opacity-100 dark:hover:bg-red-900/30'
                >
                  <X size={12} className='text-red-500' />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  return (
    <GlassWidget
      title={widget.title}
      icon={widget.icon || 'list'}
      size={size}
      showAddButton={!isLayoutMode && !!onAddItem}
      onAction={() => setIsAdding(true)}
      className={hasScale ? 'h-[480px]' : undefined}
    >
      {widget.description && (
        <p className='aucctus-text-xs aucctus-text-tertiary mb-3'>
          {widget.description}
        </p>
      )}

      {hasScale ? (
        <div className='flex min-h-0 flex-1'>
          <PriorityIndicator
            highLabel={widget.topScaleLabel}
            lowLabel={widget.bottomScaleLabel}
          />
          <div className='relative min-h-0 flex-1'>
            <div className='absolute inset-0 overflow-y-auto pb-4 pr-1'>
              {addForm}
              {emptyState}
              {itemsList}
            </div>
            <div className='pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/80 to-transparent dark:from-gray-900/80' />
          </div>
        </div>
      ) : (
        <>
          {addForm}
          {emptyState}
          {itemsList}
        </>
      )}
    </GlassWidget>
  );
};

// ============================================
// Stat List Sub-renderer
// ============================================

const getTrendIcon = (
  trend?: string,
): React.FC<{ className?: string }> | null => {
  if (trend === 'up') return TrendingUp;
  if (trend === 'down') return TrendingDown;
  return null;
};

const getTrendIconColor = (trend?: string): string => {
  if (trend === 'up') return 'text-emerald-600 dark:text-emerald-400';
  if (trend === 'down') return 'text-red-600 dark:text-red-400';
  return 'aucctus-text-tertiary';
};

const getTrendCardStyle = (trend?: string): string => {
  if (trend === 'up')
    return 'border border-emerald-300/50 bg-emerald-50/30 dark:border-emerald-700/40 dark:bg-emerald-950/20';
  if (trend === 'down')
    return 'border border-red-300/50 bg-red-50/30 dark:border-red-700/40 dark:bg-red-950/20';
  return 'aucctus-bg-secondary';
};

interface CustomStatListProps {
  widget: ICustomWidget;
  size?: WidgetSize;
  isEditable?: boolean;
  isLayoutMode?: boolean;
  onAddItem?: (widgetUuid: string, data: Record<string, unknown>) => void;
  onDeleteItem?: (widgetUuid: string, itemUuid: string) => void;
}

const CustomStatList: React.FC<CustomStatListProps> = ({
  widget,
  size = 'small',
  isEditable = false,
  isLayoutMode = false,
  onAddItem,
  onDeleteItem,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTrend, setNewTrend] = useState<'up' | 'down' | 'neutral'>(
    'neutral',
  );

  const items = widget.statListItems;

  const handleAdd = useCallback(() => {
    if (!newTitle.trim() || !onAddItem) return;
    onAddItem(widget.uuid, {
      title: newTitle.trim(),
      description: newDescription.trim(),
      trend: newTrend,
    });
    setNewTitle('');
    setNewDescription('');
    setNewTrend('neutral');
    setIsAdding(false);
  }, [newTitle, newDescription, newTrend, onAddItem, widget.uuid]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleAdd();
      if (e.key === 'Escape') {
        setIsAdding(false);
        setNewTitle('');
        setNewDescription('');
        setNewTrend('neutral');
      }
    },
    [handleAdd],
  );

  return (
    <GlassWidget
      title={widget.title}
      icon={widget.icon || 'hash'}
      size={size}
      showAddButton={!isLayoutMode && !!onAddItem}
      onAction={() => setIsAdding(true)}
    >
      {widget.description && (
        <p className='aucctus-text-xs aucctus-text-tertiary mb-3'>
          {widget.description}
        </p>
      )}

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
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder='Stat (e.g., 59%)'
                className='aucctus-bg-primary aucctus-text-primary aucctus-text-sm w-full border-none outline-none'
                autoFocus
              />
              <input
                type='text'
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='Label (e.g., Renters)'
                className='aucctus-bg-primary aucctus-text-primary aucctus-text-sm w-full border-none outline-none'
              />
              <div className='flex items-center gap-2'>
                <span className='aucctus-text-xs aucctus-text-tertiary'>
                  Trend:
                </span>
                <button
                  type='button'
                  onClick={() => setNewTrend('up')}
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded transition-colors',
                    newTrend === 'up'
                      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'
                      : 'aucctus-bg-tertiary aucctus-text-tertiary hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
                  )}
                >
                  <TrendingUp size={12} />
                </button>
                <button
                  type='button'
                  onClick={() => setNewTrend('neutral')}
                  className={cn(
                    'flex h-6 items-center justify-center rounded px-1.5 transition-colors',
                    newTrend === 'neutral'
                      ? 'aucctus-bg-secondary aucctus-text-primary'
                      : 'aucctus-bg-tertiary aucctus-text-tertiary',
                  )}
                >
                  <span className='text-xs'>—</span>
                </button>
                <button
                  type='button'
                  onClick={() => setNewTrend('down')}
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded transition-colors',
                    newTrend === 'down'
                      ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
                      : 'aucctus-bg-tertiary aucctus-text-tertiary hover:bg-red-50 dark:hover:bg-red-900/20',
                  )}
                >
                  <TrendingDown size={12} />
                </button>
              </div>
              <div className='flex gap-2'>
                <button
                  type='button'
                  onClick={handleAdd}
                  disabled={!newTitle.trim()}
                  className='btn btn-primary btn-xs'
                >
                  Add
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setIsAdding(false);
                    setNewTitle('');
                    setNewDescription('');
                    setNewTrend('neutral');
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
      {items.length === 0 && !isAdding && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='flex flex-col items-center py-6'
        >
          <div className='mb-4 flex w-full gap-3 px-2'>
            {[
              { trend: 'up', value: '—', label: '...' },
              { trend: 'down', value: '—', label: '...' },
            ].map((placeholder, i) => (
              <div
                key={i}
                className={cn(
                  'flex-1 rounded-lg p-4 opacity-40',
                  getTrendCardStyle(placeholder.trend),
                )}
              >
                <p className='aucctus-text-lg-bold aucctus-text-primary'>
                  {placeholder.value}
                </p>
                <p className='aucctus-text-sm aucctus-text-secondary mt-1'>
                  {placeholder.label}
                </p>
              </div>
            ))}
          </div>
          <p className='aucctus-text-sm aucctus-text-tertiary mb-2'>
            No stats yet
          </p>
          {onAddItem && (
            <button
              type='button'
              onClick={() => setIsAdding(true)}
              className='btn btn-ghost btn-sm flex items-center gap-1.5'
            >
              <Plus size={14} />
              Add first stat
            </button>
          )}
        </motion.div>
      )}

      <div className='flex flex-wrap gap-3'>
        {items.map((item, index) => {
          const TrendIcon = getTrendIcon(item.trend);
          return (
            <motion.div
              key={item.uuid}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: Math.min(index * 0.05, 0.3) }}
              className={cn(
                'group relative min-w-[calc(50%-0.375rem)] flex-1 rounded-lg p-4',
                getTrendCardStyle(item.trend),
              )}
            >
              <div className='flex items-start justify-between'>
                <div>
                  <p className='aucctus-text-lg-bold aucctus-text-primary'>
                    {item.title}
                  </p>
                  <p className='aucctus-text-sm aucctus-text-secondary mt-1'>
                    {item.description}
                  </p>
                </div>
                <div className='flex items-center gap-1'>
                  {TrendIcon && (
                    <TrendIcon
                      className={cn('h-4 w-4', getTrendIconColor(item.trend))}
                    />
                  )}
                  {isEditable && onDeleteItem && (
                    <button
                      type='button'
                      onClick={() => onDeleteItem(widget.uuid, item.uuid)}
                      className='flex h-5 w-5 shrink-0 items-center justify-center rounded opacity-0 transition-opacity hover:bg-red-100 group-hover:opacity-100 dark:hover:bg-red-900/30'
                    >
                      <X size={12} className='text-red-500' />
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

// ============================================
// Main CustomWidgetRenderer
// ============================================

/**
 * CustomWidgetRenderer Component
 */
const CustomWidgetRenderer: React.FC<CustomWidgetRendererProps> = ({
  widget,
  size = 'small',
  isEditable = false,
  isLayoutMode = false,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  className,
}) => {
  switch (widget.widgetType) {
    case 'metric_chart':
      return (
        <div className={cn('group relative', className)}>
          <MetricChartWidget
            title={widget.title}
            description={widget.description}
            icon={widget.icon}
            items={widget.metricChartItems}
            chartType={widget.chartType || 'bar'}
            size={size}
            isEditable={isEditable}
            showAddButton={!isLayoutMode}
            onAdd={
              onAddItem
                ? (data) =>
                    onAddItem(
                      widget.uuid,
                      data as unknown as Record<string, unknown>,
                    )
                : undefined
            }
            onUpdate={
              onUpdateItem
                ? (uuid, data) =>
                    onUpdateItem(
                      widget.uuid,
                      uuid,
                      data as unknown as Record<string, unknown>,
                    )
                : undefined
            }
            onDelete={
              onDeleteItem
                ? (itemUuid) => onDeleteItem(widget.uuid, itemUuid)
                : undefined
            }
          />
        </div>
      );

    case 'timeline':
      return (
        <CustomTimeline
          widget={widget}
          size={size}
          isEditable={isEditable}
          isLayoutMode={isLayoutMode}
          onAddItem={onAddItem}
          onUpdateItem={onUpdateItem}
          onDeleteItem={onDeleteItem}
        />
      );

    case 'card_list':
      return (
        <CustomCardList
          widget={widget}
          size={size}
          isEditable={isEditable}
          isLayoutMode={isLayoutMode}
          onAddItem={onAddItem}
          onDeleteItem={onDeleteItem}
        />
      );

    case 'stat_list':
      return (
        <CustomStatList
          widget={widget}
          size={size}
          isEditable={isEditable}
          isLayoutMode={isLayoutMode}
          onAddItem={onAddItem}
          onDeleteItem={onDeleteItem}
        />
      );

    default:
      return null;
  }
};

export default CustomWidgetRenderer;
