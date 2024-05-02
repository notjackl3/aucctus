import { FunctionComponent, ReactNode } from 'react';
import styles from './styles/tabs.module.scss';
import Tab from './Tab';

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
  tabClassName?: string;
  variant?: 'default' | 'button';
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
  actionButtons,
  activeTab,
  onTabSelect,
}) => {
  return (
    <div className={`${styles.tabView} ${className}`}>
      <div className={styles.tabContainer}>
        <div className={`${styles.tabs}`}>
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
        {actionButtons ? <div className={styles.actionButtons}>{actionButtons}</div> : null}
      </div>
      {children}
    </div>
  );
};

export default TabView;
