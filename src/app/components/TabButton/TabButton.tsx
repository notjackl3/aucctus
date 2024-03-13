import { FunctionComponent } from 'react';
import styles from './styles/tabButton.module.scss';

export interface TabButtonProps {
  selectTab: () => void;
  label: string;
  tabIndex: number;
  activeTab: number;
}

const TabButton: FunctionComponent<TabButtonProps> = ({ selectTab, label, activeTab, tabIndex }) => {
  const isTabActive = activeTab === tabIndex;

  const activeClassName = isTabActive ? styles.active : '';

  return (
    <li className={`${styles.tabButton} ${activeClassName}`}>
      <button className={styles.button} onClick={selectTab} />
      <span className={`${styles.label} ${activeClassName}`}>{label}</span>
    </li>
  );
};

export default TabButton;
