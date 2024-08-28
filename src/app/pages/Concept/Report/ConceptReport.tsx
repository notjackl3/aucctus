import { Container, Icon, Select, Tooltip } from '@components';
import { useConcept, useConceptUpdate } from '@hooks/query/concepts.hook';
import { useRoutePattern } from '@hooks/router.hook';
import { ConceptStatus, IConcept } from '@libs/api/types';
import { AppPath } from '@routes/routes';
import { FunctionComponent, useCallback, useMemo } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';

export interface IConceptReportContext {
  navigateToTab: (tab: string) => void;
  concept?: IConcept;
}

type TabTitles =
  | 'Overview'
  | 'Market Scan'
  | 'Financial Projection'
  | 'Customer Profile'
  | 'Key Assumptions'
  | 'Context';
export const CONCEPT_TABS: { label: TabTitles; value: AppPath }[] = [
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
    <div className={`mx-auto my-0 flex min-h-full w-full flex-col p-8`}>
      <div className='mb-8 flex flex-row items-start justify-between self-stretch'>
        <div className='flex flex-row items-center justify-start'>
          <h1 className='h-full text-3xl font-medium capitalize not-italic leading-10 text-blue-900'>
            {concept?.title}
          </h1>
          <div className='ml-4 flex'>
            <Select.ConceptStatus
              value={status}
              onChange={changeConceptStatus}
            />
          </div>
        </div>
        <div className='flex gap-4'>
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
            onClick={() => navigate(AppPath.ConceptBank)}
          />
        </div>
      </div>
      <div className='flex h-full w-full max-w-[1200px] flex-col flex-wrap items-start gap-6 self-stretch'>
        <Container.TabView
          className=''
          tabs={CONCEPT_TABS.filter(
            (v) => !(v.label === 'Context' && !concept?.seed),
          )}
          onTabSelect={onTabSelect}
          activeTab={activeTab || ''}
        >
          <Outlet
            context={{
              navigateToTab: onTabSelect,
              concept: concept,
            }}
          />
        </Container.TabView>
      </div>
    </div>
  );
};

export default ConceptReport;
