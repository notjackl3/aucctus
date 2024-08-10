import { FunctionComponent } from 'react';
import styles from './styles/concepts.module.scss';

import { Icon, Table, Text } from '@components';
import { useConceptTable } from '@hooks/tables/concepts.hook';
import { ACTIVE_CONCEPT_STATUS_LIST, ARCHIVE_CONCEPT_STATUS_LIST, DRAFT_CONCEPT_STATUS_LIST } from '@libs/concepts';
import { AppPath } from '@routes/routes';
import { useNavigate } from 'react-router-dom';

export const CONCEPT_STATUS_LIST_MAP = {
  draft: DRAFT_CONCEPT_STATUS_LIST,
  active: ACTIVE_CONCEPT_STATUS_LIST,
  archive: ARCHIVE_CONCEPT_STATUS_LIST,
};

const Concepts: FunctionComponent = () => {
  const navigate = useNavigate();

  const { table, page, setPage, numberOfPages, isLoading, searchParam, setSearchParam } = useConceptTable();

  return (
    <div className={styles.contentList}>
      <div className={styles.headerSection}>
        <div className={styles.header}>
          <h1>{`Concepts`}</h1>
        </div>
        <div className={styles.actions}>
          <button
            className={`btn btn-primary ${styles.button}`}
            onClick={() => {
              navigate(AppPath.IgniteConcept);
            }}
          >
            <Icon.Variant variant='rocket' height={20} width={20} />
            Add Concept
          </button>
        </div>
      </div>

      <Table.Default
        isLoading={isLoading}
        header={
          <>
            <Text.Search
              name=''
              type='text'
              value={searchParam || ''}
              onChange={(e) => setSearchParam(e.target.value)}
            />
          </>
        }
        table={table}
        pagination={{
          page: page,
          flipPage: (page: number) => setPage(page),
          numberOfPages: numberOfPages,
        }}
      />
    </div>
  );
};

export default Concepts;
