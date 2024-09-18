import { FunctionComponent } from 'react';

import styles from './confirmation-modal.module.scss';

interface IActionButton {
  title: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  variant:
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'warning'
    | 'success'
    | 'info'
    | 'light'
    | 'dark';
}

interface IConfirmationModalProps {
  title: string;
  subtitle?: string;

  actions: IActionButton[];
}

const ConfirmationModal: FunctionComponent<IConfirmationModalProps> = ({
  title,
  subtitle,
  actions,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className={styles.actions}>
        {actions.map((action, index) => (
          <button
            key={`confirmation-button-${index}`}
            className={`btn btn-${action.variant}`}
            onClick={action.onClick}
          >
            {action.title}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ConfirmationModal;
