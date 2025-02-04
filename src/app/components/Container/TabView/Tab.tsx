import { FunctionComponent, ReactNode } from 'react';
import styles from './styles/tab.module.scss';

export type TabVariant = 'default' | 'button' | 'button-separated';
export interface ITabProps<T = string> {
  /**
   * The value the will be used when the tab is selected


   */
  value: T;
  onSelect: (value: T) => void;
  label: string | ReactNode;
  isActive: boolean;
  className?: string;
  /**
   * The variant of the tab for different styles
   */
  variant?: 'default' | 'button' | 'button-separated';
}

function getTabStyle(variant: TabVariant) {
  switch (variant) {
    case 'button':
      return styles.tabButton;
    case 'button-separated':
      return styles.tabButtonSeparated;
    default:
      return styles.tab;
  }
}

const Tab: FunctionComponent<ITabProps> = ({
  label,
  value,
  isActive,
  className,
  onSelect,
  variant = 'default',
}) => {
  const activeClassName = isActive ? styles.active : '';
  const tabStyle = getTabStyle(variant);

  return (
    <li
      className={`${tabStyle} ${activeClassName} ${className}`}
      onClick={(e) => {
        e.preventDefault();
        onSelect(value);
      }}
    >
      <span className={`${styles.label} ${activeClassName}`}>{label}</span>
    </li>
  );
};

export default Tab;
