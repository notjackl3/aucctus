import { FunctionComponent } from 'react';

import styles from './styles/generalBadge.module.scss';

export interface GeneralBadgeProps {
  badgeClassName?: string;
  bulletClassName?: string;
  badgeText: string;
}

const GeneralBadge: FunctionComponent<GeneralBadgeProps> = ({ badgeClassName, bulletClassName, badgeText }) => {
  return (
    <div className={`${styles.generalBadge} ${badgeClassName ? badgeClassName : ''}`}>
      <span className={`${styles.bullet} ${bulletClassName ? bulletClassName : ''}`}>●</span>
      <span className={styles.badgeText}>{badgeText}</span>
    </div>
  );
};

export default GeneralBadge;
