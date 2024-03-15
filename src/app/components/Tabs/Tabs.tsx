import { FunctionComponent, ReactElement } from 'react';
import styles from './styles/tabs.module.scss';
import Tab from '../Tab/Tab';
import TabButton from '../TabButton/TabButton';

export interface TabElement {
  label: string;
}

export interface TabsProps {
  tabs: TabElement[];
  className?: string;
  tabClassName?: string;
  children: ReactElement[] | ReactElement;
  isButtonStyle?: boolean;
  selectActiveTab: (index: number) => void;
  activeTabIndex: number;
}

const Tabs: FunctionComponent<TabsProps> = ({
  tabs,
  children,
  className,
  isButtonStyle,
  tabClassName,
  activeTabIndex,
  selectActiveTab,
}) => {
  if (!Array.isArray(children)) {
    children = [children];
  }

  return (
    <div className={`${styles.tabs} ${className}`}>
      <div className={`${styles.list}`}>
        {tabs?.map((tab, index) =>
          !isButtonStyle ? (
            <Tab
              selectTab={() => selectActiveTab(index)}
              activeTab={activeTabIndex}
              tabIndex={index}
              key={tab.label}
              className={tabClassName}
              label={tab.label}
            />
          ) : (
            <TabButton
              selectTab={() => selectActiveTab(index)}
              activeTab={activeTabIndex}
              tabIndex={index}
              key={tab.label}
              label={tab.label}
            />
          )
        )}
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
