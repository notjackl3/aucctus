/**
 * StrategicPillarsWidget - Accordion widget displaying strategic pillars.
 *
 * Each pillar has a colored accent line, icon, title, and expandable description.
 * Supports inline add/delete of items when isEditable is true.
 * Maps to the `accordion` widget type.
 */

import { GlassSurface } from '@components';
import type { INucleusOverviewWidget } from '@libs/api/types/nucleusOverview';
import { resolveIcon } from '@libs/utils/iconMap';
import { cn } from '@libs/utils/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Layers, Plus, Trash2 } from 'lucide-react';
import React, { useCallback, useState } from 'react';

interface StrategicPillarsWidgetProps {
  widget: INucleusOverviewWidget;
  brandColors?: Record<string, string>;
  isEditable?: boolean;
  onAddItem?: (widgetUuid: string, data: Record<string, unknown>) => void;
  onUpdateItem?: (
    widgetUuid: string,
    itemUuid: string,
    data: Record<string, unknown>,
  ) => void;
  onDeleteItem?: (widgetUuid: string, itemUuid: string) => void;
}

/** Inline editable text that becomes an input/textarea on click. */
const EditableText: React.FC<{
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
  multiline?: boolean;
}> = ({ value, onSave, className, multiline = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = useCallback(() => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== value) {
      onSave(trimmed);
    }
    setIsEditing(false);
  }, [editValue, value, onSave]);

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setEditValue(value);
              setIsEditing(false);
            }
          }}
          className={`aucctus-bg-secondary aucctus-border-brand w-full resize-none rounded border px-2 py-1 outline-none ${className ?? ''}`}
          rows={2}
          autoFocus
        />
      );
    }
    return (
      <input
        type='text'
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
          if (e.key === 'Escape') {
            setEditValue(value);
            setIsEditing(false);
          }
        }}
        className={`aucctus-bg-secondary aucctus-border-brand w-full rounded border px-2 py-1 outline-none ${className ?? ''}`}
        autoFocus
      />
    );
  }

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      className={`hover:aucctus-text-brand-primary cursor-text ${className ?? ''}`}
      role='button'
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.stopPropagation();
          setIsEditing(true);
        }
      }}
    >
      {value}
    </span>
  );
};

const StrategicPillarsWidget: React.FC<StrategicPillarsWidgetProps> = ({
  widget,
  brandColors = {},
  isEditable = false,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
}) => {
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const pillars = widget.accordionItems;
  const brandColorValues = Object.values(brandColors);

  const handleAdd = useCallback(() => {
    if (!newName.trim()) return;
    onAddItem?.(widget.uuid, {
      name: newName.trim(),
      description: newDescription.trim(),
    });
    setNewName('');
    setNewDescription('');
    setIsAdding(false);
  }, [newName, newDescription, widget.uuid, onAddItem]);

  const handleDelete = useCallback(
    (e: React.MouseEvent, itemUuid: string) => {
      e.stopPropagation();
      onDeleteItem?.(widget.uuid, itemUuid);
    },
    [widget.uuid, onDeleteItem],
  );

  return (
    <GlassSurface
      className='flex h-full min-h-[180px] flex-col overflow-hidden'
      variant='default'
    >
      <div className='flex-shrink-0 px-4 pb-1 pt-2'>
        <div className='flex items-center gap-2'>
          <Layers className='text-primary/70 h-4 w-4' />
          <span className='aucctus-text-xs-medium aucctus-text-tertiary flex-1 uppercase tracking-wider'>
            {widget.title}
          </span>
          {isEditable && onAddItem && (
            <button
              type='button'
              onClick={() => setIsAdding(true)}
              className='aucctus-text-tertiary hover:aucctus-bg-secondary flex h-5 w-5 items-center justify-center rounded-full transition-colors'
              title='Add pillar'
            >
              <Plus className='h-3.5 w-3.5' />
            </button>
          )}
        </div>
      </div>

      <div className='flex flex-1 flex-col overflow-hidden'>
        {pillars.map((pillar, index) => {
          const isExpanded = expandedIndex === index;
          const color =
            brandColorValues[index % brandColorValues.length] || '#333333';
          const isLast = index === pillars.length - 1;
          const PillarIcon = resolveIcon(pillar.icon);

          return (
            <motion.div
              key={pillar.uuid}
              layout
              className={cn(
                'group/item relative flex cursor-pointer overflow-hidden',
                pillar.uuid.startsWith('temp-') && 'animate-pulse opacity-60',
              )}
              animate={{ flex: isExpanded ? 1 : 0 }}
              style={{ minHeight: '2.5rem' }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 30,
                mass: 0.8,
              }}
              onClick={() => setExpandedIndex(index)}
            >
              {/* Left accent line */}
              <motion.div
                className='w-1 flex-shrink-0'
                animate={{
                  backgroundColor: color,
                  boxShadow: isExpanded
                    ? `0 0 12px ${color}66, 0 0 4px ${color}4D`
                    : 'none',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />

              {/* Background */}
              <motion.div
                className='absolute inset-0 left-1'
                animate={{
                  backgroundColor: isExpanded ? `${color}1F` : `${color}0F`,
                }}
                style={{
                  borderBottom: !isLast ? `1px solid ${color}1F` : 'none',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />

              {/* Content */}
              <div
                className={cn(
                  'relative flex h-full flex-1 flex-col overflow-hidden px-4',
                  isExpanded ? 'justify-start py-2' : 'justify-center',
                )}
              >
                <div
                  className={cn(
                    'grid min-h-[28px] grid-cols-[28px_1fr_auto] gap-x-2.5',
                    isExpanded ? 'items-start gap-y-0' : 'items-center',
                  )}
                >
                  {/* Icon box */}
                  <motion.div
                    layout='position'
                    className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md'
                    animate={{
                      background: isExpanded ? `${color}40` : `${color}26`,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  >
                    <PillarIcon
                      className='h-3.5 w-3.5 flex-shrink-0'
                      style={{ color }}
                    />
                  </motion.div>

                  {/* Title */}
                  <motion.span
                    layout='position'
                    className={cn(
                      'block text-base font-semibold',
                      isExpanded ? 'leading-none' : 'leading-tight',
                    )}
                    animate={{
                      color: isExpanded ? color : 'hsl(var(--foreground))',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  >
                    {isEditable && onUpdateItem ? (
                      <EditableText
                        value={pillar.name}
                        onSave={(v) =>
                          onUpdateItem(widget.uuid, pillar.uuid, { name: v })
                        }
                      />
                    ) : (
                      pillar.name
                    )}
                  </motion.span>

                  {/* Chevron + delete */}
                  <div className='flex items-center gap-1'>
                    {isEditable && onDeleteItem && (
                      <button
                        type='button'
                        onClick={(e) => handleDelete(e, pillar.uuid)}
                        className='flex h-5 w-5 items-center justify-center rounded opacity-0 transition-opacity hover:bg-red-100 group-hover/item:opacity-100 dark:hover:bg-red-900/30'
                        title='Delete pillar'
                      >
                        <Trash2 className='h-3 w-3 text-red-500' />
                      </button>
                    )}
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 30,
                      }}
                    >
                      <ChevronDown
                        className='h-4 w-4'
                        style={{
                          color: isExpanded
                            ? color
                            : 'hsl(var(--muted-foreground))',
                          opacity: isExpanded ? 0.8 : 0.4,
                        }}
                      />
                    </motion.div>
                  </div>

                  {/* Description */}
                  <AnimatePresence mode='wait'>
                    {isExpanded && (
                      <motion.div
                        key='desc'
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 30,
                          opacity: { duration: 0.15 },
                        }}
                        className='aucctus-text-secondary col-start-2 mt-0.5 text-sm font-light leading-snug'
                      >
                        {isEditable && onUpdateItem ? (
                          <EditableText
                            value={pillar.description}
                            onSave={(v) =>
                              onUpdateItem(widget.uuid, pillar.uuid, {
                                description: v,
                              })
                            }
                            multiline
                          />
                        ) : (
                          pillar.description
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Inline add form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className='overflow-hidden px-4 pb-3'
          >
            <div className='space-y-2 rounded-lg border border-dashed border-gray-300 p-3 dark:border-gray-600'>
              <input
                type='text'
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAdd();
                  if (e.key === 'Escape') {
                    setNewName('');
                    setNewDescription('');
                    setIsAdding(false);
                  }
                }}
                placeholder='Pillar name...'
                className='aucctus-bg-secondary aucctus-border-secondary aucctus-text-primary focus:aucctus-border-brand w-full rounded-lg border px-3 py-1.5 text-sm outline-none transition-colors'
                autoFocus
              />
              <input
                type='text'
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAdd();
                  if (e.key === 'Escape') {
                    setNewName('');
                    setNewDescription('');
                    setIsAdding(false);
                  }
                }}
                placeholder='Description (optional)...'
                className='aucctus-bg-secondary aucctus-border-secondary aucctus-text-primary focus:aucctus-border-brand w-full rounded-lg border px-3 py-1.5 text-sm outline-none transition-colors'
              />
              <div className='flex items-center gap-2'>
                <button
                  type='button'
                  onClick={handleAdd}
                  disabled={!newName.trim()}
                  className='aucctus-bg-brand-solid rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-opacity disabled:opacity-50'
                >
                  Add
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setNewName('');
                    setNewDescription('');
                    setIsAdding(false);
                  }}
                  className='aucctus-text-tertiary hover:aucctus-bg-secondary rounded-lg px-2 py-1.5 text-xs transition-colors'
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassSurface>
  );
};

export default StrategicPillarsWidget;
