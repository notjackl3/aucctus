import { FunctionComponent } from 'react';

import styles from './styles/popupMenu.module.scss';
import usePopupMenu from './hooks/usePopupMenu';

export interface PopupMenuProps {
  conceptId: string;
  clearPopupMenuId: () => void;
}

export enum ConceptStatus {
  ideating = 'ideating',
  inReview = 'in_review',
  prototyping = 'prototyping',
  proofOfConcept = 'proof_of_concept',
  minimumViableProduct = 'minimum_viable_product',
  commercialized = 'commercialized',
  archived = 'archived',
}

const PopupMenu: FunctionComponent<PopupMenuProps> = ({ conceptId, clearPopupMenuId }) => {
  const { updateConceptStatus } = usePopupMenu({ conceptId });

  return (
    <div className={styles.popupMenu}>
      <button
        className={styles.button}
        onClick={() => {
          clearPopupMenuId();
          updateConceptStatus(ConceptStatus.archived);
        }}
      >
        Archive concept
      </button>
    </div>
  );
};

export default PopupMenu;
