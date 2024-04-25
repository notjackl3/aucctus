import { FunctionComponent } from 'react';

import styles from './conceptMenu.module.scss';
import { useConceptUpdate } from '../../../hooks/query/concepts.hook';
import { ConceptReportStatus, ConceptStatus } from '../../../../libs/api/types';

export interface ConceptMenuProps {
  uuid: string;
  status: ConceptStatus;
  reportStatus: ConceptReportStatus;
  onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
}

const ConceptMenu: FunctionComponent<ConceptMenuProps> = ({ uuid, status, reportStatus, onClick }) => {
  const { mutate: updateConcept } = useConceptUpdate();

  const text = status !== 'archived' ? 'Archive concept' : 'Unarchive concept';
  const unarchiveStatus: ConceptStatus = reportStatus !== 'notStarted' ? 'ideating' : 'new';

  return (
    <div className={styles.conceptMenu}>
      <button
        className={styles.button}
        onClick={(e) => {
          e.stopPropagation();
          onClick && onClick(e);
          updateConcept({
            uuid: uuid,
            status: status !== 'archived' ? 'archived' : unarchiveStatus,
          });
        }}
      >
        {text}
      </button>
    </div>
  );
};

export default ConceptMenu;
