/**
 * TabbedCardListWidget - Card list with tab switching and per-item icons
 *
 * Displays multiple card lists in a tabbed interface.
 * Ported from lovable MotivationsAndBehaviours design:
 * - Tab buttons with icons and item counts
 * - Per-item icon from active tab configuration
 * - Scrollable content within fixed height
 * Used for: Motivations & Behaviours
 */

import { cn } from '@libs/utils/react';
import { AnimatePresence, motion } from 'framer-motion';
import { type LucideIcon, Target } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { CardListItem } from './CardListWidget';
import GlassWidget, { WidgetSize } from './GlassWidget';

/** Tab configuration */
export interface TabConfig {
  id: string;
  label: string;
  icon?: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  items: CardListItem[];
}

/** Props for the TabbedCardListWidget component */
export interface TabbedCardListWidgetProps {
  /** Widget title */
  title: string;
  /** Icon variant */
  icon?: string;
  /** Tabs with their content */
  tabs: TabConfig[];
  /** Widget size */
  size?: WidgetSize;
  /** Whether editing is enabled */
  isEditable?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * TabbedCardListWidget Component
 */
const TabbedCardListWidget: React.FC<TabbedCardListWidgetProps> = ({
  title,
  icon,
  tabs,
  size = 'small',
  className,
}) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '');

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  const activeTabData = tabs.find((t) => t.id === activeTab);

  return (
    <GlassWidget
      title={title}
      icon={icon}
      size={size}
      className={cn('h-[480px]', className)}
    >
      <div className='flex min-h-0 flex-1 flex-col'>
        {/* Tab bar with icons and counts */}
        <div className='mb-4 flex flex-shrink-0 gap-2'>
          {tabs.map((tab) => (
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
              {tab.icon && <tab.icon className='mr-1 h-4 w-4' />}
              {tab.label} ({tab.items.length})
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
                {activeTabData?.items.map((item, index) => (
                  <motion.div
                    key={item.uuid}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.2,
                      delay: Math.min(index * 0.03, 0.3),
                    }}
                    className='aucctus-border-secondary hover:aucctus-bg-secondary-hover flex items-start gap-3 rounded-md border p-3 transition-colors'
                  >
                    <div className='mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/20'>
                      <Target className='h-3 w-3 text-amber-600' />
                    </div>
                    <p className='aucctus-text-sm aucctus-text-primary flex-1'>
                      {item.text}
                    </p>
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

export default TabbedCardListWidget;
