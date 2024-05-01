import { FunctionComponent, useCallback, useEffect, useMemo } from 'react';
import styles from './styles/conceptOverview.module.scss';
import Icon from '../../components/Icons/Icon/Icon';
import TabView from '../../components/Container/TabView';
import Dropdown from '../../components/Buttons/Dropdown/Dropdown';
import { Outlet, useNavigate } from 'react-router-dom';
import { ConceptStatus, IConcept } from '../../../libs/api/types';
import { AppPath } from '../../../routes/routes';
import { useConceptUuid } from './concept-uuid.hook';

import ConceptStatusBubble from '../../components/Badges/ConceptStatusBubble/ConceptStatusBubble';
import { CONCEPT_STATUS_LIST } from '../../../libs/concepts';
import { useConcept, useConceptUpdate } from '../../hooks/query/concepts.hook';
import { useRoutePattern } from '../../hooks/router.hook';

export interface IConceptReportContext {
  navigateToTab: (tab: string) => void;
  concept?: IConcept;
}

const DROPDOWN_OPTIONS = CONCEPT_STATUS_LIST.map((value) => ({
  label: <ConceptStatusBubble status={value} variant="dropdown" />,
  displayLabel: <ConceptStatusBubble status={value} variant="dropdown" isActive />,
  value,
}));

export const CONCEPT_TABS = [
  { label: 'Overview', value: AppPath.ConceptOverview },
  { label: 'Market Scan', value: AppPath.ConceptMarketScan },
  { label: 'Financial Projection', value: AppPath.ConceptFinancialProjection },
  { label: 'Customer Profile', value: AppPath.ConceptCustomerProfile },
  { label: 'Key Assumptions', value: AppPath.ConceptKeyAssumptions },
];

const defaultIconProps = {
  width: 20,
  height: 20,
  stroke: '#98A2B3',
};

const ConceptReport: FunctionComponent = () => {
  const conceptUuid = useConceptUuid();
  const navigate = useNavigate();
  const activeTab = useRoutePattern();

  const { concept, isError } = useConcept(conceptUuid);
  const status = useMemo(() => concept?.status || 'new', [concept]);
  const { mutate: updateConcept } = useConceptUpdate();
  /**
   * Each tab has been set to return the associated route from AppPath
   */
  const onTabSelect = useCallback(
    (value: string) => {
      if (conceptUuid === undefined) return;
      const route = value.replace(':id', conceptUuid);
      navigate(route);
    },
    [conceptUuid, navigate]
  );

  const changeConceptStatus = useCallback(
    (value: string) => {
      if (!conceptUuid) return;
      updateConcept({
        uuid: conceptUuid,
        status: value as ConceptStatus,
      });
    },
    [updateConcept, conceptUuid]
  );

  // useEffect(() => {
  //   if (conceptUuid && !concept && isError) {
  //     // Go back to the previous page if the conceptUuid is not available
  //     navigate(-1);
  //   }
  // }, [conceptUuid, navigate, concept, isError]);

  return (
    <div className={`${styles.conceptOverview} ${styles.slideAnimation}`}>
      <div className={styles.headerSection}>
        <div className={styles.header}>
          <h1>{concept?.title}</h1>
          <div className={styles.statusSelect}>
            <Dropdown options={DROPDOWN_OPTIONS} hideChevron onSelect={changeConceptStatus} selected={status} />
          </div>
        </div>
        <div className={styles.actions}>
          <button
            aria-label="Download Opportunity Snapshot"
            className={`btn btn-primary btn-bold`}
            onClick={() => navigate(AppPath.ConceptSnapshot)}
            disabled
          >
            <Icon variant="download-cloud" {...defaultIconProps} />
            Opportunity Snapshot
          </button>
          <button
            aria-label="Close Detail Page"
            className={`${styles.closeButton}`}
            onClick={() => navigate(AppPath.ConceptCategory)}
          >
            <Icon variant="closeX" {...defaultIconProps} />
          </button>
        </div>
      </div>
      <div className={styles.contentContainer}>
        <TabView className={styles.tabs} tabs={CONCEPT_TABS} onTabSelect={onTabSelect} activeTab={activeTab || ''}>
          <Outlet
            context={{
              navigateToTab: onTabSelect,
              concept: concept,
            }}
          />
        </TabView>
      </div>
    </div>
  );
};

export default ConceptReport;
