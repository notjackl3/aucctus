import { FunctionComponent, useCallback, useEffect, useMemo } from 'react';
import styles from './styles/concepts.module.scss';
import { useQuery } from 'react-query';
import api from '../../../libs/api';
import Icon from '../../components/Icon/Icon';
import { AppPath } from '../../../routes/routes';
import { Outlet, useNavigate, useSearchParams } from 'react-router-dom';

import Kanban from '../../components/Kanban';
import TabView from '../../components/TabView';
import { ConceptStatus, ConceptCategory, IConceptPage } from '../../../libs/api/typings';
import ConceptTable from './components/ConceptTable';
import ConceptContainer from './components/ConceptContainer';
import { ConceptColumns } from '../../components/Kanban/Kanban';
import {
  ACTIVE_CONCEPT_STATUS_LIST,
  ARCHIVE_CONCEPT_STATUS_LIST,
  DRAFT_CONCEPT_STATUS_LIST,
} from '../../../libs/concepts';

export const CONCEPT_STATUS_LIST_MAP = {
  draft: DRAFT_CONCEPT_STATUS_LIST,
  active: ACTIVE_CONCEPT_STATUS_LIST,
  archive: ARCHIVE_CONCEPT_STATUS_LIST,
};

export const KANBAN_COLUMNS_MAP = ACTIVE_CONCEPT_STATUS_LIST.reduce<ConceptColumns>(
  (acc: ConceptColumns, item: ConceptStatus) => {
    acc[item] = {
      title: item,
      items: [],
    };
    return acc;
  },
  {} as ConceptColumns
);

const ACTIVE_VIEW_TABS = (['list', 'board'] as IconVariant[]).map((value) => ({
  label: (
    <div className={styles.tabLabel}>
      <Icon variant={value} height={20} width={20} />
      {value.charAt(0).toUpperCase() + value.slice(1)}
    </div>
  ),
  value,
}));

const Concepts: FunctionComponent = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const category = (searchParams.get('category') as ConceptCategory) || 'active';
  const status = (searchParams.get('status') as ConceptStatus) || null;
  const page = searchParams.get('page') || '1';

  const isKanbanView = searchParams.get('kanban') === 'true' && category === 'active';

  /**
   * Sets the status filter for concepts.
   * @param newStatus - The new status to filter by. If not provided, the status filter will be removed.
   */
  const setStatusFilter = useCallback(
    (newStatus?: ConceptStatus) => {
      if (!newStatus) {
        searchParams.delete('status');
      } else {
        searchParams.set('status', newStatus);
      }
      setSearchParams(searchParams);
    },
    [searchParams, setSearchParams]
  );

  /**
   * Sets the page number in the search parameters.
   * @param newPage - The new page number to set.
   */
  const setPage = useCallback(
    (newPage: number) => {
      searchParams.set('page', newPage.toString());
      setSearchParams(searchParams);
    },
    [searchParams, setSearchParams]
  );

  /**
   * Handles the selection of a tab.
   * @param value - The value of the selected tab.
   */
  const onTabSelect = useCallback(
    (value: string) => {
      if (value !== 'board') {
        searchParams.delete('kanban');
      } else {
        searchParams.set('kanban', 'true');
        searchParams.set('category', 'active');
        searchParams.delete('status');
      }
      setSearchParams(searchParams);
    },
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    if (!page) {
      searchParams.set('page', '1');
      setSearchParams(searchParams);
    }
  }, [page, searchParams, setSearchParams]);

  useEffect(() => {
    if (!category) {
      searchParams.set('category', 'active');
      setSearchParams(searchParams);
    }
  }, [category, searchParams, setSearchParams]);

  const { data, isLoading } = useQuery({
    queryKey: ['concepts', status, category, page],
    refetchOnWindowFocus: false,
    retry: 0,
    cacheTime: 12000,
    refetchInterval: (data?: IConceptPage) => {
      if (data && data.results.some((concept) => concept.reportStatus === 'pending')) {
        return 5000;
      } else {
        return false;
      }
    },
    queryFn: async () => {
      return api.concept.getConcepts({
        status,
        category,
        page: parseInt(page),
      });
    },
  });

  // We should be able to update the columns (components) without having to recreate the entire component
  const kanbanColumns = useMemo(() => {
    // Create a deep copy of the columns
    const columns = JSON.parse(JSON.stringify(KANBAN_COLUMNS_MAP));

    if (data && data.results) {
      data.results.forEach((item) => {
        if (columns[item.status]) {
          columns[item.status].items.push(item);
        }
      });
    }
    return columns;
  }, [data]);

  const tabs = category === 'active' ? ACTIVE_VIEW_TABS : [];

  return (
    <>
      <div className={styles.contentList}>
        <div className={styles.headerSection}>
          <div className={styles.header}>
            <h1>{`${category} Concepts`}</h1>
          </div>
          <div className={styles.actions}>
            <button
              className={`btn btn-primary ${styles.button}`}
              onClick={() => {
                navigate(AppPath.IgniteConcept);
              }}
            >
              <Icon variant="rocket" height={20} width={20} stroke="#fff" />
              Add Concept
            </button>
          </div>
        </div>
        <TabView tabs={tabs} className={styles.tabs} variant="button" onTabSelect={onTabSelect} defaultTab={'list'}>
          <ConceptContainer
            category={category}
            categoryCount={data?.count || 0}
            numberOfPages={data?.numberOfPages || 1}
            page={page}
            setPage={setPage}
            status={status}
            setStatusFilter={setStatusFilter}
            showStatusFilter={!isKanbanView}
          >
            <>
              {isKanbanView ? (
                <Kanban
                  kanbanColumns={kanbanColumns}
                  selectCard={(id: string) => navigate(AppPath.ConceptOverview.replace(':id', id))}
                />
              ) : (
                <ConceptTable data={data?.results || []} isLoading={isLoading} />
              )}
            </>
          </ConceptContainer>
        </TabView>
      </div>
      <Outlet />
    </>
  );
};

export default Concepts;
