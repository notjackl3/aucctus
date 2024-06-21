import React, { FunctionComponent, ReactNode } from 'react';

import styles from './ignite-form.module.scss';
import FeatureIcon from '../../Icons/FeatureIcon';

interface IIgniteForm {
  title: string;
  subtitle: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
}

const IgniteForm: FunctionComponent<IIgniteForm> = ({ title, subtitle, children, onSubmit }) => {
  return (
    <form className={styles.container} onSubmit={onSubmit}>
      <div className={styles.header}>
        <FeatureIcon icon='lightbulb' color='purple' />
        <div className={styles.supportingText}>
          <h1 className={styles.title}>{title}</h1>
          <span className={styles.subtitle}>{subtitle}</span>
        </div>
      </div>
      <div className={styles.content}>{children}</div>
    </form>
  );
};

export default IgniteForm;
