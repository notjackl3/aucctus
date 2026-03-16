/**
 * SocialValuesWidget - Card-based social values display
 *
 * Displays persona social values as cards with title and description.
 * Ported from lovable SocialValues design:
 * - Heart icon per card
 * - Title + description layout
 * - Scrollable list within fixed height
 */

import { cn } from '@libs/utils/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Pencil, Plus, X } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import GlassWidget, { WidgetSize } from './GlassWidget';

/** Social value item structure */
export interface SocialValueItem {
  uuid: string;
  title: string;
  description?: string;
}

/** Props for the SocialValuesWidget component */
export interface SocialValuesWidgetProps {
  /** Widget title */
  title?: string;
  /** Icon variant */
  icon?: string;
  /** List of social values */
  items: SocialValueItem[];
  /** Widget size */
  size?: WidgetSize;
  /** Whether editing is enabled */
  isEditable?: boolean;
  /** Callback to add new item */
  onAdd?: (data: { title: string; description?: string }) => void;
  /** Callback to update item */
  onUpdate?: (
    uuid: string,
    data: { title: string; description?: string },
  ) => void;
  /** Callback to delete item */
  onDelete?: (uuid: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * SocialValuesWidget Component
 */
const SocialValuesWidget: React.FC<SocialValuesWidgetProps> = ({
  title = 'Social Values',
  icon = 'heart',
  items,
  size = 'small',
  onAdd,
  onUpdate,
  onDelete,
  className,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const handleAdd = useCallback(() => {
    if (!newTitle.trim() || !onAdd) return;
    onAdd({
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
    });
    setNewTitle('');
    setNewDescription('');
    setIsAdding(false);
  }, [newTitle, newDescription, onAdd]);

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

  const handleStartEdit = useCallback((item: SocialValueItem) => {
    setEditingUuid(item.uuid);
    setEditTitle(item.title);
    setEditDescription(item.description || '');
    setIsAdding(false);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingUuid || !editTitle.trim() || !onUpdate) return;
    onUpdate(editingUuid, {
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
    });
    setEditingUuid(null);
    setEditTitle('');
    setEditDescription('');
  }, [editingUuid, editTitle, editDescription, onUpdate]);

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSaveEdit();
      if (e.key === 'Escape') {
        setEditingUuid(null);
        setEditTitle('');
        setEditDescription('');
      }
    },
    [handleSaveEdit],
  );

  return (
    <GlassWidget
      title={title}
      icon={icon}
      iconBgClass='bg-pink-100 border-pink-200'
      iconColorClass='stroke-pink-500'
      size={size}
      showAddButton={!!onAdd}
      onAction={() => setIsAdding(true)}
      className={cn('h-[480px]', className)}
    >
      <p className='aucctus-text-secondary aucctus-text-sm mb-4'>
        Core beliefs and values that guide their decisions and lifestyle
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
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder='Title (e.g., Environmental Sustainability)'
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

      <div className='relative min-h-0 flex-1'>
        {/* Empty state */}
        {items.length === 0 && !isAdding && onAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='flex h-full items-center justify-center'
          >
            <button
              type='button'
              onClick={() => setIsAdding(true)}
              className='aucctus-text-secondary hover:aucctus-text-primary aucctus-border-secondary hover:aucctus-border-primary flex items-center gap-2 rounded-lg border border-dashed px-4 py-2 transition-colors'
            >
              <Plus className='h-4 w-4' />
              <span className='aucctus-text-sm'>Add a social value</span>
            </button>
          </motion.div>
        )}

        {(items.length > 0 || isAdding) && (
          <div className='absolute inset-0 overflow-y-auto pb-4 pr-1'>
            <div className='space-y-3'>
              <AnimatePresence>
                {items.map((item, index) => (
                  <motion.div
                    key={item.uuid}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{
                      duration: 0.2,
                      delay: Math.min(index * 0.04, 0.3),
                    }}
                    className='aucctus-border-secondary hover:aucctus-bg-secondary-hover group rounded-md border p-3 transition-colors'
                  >
                    {editingUuid === item.uuid ? (
                      <div className='space-y-2 p-1'>
                        <input
                          type='text'
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder='Title'
                          className='aucctus-bg-primary aucctus-text-primary aucctus-text-sm w-full border-none outline-none'
                          autoFocus
                        />
                        <input
                          type='text'
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          onKeyDown={handleEditKeyDown}
                          placeholder='Description (optional)'
                          className='aucctus-bg-primary aucctus-text-primary aucctus-text-sm w-full border-none outline-none'
                        />
                        <div className='flex gap-2'>
                          <button
                            type='button'
                            onClick={handleSaveEdit}
                            disabled={!editTitle.trim()}
                            className='btn btn-primary btn-xs'
                          >
                            Save
                          </button>
                          <button
                            type='button'
                            onClick={() => {
                              setEditingUuid(null);
                              setEditTitle('');
                              setEditDescription('');
                            }}
                            className='btn btn-ghost btn-xs'
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className='flex items-start gap-3'>
                        <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-pink-500/10'>
                          <Heart className='h-4 w-4 text-pink-500' />
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
                        <div className='flex shrink-0 items-center gap-1'>
                          {onUpdate && (
                            <button
                              type='button'
                              onClick={() => handleStartEdit(item)}
                              className='flex h-5 w-5 items-center justify-center rounded opacity-0 transition-opacity hover:bg-blue-100 group-hover:opacity-100 dark:hover:bg-blue-900/30'
                            >
                              <Pencil className='aucctus-text-secondary h-3 w-3' />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              type='button'
                              onClick={() => onDelete(item.uuid)}
                              className='flex h-5 w-5 items-center justify-center rounded opacity-0 transition-opacity hover:bg-red-100 group-hover:opacity-100 dark:hover:bg-red-900/30'
                            >
                              <X className='h-3 w-3 text-red-500' />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
        {/* Bottom fade gradient */}
        {(items.length > 0 || isAdding) && (
          <div className='pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/80 to-transparent dark:from-gray-900/80' />
        )}
      </div>
    </GlassWidget>
  );
};

export default SocialValuesWidget;
