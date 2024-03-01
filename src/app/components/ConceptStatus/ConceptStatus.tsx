import { FunctionComponent } from 'react';

import styles from './styles/conceptStatus.module.scss';
import { ConceptStatus as ConceptStatusType } from '../../../libs/api/typings';
import { snakeCaseToTitleCase } from '../../../libs/utils';

export interface IConceptStatusProps {
  status: ConceptStatusType;
  color: 'red' | 'green' | 'blue' | 'pink' | 'purple';
}

const ConceptStatus: FunctionComponent<IConceptStatusProps> = ({ status, color }) => {
  return (
    <div className={`${styles.conceptStatus} ${styles[`${color}Background`]}`}>
      <span className={styles[`${color}Bullet`]}>●</span>
      <span className={`${styles.status} ${styles[`${color}Status`]}`}>{snakeCaseToTitleCase(status)}</span>
    </div>
  );
};

export default ConceptStatus;
