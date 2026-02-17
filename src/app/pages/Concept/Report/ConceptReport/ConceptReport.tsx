import {
  Container,
  Icon,
  Loading,
  Modal,
  Select,
  ConceptReportSkeletons,
} from '@components';
import { OverseerWrapper, ROUTE_TO_PAGE_CONTEXT } from '@components/Overseer';
import AucctusLogo from '@assets/aucctus_logo.png';
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
import { useEffect, useRef } from 'react';
import { ConceptStatus, IConcept } from '@libs/api/types';
import { AppPath } from '@routes/routes';
import useStore from '@stores/store';
import { toast } from '@components';
import ConceptVersionsButton from '@components/Button/ConceptVersionsButton';
import LoadingMask from '@components/Card/ConceptGeneration/UserExploration/components/util/LoadingMask';
import { useModal } from '@context/ModalContextProvider';
import { cn } from '@libs/utils/react';
import { FunctionComponent, useCallback, useMemo } from 'react';
import { Navigate, Outlet, useNavigate, useParams } from 'react-router-dom';
import ConceptReportSocketWrapper from './ConceptReportSocketWrapper';

const { SkeletonBlock } = ConceptReportSkeletons;

export interface IConceptReportContext {
  navigateToTab: (tab: string) => void;
  concept: IConcept;
}

type TabTitles =
  | 'OVERVIEW'
  | 'MARKET SCAN'
  | 'FINANCIAL PROJECTION'
  | 'CUSTOMER PROFILE'
  | 'ASSUMPTIONS'
  | 'WORKSHOP'
  | 'CONTEXT'
  | 'TESTING';

// Map tab labels to section keys in reportStatusBySection
const TAB_TO_SECTION_MAP: Partial<Record<TabTitles, string>> = {
  OVERVIEW: 'overview',
  'MARKET SCAN': 'ecosystem',
  'FINANCIAL PROJECTION': 'financialProjection',
  'CUSTOMER PROFILE': 'customerProfiles',
  ASSUMPTIONS: 'assumptions',
};

// Base tabs - Testing will be added dynamically based on concept version
const CONCEPT_TABS: { label: TabTitles; value: AppPath; icon: IconVariant }[] =
  [
    {
      label: 'OVERVIEW',
      value: AppPath.ConceptOverview,
      icon: 'presentation-chart',
    },
    {
      label: 'MARKET SCAN',
      value: AppPath.ConceptMarketScan,
      icon: 'search-md',
    },
    {
      label: 'FINANCIAL PROJECTION',
      value: AppPath.ConceptFinancialProjection,
      icon: 'trendup',
    },
    {
      label: 'CUSTOMER PROFILE',
      value: AppPath.ConceptCustomerProfile,
      icon: 'users-03',
    },
    {
      label: 'ASSUMPTIONS',
      value: AppPath.ConceptKeyAssumptions,
      icon: 'book-open',
    },
    // TODO: Re-activate Workshop tab when ready
    // {
    //   label: 'WORKSHOP',
    //   value: AppPath.ConceptWorkshop,
    //   icon: 'filecode',
    // },
    { label: 'CONTEXT', value: AppPath.ConceptSettings, icon: 'globe' },
  ];

const ConceptReport: FunctionComponent = () => {
  const { id: conceptIdentifier } = useParams();
  const navigate = useNavigate();
  const activeTab = useRoutePattern();
  const { title: titleEdit } = useEditConcept();
  const { mutate: trackConceptView } = useTrackConceptView();
  const hasTrackedView = useRef(false);

  const {
    concept,
    isLoading: isConceptLoading,
    isFetching: isConceptFetching,
  } = useConcept(conceptIdentifier);
  const conceptUuid = useMemo(() => concept?.uuid || '', [concept]);
  const status = useMemo(() => concept?.status || 'new', [concept]);
  const { mutate: updateConcept } = useConceptUpdate();
  const { openModal, closeModal } = useModal();

  const setActiveConcept = useStore(
    (state) => state.conceptReport.setActiveConcept,
  );
  const setConceptUuid = useStore(
    (state) => state.conceptReport.setConceptUuid,
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
      const contextIndex = tabs.findIndex((tab) => tab.label === 'CONTEXT');
      tabs.splice(contextIndex, 0, {
        label: 'TESTING',
        value: AppPath.ConceptTesting,
        icon: 'beaker',
      });
    }

    // Filter out Context tab if concept doesn't have seed
    const filteredTabs = tabs.filter(
      (v) => !(v.label === 'CONTEXT' && !concept?.hasSeed),
    );

    // Add isLoading state based on section status
    return filteredTabs.map((tab) => {
      const sectionKey = TAB_TO_SECTION_MAP[tab.label];
      const sectionStatus = sectionKey
        ? concept?.reportStatusBySection?.[sectionKey]?.status
        : undefined;
      // Tab is loading if section is pending
      const isLoading = sectionStatus === 'pending';

      return {
        ...tab,
        isLoading,
      };
    });
  }, [
    concept?.featureVersions?.assumptions,
    concept?.hasSeed,
    concept?.reportStatusBySection,
  ]);

  useEffect(() => {
    if (concept) {
      setActiveConcept(concept);
    }
  }, [concept, setActiveConcept]);

  // Clear active concept UUID when leaving the concept report page
  // This ensures workflow_completed toasts show for any concept, not just the last viewed one
  useEffect(() => {
    return () => {
      setConceptUuid(undefined);
    };
  }, [setConceptUuid]);

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

  const overseerOpen = useStore((state) => state.overseer.open);
  const setDocked = useStore((state) => state.overseer.setDocked);

  const onAskAucctusClick = useCallback(() => {
    const pageContext = ROUTE_TO_PAGE_CONTEXT[activeTab || ''] || 'overview';
    overseerOpen({
      selectedText: '',
      expandedText: '',
      pageContext,
      position: { x: 0, y: 0 },
      conceptUuid: conceptUuid || undefined,
    });
    setDocked(true);
  }, [activeTab, conceptUuid, overseerOpen, setDocked]);

  const onMagicShareClick = useCallback(() => {
    openModal(
      Modal.MagicShare,
      {
        conceptUuid,
      },
      {
        position: 'center',
        shouldCloseOnOverlayClick: true,
        shouldCloseOnEscape: true,
        modalClassName: 'max-w-xl',
      },
    );
  }, [openModal, conceptUuid]);

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

  // Show toast and redirect if concept not found
  // Only redirect when query is idle (not loading/fetching) and no concept exists
  const shouldRedirect = !concept && !isConceptLoading && !isConceptFetching;
  useEffect(() => {
    if (shouldRedirect) {
      toast.error('Concept Not Found', 'Concept Not Found');
    }
  }, [shouldRedirect]);

  if (shouldRedirect) {
    return <Navigate to={AppPath.ConceptBank} />;
  }

  return (
    <>
      <ConceptReportSocketWrapper />
      <OverseerWrapper>
        <div className={cn('mx-auto my-0 flex min-h-full w-full flex-col p-8')}>
          <div className='mb-8 flex flex-row items-start justify-between self-stretch'>
            {/* Title and Status Section */}
            {isConceptLoading || isConceptFetching ? (
              <div className='aucctus-bg-secondary flex flex-row items-center justify-start gap-4 rounded-lg p-4'>
                {/* Title Skeleton - matches text-3xl height */}
                <SkeletonBlock className='h-9 w-80' />
                {/* Status Dropdown Skeleton */}
                <SkeletonBlock className='h-10 w-32 rounded' />
              </div>
            ) : (
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
                  saveOnBlur={true}
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
            )}
            <div className='flex gap-4'>
              {!concept?.isHistoricalVersion && (
                <button
                  onClick={onAskAucctusClick}
                  className='flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors hover:bg-[#3a1212]'
                  style={{ backgroundColor: '#2a0a0a' }}
                  aria-label='Ask Aucctus'
                >
                  <img src={AucctusLogo} alt='Aucctus' className='h-4 w-4' />
                  Ask Aucctus
                </button>
              )}
              {concept &&
                !concept.isHistoricalVersion &&
                FEATURE_CONCEPT_VERSIONING && (
                  <ConceptVersionsButton
                    conceptUuid={conceptUuid}
                    conceptIdentifier={conceptIdentifier}
                  />
                )}
              {!concept?.isHistoricalVersion && (
                <>
                  <button
                    onClick={onMagicShareClick}
                    className='flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-opacity hover:opacity-90'
                    style={{ backgroundColor: '#120C0C' }}
                    aria-label='Magic Share'
                  >
                    <Icon
                      variant='threeStars'
                      className='h-4 w-4 fill-white stroke-white'
                    />
                    Magic Share
                  </button>
                  <div className='group relative'>
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
                  </div>
                </>
              )}
            </div>
          </div>
          <div className='flex h-full w-full max-w-[1200px] flex-col flex-wrap items-start gap-6 self-stretch'>
            <Container.TabView
              className=''
              tabGroupClassName='rounded-lg p-1 mb-2'
              tabContainerClassName='gap-1'
              tabContentClassName={cn({
                'pointer-events-none select-text select-auto user-select-auto webkit-user-select-auto':
                  concept?.isHistoricalVersion,
              })}
              tabs={conceptTabs}
              variant='icon-button'
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
              isConceptLoading ||
              isConceptFetching ||
              isReverting ||
              isCancelling
            }
          />
        </div>
      </OverseerWrapper>

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
                      commitConceptVersionRevert(
                        {
                          uuid: conceptUuid!,
                          conceptIdentifier: conceptIdentifier!,
                        },
                        {
                          onSuccess: () => {
                            closeModal();
                          },
                        },
                      ),
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
            onClick={() =>
              cancelConceptVersionRevert({
                uuid: conceptUuid!,
                conceptIdentifier: conceptIdentifier!,
              })
            }
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
