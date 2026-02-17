/**
 * MotivationsBehavioursWidget - Combined tabbed widget for motivations & behaviours
 *
 * Displays motivations and behaviours in a tabbed interface.
 * Ported from lovable MotivationsAndBehaviours design:
 * - Tab buttons with icons and item counts
 * - Per-item icon from active tab configuration
 * - Scrollable content within fixed height
 * - Add form appears inside the list (doesn't affect tab bar or layout)
 */

import { cn } from '@libs/utils/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Target, X as XIcon, Zap } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import GlassWidget, { WidgetSize } from './GlassWidget';

/** Motivation item structure */
export interface MotivationBehaviourItem {
  uuid: string;
  text: string;
  priority?: number;
  order?: number;
}

type ActiveTab = 'motivations' | 'behaviours';

/** Props for the MotivationsBehavioursWidget component */
export interface MotivationsBehavioursWidgetProps {
  /** Widget title */
  title?: string;
  /** Icon variant */
  icon?: string;
  /** List of motivations */
  motivations: MotivationBehaviourItem[];
  /** List of behaviours */
  behaviours: MotivationBehaviourItem[];
  /** Widget size */
  size?: WidgetSize;
  /** Whether editing is enabled */
  isEditable?: boolean;
  /** Callback to add new motivation */
  onAddMotivation?: (data: { text: string; priority?: number }) => void;
  /** Callback to delete motivation */
  onDeleteMotivation?: (uuid: string) => void;
  /** Callback to add new behaviour */
  onAddBehaviour?: (data: { text: string }) => void;
  /** Callback to delete behaviour */
  onDeleteBehaviour?: (uuid: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * MotivationsBehavioursWidget Component
 */
const MotivationsBehavioursWidget: React.FC<
  MotivationsBehavioursWidgetProps
> = ({
  title = 'Motivations & Behaviours',
  icon = 'zap',
  motivations,
  behaviours,
  size = 'small',
  onAddMotivation,
  onDeleteMotivation,
  onAddBehaviour,
  onDeleteBehaviour,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('motivations');
  const [isAdding, setIsAdding] = useState(false);
  const [newText, setNewText] = useState('');

  const sortedMotivations = [...motivations].sort(
    (a, b) => (b.priority || 0) - (a.priority || 0),
  );
  const sortedBehaviours = [...behaviours].sort(
    (a, b) => (a.order || 0) - (b.order || 0),
  );

  const canAdd =
    activeTab === 'motivations' ? !!onAddMotivation : !!onAddBehaviour;

  const handleAdd = useCallback(() => {
    if (!newText.trim()) return;
    if (activeTab === 'motivations' && onAddMotivation) {
      onAddMotivation({ text: newText.trim() });
    } else if (activeTab === 'behaviours' && onAddBehaviour) {
      onAddBehaviour({ text: newText.trim() });
    }
    setNewText('');
    setIsAdding(false);
  }, [newText, activeTab, onAddMotivation, onAddBehaviour]);

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

  const handleTabChange = useCallback((tab: ActiveTab) => {
    setActiveTab(tab);
    setIsAdding(false);
    setNewText('');
  }, []);

  const handleStartAdding = useCallback(() => {
    setIsAdding(true);
  }, []);

  const activeItems =
    activeTab === 'motivations' ? sortedMotivations : sortedBehaviours;
  const onDelete =
    activeTab === 'motivations' ? onDeleteMotivation : onDeleteBehaviour;
  const placeholder =
    activeTab === 'motivations'
      ? 'Enter a motivation...'
      : 'Enter a behaviour...';

  const tabConfig = [
    {
      id: 'motivations' as const,
      label: 'Motivations',
      icon: Target,
      count: motivations.length,
    },
    {
      id: 'behaviours' as const,
      label: 'Behaviours',
      icon: Zap,
      count: behaviours.length,
    },
  ];

  return (
    <GlassWidget
      title={title}
      icon={icon}
      iconBgClass='bg-amber-100 border-amber-200'
      iconColorClass='stroke-amber-600'
      size={size}
      showAddButton={canAdd}
      onAction={handleStartAdding}
      className={cn('h-[480px]', className)}
    >
      <div className='flex min-h-0 flex-1 flex-col'>
        {/* Tab bar with icons and counts */}
        <div className='mb-4 flex flex-shrink-0 gap-2'>
          {tabConfig.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'btn btn-sm flex-1',
                activeTab === tab.id ? 'btn-primary' : 'btn-light',
              )}
            >
              <tab.icon className='mr-1 h-4 w-4' />
              {tab.label} ({tab.count})
            </motion.button>
          ))}
        </div>

        {/* Tab content - scrollable */}
        <div className='relative min-h-0 flex-1'>
          <div className='absolute inset-0 overflow-y-auto pb-4 pr-1'>
            <AnimatePresence mode='wait'>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className='space-y-3'
              >
                {/* Inline add form - inside the scrollable list */}
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
                          placeholder={placeholder}
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

                {activeItems.map((item, index) => (
                  <motion.div
                    key={item.uuid}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.2,
                      delay: Math.min(index * 0.03, 0.3),
                    }}
                    className='aucctus-border-secondary hover:aucctus-bg-secondary-hover group flex items-start gap-3 rounded-md border p-3 transition-colors'
                  >
                    <div
                      className={cn(
                        'mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full',
                        activeTab === 'motivations'
                          ? 'bg-amber-500/20'
                          : 'bg-blue-300/30',
                      )}
                    >
                      {activeTab === 'motivations' ? (
                        <Target className='h-3 w-3 text-amber-600' />
                      ) : (
                        <Zap className='h-3 w-3 text-blue-600' />
                      )}
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
              </motion.div>
            </AnimatePresence>
          </div>
          {/* Bottom fade gradient */}
          <div className='pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/80 to-transparent dark:from-gray-900/80' />
        </div>
      </div>
    </GlassWidget>
  );
};

export default MotivationsBehavioursWidget;
