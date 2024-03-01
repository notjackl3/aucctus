import styles from '../styles/statusButton.module.scss';

type useStatusButtonProps = {
  isActive?: boolean;
};

const useStatusButton = ({ isActive }: useStatusButtonProps) => {
  const activeClassName = isActive ? styles.active : '';
  const activeBadgeClassName = isActive ? styles.activeBadge : '';
  const activeStatusClassName = isActive ? styles.activeStatusName : '';
  return {
    activeClassName,
    activeBadgeClassName,
    activeStatusClassName,
  };
};

export default useStatusButton;
