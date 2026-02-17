/**
 * LiquidGlassTabs - Liquid Glass Design System Tab Component
 *
 * A tab bar component with glass morphic styling and animated sliding indicator.
 * Used for switching between content sections with a polished, modern aesthetic.
 *
 * Features:
 * - Animated sliding indicator that follows the active tab
 * - Glass morphic container styling
 * - Optional icons for each tab
 * - Keyboard navigation support
 * - Smooth transitions with Framer Motion
 *
 * Usage:
 * ```tsx
 * <LiquidGlassTabs
 *   tabs={[
 *     { id: 'company', label: 'Company Context', icon: <Icon variant="building" /> },
 *     { id: 'personas', label: 'Living Personas', icon: <Icon variant="users" /> },
 *     { id: 'uploads', label: 'Data & Uploads', icon: <Icon variant="upload" /> },
 *   ]}
 *   activeTab="personas"
 *   onTabChange={(id) => setActiveTab(id)}
 * />
 * ```
 */

import { motion, LayoutGroup } from 'framer-motion';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cn } from '@libs/utils/react';

/** Configuration for a single tab */
export interface TabConfig {
  /** Unique identifier for the tab */
  id: string;
  /** Display label */
  label: string;
  /** Optional icon element (render before label) */
  icon?: React.ReactNode;
  /** Optional disabled state */
  disabled?: boolean;
}

/** Props for the LiquidGlassTabs component */
export interface LiquidGlassTabsProps {
  /** Array of tab configurations */
  tabs: TabConfig[];
  /** Currently active tab ID */
  activeTab: string;
  /** Callback when a tab is selected */
  onTabChange: (tabId: string) => void;
  /** Additional CSS classes for the container */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * LiquidGlassTabs Component
 *
 * Renders a glass morphic tab bar with animated sliding indicator.
 */
const LiquidGlassTabs: React.FC<LiquidGlassTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
  size = 'md',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // Size-based styling
  const sizeClasses = useMemo(
    () => ({
      sm: {
        container: 'px-1 py-1 gap-1',
        tab: 'px-3 py-1.5 text-xs',
        icon: 'h-3.5 w-3.5',
      },
      md: {
        container: 'px-1.5 py-1.5 gap-1.5',
        tab: 'px-4 py-2 text-sm',
        icon: 'h-4 w-4',
      },
      lg: {
        container: 'px-2 py-2 gap-2',
        tab: 'px-6 py-2.5 text-base',
        icon: 'h-5 w-5',
      },
    }),
    [],
  );

  // Update indicator position on tab change and window resize
  useEffect(() => {
    const updateIndicatorPosition = () => {
      const activeTabEl = tabRefs.current.get(activeTab);
      const containerEl = containerRef.current;

      if (activeTabEl && containerEl) {
        const containerRect = containerEl.getBoundingClientRect();
        const tabRect = activeTabEl.getBoundingClientRect();

        setIndicatorStyle({
          left: tabRect.left - containerRect.left,
          width: tabRect.width,
        });
      }
    };

    updateIndicatorPosition();

    window.addEventListener('resize', updateIndicatorPosition);
    return () => window.removeEventListener('resize', updateIndicatorPosition);
  }, [activeTab]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, currentIndex: number) => {
      const enabledTabs = tabs.filter((tab) => !tab.disabled);
      const currentEnabledIndex = enabledTabs.findIndex(
        (tab) => tab.id === tabs[currentIndex].id,
      );

      let nextIndex: number | null = null;

      switch (event.key) {
        case 'ArrowLeft':
          nextIndex =
            currentEnabledIndex > 0
              ? currentEnabledIndex - 1
              : enabledTabs.length - 1;
          break;
        case 'ArrowRight':
          nextIndex =
            currentEnabledIndex < enabledTabs.length - 1
              ? currentEnabledIndex + 1
              : 0;
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = enabledTabs.length - 1;
          break;
        default:
          return;
      }

      if (nextIndex !== null) {
        event.preventDefault();
        const nextTab = enabledTabs[nextIndex];
        onTabChange(nextTab.id);
        tabRefs.current.get(nextTab.id)?.focus();
      }
    },
    [tabs, onTabChange],
  );

  return (
    <LayoutGroup>
      {/* Glass morphic container */}
      <div
        ref={containerRef}
        className={cn(
          'relative inline-flex items-center',
          'rounded-lg border shadow-sm backdrop-blur-xl',
          'border-white/30 bg-white/30 dark:bg-gray-900/30',
          sizeClasses[size].container,
          className,
        )}
        role='tablist'
        aria-orientation='horizontal'
      >
        {/* Animated sliding indicator */}
        <motion.div
          className={cn(
            'absolute rounded-md',
            'border border-white/30 bg-white/20 backdrop-blur-sm',
          )}
          style={{
            height: 'calc(100% - 8px)',
            top: 4,
          }}
          initial={false}
          animate={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 35,
          }}
        />

        {/* Tab buttons */}
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeTab;

          return (
            <motion.button
              key={tab.id}
              ref={(el) => {
                if (el) {
                  tabRefs.current.set(tab.id, el);
                } else {
                  tabRefs.current.delete(tab.id);
                }
              }}
              type='button'
              role='tab'
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              aria-disabled={tab.disabled}
              tabIndex={isActive ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => !tab.disabled && onTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={cn(
                'relative z-10 flex items-center gap-2 rounded-md font-medium transition-colors',
                sizeClasses[size].tab,
                isActive
                  ? 'font-semibold text-gray-950'
                  : 'text-gray-800 hover:text-gray-950',
                tab.disabled && 'cursor-not-allowed opacity-50',
              )}
              whileHover={!tab.disabled && !isActive ? { scale: 1.02 } : {}}
              whileTap={!tab.disabled ? { scale: 0.98 } : {}}
            >
              {/* Tab icon */}
              {tab.icon && (
                <span
                  className={cn(
                    sizeClasses[size].icon,
                    isActive ? 'text-gray-950' : 'text-gray-800',
                  )}
                >
                  {tab.icon}
                </span>
              )}

              {/* Tab label */}
              <span>{tab.label}</span>
            </motion.button>
          );
        })}
      </div>
    </LayoutGroup>
  );
};

export default LiquidGlassTabs;
