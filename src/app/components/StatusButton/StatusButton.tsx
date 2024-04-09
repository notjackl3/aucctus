import { FunctionComponent } from 'react';

import styles from './styles/statusButton.module.scss';
import useStatusButton from './hooks/useStatusButton';
interface StatusButtonProps {
  statusName: string;
  quantity?: number;
  isActive?: boolean;
  activateFilter: () => void;
}

const StatusButton: FunctionComponent<StatusButtonProps> = ({ statusName, isActive, quantity, activateFilter }) => {
  const { activeClassName, activeBadgeClassName, activeStatusClassName } = useStatusButton({ isActive });

  return (
    <button className={`${styles.statusButton} ${activeClassName}`} onClick={activateFilter}>
      <span className={`${styles.statusName} ${activeStatusClassName}`}>{statusName}</span>
      {!!quantity && (
        <div className={`${styles.badge} ${activeBadgeClassName}`}>
          <span className={styles.quantity}>{quantity}</span>
        </div>
      )}
    </button>
  );
};

export default StatusButton;
