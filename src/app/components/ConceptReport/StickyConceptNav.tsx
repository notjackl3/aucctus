import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@libs/utils/react';
import type { ConceptTab } from './ConceptNavigation';

interface StickyConceptNavProps {
  sentinelRef: React.RefObject<HTMLElement | null>;
  tabs: ConceptTab[];
  conceptImage?: string;
  conceptTitle?: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const StickyConceptNav: React.FC<StickyConceptNavProps> = ({
  sentinelRef,
  tabs,
  conceptImage,
  conceptTitle,
  activeTab,
  onTabChange,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<Element | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
  }, [conceptImage]);

  // Filter tabs before effects so they can reference the filtered list
  const mainTabs = useMemo(() => tabs.filter((t) => t.label), [tabs]);
  const actionTabs = useMemo(() => tabs.filter((t) => !t.label), [tabs]);

  useEffect(() => {
    if (!isVisible) return;
    // 50ms delay so flex layout fully settles after visibility change
    const timerId = setTimeout(() => {
      const activeIndex = mainTabs.findIndex((t) => t.value === activeTab);
      if (activeIndex === -1) return;
      const el = tabRefs.current[activeIndex];
      if (el && tabsContainerRef.current) {
        const containerRect = tabsContainerRef.current.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        setIndicatorStyle({
          left: elRect.left - containerRect.left,
          width: elRect.width,
        });
      }
    }, 50);
    return () => clearTimeout(timerId);
  }, [activeTab, isVisible, mainTabs]);

  // Use IntersectionObserver to detect when the sentinel scrolls out of view
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setIsVisible(!entry.isIntersecting),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [sentinelRef]);

  // Measure nav drawer width for positioning
  useEffect(() => {
    const scrollContainer = document.querySelector('[data-scroll-container]');
    scrollContainerRef.current = scrollContainer;
    if (!scrollContainer) return;

    const updateNavWidth = () => {
      if (scrollContainer.previousElementSibling) {
        setSidebarWidth(
          scrollContainer.previousElementSibling.getBoundingClientRect().width,
        );
      }
    };
    updateNavWidth();

    const observer = new ResizeObserver(() => updateNavWidth());
    if (scrollContainer.previousElementSibling) {
      observer.observe(scrollContainer.previousElementSibling);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -48, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className='fixed top-3 z-50'
          style={{ left: sidebarWidth + 48, right: 24 }}
        >
          <div className='sticky-concept-nav flex max-w-7xl items-center gap-0 rounded-xl'>
            {/* Concept image flush left */}
            {conceptImage && (
              <div className='aucctus-bg-secondary h-12 w-16 flex-shrink-0 overflow-hidden rounded-l-xl'>
                <img
                  src={conceptImage}
                  alt={conceptTitle}
                  className={cn(
                    'h-full w-full object-cover transition-opacity duration-300',
                    {
                      'opacity-0': !imageLoaded,
                      'opacity-100': imageLoaded,
                    },
                  )}
                  loading='eager'
                  onLoad={() => setImageLoaded(true)}
                />
              </div>
            )}

            {/* Title + tabs */}
            <div className='flex min-w-0 flex-1 items-center gap-3 px-4 py-2'>
              <span className='aucctus-text-brand-primary whitespace-nowrap text-base font-bold tracking-tight'>
                {conceptTitle}
              </span>
              <div className='aucctus-border-secondary h-5 w-px' />

              {/* Main tab buttons with sliding indicator */}
              <div
                ref={tabsContainerRef}
                className='no-scrollbar relative flex flex-1 items-center gap-0.5 overflow-x-auto py-0.5'
              >
                <motion.div
                  className='concept-nav-indicator absolute bottom-0.5 top-0.5 rounded-md'
                  initial={false}
                  animate={{
                    left: indicatorStyle.left,
                    width: indicatorStyle.width,
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />

                {mainTabs.map((tab, index) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.value;
                  return (
                    <button
                      key={tab.value}
                      ref={(el) => {
                        tabRefs.current[index] = el;
                      }}
                      onClick={() => onTabChange(tab.value)}
                      className={cn(
                        'relative z-10 flex items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-wide outline-none transition-colors duration-200',
                        isActive
                          ? 'aucctus-text-brand-primary font-semibold'
                          : 'aucctus-text-tertiary hover:aucctus-text-secondary',
                      )}
                    >
                      <Icon className='h-3 w-3' />
                      <span className='hidden md:inline'>{tab.label}</span>
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

              {/* Action buttons pushed far right */}
              {actionTabs.length > 0 && (
                <div className='ml-auto flex flex-shrink-0 items-center gap-0.5'>
                  {actionTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.value;
                    return (
                      <button
                        key={tab.value}
                        onClick={(e) =>
                          tab.onAction
                            ? tab.onAction(e)
                            : onTabChange(tab.value)
                        }
                        className={cn(
                          'relative z-10 flex items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-wide outline-none transition-colors duration-200',
                          isActive
                            ? 'aucctus-text-brand-primary font-semibold'
                            : 'aucctus-text-tertiary hover:aucctus-text-secondary',
                        )}
                      >
                        <Icon className='h-3 w-3' />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyConceptNav;
