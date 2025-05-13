import React, { useState, useCallback } from 'react';
import { cn } from '@libs/utils/react';
import { Button, Icon, Input } from '@components';
import type { ICustomerListItemWithUuid } from '@libs/api/types';
import AddItemForm from './AddItemForm';
import { animated } from 'react-spring';
import { useExpandCollapseTransition } from '@hooks/animation/animation.hook';

export interface EditableListProps {
  items: ICustomerListItemWithUuid[];
  onEdit: (
    item: ICustomerListItemWithUuid,
    index: number,
    newValue: string,
  ) => Promise<void>;
  onCreate: (newValue: string) => Promise<void>;
  onDelete: (item: ICustomerListItemWithUuid, index: number) => Promise<void>;
  itemLabel?: string;
  maxVisible?: number;
  /**
   * Controls whether the add form is shown
   */
  isAdding?: boolean;
  /**
   * Called when the add button is clicked
   */
  onStartAdding?: () => void;
  /**
   * Called when the add form is cancelled
   */
  onCancelAdding?: () => void;
  /**
   * Custom class for the icon background (e.g. bg-orangeDark-300)
   */
  iconBgClass?: string;
  /**
   * Custom class for the icon color (e.g. aucctus-stroke-brand-primary or stroke-orangeDark-900)
   */
  iconColorClass?: string;
  /**
   * Custom size for the icon container
   * 'sm' = h-5 w-5
   * 'md' = h-6 w-6
   * 'lg' = h-7 w-7
   */
  iconSize?: 'sm' | 'md' | 'lg';
}

/**
 * EditableList is a generic, reusable component for listing, adding, editing, and removing ICustomerListItem items.
 * It supports custom icon logic and exposes async callbacks for API integration.
 */
const EditableList: React.FC<EditableListProps> = ({
  items,
  onEdit,
  onCreate,
  onDelete,
  itemLabel = 'item',
  isAdding = false,
  onCancelAdding,
  iconBgClass = 'aucctus-bg-secondary-subtle',
  iconColorClass = '',
  iconSize = 'sm',
}) => {
  const [newValue, setNewValue] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [addingLoading, setAddingLoading] = useState(false);

  // Get icon size classes
  const iconSizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-7 w-7',
  }[iconSize];

  // Handlers
  const handleAdd = useCallback(async () => {
    if (!newValue.trim()) return;
    setAddingLoading(true);
    await onCreate(newValue.trim());
    setNewValue('');
    setAddingLoading(false);
    if (onCancelAdding) onCancelAdding();
  }, [newValue, onCreate, onCancelAdding]);

  const handleEditStart = useCallback((index: number, value: string) => {
    setEditingIndex(index);
    setEditingValue(value);
  }, []);
  const handleCancelEdit = useCallback(() => setEditingIndex(null), []);

  const handleSaveEdit = useCallback(async () => {
    if (editingIndex === null || !editingValue.trim()) return;
    setLoadingIndex(editingIndex);
    await onEdit(items[editingIndex], editingIndex, editingValue.trim());
    setEditingIndex(null);
    setLoadingIndex(null);
  }, [editingIndex, editingValue, items, onEdit]);

  const handleRemove = useCallback(
    async (item: ICustomerListItemWithUuid, index: number) => {
      setLoadingIndex(index);
      await onDelete(item, index);
      setLoadingIndex(null);
    },
    [onDelete],
  );

  const addItemTransitions = useExpandCollapseTransition({
    isExpanded: isAdding,
    withOpacity: true,
    collapsedHeight: 0,
    maxHeight: 250,
  });

  // Render
  return (
    <div className='min-w-0 flex-1 space-y-2'>
      {/* Add Form */}
      {addItemTransitions(
        (style, item) =>
          item && (
            <animated.div style={style} className='p-2'>
              <AddItemForm
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onAdd={handleAdd}
                onCancel={onCancelAdding || (() => setNewValue(''))}
                loading={addingLoading}
                itemLabel={itemLabel}
              />
            </animated.div>
          ),
      )}

      {/* List */}
      {items.length > 0 ? (
        items.map((item, index) => {
          const isEditing = editingIndex === index;
          const isLoading = loadingIndex === index;
          // Fallbacks
          const iconVariant = item.icon || 'cube';
          return (
            <div
              key={`item-${index}`}
              className={cn(
                'group flex items-start gap-2 rounded-md p-3',
                'aucctus-border-secondary hover:aucctus-bg-secondary-hover border',
                'relative transition-colors',
                isLoading && 'pointer-events-none opacity-50',
              )}
            >
              <span
                className={cn(
                  `mt-0.5 flex ${iconSizeClasses} flex-shrink-0 items-center justify-center rounded-full`,
                  iconBgClass,
                )}
              >
                <Icon
                  variant={iconVariant}
                  height={16}
                  width={16}
                  className={iconColorClass}
                />
              </span>
              {isEditing ? (
                <div className='w-full min-w-0 flex-1 space-y-2'>
                  <Input
                    name={`${itemLabel}-edit`}
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit();
                      else if (e.key === 'Escape') handleCancelEdit();
                    }}
                    autoFocus
                  />
                  <div className='flex justify-end gap-2'>
                    <Button size='sm' color='light' onClick={handleCancelEdit}>
                      <span className='flex items-center'>
                        <Icon variant='closeX' height={16} width={16} />
                      </span>
                    </Button>
                    <Button
                      size='sm'
                      color='primary'
                      onClick={handleSaveEdit}
                      disabled={isLoading}
                    >
                      <span className='flex items-center'>
                        <Icon
                          variant='check'
                          height={16}
                          width={16}
                          className='aucctus-stroke-white'
                        />
                        {isLoading && (
                          <Icon.LoadingSpinner
                            className='ml-2'
                            height={16}
                            width={16}
                          />
                        )}
                      </span>
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className='min-w-0 flex-1 pr-12'>
                    <p className='aucctus-text-primary aucctus-text-sm'>
                      {item.description}
                    </p>
                  </div>
                  <div className='absolute right-2 top-2.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
                    <span
                      className='aucctus-bg-secondary-hover flex h-5 w-5 cursor-pointer items-center justify-center rounded-full'
                      onClick={() => handleEditStart(index, item.description)}
                    >
                      <Icon variant='edit' height={14} width={14} />
                    </span>
                    <span
                      className='aucctus-bg-secondary-hover flex h-5 w-5 cursor-pointer items-center justify-center rounded-full text-red-500'
                      onClick={() => handleRemove(item, index)}
                    >
                      <Icon variant='closeX' height={12} width={12} />
                    </span>
                  </div>
                </>
              )}
            </div>
          );
        })
      ) : (
        <div className='aucctus-bg-secondary-subtle rounded-md p-3 text-center'>
          <p className='aucctus-text-secondary aucctus-text-sm'>
            No {itemLabel}s added yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default EditableList;
