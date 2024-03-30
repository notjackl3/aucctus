import { FunctionComponent } from 'react';

import styles from './styles/conceptStatus.module.scss';
import { ConceptStatus as ConceptStatusType } from '../../../libs/api/typings';
import { snakeCaseToTitleCase } from '../../../libs/utils';

export interface IConceptStatusProps {
  status: ConceptStatusType;
}

const ConceptStatusBubble: FunctionComponent<IConceptStatusProps> = ({ status }) => {
  const statusColorObj = {
    new: 'blue',
    ideating: 'blue',
    in_review: 'blue',
    commercialized: 'green',
    prototyping: 'purple',
    proof_of_concept: 'purple',
    minimum_viable_product: 'pink',
    archived: 'red',
  };

  const color = statusColorObj[status];

  return (
    <div className={`${styles.conceptStatus} ${styles[`${color}Background`]}`}>
      <span className={styles[`${color}Bullet`]}>●</span>
      <span className={`${styles.status} ${styles[`${color}Status`]}`}>{snakeCaseToTitleCase(status)}</span>
    </div>
  );
};

export default ConceptStatusBubble;
