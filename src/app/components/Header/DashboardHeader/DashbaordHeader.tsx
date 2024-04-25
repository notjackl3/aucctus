import { FunctionComponent } from 'react';
import defaultAvatar from '../assets/company-avatar.svg';
import styles from '../assets/styles/pages/dashboard.module.scss';

interface DashboardHeaderProps {
  title: string;
  supportingText: string;
  avatar?: string;
}

const DashboardHeader: FunctionComponent<DashboardHeaderProps> = ({
  title,
  supportingText,
  avatar = defaultAvatar,
}) => {
  return (
    <div className={styles.header}>
      <img className={styles.avatar} alt={title} src={avatar} />
      <div className={styles.text}>
        <h1>{title}</h1>
        <span>{supportingText}</span>
      </div>

      <button className="btn btn-light disabled">Edit Inputs</button>
    </div>
  );
};

export default DashboardHeader;
