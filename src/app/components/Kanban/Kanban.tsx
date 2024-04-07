import { FunctionComponent } from 'react';

import styles from './styles/kanban.module.scss';
import ConceptCard from '../ConceptCard/ConceptCard';
import { camelCaseToTitleCase } from '../../../libs/utils';
import { ConceptStatus, IConcept } from '../../../libs/api/typings';

interface ConceptColumn {
  title: ConceptStatus;
  items: IConcept[];
}

export type ConceptColumns = {
  [key in ConceptStatus]: ConceptColumn;
};

export interface KanbanProps {
  kanbanColumns: ConceptColumns;
  selectCard: (id: string) => void;
}

const Kanban: FunctionComponent<KanbanProps> = ({ kanbanColumns, selectCard }) => {
  const renderColumnCards = (columnCardList: IConcept[]) => {
    return columnCardList.map((columnCard, index) => {
      return <ConceptCard key={`concept-card-${index}`} concept={columnCard} selectCard={selectCard} />;
    });
  };

  return (
    <div className={`${styles.kanban}`}>
      {Object.entries(kanbanColumns).map(([columnId, column], index) => {
        return (
          <div key={`column-${columnId}-${index}`} className={styles.column}>
            <div className={styles.columnHeader}>
              <div className={styles.columnHeaderTitle}>{camelCaseToTitleCase(column?.title)}</div>
              <div className={styles.columnHeaderCount}>{column?.items?.length}</div>
            </div>
            {renderColumnCards(column?.items)}
          </div>
        );
      })}
    </div>
  );
};

export default Kanban;
