import { FunctionComponent } from 'react';

import styles from './styles/conceptCard.module.scss';
import Icon from '../Icon';
import { IConcept } from '../../../libs/api/typings';
import { dateCellFormatter } from '../../../libs/utils';

export interface IConceptCardProps {
  concept: IConcept;
  selectCard: (id: string) => void;
}

const defaultIconProps = {
  height: 15,
  width: 15,
  stroke: '#FFFFFF',
};

const ConceptCard: FunctionComponent<IConceptCardProps> = ({ concept, selectCard }) => {
  return (
    <div className={`${styles.conceptCard}`}>
      <div className={styles.conceptCardContent}>
        <div className={styles.cardTitle}>{concept?.title}</div>
        <p className={`${styles.cardDescription} ${styles.desccriptionOverflow}`}>{concept?.description}</p>
        <p className={styles.cardModified}>Last modified: {dateCellFormatter(concept?.updatedAt)}</p>
      </div>
      <div className={styles.footer}>
        <div className={styles.owner}>
          <p className={styles.ownerText}>Owner: {concept?.createdBy}</p>
        </div>
        <button
          className={`${styles.cardButton} btn btn-primary`}
          onClick={() => {
            selectCard(concept.uuid);
          }}
          aria-label="Open Concept Details"
        >
          <Icon variant="chevronRight" {...defaultIconProps} />
        </button>
      </div>
    </div>
  );
};

export default ConceptCard;
