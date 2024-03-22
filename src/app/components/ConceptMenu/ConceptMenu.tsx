import { FunctionComponent } from 'react';

import styles from './styles/conceptMenu.module.scss';
import useConceptMenu from './hooks/useConceptMenu';

export interface ConceptMenuProps {
  conceptId: string;
  clearConceptMenuId: () => void;
}

export enum ConceptStatus {
  new = 'new',
  ideating = 'ideating',
  inReview = 'in_review',
  prototyping = 'prototyping',
  proofOfConcept = 'proof_of_concept',
  minimumViableProduct = 'minimum_viable_product',
  commercialized = 'commercialized',
  archived = 'archived',
}

const ConceptMenu: FunctionComponent<ConceptMenuProps> = ({ conceptId, clearConceptMenuId }) => {
  const { updateConceptStatus } = useConceptMenu({ conceptId });

  return (
    <div className={styles.conceptMenu}>
      <button
        className={styles.button}
        onClick={(e) => {
          e.stopPropagation();
          clearConceptMenuId();
          updateConceptStatus(ConceptStatus.archived);
        }}
      >
        Archive concept
      </button>
    </div>
  );
};

export default ConceptMenu;
