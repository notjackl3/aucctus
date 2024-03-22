import { FunctionComponent } from 'react';

import styles from './styles/conceptStatistic.module.scss';
import Icon, { IconVariant } from '../Icon';

export interface IConceptStatusProps {
  icon: keyof typeof IconVariant;
  iconColor: 'lightblue' | 'blue' | 'purple';
  infoTitle: string;
  infoValue: string;
}

const defaultIconProps = {
  height: 24,
  width: 24,
  stroke: '#155eef',
};

const ConceptStatistic: FunctionComponent<IConceptStatusProps> = ({ infoTitle, infoValue, iconColor, icon }) => {
  return (
    <div className={`${styles.conceptStatistic}`}>
      <span className={`${styles.conceptIcon} ${styles[`${iconColor}Icon`]}`}>
        <Icon variant={icon} {...defaultIconProps} />
      </span>
      <div className={styles.conceptInfo}>
        <div className={styles.conceptInfoTitle}>{infoTitle}</div>
        <div className={styles.conceptData}>
          <span className={styles.conceptDataNumber}>{infoValue}</span>
        </div>
      </div>
    </div>
  );
};

export default ConceptStatistic;
