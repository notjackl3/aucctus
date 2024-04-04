import { FunctionComponent } from 'react';

import styles from '../styles/concepts.module.scss';
import StatusButton from '../../../components/StatusButton';
import { snakeCaseToTitleCase } from '../../../../libs/utils';
import { CONCEPT_STATUS_LIST_MAP } from '../Concepts';
import TablePagination from '../../../components/TablePagination';
import { ConceptCategory, ConceptStatus } from '../../../../libs/api/typings';

interface IConceptContainerProps {
  children?: React.ReactNode;
  category: ConceptCategory | null;
  categoryCount: number;
  numberOfPages: number;
  page: number | string;
  status: ConceptStatus;
  setPage: (page: number) => void;
  setStatusFilter: (status?: ConceptStatus) => void;
  showStatusFilter?: boolean;
}

const ConceptContainer: FunctionComponent<IConceptContainerProps> = ({
  children,
  category,
  categoryCount,
  page,
  setPage,
  numberOfPages,
  setStatusFilter,
  status,
  showStatusFilter = true,
}) => {
  return (
    <div className={styles.content}>
      <div className={styles.header}>
        <div className={styles.filters}>
          <StatusButton
            statusName={`All ${category}`}
            quantity={categoryCount}
            isActive={true}
            activateFilter={() => setStatusFilter(undefined)}
          />
          <>
            {showStatusFilter &&
              category &&
              CONCEPT_STATUS_LIST_MAP[category].map((label, index) => (
                <StatusButton
                  key={`status-button-${index}`}
                  isActive={label === status}
                  statusName={snakeCaseToTitleCase(label)}
                  quantity={1}
                  activateFilter={() => setStatusFilter(label)}
                />
              ))}
          </>
        </div>
      </div>
      {children}
      <div className={styles.footer}>
        <TablePagination
          variant="server"
          totalPages={numberOfPages || 1}
          page={typeof page === 'string' ? parseInt(page) : page}
          setPage={setPage}
        />
      </div>
    </div>
  );
};

export default ConceptContainer;
