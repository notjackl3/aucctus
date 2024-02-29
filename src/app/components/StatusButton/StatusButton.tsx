import { FunctionComponent } from 'react';

import styles from './styles/statusButton.module.scss';
import { StatusButtonProps } from './StatusButton.types';
import useStatusButton from './hooks/useStatusButton';

const StatusButton: FunctionComponent<StatusButtonProps> = ({ statusName, isActive, quantity, activateFilter }) => {
  const { activeClassName, activeBadgeClassName, activeStatusClassName } = useStatusButton({ isActive });

  return (
    <button className={`${styles.statusButton} ${activeClassName}`} onClick={activateFilter}>
      <span className={`${styles.statusName} ${activeStatusClassName}`}>{statusName}</span>
      <div className={`${styles.badge} ${activeBadgeClassName}`}>
        <span className={styles.quantity}>{quantity}</span>
      </div>
    </button>
  );
};

export default StatusButton;
