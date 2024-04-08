import { FunctionComponent, useCallback, useState } from 'react';
import styles from './styles/conceptOverview.module.scss';
import Icon from '../../components/Icon';
import TabView from '../../components/TabView';
import Dropdown from '../../components/Dropdown/Dropdown';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { ConceptStatus } from '../../../libs/api/typings';
import api from '../../../libs/api';
import { useQuery } from 'react-query';
import { AppPath } from '../../../routes/routes';
import useConceptMenu from '../../components/ConceptMenu/hooks/useConceptMenu';
import ConceptStatusBubble from '../../components/ConceptStatusBubble/ConceptStatusBubble';
import { CONCEPT_STATUS_LIST } from '../../../libs/concepts';

const DROPDOWN_OPTIONS = CONCEPT_STATUS_LIST.map((value) => ({
  label: <ConceptStatusBubble status={value} variant="dropdown" />,
  displayLabel: <ConceptStatusBubble status={value} variant="dropdown" isActive />,
  value,
}));

export const CONCEPT_TABS = [
  { label: 'Overview', value: AppPath.ConceptOverview },
  { label: 'Market Scan', value: AppPath.ConceptMarketScan },
  { label: 'Financial Projection', value: AppPath.ConceptFinancialProjection },
  { label: 'Customer Profile', value: AppPath.ConceptCustomerPersona },
  { label: 'Key Assumptions', value: AppPath.ConceptKeyAssumptions },
];

const ConceptReport: FunctionComponent = () => {
  const { id: conceptId = '' } = useParams();
  const navigate = useNavigate();
  const { updateConceptStatus } = useConceptMenu({ conceptId: conceptId });
  const [status, setStatus] = useState<ConceptStatus>('new');
  /**
   * Each tab has been set to return the associated route from AppPath
   */
  const onTabSelect = useCallback(
    (value: string) => {
      const route = value.replace(':id', conceptId);
      navigate(route);
    },
    [conceptId, navigate]
  );

  const changeConceptStatus = useCallback(
    (value: string) => {
      updateConceptStatus(value as ConceptStatus, conceptId, {
        onSuccess: (resp) => {
          setStatus(resp.status);
        },
      });
    },
    [updateConceptStatus, conceptId]
  );

  const { data: concept } = useQuery({
    queryKey: [`concept/${conceptId}`],
    retry: 1,
    queryFn: async () =>
      await api.concept.getConcept(conceptId || '').then((res) => {
        setStatus(res.status as ConceptStatus);
        return res;
      }),
  });

  return (
    <div className={`${styles.conceptOverview} ${styles.slideAnimation}`}>
      <div className={styles.headerSection}>
        <div className={styles.header}>
          <h1>{concept?.title}</h1>
          <div className={styles.statusSelect}>
            <Dropdown options={DROPDOWN_OPTIONS} onSelect={changeConceptStatus} selected={status} />
          </div>
        </div>
        <div className={styles.actions}>
          <button
            aria-label="Close Detail Page"
            className={`${styles.closeButton}`}
            onClick={() => navigate(AppPath.ConceptCategory)}
          >
            <Icon variant="closeX" height={20} width={20} stroke="#fff" />
          </button>
        </div>
      </div>
      <div className={styles.contentContainer}>
        <TabView
          className={styles.tabs}
          tabs={CONCEPT_TABS}
          onTabSelect={onTabSelect}
          defaultTab={AppPath.ConceptOverview}
        >
          <Outlet />
        </TabView>
      </div>
    </div>
  );
};

export default ConceptReport;
