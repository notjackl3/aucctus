import { FunctionComponent, ReactNode } from 'react';
import styles from './styles/tab.module.scss';

export interface TabProps {
  selectTab: () => void;
  label: string | ReactNode;
  tabIndex: number;
  activeTab: number;
  className?: string;
}

const Tab: FunctionComponent<TabProps> = ({ selectTab, label, activeTab, tabIndex, className }) => {
  const isTabActive = activeTab === tabIndex;

  const activeClassName = isTabActive ? styles.active : '';

  return (
    <li className={`${styles.tab} ${activeClassName} ${className}`}>
      <button className={styles.button} onClick={selectTab} />
      <span className={`${styles.label} ${activeClassName}`}>{label}</span>
    </li>
  );
};

export default Tab;
