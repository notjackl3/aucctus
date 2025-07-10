import { Container, Icon, Loading, Modal, Select } from '@components';
import EditModeSwitcher from '@components/Text/EditModeSwitcher/EditModeSwitcher';
import { useEditConcept } from '@hooks/concepts/editable.hook';
import {
  useCancelConceptVersionRevert,
  useCommitConceptVersionRevert,
  useConcept,
  useConceptUpdate,
  useTrackConceptView,
} from '@hooks/query/concepts.hook';
import { useRoutePattern } from '@hooks/router.hook';
// import api from '@libs/api';
// import {
//   downloadPdf,
//   generateConceptSnapshotFileName,
// } from '@libs/utils/files';
import { useEffect, useRef } from 'react';

import { ConceptStatus, IConcept } from '@libs/api/types';
import { AppPath } from '@routes/routes';
import useStore from '@stores/store';

import { toast } from '@components';
import ConceptVersionsButton from '@components/Button/ConceptVersionsButton';
import LoadingMask from '@components/Card/ConceptGeneration/UserExploration/components/util/LoadingMask';
import { useModal } from '@context/ModalContextProvider';
import { cn } from '@libs/utils/react';
import { FunctionComponent, useCallback, useMemo /*useState*/ } from 'react';
import { Navigate, Outlet, useNavigate, useParams } from 'react-router-dom';
import ConceptReportSocketWrapper from './ConceptReportSocketWrapper';

export interface IConceptReportContext {
  navigateToTab: (tab: string) => void;
  concept: IConcept;
}

type TabTitles =
  | 'Overview'
  | 'Market Scan'
  | 'Financial Projection'
  | 'Customer Profile'
  | 'Key Assumptions'
  | 'Context'
  | 'Testing';

// Base tabs - Testing will be added dynamically based on concept version
const CONCEPT_TABS: { label: TabTitles; value: AppPath }[] = [
  { label: 'Overview', value: AppPath.ConceptOverview },
  { label: 'Market Scan', value: AppPath.ConceptMarketScan },
  { label: 'Financial Projection', value: AppPath.ConceptFinancialProjection },
  { label: 'Customer Profile', value: AppPath.ConceptCustomerProfile },
  { label: 'Key Assumptions', value: AppPath.ConceptKeyAssumptions },
  { label: 'Context' as TabTitles, value: AppPath.ConceptSettings },
];

const ConceptReport: FunctionComponent = () => {
  const { id: conceptIdentifier } = useParams();
  const navigate = useNavigate();
  const activeTab = useRoutePattern();
  // const account = useStore((state) => state.auth.account);
  const { title: titleEdit } = useEditConcept();
  const { mutate: trackConceptView } = useTrackConceptView();
  const hasTrackedView = useRef(false);

  const {
    concept,
    isFetched: isConceptFetched,
    isLoading: isConceptLoading,
    isFetching: isConceptFetching,
  } = useConcept(conceptIdentifier);
  const conceptUuid = useMemo(() => concept?.uuid || '', [concept]);
  const status = useMemo(() => concept?.status || 'new', [concept]);
  const { mutate: updateConcept } = useConceptUpdate();
  // const [isLoading, setIsLoading] = useState(false);
  const { openModal, closeModal } = useModal();
  const setActiveConcept = useStore(
    (state) => state.conceptReport.setActiveConcept,
  );
  const { mutate: commitConceptVersionRevert, isLoading: isReverting } =
    useCommitConceptVersionRevert();
  const { mutate: cancelConceptVersionRevert, isLoading: isCancelling } =
    useCancelConceptVersionRevert();

  // Build tabs dynamically based on concept feature version
  const conceptTabs = useMemo(() => {
    const tabs = [...CONCEPT_TABS];

    // Add Testing tab if concept has assumptions v2
    if (concept?.featureVersions?.assumptions === 'v2') {
      const contextIndex = tabs.findIndex((tab) => tab.label === 'Context');
      tabs.splice(contextIndex, 0, {
        label: 'Testing',
        value: AppPath.ConceptTesting,
      });
    }

    // Filter out Context tab if concept doesn't have seed
    return tabs.filter((v) => !(v.label === 'Context' && !concept?.hasSeed));
  }, [concept?.featureVersions?.assumptions, concept?.hasSeed]);

  useEffect(() => {
    if (concept) {
      setActiveConcept(concept);
    }
  }, [concept, setActiveConcept]);

  useEffect(() => {
    if (conceptUuid && !hasTrackedView.current) {
      trackConceptView(conceptUuid);
      hasTrackedView.current = true;
    }
  }, [conceptUuid, trackConceptView]);

  const onTabSelect = useCallback(
    (value: string) => {
      if (conceptIdentifier === undefined) return;
      const route = value.replace(':id', conceptIdentifier);
      navigate(route);
    },
    [conceptIdentifier, navigate],
  );

  // const onSnapshotClick = useCallback(async () => {
  //   if (conceptUuid === undefined) return;
  //   setIsLoading(true);

  //   try {
  //     const pdf = await api.concept.downloadConcept(conceptUuid);
  //     const fileName = generateConceptSnapshotFileName(
  //       account?.name || '',
  //       concept?.title || '',
  //     );
  //     await downloadPdf(pdf, fileName);
  //   } catch (error) {
  //     toast.error('Failed to download snapshot.');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, [conceptUuid, account?.name, concept?.title]);

  const changeConceptStatus = useCallback(
    (value: string) => {
      if (!conceptIdentifier) return;
      updateConcept({
        identifier: conceptIdentifier,
        status: value as ConceptStatus,
      });
    },
    [updateConcept, conceptIdentifier],
  );

  if (!concept && isConceptFetched) {
    toast.error('Concept Not Found.');
    return <Navigate to={AppPath.ConceptBank} />;
  }

  return (
    <>
      <ConceptReportSocketWrapper />
      <div className={cn('mx-auto my-0 flex min-h-full w-full flex-col p-8')}>
        <div className='mb-8 flex flex-row items-start justify-between self-stretch'>
          <div className='flex flex-row items-center justify-start'>
            <EditModeSwitcher
              containerClassName={cn({
                'pointer-events-none select-text select-auto user-select-auto webkit-user-select-auto':
                  concept?.isHistoricalVersion,
              })}
              pClassName='aucctus-text-brand-primary aucctus-header-sm-medium'
              textFieldClassName='!text-3xl max-w-[600px]'
              value={titleEdit.value}
              label=''
              name='title'
              maxLength={titleEdit.validation.maxLength}
              rows={1}
              onChange={(e) => titleEdit.handleChange(e)}
              handleSave={() => titleEdit.handleSave()}
              handleCancel={() => titleEdit.handleCancel()}
            />
            <div className='ml-4 flex'>
              <Select.ConceptStatus
                disabled={concept?.isHistoricalVersion}
                value={status}
                onChange={changeConceptStatus}
              />
            </div>
          </div>
          <div className='flex gap-4'>
            {concept &&
              !concept.isHistoricalVersion &&
              FEATURE_CONCEPT_VERSIONING && (
                <ConceptVersionsButton conceptUuid={conceptUuid} />
              )}
            {/* {concept && !concept.isHistoricalVersion && (
              <button
                aria-label='Download Opportunity Snapshot'
                className='btn btn-bold aucctus-text-brand-primary group whitespace-nowrap hover:bg-primary-900 hover:text-white'
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
            )} */}
            {!concept?.isHistoricalVersion && (
              <button
                onClick={() =>
                  openModal(
                    Modal.AiEditing,
                    {},
                    {
                      position: 'right',
                      modalClassName: 'max-h-[90vh]',
                      hideBodyScroll: true,
                      shouldCloseOnOverlayClick: true,
                      shouldCloseOnEscape: true,
                    },
                  )
                }
                className='btn btn-bold aucctus-text-brand-primary group hover:bg-primary-900 hover:text-white'
              >
                Refine
              </button>
            )}
          </div>
        </div>
        <div className='flex h-full w-full max-w-[1200px] flex-col flex-wrap items-start gap-6 self-stretch'>
          <Container.TabView
            className=''
            tabContentClassName={cn({
              'pointer-events-none select-text select-auto user-select-auto webkit-user-select-auto':
                concept?.isHistoricalVersion,
            })}
            tabs={conceptTabs}
            onTabSelect={onTabSelect}
            activeTab={activeTab || ''}
          >
            {!concept ? (
              <div className='flex h-full min-h-96 w-full items-center justify-center align-middle'>
                <Loading />
              </div>
            ) : (
              <div key={activeTab} className='animate-fade-in'>
                <Outlet
                  context={{
                    navigateToTab: onTabSelect,
                    concept: concept,
                  }}
                />
              </div>
            )}
          </Container.TabView>
        </div>
        <LoadingMask
          isLoading={
            isConceptLoading || isConceptFetching || isReverting || isCancelling
          }
        />
      </div>

      {concept?.isHistoricalVersion && FEATURE_CONCEPT_VERSIONING && (
        <div className='aucctus-bg-primary fixed left-1/2 top-0 z-50 flex -translate-x-1/2 animate-fade-in flex-row items-center justify-center gap-2 rounded-b-md px-4 py-2 shadow-md'>
          <span className='flex min-h-6 min-w-6 items-center justify-center'>
            <Icon
              variant='alert-triangle'
              height={16}
              width={16}
              className='stroke-warning-500'
            />
          </span>
          <span className='aucctus-text-brand-secondary aucctus-text-sm-medium mr-2'>
            You are viewing a historical version of this concept
          </span>
          <button
            onClick={() =>
              openModal(Modal.Confirmation, {
                title: 'Are you sure you want to revert to this version?',
                subtitle: (
                  <>
                    Once reverted, you will lose any current changes you have
                    made to this concept.
                    <br />
                    <strong>WARNING:</strong> This action cannot be undone!
                  </>
                ),
                actions: [
                  {
                    title: 'Revert',
                    onClick: () =>
                      commitConceptVersionRevert(conceptUuid!, {
                        onSuccess: () => {
                          closeModal();
                        },
                      }),
                    variant: 'warning',
                  },
                  {
                    title: 'Cancel',
                    onClick: () => {
                      closeModal();
                    },
                    variant: 'secondary',
                  },
                ],
              })
            }
            className='btn btn-bold btn-primary aucctus-text-brand-primary group hover:bg-primary-900 hover:text-white'
          >
            Revert
          </button>
          <button
            onClick={() => cancelConceptVersionRevert(conceptUuid!)}
            className='btn btn-bold btn-secondary aucctus-text-brand-primary group hover:bg-primary-900 hover:text-white'
          >
            Cancel
          </button>
        </div>
      )}
    </>
  );
};

export default ConceptReport;
