import { FunctionComponent, useCallback, useMemo } from 'react';
import styles from './styles/conceptOverview.module.scss';
import Icon from '../../components/Icons/Icon/Icon';
import TabView from '../../components/Container/TabView';
import Dropdown from '../../components/Buttons/Dropdown/Dropdown';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { ConceptStatus, IConcept } from '../../../libs/api/types';
import { AppPath } from '../../../routes/routes';

import ConceptStatusBubble from '../../components/Badges/ConceptStatusBubble/ConceptStatusBubble';
import { CONCEPT_STATUS_LIST } from '../../../libs/concepts';
import { useConcept, useConceptUpdate } from '../../hooks/query/concepts.hook';
import { useRoutePattern } from '../../hooks/router.hook';
import Tooltip from '../../components/ToolTip/Tooltip';

export interface IConceptReportContext {
  navigateToTab: (tab: string) => void;
  concept?: IConcept;
}

const DROPDOWN_OPTIONS = CONCEPT_STATUS_LIST.map((value) => ({
  label: <ConceptStatusBubble status={value} variant='dropdown' />,
  displayLabel: <ConceptStatusBubble status={value} variant='dropdown' isActive />,
  value,
}));

export const CONCEPT_TABS = [
  { label: 'Overview', value: AppPath.ConceptOverview },
  { label: 'Market Scan', value: AppPath.ConceptMarketScan },
  { label: 'Financial Projection', value: AppPath.ConceptFinancialProjection },
  { label: 'Customer Profile', value: AppPath.ConceptCustomerProfile },
  { label: 'Key Assumptions', value: AppPath.ConceptKeyAssumptions },
  { label: 'Context', value: AppPath.ConceptSettings },
];

const defaultIconProps = {
  width: 20,
  height: 20,
  stroke: '#98A2B3',
};

const ConceptReport: FunctionComponent = () => {
  const { id: conceptUuid } = useParams();
  const navigate = useNavigate();
  const activeTab = useRoutePattern();

  const { concept } = useConcept(conceptUuid);
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
    [conceptUuid, navigate],
  );

  const changeConceptStatus = useCallback(
    (value: string) => {
      if (!conceptUuid) return;
      updateConcept({
        uuid: conceptUuid,
        status: value as ConceptStatus,
      });
    },
    [updateConcept, conceptUuid],
  );

  return (
    <div className={`min-h-full ${styles.conceptOverview} ${styles.slideAnimation}`}>
      <div className={styles.headerSection}>
        <div className={styles.header}>
          <h1>{concept?.title}</h1>
          <div className={styles.statusSelect}>
            <Dropdown
              options={DROPDOWN_OPTIONS}
              hideChevron
              onSelect={changeConceptStatus}
              selected={status}
              hidePadding
            />
          </div>
        </div>
        <div className={styles.actions}>
          <Tooltip tip='Coming Soon'>
            <button
              aria-label='Download Opportunity Snapshot'
              className={`btn btn-disabled btn-bold`}
              onClick={() => navigate(AppPath.ConceptSnapshot)}
              disabled
            >
              <Icon variant='download-cloud' {...defaultIconProps} />
              Opportunity Snapshot
            </button>
          </Tooltip>
          <button
            aria-label='Close Detail Page'
            className='btn-close'
            onClick={() => navigate(AppPath.ConceptCategory)}
          />
        </div>
      </div>
      <div className={styles.contentContainer}>
        <TabView
          className={styles.tabs}
          tabs={CONCEPT_TABS.filter((v) => !(v.label === 'Context' && !concept?.seed))}
          onTabSelect={onTabSelect}
          activeTab={activeTab || ''}
        >
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
