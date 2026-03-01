/**
 * MustWinPrioritiesWidget - Card list displaying near-term strategic priorities.
 *
 * Shows cards with colored borders, icons, and descriptions in a responsive grid.
 * Supports inline add/delete/update of items when isEditable is true.
 * Maps to the `card_list` widget type.
 */

import { GlassSurface } from '@components';
import type { INucleusOverviewWidget } from '@libs/api/types/nucleusOverview';
import { resolveIcon } from '@libs/utils/iconMap';
import { cn } from '@libs/utils/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Trash2, Trophy } from 'lucide-react';
import React, { useCallback, useState } from 'react';

interface MustWinPrioritiesWidgetProps {
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

const MustWinPrioritiesWidget: React.FC<MustWinPrioritiesWidgetProps> = ({
  widget,
  brandColors = {},
  isEditable = false,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const priorities = widget.cardListItems;
  const brandColorValues = Object.values(brandColors);

  const handleAdd = useCallback(() => {
    if (!newTitle.trim()) return;
    onAddItem?.(widget.uuid, {
      title: newTitle.trim(),
      description: newDescription.trim(),
    });
    setNewTitle('');
    setNewDescription('');
    setIsAdding(false);
  }, [newTitle, newDescription, widget.uuid, onAddItem]);

  const handleDelete = useCallback(
    (itemUuid: string) => {
      onDeleteItem?.(widget.uuid, itemUuid);
    },
    [widget.uuid, onDeleteItem],
  );

  const handleUpdateField = useCallback(
    (itemUuid: string, field: string, value: string) => {
      onUpdateItem?.(widget.uuid, itemUuid, { [field]: value });
    },
    [widget.uuid, onUpdateItem],
  );

  return (
    <GlassSurface
      className='flex h-full min-h-[180px] flex-col'
      variant='default'
    >
      <div className='flex-shrink-0 pb-2 pl-4 pr-4 pt-3'>
        <div className='flex items-center gap-2'>
          <Trophy className='text-primary/70 h-4 w-4' />
          <span className='aucctus-text-xs-medium aucctus-text-tertiary flex-1 uppercase tracking-wider'>
            {widget.title}
          </span>
          {isEditable && onAddItem && (
            <button
              type='button'
              onClick={() => setIsAdding(true)}
              className='aucctus-text-tertiary hover:aucctus-bg-secondary flex h-5 w-5 items-center justify-center rounded-full transition-colors'
              title='Add item'
            >
              <Plus className='h-3.5 w-3.5' />
            </button>
          )}
        </div>
      </div>
      <div className='flex flex-1 flex-col justify-center px-4 pb-4 pt-0'>
        <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
          {priorities.map((priority, index) => {
            const color =
              priority.color ||
              brandColorValues[index % brandColorValues.length] ||
              '#333333';
            const PriorityIcon = resolveIcon(priority.icon);
            return (
              <div
                key={priority.uuid}
                className={cn(
                  'group/item bg-background/80 relative overflow-hidden rounded-lg p-4 backdrop-blur-sm transition-all hover:shadow-md',
                  priority.uuid.startsWith('temp-') &&
                    'animate-pulse opacity-60',
                )}
                style={{
                  border: `1px solid ${color}`,
                  boxShadow: `inset 0 0 20px ${color}40`,
                }}
              >
                {isEditable && onDeleteItem && (
                  <button
                    type='button'
                    onClick={() => handleDelete(priority.uuid)}
                    className='absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded opacity-0 transition-opacity hover:bg-red-100 group-hover/item:opacity-100 dark:hover:bg-red-900/30'
                    title='Delete item'
                  >
                    <Trash2 className='h-3 w-3 text-red-500' />
                  </button>
                )}
                <div className='relative z-10 flex flex-col gap-1.5'>
                  <div className='flex items-center gap-2'>
                    <PriorityIcon className='h-4 w-4' style={{ color }} />
                  </div>
                  {isEditable && onUpdateItem ? (
                    <>
                      <EditableField
                        value={priority.title}
                        onSave={(v) =>
                          handleUpdateField(priority.uuid, 'title', v)
                        }
                        className='aucctus-text-primary text-base font-semibold leading-tight'
                      />
                      <EditableField
                        value={priority.description}
                        onSave={(v) =>
                          handleUpdateField(priority.uuid, 'description', v)
                        }
                        className='aucctus-text-secondary text-sm leading-snug'
                        multiline
                      />
                    </>
                  ) : (
                    <>
                      <h4 className='aucctus-text-primary text-base font-semibold leading-tight'>
                        {priority.title}
                      </h4>
                      <p className='aucctus-text-secondary text-sm leading-snug'>
                        {priority.description}
                      </p>
                    </>
                  )}
                </div>
              </div>
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
              className='overflow-hidden'
            >
              <div className='mt-3 space-y-2 rounded-lg border border-dashed border-gray-300 p-3 dark:border-gray-600'>
                <input
                  type='text'
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAdd();
                    if (e.key === 'Escape') {
                      setNewTitle('');
                      setNewDescription('');
                      setIsAdding(false);
                    }
                  }}
                  placeholder='Title...'
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
                      setNewTitle('');
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
                    disabled={!newTitle.trim()}
                    className='aucctus-bg-brand-solid rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-opacity disabled:opacity-50'
                  >
                    Add
                  </button>
                  <button
                    type='button'
                    onClick={() => {
                      setNewTitle('');
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
      </div>
    </GlassSurface>
  );
};

/** Editable text field that becomes an input on click. */
const EditableField: React.FC<{
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
          className={`aucctus-bg-secondary aucctus-border-brand w-full resize-none rounded border px-1 py-0.5 text-sm outline-none ${className ?? ''}`}
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
        className={`aucctus-bg-secondary aucctus-border-brand w-full rounded border px-1 py-0.5 text-sm outline-none ${className ?? ''}`}
        autoFocus
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`hover:aucctus-text-brand-primary cursor-text ${className ?? ''}`}
      role='button'
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') setIsEditing(true);
      }}
    >
      {value}
    </div>
  );
};

export default MustWinPrioritiesWidget;
