import { FunctionComponent, useCallback, useMemo, useState } from 'react';
import styles from './styles/conceptOverview.module.scss';
import Icon from '../../components/Icon';
import TabView from '../../components/TabView';
import Dropdown from '../../components/Dropdown/Dropdown';
import { Option } from '../../components/Dropdown/Dropdown';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { ConceptStatus } from '../../../libs/api/typings';
import ConceptStatusDropdown from '../../components/ConceptStatusDropdown';
import api from '../../../libs/api';
import { useQuery } from 'react-query';
import { AppPath } from '../../../routes/routes';
import useConceptMenu from '../../components/ConceptMenu/hooks/useConceptMenu';

const OPTIONS = [
  {
    label: <ConceptStatusDropdown status={ConceptStatus.new} />,
    displayLabel: <ConceptStatusDropdown status={ConceptStatus.new} isActive />,
    value: ConceptStatus.new,
  },
  {
    label: <ConceptStatusDropdown status={ConceptStatus.ideating} />,
    displayLabel: <ConceptStatusDropdown status={ConceptStatus.ideating} isActive />,
    value: ConceptStatus.ideating,
  },
  {
    label: <ConceptStatusDropdown status={ConceptStatus.inReview} />,
    displayLabel: <ConceptStatusDropdown status={ConceptStatus.inReview} isActive />,
    value: ConceptStatus.inReview,
  },
  {
    label: <ConceptStatusDropdown status={ConceptStatus.prototyping} />,
    displayLabel: <ConceptStatusDropdown status={ConceptStatus.prototyping} isActive />,
    value: ConceptStatus.prototyping,
  },
  {
    label: <ConceptStatusDropdown status={ConceptStatus.proofOfConcept} />,
    displayLabel: <ConceptStatusDropdown status={ConceptStatus.proofOfConcept} isActive />,
    value: ConceptStatus.proofOfConcept,
  },
  {
    label: <ConceptStatusDropdown status={ConceptStatus.minimumViableProduct} />,
    displayLabel: <ConceptStatusDropdown status={ConceptStatus.minimumViableProduct} isActive />,
    value: ConceptStatus.minimumViableProduct,
  },
  {
    label: <ConceptStatusDropdown status={ConceptStatus.commercialized} />,
    displayLabel: <ConceptStatusDropdown status={ConceptStatus.commercialized} isActive />,
    value: ConceptStatus.commercialized,
  },
  {
    label: <ConceptStatusDropdown status={ConceptStatus.archived} />,
    displayLabel: <ConceptStatusDropdown status={ConceptStatus.archived} isActive />,
    value: ConceptStatus.archived,
  },
];

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
  const [status, setStatus] = useState<ConceptStatus>(ConceptStatus.new);

  const conceptStatusOptions = useMemo(() => {
    return OPTIONS.find((option) => option.value === status);
  }, [status]);

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
    (option: Option) => {
      updateConceptStatus(option?.value as ConceptStatus);
    },
    [updateConceptStatus]
  );

  const { data: concept, isLoading } = useQuery({
    queryKey: [`concept/${conceptId}`],
    retry: 1,
    queryFn: async () => await api.concept.getConcept(conceptId || ''),
    onSuccess: (response) => {
      setStatus(response.status);
    },
  });

  return (
    <div className={`${styles.conceptOverview} ${styles.slideAnimation}`}>
      <div className={styles.headerSection}>
        <div className={styles.header}>
          <h1>{concept?.title}</h1>
          <div className={styles.statusSelect}>
            <Dropdown options={OPTIONS} onSelect={changeConceptStatus} initialOption={conceptStatusOptions} />
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
