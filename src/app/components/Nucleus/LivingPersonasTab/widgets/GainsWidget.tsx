/**
 * GainsWidget - Gains list with impact scale indicator
 *
 * Displays persona gains sorted by impact with a vertical gradient scale.
 * Uses PriorityIndicator with custom "High Impact / Low Impact" labels.
 * - Emerald color scheme
 * - Sparkle icon per item
 * - Scrollable list within fixed height
 */

import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import PriorityIndicator from '@pages/Concept/Report/CustomerProfile/Details/components/PriorityIndicator';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import GlassWidget, { WidgetSize } from './GlassWidget';

/** Gain item structure */
export interface GainItem {
  uuid: string;
  text: string;
  impact?: number;
}

/** Props for the GainsWidget component */
export interface GainsWidgetProps {
  /** Widget title */
  title?: string;
  /** Icon variant */
  icon?: string;
  /** List of gains */
  items: GainItem[];
  /** Widget size */
  size?: WidgetSize;
  /** Whether editing is enabled */
  isEditable?: boolean;
  /** Callback to add new item */
  onAdd?: (data: { text: string; impact?: number }) => void;
  /** Callback to delete item */
  onDelete?: (uuid: string) => void;
  /** Additional CSS classes */
  className?: string;
}

const IMPACT_COLOR_TEXT = 'text-emerald-600';
const IMPACT_COLOR_LINE =
  'bg-gradient-to-b from-emerald-500/80 to-emerald-500/10';
const ICON_COLOR = 'stroke-emerald-600';
const ICON_BG = 'bg-emerald-100';

/**
 * GainsWidget Component
 */
const GainsWidget: React.FC<GainsWidgetProps> = ({
  title = 'Gains',
  icon = 'trending-up',
  items,
  size = 'small',
  onAdd,
  onDelete,
  className,
}) => {
  const sortedItems = [...items].sort(
    (a, b) => (b.impact || 0) - (a.impact || 0),
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
      iconBgClass={`${ICON_BG} border-emerald-200`}
      iconColorClass={ICON_COLOR}
      size={size}
      showAddButton={!!onAdd}
      onAction={() => setIsAdding(true)}
      className={cn('h-[480px]', className)}
    >
      <p className='aucctus-text-secondary aucctus-text-sm mb-4'>
        Desired outcomes and benefits the customer is seeking
      </p>

      <div className='flex min-h-0 flex-1'>
        {/* Impact Scale */}
        <PriorityIndicator
          textColorClass={IMPACT_COLOR_TEXT}
          lineColorClass={IMPACT_COLOR_LINE}
          highLabel='High Impact'
          lowLabel='Low Impact'
        />

        {/* Items List - Scrollable */}
        <div className='relative min-h-0 flex-1'>
          <div className='absolute inset-0 overflow-y-auto pb-4 pr-1'>
            <div className='space-y-3'>
              {/* Inline add form - inside scrollable area so priority line is unaffected */}
              <AnimatePresence>
                {isAdding && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className='aucctus-border-brand flex items-center gap-2 rounded-lg border p-2'>
                      <input
                        type='text'
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder='Enter a gain...'
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
                        <X className='h-3 w-3' />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
                    <div
                      className={cn(
                        'mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full',
                        ICON_BG,
                      )}
                    >
                      <Icon
                        variant='sparkles'
                        className={cn('h-3 w-3', ICON_COLOR)}
                      />
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
                        <Icon
                          variant='closeX'
                          className='h-3 w-3 text-red-500'
                        />
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
      </div>
    </GlassWidget>
  );
};

export default GainsWidget;
