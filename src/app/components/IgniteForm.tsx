import { FunctionComponent, ReactNode } from 'react';

import styles from '../assets/styles/pages/ignite.module.scss';
import FeatureIcon from './FeatureIcon';

interface IIgniteForm {
  title: string;
  subtitle: string;
  children: ReactNode;
}

const IgniteForm: FunctionComponent<IIgniteForm> = ({ title, subtitle, children }) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <FeatureIcon icon="file" color="purple" />
        <div className={styles.supportingText}>
          <h1 className={styles.title}>{title}</h1>
          <span className={styles.subtitle}>{subtitle}</span>
        </div>
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default IgniteForm;
