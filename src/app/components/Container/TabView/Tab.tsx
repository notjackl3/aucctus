import { FunctionComponent, ReactNode } from 'react';
import styles from './styles/tab.module.scss';
import { Icon } from '@components';

export type TabVariant =
  | 'default'
  | 'button'
  | 'button-separated'
  | 'icon-button';
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
   * Optional icon variant to display with the tab label
   */
  icon?: IconVariant;
  /**
   * The variant of the tab for different styles
   */
  variant?: 'default' | 'button' | 'button-separated' | 'icon-button';
}

function getTabStyle(variant: TabVariant) {
  switch (variant) {
    case 'button':
      return styles.tabButton;
    case 'button-separated':
      return styles.tabButtonSeparated;
    case 'icon-button':
      return styles.tabIconButton;
    default:
      return styles.tab;
  }
}

const Tab: FunctionComponent<ITabProps> = ({
  label,
  value,
  isActive,
  className,
  icon,
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
      {icon && variant === 'icon-button' && (
        <Icon variant={icon} className='h-4 w-4' />
      )}
      <span className={`${styles.label} ${activeClassName}`}>{label}</span>
    </li>
  );
};

export default Tab;
