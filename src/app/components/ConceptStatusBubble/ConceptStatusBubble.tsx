import { FunctionComponent } from 'react';

import styles from './styles/conceptStatus.module.scss';
import { ConceptStatus as ConceptStatusType } from '../../../libs/api/typings';
import { snakeCaseToTitleCase } from '../../../libs/utils';
import { getConceptStatusColor } from '../../../libs/concepts';

export interface IConceptStatusProps {
  status: ConceptStatusType;
}

const ConceptStatusBubble: FunctionComponent<IConceptStatusProps> = ({ status }) => {
  const color = getConceptStatusColor(status);

  return (
    <div className={`${styles.conceptStatus} ${styles[`${color}Background`]}`}>
      <span className={styles[`${color}Bullet`]}>●</span>
      <span className={`${styles.status} ${styles[`${color}Status`]}`}>{snakeCaseToTitleCase(status)}</span>
    </div>
  );
};

export default ConceptStatusBubble;
