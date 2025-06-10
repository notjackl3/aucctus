import { FunctionComponent, ReactNode } from 'react';
import Tab from './Tab';
import { cn } from '@libs/utils/react';

export interface TabElement {
  label: string | ReactNode;
  /**
   * Value be Unique. This is used to tell us which tab is active
   *
   */
  value: string;
}

export interface TabsProps {
  tabs: TabElement[];
  className?: string;
  tabGroupClassName?: string;
  tabClassName?: string;
  tabContainerClassName?: string;
  tabContentClassName?: string;
  variant?: 'default' | 'button' | 'button-separated';
  onTabSelect: (value: string) => void;
  children?: ReactNode;
  actionButtons?: ReactNode | ReactNode[];
  activeTab: string;
}

const TabView: FunctionComponent<TabsProps> = ({
  tabs,
  children,
  className = '',
  variant = 'default',
  tabClassName = '',
  tabGroupClassName = '',
  tabContainerClassName = '',
  tabContentClassName = '',
  actionButtons,
  activeTab,
  onTabSelect,
}) => {
  return (
    <div
      className={cn(
        'flex h-full w-full flex-col items-center self-stretch',
        className,
      )}
    >
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
          {tabs.map((tab, index) => (
            <Tab
              key={`tab-label-${index}`}
              className={tabClassName}
              label={tab.label}
              value={tab.value}
              variant={variant}
              isActive={activeTab === tab.value}
              onSelect={onTabSelect}
            />
          ))}
        </div>
        {actionButtons ? (
          <div className='ml-4 mr-2 flex flex-row items-center gap-4'>
            {actionButtons}
          </div>
        ) : null}
      </div>
      <div
        className={cn(
          'flex h-full w-full items-center justify-center',
          tabContentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default TabView;
