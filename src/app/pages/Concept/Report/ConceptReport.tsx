import { Container, Icon, Loading, Select } from '@components';
import EditModeSwitcher from '@components/Text/EditModeSwitcher/EditModeSwitcher';
import { useEditConcept } from '@hooks/concepts/editable.hook';
import { useConcept, useConceptUpdate } from '@hooks/query/concepts.hook';
import { useRoutePattern } from '@hooks/router.hook';
import api from '@libs/api';

import { ConceptStatus, IConcept } from '@libs/api/types';
import { AppPath } from '@routes/routes';
import useStore from '@stores/store';

import { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { Navigate, Outlet, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

export interface IConceptReportContext {
  navigateToTab: (tab: string) => void;
  concept: IConcept;
}

type TabTitles =
  | 'Overview'
  | 'Market Scan'
  | 'Market Scan V2'
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
  // { label: 'Context', value: AppPath.ConceptSettings },
];

const ConceptReport: FunctionComponent = () => {
  const { id: conceptUuid } = useParams();
  const navigate = useNavigate();
  const activeTab = useRoutePattern();
  const account = useStore((state) => state.auth.account);
  const { title: titleEdit } = useEditConcept();

  const { concept, isFetched: isConceptFetched } = useConcept(conceptUuid);
  const status = useMemo(() => concept?.status || 'new', [concept]);
  const { mutate: updateConcept } = useConceptUpdate();
  const [isLoading, setIsLoading] = useState(false);

  const onTabSelect = useCallback(
    (value: string) => {
      if (conceptUuid === undefined) return;
      const route = value.replace(':id', conceptUuid);
      navigate(route);
    },
    [conceptUuid, navigate],
  );

  const onSnapshotClick = useCallback(async () => {
    if (conceptUuid === undefined) return;
    setIsLoading(true);

    try {
      const pdf = await api.concept.downloadConcept(conceptUuid);
      const blob = new Blob([pdf], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Get today's date in YYYYMMDD format
      const today = new Date();
      const readableDate = today.toISOString().split('T')[0].replace(/-/g, '');
      // company-concept-20241117
      const fileName = `${account?.name.toLowerCase()}-${concept?.title.replace(/\s+/g, '-').toLowerCase()}-${readableDate}.pdf`;
      // Set the download filename
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to download snapshot.');
    } finally {
      setIsLoading(false);
    }
  }, [conceptUuid, account?.name, concept?.title]);

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

  if (!concept && isConceptFetched) {
    toast.error('Concept Not Found.');
    return <Navigate to={AppPath.ConceptBank} />;
  }

  return (
    <div
      className={`aucctus-bg-secondary-extra-subtle mx-auto my-0 flex min-h-full w-full flex-col p-8`}
    >
      <div className='mb-8 flex flex-row items-start justify-between self-stretch'>
        <div className='flex flex-row items-center justify-start'>
          <EditModeSwitcher
            pClassName='aucctus-text-brand-primary aucctus-header-sm-medium'
            textFieldClassName='!text-3xl max-w-[600px]'
            value={titleEdit.value}
            label=''
            name='title'
            maxLength={titleEdit.validation.maxLength}
            rows={1}
            onChange={titleEdit.handleChange}
            handleSave={titleEdit.handleSave}
            handleCancel={titleEdit.handleCancel}
          />
          <div className='ml-4 flex'>
            <Select.ConceptStatus
              value={status}
              onChange={changeConceptStatus}
            />
          </div>
        </div>
        <div className='flex gap-4'>
          <button
            aria-label='Download Opportunity Snapshot'
            className={`btn btn-bold aucctus-text-brand-primary group hover:bg-primary-900 hover:text-white`}
            onClick={onSnapshotClick}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loading isSmall />
            ) : (
              <Icon
                variant='download-cloud'
                height={20}
                width={20}
                className='stroke-primary-900 transition-colors duration-300 group-hover:stroke-primary-100'
              />
            )}
            Opportunity Snapshot
          </button>
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
            (v) => !(v.label === 'Context' && !concept?.hasSeed),
          )}
          onTabSelect={onTabSelect}
          activeTab={activeTab || ''}
        >
          {!concept ? (
            <div className='flex h-full min-h-96 w-full items-center justify-center align-middle'>
              <Loading />
            </div>
          ) : (
            <Outlet
              context={{
                navigateToTab: onTabSelect,
                concept: concept,
              }}
            />
          )}
        </Container.TabView>
      </div>
    </div>
  );
};

export default ConceptReport;
