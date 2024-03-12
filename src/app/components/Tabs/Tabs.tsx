import { FunctionComponent, ReactElement, useState } from 'react';
import styles from './styles/tabs.module.scss';
import Tab from '../Tab/Tab';

export interface TabElement {
  label: string;
}

export interface TabsProps {
  tabs: TabElement[];
  className?: string;
  children: ReactElement[];
}

const Tabs: FunctionComponent<TabsProps> = ({ tabs, children, className }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  return (
    <div className={`${styles.tabs} ${className}`}>
      <div className={styles.list}>
        {tabs?.map((tab, index) => (
          <Tab
            selectTab={() => setActiveTabIndex(index)}
            activeTab={activeTabIndex}
            tabIndex={index}
            key={tab.label}
            label={tab.label}
          />
        ))}
      </div>
      <div className={styles.content}>
        {children?.map((child, index) => {
          if (index !== activeTabIndex) return undefined;
          return child;
        })}
      </div>
    </div>
  );
};

export default Tabs;
