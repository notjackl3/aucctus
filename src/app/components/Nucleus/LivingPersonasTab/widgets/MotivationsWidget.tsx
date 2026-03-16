/**
 * MotivationsWidget - Motivations list (no scale bar)
 *
 * Displays persona motivations sorted by priority.
 * Simpler than Jobs/Pains widgets — no vertical scale bar.
 * - Target icon per item in amber circle
 * - Bordered cards with hover states
 * - Scrollable list within fixed height with bottom fade gradient
 */

import { cn } from '@libs/utils/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Target, X as XIcon } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import GlassWidget, { WidgetSize } from './GlassWidget';

/** Motivation item structure */
export interface MotivationItem {
  uuid: string;
  text: string;
  priority?: number;
}

/** Props for the MotivationsWidget component */
export interface MotivationsWidgetProps {
  /** Widget title */
  title?: string;
  /** Icon variant */
  icon?: string;
  /** List of motivations */
  items: MotivationItem[];
  /** Widget size */
  size?: WidgetSize;
  /** Whether editing is enabled */
  isEditable?: boolean;
  /** Callback to add new item */
  onAdd?: (data: { text: string; priority?: number }) => void;
  /** Callback to delete item */
  onDelete?: (uuid: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * MotivationsWidget Component
 */
const MotivationsWidget: React.FC<MotivationsWidgetProps> = ({
  title = 'Motivations',
  icon = 'target',
  items,
  size = 'small',
  onAdd,
  onDelete,
  className,
}) => {
  const sortedItems = [...items].sort(
    (a, b) => (b.priority || 0) - (a.priority || 0),
  );
  const [isAdding, setIsAdding] = useState(false);
  const [newText, setNewText] = useState('');

  const handleAdd = useCallback(() => {
    if (!newText.trim() || !onAdd) return;
    onAdd({ text: newText.trim() });
    setNewText('');
    setIsAdding(false);
  }, [newText, onAdd]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleAdd();
      if (e.key === 'Escape') {
        setIsAdding(false);
        setNewText('');
      }
    },
    [handleAdd],
  );

  return (
    <GlassWidget
      title={title}
      icon={icon}
      iconBgClass='bg-amber-100 border-amber-200'
      iconColorClass='stroke-amber-600'
      size={size}
      showAddButton={!!onAdd}
      onAction={() => setIsAdding(true)}
      className={cn('h-[480px]', className)}
    >
      <p className='aucctus-text-secondary aucctus-text-sm mb-4'>
        What drives this persona to take action and make decisions
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
            <div className='aucctus-border-brand flex items-center gap-2 rounded-lg border p-2'>
              <input
                type='text'
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='Enter a motivation...'
                className='aucctus-bg-primary aucctus-text-primary aucctus-text-sm flex-1 border-none outline-none'
                autoFocus
              />
              <button
                type='button'
                onClick={handleAdd}
                disabled={!newText.trim()}
                className='btn btn-primary btn-xs'
              >
                Add
              </button>
              <button
                type='button'
                onClick={() => {
                  setIsAdding(false);
                  setNewText('');
                }}
                className='btn btn-ghost btn-xs'
              >
                <XIcon className='h-3 w-3' />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className='relative min-h-0 flex-1'>
        {/* Empty state */}
        {sortedItems.length === 0 && !isAdding && onAdd && (
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
              <span className='aucctus-text-sm'>Add a motivation</span>
            </button>
          </motion.div>
        )}

        <div className='absolute inset-0 overflow-y-auto pb-4 pr-1'>
          <div className='space-y-3'>
            <AnimatePresence>
              {sortedItems.map((item, index) => (
                <motion.div
                  key={item.uuid}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{
                    duration: 0.2,
                    delay: Math.min(index * 0.03, 0.3),
                  }}
                  className='aucctus-border-secondary hover:aucctus-bg-secondary-hover group flex items-start gap-3 rounded-md border p-3 transition-colors'
                >
                  <div className='mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/20'>
                    <Target className='h-3 w-3 text-amber-600' />
                  </div>
                  <p className='aucctus-text-sm aucctus-text-primary flex-1'>
                    {item.text}
                  </p>
                  {onDelete && (
                    <button
                      type='button'
                      onClick={() => onDelete(item.uuid)}
                      className='flex h-5 w-5 shrink-0 items-center justify-center rounded opacity-0 transition-opacity hover:bg-red-100 group-hover:opacity-100 dark:hover:bg-red-900/30'
                    >
                      <XIcon className='h-3 w-3 text-red-500' />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        {/* Bottom fade gradient */}
        <div className='pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/80 to-transparent dark:from-gray-900/80' />
      </div>
    </GlassWidget>
  );
};

export default MotivationsWidget;
