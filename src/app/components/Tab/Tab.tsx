import { FunctionComponent } from 'react';
import styles from './styles/tab.module.scss';

export interface TabProps {
  selectTab: () => void;
  label: string;
  tabIndex: number;
  activeTab: number;
}

const Tab: FunctionComponent<TabProps> = ({ selectTab, label, activeTab, tabIndex }) => {
  const isTabActive = activeTab === tabIndex;

  const activeClassName = isTabActive ? styles.active : '';

  return (
    <li className={`${styles.tab} ${activeClassName}`}>
      <button className={styles.button} onClick={selectTab} />
      <span className={`${styles.label} ${activeClassName}`}>{label}</span>
    </li>
  );
};

export default Tab;
