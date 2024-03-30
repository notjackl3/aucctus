import { FunctionComponent, ReactNode, useState } from 'react';
import styles from './styles/tabs.module.scss';
import Tab from './Tab';

export interface TabElement<T = string> {
  label: string | ReactNode;
  value: T;
}

export interface TabsProps<T = string> {
  tabs: TabElement[];
  className?: string;
  tabClassName?: string;
  variant?: 'default' | 'button';
  onTabSelect: (value: T) => void;
  children?: ReactNode;
  defaultTab: T;
}

const TabView: FunctionComponent<TabsProps> = ({
  tabs,
  children,
  className,
  variant = 'default',
  tabClassName,
  defaultTab,
  onTabSelect,
}) => {
  const [activeValue, setActiveValue] = useState(defaultTab);

  const handleTabSelect = (value: string) => {
    setActiveValue(value);
    onTabSelect(value);
  };

  return (
    <div className={`${styles.tabs} ${className}`}>
      <div className={`${styles.list}`}>
        {tabs.map((tab, index) => (
          <Tab
            key={`tab-label-${index}`}
            className={tabClassName}
            label={tab.label}
            value={tab.value}
            variant={variant}
            isActive={activeValue === tab.value}
            onSelect={handleTabSelect}
          />
        ))}
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default TabView;
