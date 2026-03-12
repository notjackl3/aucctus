import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { motion } from 'framer-motion';
import { cn } from '@libs/utils/react';

export interface ConceptTab {
  label: string;
  value: string;
  icon: React.FC<{ className?: string }>;
  isLoading?: boolean;
  onAction?: (e: React.MouseEvent) => void;
}

interface ConceptNavigationProps {
  tabs: ConceptTab[];
  activeTab: string;
  onTabSelect: (value: string) => void;
  className?: string;
}

const ConceptNavigation: React.FC<ConceptNavigationProps> = ({
  tabs,
  activeTab,
  onTabSelect,
  className,
}) => {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // Tabs that participate in the sliding indicator (exclude action-only tabs)
  const navigableTabs = useMemo(() => tabs.filter((t) => !t.onAction), [tabs]);

  const measureIndicator = useCallback(() => {
    const activeIndex = navigableTabs.findIndex((t) => t.value === activeTab);
    const el = tabRefs.current[tabs.indexOf(navigableTabs[activeIndex])];
    const container = containerRef.current;
    if (el && container) {
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setIndicatorStyle({
        left: elRect.left - containerRect.left,
        width: elRect.width,
      });
    }
  }, [activeTab, tabs, navigableTabs]);

  // On tab/tabs change, defer one frame so flex layout is fully resolved
  useEffect(() => {
    const id = requestAnimationFrame(measureIndicator);
    return () => cancelAnimationFrame(id);
  }, [measureIndicator]);

  // Recalculate on container resize (window resize, sidebar toggle, etc.)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => measureIndicator());
    ro.observe(container);
    return () => ro.disconnect();
  }, [measureIndicator]);

  return (
    <div className={cn('mb-8 w-full', className)}>
      <div
        ref={containerRef}
        className='concept-nav-bar relative flex gap-0.5 rounded-lg px-1.5 py-1.5'
      >
        {/* Sliding indicator */}
        <motion.div
          className='concept-nav-indicator absolute bottom-1.5 top-1.5 rounded-lg'
          initial={false}
          animate={{ left: indicatorStyle.left, width: indicatorStyle.width }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />

        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              onClick={(e) =>
                tab.onAction ? tab.onAction(e) : onTabSelect(tab.value)
              }
              className={cn(
                'relative z-10 flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3.5 py-2 text-[11px] font-medium uppercase tracking-wide outline-none transition-colors duration-200',
                tab.label ? 'flex-1' : 'flex-shrink-0',
                isActive
                  ? 'text-foreground font-semibold'
                  : 'text-muted-foreground/70 hover:text-muted-foreground',
              )}
            >
              <Icon className='h-3 w-3' />
              {tab.label}
              {tab.isLoading && (
                <svg
                  className='pointer-events-none absolute inset-0 h-full w-full overflow-visible'
                  preserveAspectRatio='none'
                >
                  <rect
                    x='0.5'
                    y='0.5'
                    width='99%'
                    height='99%'
                    rx={6}
                    ry={6}
                    fill='none'
                    stroke='rgba(175, 20, 20, 0.5)'
                    strokeWidth={1}
                    pathLength={200}
                    strokeDasharray='20 180'
                    className='animate-stroke-trace'
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ConceptNavigation;
