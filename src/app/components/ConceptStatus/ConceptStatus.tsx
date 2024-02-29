import { FunctionComponent } from 'react';

import styles from './styles/conceptStatus.module.scss';
import { BulletColorTypes, ConceptStatusProps, StatusColorTypes, BackgroundColorTypes } from './ConceptStatus.types';

const ConceptStatus: FunctionComponent<ConceptStatusProps> = ({ status, color }) => {
  const statusColorStyleObj: StatusColorTypes = {
    red: 'statusRed',
    green: 'statusGreen',
    blue: 'statusBlue',
    pink: 'statusPink',
    purple: 'statusPurple',
  };

  const bulletColorStyleObj: BulletColorTypes = {
    red: 'bulletRed',
    green: 'bulletGreen',
    blue: 'bulletBlue',
    pink: 'bulletPink',
    purple: 'bulletPurple',
  };

  const backgroundColorStylesObj: BackgroundColorTypes = {
    red: 'backgroundRed',
    green: 'backgroundGreen',
    blue: 'backgroundBlue',
    pink: 'backgroundPink',
    purple: 'backgroundPurple',
  };

  return (
    <div className={`${styles.conceptStatus} ${styles[backgroundColorStylesObj[color]]}`}>
      <span className={styles[bulletColorStyleObj[color]]}>●</span>
      <span className={`${styles.status} ${styles[statusColorStyleObj[color]]}`}>{status}</span>
    </div>
  );
};

export default ConceptStatus;
