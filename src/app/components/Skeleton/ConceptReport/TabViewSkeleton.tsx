import React from 'react';
import { cn } from '@libs/utils/react';
import SkeletonBlock from './SkeletonBlock';

interface TabSkeletonConfig {
  /**
   * Width class for the tab label text (e.g., 'w-24', 'w-32', 'w-40')
   */
  textWidth: string;
}

interface TabViewSkeletonProps {
  /**
   * Configuration for each tab skeleton
   * Defaults to 2 tabs with medium widths if not provided
   */
  tabs?: TabSkeletonConfig[];
  /**
   * Optional className for the outer wrapper (mirrors TabView's className prop)
   */
  className?: string;
  /**
   * Optional className for the tab group container (mirrors TabView's tabGroupClassName prop)
   */
  tabGroupClassName?: string;
  /**
   * Optional className for the tab container (mirrors TabView's tabContainerClassName prop)
   */
  tabContainerClassName?: string;
  /**
   * Optional className for each tab (mirrors TabView's tabClassName prop)
   */
  tabClassName?: string;
  /**
   * Whether to include the outer wrapper div
   * Set to false if you're only showing tabs without the full TabView structure
   * Defaults to true
   */
  includeWrapper?: boolean;
}

/**
 * Reusable skeleton component for TabView
 * Mirrors the structure and styling of the real TabView component
 */
const TabViewSkeleton: React.FC<TabViewSkeletonProps> = ({
  tabs = [{ textWidth: 'w-32' }, { textWidth: 'w-24' }],
  className = '',
  tabGroupClassName = 'pointer-events-auto flex flex-1',
  tabContainerClassName = 'flex flex-1 items-center justify-center',
  tabClassName = '',
  includeWrapper = true,
}) => {
  const tabGroupContent = (
    <div
      className={cn(
        'flex flex-row items-start justify-between self-stretch overflow-x-auto overflow-y-hidden py-4',
        tabGroupClassName,
      )}
    >
      <div
        className={cn(
          'flex list-none items-center justify-start pl-0',
          tabContainerClassName,
        )}
      >
        {tabs.map((tab, index) => {
          // Determine border radius based on position
          const isFirst = index === 0;
          const isLast = index === tabs.length - 1;
          const borderRadiusClass = isFirst
            ? 'rounded-l-lg'
            : isLast
              ? 'rounded-r-lg'
              : '';

          return (
            <li
              key={`tab-skeleton-${index}`}
              className={cn(
                // Base tabButton styles from tab.module.scss
                'relative box-border flex h-8 min-h-10 flex-1 shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap px-4 py-2',
                'border-b border-r border-t',
                borderRadiusClass,
                // First and last child border styles
                {
                  'aucctus-bg-primary border-b border-r border-t': !isFirst,
                  'aucctus-border-secondary aucctus-bg-secondary border':
                    isFirst,
                  'aucctus-border-secondary border-r': isLast,
                },
                tabClassName,
              )}
            >
              <span className='aucctus-text-brand-tertiary aucctus-text-sm-bold flex items-center gap-2'>
                {/* Icon skeleton */}
                <SkeletonBlock className='h-4 w-4 rounded' />
                {/* Text label skeleton */}
                <SkeletonBlock className={`h-4 ${tab.textWidth}`} />
              </span>
            </li>
          );
        })}
      </div>
    </div>
  );

  if (!includeWrapper) {
    return tabGroupContent;
  }

  return (
    <div
      className={cn(
        'flex h-full w-full flex-col items-center self-stretch',
        className,
      )}
    >
      {tabGroupContent}
    </div>
  );
};

export default TabViewSkeleton;
